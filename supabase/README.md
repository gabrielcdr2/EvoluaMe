
# Aula 6 — Autenticação e Autorização

## Projeto EvoluaMe

Esta atividade implementa e demonstra mecanismos de autenticação e autorização para proteger os dados dos usuários do EvoluaMe.

## Autenticação

O backend utiliza tokens JWT para autenticar usuários e controlar o acesso às rotas protegidas.

As sessões são registradas no banco de dados, permitindo sua revogação durante o logout.

O Supabase Auth também foi utilizado com três contas de teste para validar as políticas RLS.

## Autorização

O backend verifica a identidade do usuário e sua participação nas conversas antes de permitir operações no chat.

No Supabase, as seguintes tabelas possuem RLS ativado:

- conversas
- mensagens
- conversa_participantes
- usuario_auth_vinculos

As políticas SELECT permitem consultar somente os registros autorizados para o usuário autenticado.

O código das políticas está documentado em `schema.sql`.

## Testes realizados

Foram utilizadas três contas de teste:

| Conta | Conversas visíveis | Mensagens visíveis |
|---|---:|---:|
| A | 4 | 17 |
| B | 1 | 2 |
| C | 0 | 0 |

A tentativa de inserção direta não autorizada foi bloqueada pelo PostgreSQL, retornando o código 42501.

Também foram realizados testes de autenticação, logout, revogação de sessão e proteção das rotas do chat no backend.

## Instruções de verificação

1. Configurar as variáveis de ambiente do projeto, sem publicar senhas ou chaves.
2. Utilizar contas de teste autenticadas no Supabase.
3. Verificar se o RLS está habilitado nas quatro tabelas.
4. Conferir as políticas SELECT documentadas em `schema.sql`.
5. Consultar conversas e mensagens com diferentes contas.
6. Confirmar que usuários não conseguem visualizar dados de conversas das quais não participam.
7. Verificar que operações sem permissão são bloqueadas.

As políticas documentadas em `schema.sql` já foram aplicadas ao banco de laboratório. Não executar novamente os comandos CREATE POLICY sem verificar se as políticas existentes precisam ser substituídas.
