# EvoluaMe — Monorepo

Estrutura do projeto:

```
EvoluaMe/
├── app-evoluame/   → App mobile/web (Expo + React Native)
└── backend/        → API REST (Node.js + Express + MongoDB Atlas)
```

## Rodando localmente

### Backend (porta 3000)
```bash
cd backend
npm install
npm run dev
```

### App Expo
```bash
cd app-evoluame
npm install
npx expo start
```

## Comunicação entre app e backend

| Ambiente | URL da API no app |
|---|---|
| Dev local | `http://localhost:3000` |
| Produção | `https://evoluame-api.onrender.com` |

A variável `EXPO_PUBLIC_API_BASE_URL` em `app-evoluame/.env` controla qual URL é usada.
