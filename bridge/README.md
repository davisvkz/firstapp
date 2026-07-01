# conversa-opencode-bridge

Bridge HTTP sem dependências que adapta a requisição simples do app
(`{ messages: [{role, content}] }`) para a API baseada em sessões do
[opencode](https://opencode.ai). Usado apenas para o **chat** — a transcrição
de áudio continua indo direto para o Groq/Whisper.

## Como rodar

### 1. Instale e inicie o opencode

```sh
opencode serve --port 4096
```

Para exigir autenticação, inicie com uma senha (o bridge repassa via
`Authorization: Basic`):

```sh
OPENCODE_SERVER_PASSWORD=minha-senha opencode serve --port 4096
```

Mantenha o opencode ligado apenas em `localhost` — só o bridge precisa ficar
exposto na LAN.

### 2. Inicie o bridge

```sh
cd bridge
npm start
```

Ou, passando variáveis de ambiente explicitamente:

```sh
PORT=8787 OPENCODE_URL=http://127.0.0.1:4096 node server.mjs
```

Veja `.env.example` para todas as variáveis (`PORT`, `OPENCODE_URL`,
`OPENCODE_SERVER_PASSWORD`, `OPENCODE_SERVER_USERNAME`, `OPENCODE_PROVIDER`,
`OPENCODE_MODEL`).

### 3. Descubra o IP da sua LAN

- macOS: `ipconfig getifaddr en0`
- Linux: `ip addr`

Use `http://<IP-DA-LAN>:8787` como a "URL do bridge opencode" na tela de
configuração do app.

### 4. Teste rápido (smoke test)

```sh
curl http://localhost:8787/health
# {"ok":true}

curl -X POST http://localhost:8787/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"system","content":"Responda em português."},{"role":"user","content":"Diga oi."}]}'
# {"content":"Oi! ..."}
```

### 5. Exposição na rede

Apenas o bridge precisa estar acessível na mesma rede do celular. O opencode em
si deve permanecer ligado somente ao localhost.
