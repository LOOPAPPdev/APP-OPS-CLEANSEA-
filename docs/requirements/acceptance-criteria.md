# Critérios de aceitação

GIVEN um utilizador não autenticado
WHEN chama qualquer endpoint protegido
THEN a API responde 401.

GIVEN um utilizador sem permissão no recurso
WHEN tenta alterá-lo
THEN a API responde 403 e nada muda.

GIVEN uma mudança de estado válida
WHEN ela é concluída
THEN existe um registro de auditoria com autor, data e entidade.
