# APP-OPS-CLEANSEA

Sistema empresarial full stack (BPMS) construído de forma incremental sobre o template oficial Cloudflare **React Router + Hono**.

## Stack

| Camada | Tecnologia | Estado |
|---|---|---|
| Frontend | React 19 + React Router 7 + Tailwind 4 | Importado |
| API | Hono (Cloudflare Workers) | Importado |
| Runtime / build | Workers + Vite + Wrangler | Importado |
| Banco | Cloudflare D1 + Drizzle | Pendente |
| Validação | Zod | Pendente |
| Autenticação | Sessões + RBAC | Pendente |
| Documentos | R2 | Pendente |
| Processos duráveis | Cloudflare Workflows | A avaliar (não substitui BPMN) |
| Testes | Vitest + Playwright | Pendente |
| CI | GitHub Actions | Esqueleto em `.github/workflows/ci.yml` |

Arquitetura: monólito modular. Detalhes em `docs/architecture/`.

## Comandos

```bash
npm ci
npm run dev        # desenvolvimento local
npm run typecheck  # tipos
npm run build      # build de produção
```

`npm run deploy` publica no Cloudflare. NÃO execute sem autorização.

## Roadmap (fases)

- A. Definição — `docs/requirements/PRD.md`
- B. Arquitetura — `docs/architecture/arc42.md` + ADRs
- C. Contratos e dados — `contracts/openapi.yaml`, D1, Drizzle
- D. Primeiro fluxo completo, ponta a ponta
- E. Robustez e segurança (auditoria, idempotência, testes)
- F. Publicação controlada (CI/CD, backups, observabilidade)

Estado atual: **fase C iniciada** (scaffold oficial importado; typecheck e build passam).

O README original do template está em `docs/upstream/TEMPLATE-README.md`.
