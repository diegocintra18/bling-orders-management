# Bling Orders - Centralizador de Pedidos

Dashboard para gerenciamento de pedidos Bling com suporte a múltiplas contas.

## Stack

- **Backend**: NestJS
- **Frontend**: Next.js 14 (App Router)
- **Database**: MongoDB
- **Autenticação**: JWT com refresh tokens

## Estrutura do Projeto

```
bling/
├── apps/
│   ├── api/          # Backend NestJS
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/          # Autenticação JWT
│   │       │   ├── accounts/      # Contas Bling
│   │       │   ├── stores/        # Lojas
│   │       │   ├── orders/        # Pedidos
│   │       │   ├── webhooks/      # Webhooks Bling
│   │       │   ├── tracking/      # Job de atrasados
│   │       │   └── sync/          # Sincronização
│   │       ├── core/              # Entidades e interfaces
│   │       ├── infra/            # Database e integrações
│   │       └── common/           # Decorators e guards
│   └── web/          # Frontend Next.js
│       └── src/
│           ├── app/
│           │   ├── (dashboard)/   # Páginas protegidas
│           │   └── login/         # Página de login
│           ├── components/        # Componentes React
│           └── lib/               # Utilitários
├── packages/
│   ├── core/         # Tipos e entidades compartilhadas
│   └── infra/        # Cliente Bling e database
└── turbo.json
```

## Começando

### Pré-requisitos

- Node.js 20+
- MongoDB (local ou Atlas)
- NPM ou Yarn

### Instalação

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

```bash
# apps/api/.env
cp apps/api/.env.example apps/api/.env
# Edite com suas configurações

# apps/web/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Execute o projeto:

```bash
# Desenvolvimento (ambos api e web)
npm run dev

# Ou individualmente:
npm run dev --filter=@bling-orders/api
npm run dev --filter=@bling-orders/web
```

## Configuração do Webhook no Bling

1. Acesse sua conta Bling
2. Vá em: **Configurações > Integrações > Webhooks**
3. Crie um novo webhook:
   - URL: `https://seu-dominio.com/webhook/bling/{accountId}`
   - Eventos: Pedidos, Rastreamento
4. Use o `webhookToken` gerado no cadastro da conta

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Registro |
| POST | `/auth/refresh` | Renovar token |

### Pedidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/orders` | Listar pedidos |
| GET | `/orders/stats` | Estatísticas |
| GET | `/orders/delayed` | Pedidos atrasados |
| GET | `/orders/:id` | Detalhes |

### Webhooks

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/webhook/bling/:accountId` | Receber webhook |

## Funcionalidades

- **Dashboard**: Visão geral com stats de pedidos
- **Pedidos**: Lista com filtros por status, atrasados, busca
- **Contas**: Gerenciamento de múltiplas contas Bling
- **Lojas**: Agrupamento de contas
- **Tracking**: Detecção automática de pedidos atrasados (>24h)
- **Sync**: Sincronização periódica com API Bling

## Regras de Negócio

- Pedidos com mais de 24h sem separação são marcados como `isDelayed = true`
- Webhooks são validados por token
- Cada conta Bling possui seu próprio webhook token
- Sincronização automática a cada 15 minutos
