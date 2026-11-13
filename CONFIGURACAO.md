# Configuração do ambiente — EvoluaMe

## 1. Backend

Entre na pasta backend e instale as dependências:

cd backend
npm install

Copie o arquivo .env.example para um novo arquivo chamado .env.

Preencha as variáveis com as configurações do seu ambiente:

- MONGODB_URI: conexão com o MongoDB.
- JWT_SECRET: chave secreta forte para autenticação.
- SUPABASE_URL: URL do projeto Supabase.
- SUPABASE_SECRET_KEY: chave privada do Supabase.
- GEMINI_API_KEY: chave da API Gemini, quando utilizada.
- PORT: porta do servidor (padrão 3000).
- CORS_ORIGINS: origens autorizadas.

Inicie o servidor:

npm start

## 2. Aplicativo Expo

Entre na pasta app-evoluame e instale as dependências:

cd app-evoluame
npm install

Copie o arquivo .env.example para um novo arquivo chamado .env.

Configure:

- EXPO_PUBLIC_API_BASE_URL: endereço do backend.
- EXPO_PUBLIC_SUPABASE_URL: URL do Supabase.
- EXPO_PUBLIC_SUPABASE_ANON_KEY: chave pública do Supabase.

Inicie o aplicativo:

npx expo start

Observação: em um celular físico, localhost não aponta para o computador que executa o backend. Utilize um endereço acessível pelo celular.

## 3. Segurança — Aula 6

As regras de acesso do Supabase estão documentadas em supabase/README.md e supabase/schema.sql.

As políticas RLS precisam estar configuradas no banco Supabase utilizado.

O backend utiliza autenticação JWT e controle de sessões para proteger rotas.

Nunca publique arquivos .env, senhas, tokens ou chaves privadas no GitHub.
