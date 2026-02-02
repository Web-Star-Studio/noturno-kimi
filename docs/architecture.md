# Arquitetura

Visão geral da arquitetura do Noturno.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cliente                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                             │
│  │   Web App    │  │  Mobile App  │                             │
│  │  (Next.js)   │  │   (Expo)     │                             │
│  └──────┬───────┘  └──────┬───────┘                             │
└─────────┼────────────────┼───────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Convex                                │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │    │
│  │  │  Queries    │ │ Mutations   │ │  Actions    │        │    │
│  │  │  (Leitura)  │ │ (Escrita)   │ │  (Async)    │        │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘        │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────────┐ │    │
│  │  │                Banco de Dados                        │ │    │
│  │  │  • users • icps • leads • preCallReports • emails  │ │    │
│  │  └─────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Better Auth                          │    │
│  │            (Autenticação Centralizada)                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Serviços Externos                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   OpenAI    │  │   SerpAPI   │  │   Resend    │               │
│  │   (IA)      │  │  (Busca)    │  │   (Email)   │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### 1. Frontend

#### Web App (Next.js 14)

- **Framework**: Next.js 14 com App Router
- **Estilização**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Autenticação**: Better Auth (cookies)
- **Dados**: Convex client (real-time)

#### Mobile App (Expo SDK 54)

- **Framework**: Expo SDK 54
- **Navegação**: Expo Router
- **Estilização**: Native Wind (Tailwind para RN)
- **Autenticação**: Better Auth (secure storage)
- **Dados**: Convex client (real-time)

### 2. Backend (Convex)

#### Funções

| Tipo | Uso | Exemplo |
|------|-----|---------|
| **Query** | Leitura de dados | `getLead`, `listICPs` |
| **Mutation** | Escrita de dados | `createICP`, `updateLead` |
| **Action** | Operações async | `searchLeads`, `generateReport` |

#### Banco de Dados

**Tabelas:**

- `users` - Usuários (vinculado ao Better Auth)
- `icps` - Perfis de cliente ideal
- `leads` - Leads encontrados
- `preCallReports` - Relatórios pré-chamada
- `emails` - Emails gerados
- `searchJobs` - Jobs de busca async

#### Fluxo de Busca de Leads

```
Usuário inicia busca
       │
       ▼
┌─────────────┐
│   Action    │  searchLeads
│  (Convex)   │  • Valida ICP
└──────┬──────┘  • Cria job
       │
       ▼
┌─────────────┐
│  SerpAPI    │  Busca empresas
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Leads     │  Criar leads
│   (Batch)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  OpenAI     │  Gerar relatórios
│  (Async)    │  Gerar emails
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Update    │  Marcar como "pronto"
│   Status    │  Notificar cliente
└─────────────┘
```

### 3. Autenticação (Better Auth)

- **Server**: Configuração centralizada no Convex
- **Client**: Hooks compartilhados entre web e mobile
- **Storage**:
  - Web: Cookies HTTP-only
  - Mobile: SecureStore (Expo)

### 4. Integrações Externas

#### OpenAI API

- **Modelo**: GPT-4
- **Uso**: Geração de relatórios e emails
- **Custo**: ~$20/mês (estimado)

#### SerpAPI

- **Uso**: Busca de empresas no Google
- **Limite**: 100 resultados/busca
- **Custo**: $50/mês (plano básico)

#### Resend

- **Uso**: Envio de emails transacionais
- **Limite**: 1000 emails/dia (plano gratuito)
- **Custo**: $1/1000 emails

## Padrões de Projeto

### Repository Pattern

```typescript
// convex/icps/get.ts
export const getICP = query({
  args: { id: v.id("icps") },
  returns: v.union(v.null(), ICPValidator),
  handler: async (ctx, args) => {
    const icp = await ctx.db.get(args.id);
    if (!icp || icp.userId !== ctx.userId) {
      return null;
    }
    return icp;
  },
});
```

### Validação com Zod (Shared)

```typescript
// packages/shared/src/validators/icp.ts
export const createICPSchema = z.object({
  name: z.string().min(1),
  nicho: z.string().min(1),
  regiao: z.string().min(1),
  palavrasChave: z.array(z.string()).min(1),
});
```

### Hooks no Frontend

```typescript
// apps/web/src/hooks/use-icps.ts
export function useICPs() {
  const { user } = useAuth();
  return useQuery(api.icps.list, user ? {} : "skip");
}
```

## Fluxo de Dados

### 1. Criar ICP

```
Web/Mobile → Better Auth (valida) → Convex Mutation → DB
```

### 2. Buscar Leads

```
Web/Mobile → Better Auth → Convex Action → SerpAPI → OpenAI → DB → WebSocket → Web/Mobile
```

### 3. Visualizar Lead

```
Web/Mobile → Convex Query (real-time) → DB
```

### 4. Enviar Email

```
Web/Mobile → Convex Action → Resend → DB
```

## Segurança

- **Autenticação**: JWT via Better Auth
- **Autorização**: Verificação de `userId` em cada função Convex
- **Rate Limiting**: Built-in no Convex + Better Auth
- **Validação**: Zod em inputs, Convex validators em DB

## Escalabilidade

- **Convex**: Auto-escala (serverless)
- **Turbo**: Cache inteligente de builds
- **Bun**: Runtime rápido para desenvolvimento
