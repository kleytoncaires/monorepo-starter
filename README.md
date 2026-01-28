# Monorepo Starter

Monorepo full-stack com NestJS no backend e React no frontend.

## Tecnologias

### Backend

- NestJS 11
- PostgreSQL + Prisma ORM
- Autenticação JWT (access + refresh tokens)
- Nodemailer para emails
- Documentação Swagger
- Rate limiting
- API versionada (/v1)

### Frontend

- React 19
- Vite 7
- Material-UI 7 (com dark mode)
- React Router 7
- React Hook Form
- TanStack React Query

## Início Rápido

```bash
# Clone e configure tudo com um comando
git clone <url-do-repositorio>
cd monorepo-starter
yarn setup
```

Isso irá:

1. Instalar todas as dependências
2. Criar arquivo `.env` a partir do `.env.example`
3. Iniciar PostgreSQL + Mailpit no Docker
4. Executar migrations do banco
5. Gerar cliente Prisma
6. Popular banco com usuário admin

Depois inicie o desenvolvimento:

```bash
yarn dev
```

## Setup Manual (Passo a Passo)

Se preferir configurar manualmente ou se o `yarn setup` falhar:

### 1. Criar arquivo `.env`

```bash
cp .env.example .env
```

O projeto usa um único arquivo `.env` na raiz que é compartilhado por todos os serviços.

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env` conforme necessário:

```bash
# Variáveis essenciais para desenvolvimento (valores padrão funcionam)
DATABASE_URL=postgresql://postgres:postgres@localhost:6543/monorepo_db?schema=public
JWT_SECRET=mude-isso-para-uma-string-segura-em-producao
FRONTEND_URL=http://localhost:4200
VITE_API_URL=http://localhost:9000
```

Para **produção**, mude obrigatoriamente:

- `JWT_SECRET` - Use uma string aleatória longa e segura
- `DATABASE_URL` - Aponte para seu banco de produção
- `FRONTEND_URL` - URL do seu domínio
- `MAIL_*` - Configure SMTP real (SendGrid, AWS SES, etc.)

### 3. Iniciar o banco de dados

```bash
# Inicia PostgreSQL e Mailpit via Docker
yarn db:up
```

Isso cria dois containers:

- `monorepo-postgres-dev` - PostgreSQL na porta 6543
- `monorepo-mailpit` - Servidor de email fake (web: 8025, smtp: 1025)

### 4. Instalar dependências e configurar o banco

```bash
# Instalar dependências
yarn install

# Executar migrations do Prisma
yarn db:migrate

# Popular banco com usuário admin
yarn db:seed
```

### 5. Iniciar o backend e frontend

```bash
# Inicia ambos em paralelo
yarn dev

# Ou separadamente:
yarn workspace backend dev    # Backend na porta 9000
yarn workspace frontend dev   # Frontend na porta 4200
```

- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:9000
- **API Docs:** http://localhost:9000/api/docs
- **Mailpit:** http://localhost:8025

### Credenciais padrão

- Email: `admin@example.com`
- Senha: `Admin@123`

## Scripts Disponíveis

| Script            | Descrição                   |
| ----------------- | --------------------------- |
| `yarn setup`      | Setup inicial completo      |
| `yarn dev`        | Inicia backend e frontend   |
| `yarn build`      | Build de produção           |
| `yarn test`       | Executa todos os testes     |
| `yarn lint`       | Lint de todo o código       |
| `yarn db:up`      | Inicia PostgreSQL + Mailpit |
| `yarn db:down`    | Para containers             |
| `yarn db:migrate` | Executa migrations          |
| `yarn db:seed`    | Popula banco de dados       |
| `yarn db:studio`  | Abre Prisma Studio          |

## Estrutura do Projeto

```
monorepo-starter/
├── .env                         # Variáveis de ambiente
├── docker-compose.yml           # Produção
├── docker-compose.dev.yml       # Desenvolvimento
├── CLAUDE.md                    # Instruções detalhadas do projeto
│
├── backend/src/
│   ├── common/                  # Recursos compartilhados
│   │   ├── constants/           # Constantes globais
│   │   ├── decorators/          # @CurrentUser, @Roles, @RealIp
│   │   ├── dto/                 # DTOs compartilhados
│   │   ├── filters/             # Exception filters
│   │   ├── guards/              # JWT, Roles guards
│   │   ├── interceptors/        # Logging
│   │   └── pipes/               # Validation
│   ├── config/                  # Prisma config
│   ├── audit/                   # Logs de auditoria
│   ├── auth/                    # Autenticação
│   ├── mail/                    # Serviço de email
│   ├── notifications/           # Notificações in-app
│   ├── upload/                  # Upload de arquivos
│   └── users/                   # Usuários
│
└── frontend/src/
    ├── components/              # 1 pasta por componente
    │   ├── DataTable/
    │   ├── Modal/
    │   ├── Pagination/
    │   └── ...
    ├── contexts/                # Auth, Theme, Toast
    ├── hooks/                   # Hooks customizados
    ├── pages/                   # Páginas por feature
    ├── services/                # Serviços de API
    └── styles/                  # Tema MUI
```

## Features

- ✅ **Autenticação completa**
  - Login/Registro com verificação de email
  - JWT com refresh tokens
  - Remember me (7 ou 30 dias)
  - Reset de senha por email
  - Gerenciamento de sessões

- ✅ **Administração**
  - CRUD de usuários
  - Logs de auditoria
  - Controle de acesso (Admin/User)

- ✅ **UX/UI**
  - Dark mode
  - Notificações in-app
  - Paginação
  - Breadcrumbs
  - Responsivo

- ✅ **Upload de Arquivos**
  - Upload de avatar do usuário
  - Validação de tipo (JPEG, PNG, GIF, WebP)
  - Validação de magic bytes (segurança)
  - Limite de 5MB

- ✅ **Compliance**
  - Exportação de dados (LGPD)
  - Exclusão de conta própria
  - Rate limiting

## Endpoints da API

Todos os endpoints usam o prefixo `/v1/`.

### Autenticação (`/v1/auth`)

| Método | Endpoint                                   | Descrição                    |
| ------ | ------------------------------------------ | ---------------------------- |
| POST   | `/auth/register`                           | Cadastrar usuário            |
| POST   | `/auth/verify-email`                       | Verificar email              |
| POST   | `/auth/login`                              | Login                        |
| POST   | `/auth/refresh`                            | Renovar tokens               |
| POST   | `/auth/logout`                             | Logout                       |
| POST   | `/auth/forgot-password`                    | Solicitar reset              |
| POST   | `/auth/reset-password`                     | Redefinir senha              |
| POST   | `/auth/change-password`                    | Alterar senha                |
| GET    | `/auth/sessions`                           | Listar sessões               |
| DELETE | `/auth/sessions/:id`                       | Revogar sessão               |
| GET    | `/auth/validate-reset-token/:token`        | Validar token de reset       |
| GET    | `/auth/validate-verification-token/:token` | Validar token de verificação |

### Usuários (`/v1/users`)

| Método | Endpoint           | Descrição             | Permissão |
| ------ | ------------------ | --------------------- | --------- |
| GET    | `/users/me`        | Usuário atual         | Auth      |
| GET    | `/users/me/export` | Exportar dados        | Auth      |
| DELETE | `/users/me`        | Excluir própria conta | Auth      |
| GET    | `/users`           | Listar usuários       | Admin     |
| PATCH  | `/users/:id`       | Atualizar             | Auth      |
| DELETE | `/users/:id`       | Deletar               | Admin     |

### Upload (`/v1/upload`)

| Método | Endpoint         | Descrição        | Permissão |
| ------ | ---------------- | ---------------- | --------- |
| POST   | `/upload/avatar` | Upload de avatar | Auth      |
| DELETE | `/upload/avatar` | Remover avatar   | Auth      |

### Auditoria (`/v1/audit-logs`)

| Método | Endpoint              | Descrição     | Permissão |
| ------ | --------------------- | ------------- | --------- |
| GET    | `/audit-logs`         | Listar logs   | Admin     |
| GET    | `/audit-logs/actions` | Tipos de ação | Admin     |

### Notificações (`/v1/notifications`)

| Método | Endpoint                      | Descrição    |
| ------ | ----------------------------- | ------------ |
| GET    | `/notifications`              | Listar       |
| GET    | `/notifications/unread-count` | Contador     |
| PATCH  | `/notifications/:id/read`     | Marcar lida  |
| PATCH  | `/notifications/read-all`     | Marcar todas |
| DELETE | `/notifications/:id`          | Deletar      |

## Variáveis de Ambiente

| Variável         | Descrição                               |
| ---------------- | --------------------------------------- |
| `DATABASE_URL`   | String de conexão PostgreSQL            |
| `JWT_SECRET`     | Segredo para assinar JWT                |
| `JWT_EXPIRES_IN` | Expiração do access token (padrão: 15m) |
| `BACKEND_PORT`   | Porta do backend (padrão: 9000)         |
| `FRONTEND_PORT`  | Porta do frontend (padrão: 4200)        |
| `FRONTEND_URL`   | URL do frontend (para CORS)             |
| `MAIL_*`         | Configuração SMTP                       |

## Docker

### Desenvolvimento

```bash
yarn db:up    # PostgreSQL + Mailpit
yarn db:down  # Para containers
```

| Container               | Database      | Porta                    |
| ----------------------- | ------------- | ------------------------ |
| `monorepo-postgres-dev` | `monorepo_db` | 6543                     |
| `monorepo-mailpit`      | -             | 8025 (web) / 1025 (smtp) |

Acesso ao banco:

```bash
docker exec -it monorepo-postgres-dev psql -U postgres -d monorepo_db
```

### Produção

```bash
docker compose up -d --build
```

Serviços:

- PostgreSQL (`monorepo_db`): porta 6543
- Backend: porta 9000
- Frontend: porta 4200

## Deploy

### VPS com Docker

```bash
# No servidor
git clone <repo-url> && cd monorepo-starter
cp .env.example .env && nano .env  # Configure produção
docker compose up -d --build
```

### Atualizar

```bash
git pull && docker compose down && docker compose up -d --build
```

**Importante:** Configure `JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL` e SMTP antes de subir.

Para instruções detalhadas, consulte `CLAUDE.md`.

## Convenções

- **Backend:** DTOs em pasta `dto/` com `index.ts`, enums em `*.constants.ts`
- **Frontend:** Componentes em pasta própria, imports via `@/components`
- **Código:** Inglês para código, Português para UI
- **Commits:** Semânticos (feat, fix, refactor, docs)

Para mais detalhes, consulte o arquivo `CLAUDE.md`.

## Licença

MIT
