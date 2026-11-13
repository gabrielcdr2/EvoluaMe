
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes podem ler mensagens"
ON public.mensagens
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversa_participantes cp
    WHERE cp.conversa_id = mensagens.conversa_id
      AND cp.usuario_id IN (
        SELECT mongo_user_id
        FROM public.usuario_auth_vinculos
        WHERE auth_user_id = (SELECT auth.uid())
      )
  )
);


-- Politica de leitura da tabela conversas

ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes podem consultar conversas"
ON public.conversas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversa_participantes cp
    WHERE cp.conversa_id = conversas.id
      AND cp.usuario_id IN (
        SELECT mongo_user_id
        FROM public.usuario_auth_vinculos
        WHERE auth_user_id = (SELECT auth.uid())
      )
  )
);


-- Politica de leitura da tabela conversa_participantes

ALTER TABLE public.conversa_participantes
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario consulta sua participacao"
ON public.conversa_participantes
FOR SELECT
TO authenticated
USING (
  usuario_id IN (
    SELECT mongo_user_id
    FROM public.usuario_auth_vinculos
    WHERE auth_user_id = (SELECT auth.uid())
  )
);


-- Politica de leitura da tabela usuario_auth_vinculos

ALTER TABLE public.usuario_auth_vinculos
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario consulta seu proprio vinculo"
ON public.usuario_auth_vinculos
FOR SELECT
TO authenticated
USING (
  auth_user_id = (SELECT auth.uid())
);

