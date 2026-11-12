# ADR-0001 — Stack base e monólito modular

- Status: Aceito
- Data: 2026-11-12

## Contexto
Primeiro sistema empresarial BPMS. Precisamos de uma base verificável, sem construir um motor BPMN do zero.

## Decisão
1. Template oficial Cloudflare `react-router-hono-fullstack-template` como base.
2. Monólito modular: frontend e API no mesmo projeto Workers.
3. TypeScript; D1 + Drizzle; Zod; R2 para documentos.
4. Cloudflare Workflows para execução durável. Não substitui um motor BPMN.
5. Avaliar Flowable (Apache 2.0) se BPMN/DMN for requisito comprovado. Camunda 8 Self-Managed exige licença comercial em produção.

## Consequências
- Menos serviços para operar no início.
- D1, autenticação, RBAC, testes e CI ainda precisam ser configurados.
- Revisar a decisão se surgir requisito BPMN formal.

## Referências
arc42, ISO/IEC/IEEE 12207, NIST SSDF (SP 800-218), OMG BPMN 2.0.2, OpenAPI, OWASP ASVS, Twelve-Factor App. São guias independentes. Seu uso não implica certificação.
