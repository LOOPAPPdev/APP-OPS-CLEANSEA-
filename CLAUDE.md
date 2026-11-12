# CLAUDE.md — regras do repositório

## Contexto
BPMS empresarial. Monólito modular em Cloudflare Workers (React Router + Hono). Leia `README.md` e `docs/` antes de alterar código.

## Regras (MUST / SHOULD)
- MUST NOT fazer deploy nem provisionar recursos Cloudflare sem autorização explícita.
- MUST NOT reconstruir o que o template ou uma biblioteca já fornece. Reutilizar primeiro.
- MUST verificar autenticação e autorização no backend em toda operação.
- MUST registrar auditoria (autor, data, entidade) em toda mudança de estado.
- MUST definir idempotência e tratamento de falha em toda integração com efeito externo.
- MUST validar entradas com Zod nas fronteiras da API.
- MUST manter contratos em `contracts/openapi.yaml` antes de implementar endpoints.
- MUST registrar decisões técnicas como ADR em `docs/architecture/decisions/`.
- SHOULD usar mudanças pequenas, uma fase por vez, com testes.
- MUST rodar `npm run typecheck` e `npm run build` antes de cada commit.
- MUST NOT afirmar que algo funciona sem ter executado a verificação.

## Estrutura
- `app/` frontend (React Router) · `workers/` backend (Hono) · `contracts/` OpenAPI
- `docs/` requisitos, arquitetura (arc42, ADR), processos, segurança, operação
