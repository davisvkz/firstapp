/**
 * Bridge proxy: adapta a requisição simples do app ({ messages: [{role, content}] })
 * para a API baseada em sessões do opencode (criar sessão → enviar mensagem → ler parts).
 *
 * Zero dependências: apenas o módulo `http` embutido e o `fetch` global (Node >= 18).
 * Roda na mesma máquina que `opencode serve`.
 */
import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const OPENCODE_URL = (process.env.OPENCODE_URL || 'http://127.0.0.1:4096').replace(/\/$/, '');
const OPENCODE_PASSWORD = process.env.OPENCODE_SERVER_PASSWORD || '';
const OPENCODE_USERNAME = process.env.OPENCODE_SERVER_USERNAME || 'opencode';
const OPENCODE_PROVIDER = process.env.OPENCODE_PROVIDER || '';
const OPENCODE_MODEL = process.env.OPENCODE_MODEL || '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** Cabeçalho de auth Basic para o opencode, se uma senha estiver configurada. */
function opencodeAuthHeaders() {
  if (!OPENCODE_PASSWORD) return {};
  const token = Buffer.from(`${OPENCODE_USERNAME}:${OPENCODE_PASSWORD}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

/** Modelo a enviar ao opencode, ou undefined para usar o default configurado no servidor. */
function opencodeModel() {
  if (OPENCODE_PROVIDER && OPENCODE_MODEL) {
    return { providerID: OPENCODE_PROVIDER, modelID: OPENCODE_MODEL };
  }
  return undefined;
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** Achata o histórico (sem a mensagem system) num único prompt, uma linha por turno. */
function flattenPrompt(messages) {
  const rotulo = { user: 'Usuário', assistant: 'Assistente', system: 'Sistema' };
  return messages
    .map((m) => `${rotulo[m.role] ?? m.role}: ${m.content}`)
    .join('\n');
}

async function handleChat(req, res) {
  const raw = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(raw || '{}');
  } catch {
    sendJson(res, 400, { error: 'Corpo da requisição não é JSON válido.' });
    return;
  }

  if (!parsed || !Array.isArray(parsed.messages)) {
    sendJson(res, 400, { error: 'Corpo inválido: esperado { messages: [...] }.' });
    return;
  }

  const messages = parsed.messages;
  const systemMsg = messages.find((m) => m && m.role === 'system');
  const system = systemMsg ? String(systemMsg.content ?? '') : undefined;
  const historico = messages.filter((m) => m && m.role !== 'system');
  const prompt = flattenPrompt(historico);
  const model = opencodeModel();

  // 1. Cria a sessão no opencode.
  let sessionRes;
  try {
    sessionRes = await fetch(`${OPENCODE_URL}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...opencodeAuthHeaders() },
      body: JSON.stringify({ title: 'conversa-app' }),
    });
  } catch (err) {
    console.error('[bridge] falha ao conectar ao opencode:', err);
    sendJson(res, 502, {
      error: `Não foi possível conectar ao opencode em ${OPENCODE_URL}: ${String(err.message || err)}`,
    });
    return;
  }

  if (!sessionRes.ok) {
    const detalhe = await sessionRes.text().catch(() => '');
    console.error('[bridge] opencode /session retornou', sessionRes.status, detalhe);
    sendJson(res, sessionRes.status || 502, {
      error: `Falha ao criar sessão no opencode (${sessionRes.status}): ${detalhe.slice(0, 300)}`,
    });
    return;
  }

  const sessionData = await sessionRes.json();
  const sessionId = sessionData && sessionData.id;
  if (!sessionId) {
    console.error('[bridge] opencode /session sem id:', sessionData);
    sendJson(res, 502, { error: 'opencode não retornou o id da sessão.' });
    return;
  }

  try {
    // 2. Envia a mensagem à sessão.
    const messageRes = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...opencodeAuthHeaders() },
      body: JSON.stringify({
        system,
        parts: [{ type: 'text', text: prompt }],
        ...(model && { model }),
      }),
    });

    if (!messageRes.ok) {
      const detalhe = await messageRes.text().catch(() => '');
      console.error('[bridge] opencode /message retornou', messageRes.status, detalhe);
      sendJson(res, messageRes.status || 502, {
        error: `Falha ao enviar mensagem ao opencode (${messageRes.status}): ${detalhe.slice(0, 300)}`,
      });
      return;
    }

    const data = await messageRes.json();
    const parts = Array.isArray(data && data.parts) ? data.parts : [];
    const replyText = parts
      .filter((p) => p && p.type === 'text')
      .map((p) => String(p.text ?? ''))
      .join('');

    if (!replyText) {
      sendJson(res, 502, { error: 'opencode não retornou texto' });
      return;
    }

    sendJson(res, 200, { content: replyText });
  } finally {
    // 3. Deleta a sessão (best-effort — não falha a requisição se der erro).
    fetch(`${OPENCODE_URL}/session/${sessionId}`, {
      method: 'DELETE',
      headers: { ...opencodeAuthHeaders() },
    }).catch((err) => console.error('[bridge] falha ao deletar sessão (ignorado):', err));
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname;

    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    if (req.method === 'GET' && path === '/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && path === '/chat') {
      await handleChat(req, res);
      return;
    }

    sendJson(res, 404, { error: 'not found' });
  } catch (err) {
    console.error('[bridge]', err);
    sendJson(res, 500, { error: String(err.message || err) });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[bridge] ouvindo em http://0.0.0.0:${PORT} → opencode em ${OPENCODE_URL}`);
});
