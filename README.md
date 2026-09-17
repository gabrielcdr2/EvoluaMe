# EvoluaMe

App de evolução pessoal com gamificação — desafios por área, XP e níveis.

## GRUPO (Desenvolvedores)
> Fabrício Bandeira, Fábio Roberto, Gabriel Campos, Rafael Rodrigues, Rebeca Romeu, Thainá Santana e Yago Cesar

## Prototipos das Telas feita no figma 

> Tela de Cadastro 
> Tela de Login 
> Tela Jornada 

> https://www.figma.com/proto/hNEWo137PZlydfYRPDXhud/EvoluaMe?node-id=0-1&t=E4OzFd8jQGwHo80m-1

## Estrutura do projeto

EvoluaMe/
├── app-evoluame/   → App mobile/web (Expo + React Native)
└── backend/        → API REST (Node.js + Express + MongoDB Atlas)

## Pré-requisitos

Precisa estar instalado:

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) (já vem com o Node)
- [Expo Go](https://expo.dev/go) no celular (para testar o app)

## 1. Clonar o repositório

```bash
git clone https://github.com/gabrielcdr2/EvoluaMe.git
cd EvoluaMe
```

## 2. Configurar o Backend

### Instalar dependências

```bash
cd backend
npm install
```

### Rodar o backend

```bash
# Modo desenvolvimento (reinicia automaticamente ao salvar)
npm run dev

# Modo produção
npm start
```

O servidor sobe em: `http://localhost:3000`

---

## 3. Configurar o App (Expo)

### Instalar dependências

```bash
cd app-evoluame
npm install
```

### Criar o arquivo de variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `app-evoluame/` com o seguinte conteúdo:

```env
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

> Em produção, troque `http://localhost:3000` pela URL do seu backend no Render.

### Rodar o app

```bash
npx expo start
```

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Health check |
| `GET` | `/api/atividades?usuarioId=&area=` | Lista desafios |
| `POST` | `/api/atividades` | Cria desafio |
| `DELETE` | `/api/atividades/:id` | Remove desafio |
| `GET` | `/api/progresso/:usuarioId` | Busca XP e nível |
| `POST` | `/api/progresso/concluir` | Conclui desafio e soma XP |

---

## Deploy

| Serviço | Pasta | Observação |
|---------|-------|------------|
| **Render** | `backend/` | Start: `npm start` |
| **Vercel** | `app-evoluame/` | Root Directory: `app-evoluame` |
| **MongoDB Atlas** | — | Liberar acesso de rede (`0.0.0.0/0`) |
