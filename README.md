# Noturno

> Automação de prospecção outbound usando IA

[![CI](https://github.com/noturno/noturno/actions/workflows/ci.yml/badge.svg)](https://github.com/noturno/noturno/actions/workflows/ci.yml)

## Visão Geral

Noturno é um SaaS que automatiza a prospecção outbound usando IA. O sistema busca leads automaticamente, gera relatórios pré-chamada e cria emails personalizados de primeiro contato.

### Proposta de Valor

> *"Defina seu cliente ideal, receba leads pesquisados com email pronto para enviar."*

## Arquitetura

```
noturno/
├── apps/
│   ├── web/           # Next.js 16 (App Router)
│   └── mobile/        # Expo SDK 54 + Native Wind
├── packages/
│   ├── convex/        # Backend Convex (BD + funções)
│   ├── shared/        # Tipos e utilitários compartilhados
│   └── better-auth/   # Configuração Better Auth
└── tooling/
    ├── eslint-config/
    ├── typescript-config/
    └── prettier-config/
```

## Stack Tecnológico

| Componente | Tecnologia |
|------------|------------|
| **Monorepo** | Turborepo + Bun |
| **Web** | Next.js 16 (App Router) + Tailwind CSS |
| **Mobile** | Expo SDK 54 + Native Wind |
| **Backend** | Convex (BD + funções serverless) |
| **Autenticação** | Better Auth |
| **IA** | OpenAI API |
| **Busca** | SerpAPI |
| **Email** | Resend |

## Requisitos

- Bun 1.2.0+
- Node.js 22+

## Começando

### 1. Clone o repositório

```bash
git clone https://github.com/noturno/noturno.git
cd noturno
```

### 2. Instale as dependências

```bash
bun install
```

### 3. Configure as variáveis de ambiente

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
cp packages/convex/.env.example packages/convex/.env.local
```

### 4. Execute o projeto

```bash
# Todos os apps em paralelo
bun run dev

# Apenas web
bun run dev:web

# Apenas mobile
bun run dev:mobile
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `bun run dev` | Executa todos os apps em modo desenvolvimento |
| `bun run build` | Compila todos os pacotes |
| `bun run lint` | Executa lint em todos os pacotes |
| `bun run lint:fix` | Corrige problemas de lint automaticamente |
| `bun run typecheck` | Verifica tipos TypeScript |
| `bun run format` | Verifica formatação |
| `bun run format:fix` | Corrige formatação automaticamente |
| `bun run test` | Executa testes |

## Fluxo de Trabalho

### Fluxo de Desenvolvimento

```
feature/nome-da-feature → PR → Review (Greptile) → Merge → main
```

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudanças de código)
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## Documentação

- [Getting Started](./docs/getting-started.md)
- [Arquitetura](./docs/architecture.md)
- [Deployment](./docs/deployment.md)

## Licença

[MIT](./LICENSE)
