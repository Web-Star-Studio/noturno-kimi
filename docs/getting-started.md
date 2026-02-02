# Getting Started

Guia de início rápido para desenvolvimento no Noturno.

## Pré-requisitos

- **Bun** 1.2.0 ou superior
- **Node.js** 22 ou superior (para compatibilidade)
- **Git**

## Instalação

### 1. Instale o Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Clone e instale

```bash
git clone https://github.com/noturno/noturno.git
cd noturno
bun install
```

## Configuração

### Variáveis de Ambiente

Crie arquivos `.env.local` nos seguintes locais:

**apps/web/.env.local:**
```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Better Auth
BETTER_AUTH_SECRET=sua-chave-secreta-aqui
BETTER_AUTH_URL=http://localhost:3000

# Convex
NEXT_PUBLIC_CONVEX_URL=https://seu-deploy.convex.cloud
```

**apps/mobile/.env.local:**
```env
# Expo
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_CONVEX_URL=https://seu-deploy.convex.cloud
```

**packages/convex/.env.local:**
```env
# Convex
CONVEX_DEPLOYMENT=seu-deploy:versao

# Integrações
OPENAI_API_KEY=sk-...
SERPAPI_KEY=...
RESEND_API_KEY=re_...
```

## Executando o Projeto

### Modo Desenvolvimento

```bash
# Todos os apps
bun run dev

# Apenas web
bun run dev:web

# Apenas mobile
bun run dev:mobile

# Apenas Convex
bun --filter convex dev
```

### Build

```bash
# Build completo
bun run build

# Build específico
bun --filter web build
```

## Estrutura de Pacotes

### Apps

- `apps/web` - Aplicação Next.js
- `apps/mobile` - Aplicação Expo

### Packages

- `packages/convex` - Backend Convex
- `packages/shared` - Código compartilhado
- `packages/better-auth` - Configuração de autenticação

### Tooling

- `tooling/eslint-config` - Configuração ESLint
- `tooling/typescript-config` - Configuração TypeScript
- `tooling/prettier-config` - Configuração Prettier

## Comandos Úteis

### Lint e Formatação

```bash
# Verificar lint
bun run lint

# Corrigir lint
bun run lint:fix

# Verificar formatação
bun run format

# Corrigir formatação
bun run format:fix
```

### TypeScript

```bash
# Verificar tipos
bun run typecheck

# Verificar tipos em pacote específico
bun --filter web typecheck
```

### Testes

```bash
# Executar testes
bun run test

# Executar testes em watch mode
bun run test:watch
```

## Resolução de Problemas

### Bun não encontrado

```bash
# Adicione ao PATH
export PATH="$HOME/.bun/bin:$PATH"
```

### Dependências desatualizadas

```bash
# Limpar e reinstalar
bun run clean
bun install
```

### Cache do Turbo

```bash
# Limpar cache
rm -rf .turbo
rm -rf node_modules/.cache
```

## Próximos Passos

- Leia a [documentação de arquitetura](./architecture.md)
- Configure seu editor (VSCode recomendado)
- Execute os testes para verificar a instalação
