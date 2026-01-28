# Monorepo Starter - Instruções do Projeto

## Visão Geral

Monorepo full-stack com NestJS no backend e React no frontend usando yarn workspaces.

## Gerenciador de Pacotes

**SEMPRE use `yarn` neste projeto, NUNCA `npm`.**

- Instalar dependências: `yarn` ou `yarn install`
- Adicionar pacote: `yarn add <pacote>` ou `yarn workspace <workspace> add <pacote>`
- Rodar scripts: `yarn <script>` ou `yarn workspace <workspace> <script>`

## Stack Tecnológica

- **Backend:** NestJS 11, PostgreSQL, Prisma ORM, autenticação JWT, Nodemailer
- **Frontend:** React 19, Vite 7, Material-UI 7, React Router 7, React Hook Form, TanStack Query, Zod
- **Infraestrutura:** Docker, GitHub Actions CI/CD

## Estrutura do Projeto

### Backend

```
backend/src/
├── main.ts                          # Bootstrap da aplicação
├── app.module.ts                    # Módulo raiz
├── app.controller.ts                # Health check
│
├── common/                          # ⭐ Recursos compartilhados
│   ├── index.ts                     # Re-exporta tudo
│   ├── constants/                   # Constantes globais
│   │   ├── index.ts
│   │   ├── app.constants.ts         # URLs, rotas do frontend
│   │   ├── error-messages.constants.ts
│   │   ├── mail.constants.ts
│   │   └── throttle.constants.ts
│   ├── decorators/                  # Decorators customizados
│   │   ├── index.ts
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── dto/                         # DTOs compartilhados
│   │   ├── index.ts
│   │   └── pagination.dto.ts
│   ├── filters/                     # Exception filters
│   │   ├── index.ts
│   │   └── http-exception.filter.ts
│   ├── guards/                      # Guards de autenticação/autorização
│   │   ├── index.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/                # Interceptors (logging, transform)
│   │   ├── index.ts
│   │   └── logging.interceptor.ts
│   └── pipes/                       # Pipes de validação
│       ├── index.ts
│       └── validation.pipe.ts
│
├── config/                          # Configurações
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── audit/                           # Módulo de auditoria
│   ├── dto/
│   │   ├── index.ts
│   │   ├── audit-log.dto.ts
│   │   ├── audit-query.dto.ts
│   │   └── create-audit-log.dto.ts
│   ├── audit.constants.ts           # AuditAction enum
│   ├── audit.controller.ts
│   ├── audit.module.ts
│   └── audit.service.ts
│
├── auth/                            # Módulo de autenticação
│   ├── dto/
│   │   ├── index.ts
│   │   └── ... (9 DTOs)
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
│
├── mail/                            # Módulo de email
│   ├── templates/                   # Templates Handlebars
│   ├── mail.module.ts
│   └── mail.service.ts
│
├── notifications/                   # Módulo de notificações
│   ├── dto/
│   │   ├── index.ts
│   │   ├── create-notification.dto.ts
│   │   └── notification.dto.ts
│   ├── notifications.constants.ts   # NotificationType enum
│   ├── notifications.controller.ts
│   ├── notifications.module.ts
│   └── notifications.service.ts
│
└── users/                           # Módulo de usuários
    ├── dto/
    │   ├── index.ts
    │   ├── create-user.dto.ts
    │   └── update-user.dto.ts
    ├── types/
    │   ├── index.ts
    │   └── user.types.ts
    ├── users.controller.ts
    ├── users.module.ts
    └── users.service.ts
```

### Frontend

```
frontend/src/
├── main.tsx                         # Entry point
├── App.tsx                          # Rotas
│
├── components/                      # ⭐ Componentes (1 pasta por componente)
│   ├── index.ts                     # Re-exporta todos
│   ├── Breadcrumbs/
│   │   ├── index.ts
│   │   └── Breadcrumbs.tsx
│   ├── DataTable/
│   │   ├── index.ts
│   │   └── DataTable.tsx
│   ├── EmptyState/
│   ├── ErrorBoundary/
│   ├── LoadingSpinner/
│   ├── MainLayout/
│   ├── MaskedInput/
│   ├── Modal/
│   ├── PageHeader/
│   ├── Pagination/
│   ├── PasswordStrengthIndicator/
│   ├── PhoneInput/
│   └── TableSkeleton/
│
├── contexts/                        # Contexts React
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
│
├── hooks/                           # Hooks customizados
│   ├── useDebounce.ts
│   └── useUsers.ts
│
├── schemas/                         # ⭐ Schemas de validação (Zod)
│   ├── index.ts                     # Re-exporta todos
│   ├── common.schema.ts             # Schemas base (email, password, phone)
│   ├── auth.schema.ts               # Login, registro, reset password
│   └── profile.schema.ts            # Perfil, alteração de senha
│
├── pages/                           # Páginas (por feature)
│   ├── auth/
│   ├── dashboard/
│   ├── profile/
│   ├── users/
│   ├── audit/
│   ├── sessions/
│   └── notifications/
│
├── services/                        # Serviços de API
│   ├── api.ts                       # Axios instance + helpers
│   ├── users.service.ts
│   ├── sessions.service.ts
│   ├── audit.service.ts
│   ├── notifications.service.ts
│   └── upload.service.ts
│
├── types/                           # ⭐ Tipos TypeScript compartilhados
│   ├── index.ts                     # Re-exporta todos
│   ├── api.ts                       # PaginatedResponse, PaginationParams
│   ├── auth.ts                      # User, AuthState, LoginCredentials
│   ├── audit.ts                     # AuditLog, AuditLogParams
│   ├── notifications.ts             # Notification
│   ├── sessions.ts                  # Session
│   └── upload.ts                    # UploadResponse
│
├── constants/                       # Constantes
├── styles/                          # Tema MUI
└── utils/                           # Utilitários
```

## Comandos de Desenvolvimento

```bash
# Setup inicial
yarn setup

# Desenvolvimento
yarn dev

# Banco de dados
yarn db:up          # Inicia containers (PostgreSQL + Mailpit)
yarn db:down        # Para containers
yarn db:migrate     # Executa migrations Prisma
yarn db:seed        # Popula banco com usuário admin
yarn db:studio      # Abre Prisma Studio

# Testes e Lint
yarn test           # Todos os testes
yarn lint           # Lint de todo o código
yarn lint:fix       # Corrige problemas de lint
```

## Endpoints da API (v1)

Todos os endpoints usam o prefixo `/v1/`.

### Autenticação (`/v1/auth`)

- `POST /auth/register` - Cadastrar novo usuário
- `POST /auth/verify-email` - Verificar email com token
- `POST /auth/resend-verification` - Reenviar email de verificação
- `POST /auth/login` - Login e obter tokens
- `POST /auth/refresh` - Renovar access token
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Solicitar email de reset
- `POST /auth/reset-password` - Redefinir senha
- `POST /auth/change-password` - Alterar senha (autenticado)
- `GET /auth/sessions` - Listar sessões ativas
- `DELETE /auth/sessions/:id` - Revogar sessão
- `DELETE /auth/sessions` - Revogar todas exceto atual

### Usuários (`/v1/users`)

- `GET /users/me` - Obter usuário atual
- `GET /users/me/export` - Exportar dados pessoais (LGPD)
- `GET /users` - Listar usuários (Admin)
- `GET /users/:id` - Obter usuário por ID
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário (Admin)

### Auditoria (`/v1/audit-logs`) - Admin only

- `GET /audit-logs` - Listar logs de auditoria
- `GET /audit-logs/actions` - Listar tipos de ação

### Notificações (`/v1/notifications`)

- `GET /notifications` - Listar notificações do usuário
- `GET /notifications/unread-count` - Contador de não lidas
- `PATCH /notifications/:id/read` - Marcar como lida
- `PATCH /notifications/read-all` - Marcar todas como lidas
- `DELETE /notifications/:id` - Deletar notificação
- `DELETE /notifications` - Deletar todas lidas

## Convenções de Código

### Backend (NestJS)

**Estrutura de módulos:**

```
modulo/
├── dto/
│   ├── index.ts              # Re-exporta todos os DTOs
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
├── modulo.constants.ts       # Enums e constantes do módulo
├── modulo.controller.ts
├── modulo.module.ts
└── modulo.service.ts
```

**Imports:**

```typescript
// ✅ Usar barrel imports
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { AuditLogQueryDto, CreateAuditLogDto } from './dto';

// ❌ Evitar imports diretos
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
```

**Padrões:**

- Usar DTOs para validação de request/response
- Usar guards para autenticação (`JwtAuthGuard`) e autorização (`RolesGuard`)
- Usar decorators para padrões comuns (`@CurrentUser()`, `@Roles()`)
- Constantes e enums do módulo em `*.constants.ts`
- Toda pasta com múltiplos arquivos deve ter `index.ts`

### Frontend (React)

**Imports de componentes:**

```typescript
// ✅ Usar barrel import
import { DataTable, Pagination, PageHeader, Modal } from '@/components';

// ❌ Evitar imports individuais
import DataTable from '@/components/DataTable/DataTable';
```

**Imports de tipos:**

```typescript
// ✅ Importar tipos da pasta types/
import type { User, Session } from '@/types';
import type { PaginatedResponse } from '@/types/api';

// ❌ Não definir tipos dentro de services
// ❌ Não importar tipos de um service para outro
```

**Validação com Zod:**

```typescript
// ✅ Usar schemas da pasta schemas/
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas';

const { register, handleSubmit } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});

// ❌ Não usar rules inline do react-hook-form
{...register('email', { required: 'Email obrigatório' })}
```

**Padrões:**

- Uma pasta por componente com `index.ts`
- Usar React Hook Form + Zod para formulários
- Usar TanStack Query para gerenciamento de estado do servidor
- Usar alias `@/` para imports (ex: `@/components`, `@/services`)
- Cores do tema: usar `action.hover`, `divider`, `text.secondary` (não hardcodar `grey.100`)
- Tipos compartilhados ficam em `types/`, não dentro de `services/`
- Schemas de validação ficam em `schemas/`, com tipos inferidos via `z.infer`

### Nomenclatura

- Arquivos: kebab-case (`auth.service.ts`, `LoginPage.tsx`)
- Componentes: PascalCase (`LoginPage`, `ErrorBoundary`)
- Funções/variáveis: camelCase (`getCurrentUser`, `isLoading`)
- Constantes: UPPER_SNAKE_CASE (`SALT_ROUNDS`, `API_URL`)
- Enums: PascalCase para nome, UPPER_SNAKE_CASE para valores

## Banco de Dados

### Models

- `User` - Usuários do sistema
- `RefreshToken` - Tokens de refresh + dados de sessão
- `PasswordResetToken` - Tokens de reset de senha
- `EmailVerificationToken` - Tokens de verificação de email
- `AuditLog` - Logs de auditoria
- `Notification` - Notificações in-app

### Credenciais padrão (seed)

- Email: `admin@example.com`
- Senha: `Admin@123`

## Features Implementadas

- ✅ Autenticação JWT com refresh tokens
- ✅ Verificação de email obrigatória
- ✅ Reset de senha por email
- ✅ Remember me (30 dias)
- ✅ Gerenciamento de sessões
- ✅ Logs de auditoria
- ✅ Notificações in-app
- ✅ Dark mode
- ✅ Exportação de dados (LGPD)
- ✅ Paginação
- ✅ Rate limiting
- ✅ API versionada (/v1)

## Emails em Desenvolvimento (Mailpit)

- **Interface Web:** http://localhost:8025
- **SMTP:** localhost:1025 (sem autenticação)

## Docker

### Containers e Banco de Dados

| Ambiente | Container               | Database      | Porta     |
| -------- | ----------------------- | ------------- | --------- |
| Dev      | `monorepo-postgres-dev` | `monorepo_db` | 6543      |
| Dev      | `monorepo-mailpit`      | -             | 8025/1025 |
| Prod     | `monorepo-postgres`     | `monorepo_db` | 6543      |

**Acesso ao banco (dev):**

```bash
docker exec -it monorepo-postgres-dev psql -U postgres -d monorepo_db
```

### Desenvolvimento

```bash
yarn db:up    # PostgreSQL + Mailpit
yarn db:down  # Para containers
```

### Produção

```bash
docker compose up -d --build
```

## Deploy Manual

### Opção 1: VPS com Docker Compose

**Requisitos:** VPS com Docker e Docker Compose instalados.

```bash
# 1. No servidor, clone o repositório
git clone <repo-url> && cd monorepo-starter

# 2. Configure as variáveis de ambiente
cp .env.example .env
nano .env  # Edite com valores de produção

# 3. Suba os containers
docker compose up -d --build

# 4. Para atualizar após mudanças
git pull
docker compose down
docker compose up -d --build
```

**Variáveis importantes para produção:**

```env
JWT_SECRET=<gerar-secret-forte>
DATABASE_URL=postgresql://user:senha@postgres:5432/monorepo_db
FRONTEND_URL=https://seudominio.com
MAIL_HOST=smtp.seudominio.com
```

### Opção 2: Usar Imagens do GitHub Container Registry

O CI já publica imagens em `ghcr.io` quando há push na `main`.

```bash
# 1. Login no registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 2. Pull das imagens
docker pull ghcr.io/<usuario>/<repo>-backend:main
docker pull ghcr.io/<usuario>/<repo>-frontend:main

# 3. Rode com docker-compose.yml ajustado para usar as imagens
```

### Opção 3: Plataformas PaaS

| Plataforma  | Como configurar                                       |
| ----------- | ----------------------------------------------------- |
| **Railway** | Conecta ao GitHub, detecta Dockerfile automaticamente |
| **Render**  | Criar Web Service apontando para cada Dockerfile      |
| **Fly.io**  | `fly launch` na pasta de cada serviço                 |

### Checklist de Produção

- [ ] `JWT_SECRET` forte e único
- [ ] `DATABASE_URL` apontando para banco de produção
- [ ] `FRONTEND_URL` configurado (CORS)
- [ ] SMTP configurado para emails reais
- [ ] HTTPS configurado (nginx/traefik na frente)
- [ ] Backup do banco configurado
- [ ] Monitoramento/logs configurados

## Idioma

- Interface do usuário: Português (PT-BR)
- Código fonte: Inglês (variáveis, funções, classes)
- Mensagens de erro/validação: Português
- Templates de email: Português
