# Arquitetura (arc42) — esqueleto

1. Introdução e metas — a preencher (ver PRD)
2. Restrições — Cloudflare Workers; sem deploy sem autorização
3. Contexto e escopo — a preencher (C4 Context)
4. Estratégia de solução — ver ADR-0001
5. Visão de blocos — `app/` (web), `workers/` (API), `packages/domain` (futuro)
6. Visão de execução — a preencher (primeiro fluxo)
7. Visão de implantação — Workers + D1 + R2
8. Conceitos transversais — autenticação, RBAC, auditoria, idempotência
9. Decisões — `decisions/`
10. Qualidade — ISO 25010 (a detalhar)
11. Riscos — ver abaixo
12. Glossário — a preencher

## Riscos iniciais
| Risco | Mitigação |
|---|---|
| Workflows não é BPMN | Avaliar Flowable se necessário |
| Falta de autorização por recurso | Testes de autorização na fase E |
| Perda de dados em D1 | Backup e restauração testados na fase F |
