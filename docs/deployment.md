# Noturno Deployment Guide

Guia de deploy para produção.

## Visão Geral

| Serviço | Plataforma | URL |
|---------|------------|-----|
| Web App | Vercel | https://noturno.app |
| Mobile App | EAS (Expo) | App Store / Play Store |
| Backend | Convex | https://convex.dev |

## Deploy da Web App (Vercel)

### 1. Configuração Inicial

```bash
# Instale Vercel CLI
bun add -g vercel

# Login
vercel login
```

### 2. Deploy

```bash
# Deploy manual
vercel --prod

# Ou via Git (recomendado)
# Conecte o repo no dashboard da Vercel
```

### 3. Variáveis de Ambiente

Configure no dashboard da Vercel:

```env
NEXT_PUBLIC_APP_URL=https://noturno.app
BETTER_AUTH_SECRET=<secret>
BETTER_AUTH_URL=https://noturno.app
NEXT_PUBLIC_CONVEX_URL=https://<deploy>.convex.cloud
```

## Deploy do Backend (Convex)

### 1. Instalação

```bash
# Instale Convex CLI
bun add -g convex

# Login
convex login
```

### 2. Deploy

```bash
cd packages/convex

# Deploy para produção
convex deploy

# Ou
bun run deploy
```

### 3. Variáveis de Ambiente

Configure no dashboard do Convex:

```env
BETTER_AUTH_SECRET=<secret>
OPENAI_API_KEY=sk-...
SERPAPI_KEY=...
RESEND_API_KEY=re_...
```

## Deploy do Mobile (EAS)

### 1. Configuração

```bash
# Instale EAS CLI
bun add -g eas-cli

# Login
eas login
```

### 2. Configure o Projeto

```bash
cd apps/mobile

# Configure o projeto
eas build:configure
```

### 3. Build

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Ambos
eas build --platform all
```

### 4. Submit (App Store / Play Store)

```bash
# Submeter para review
eas submit --platform ios
eas submit --platform android
```

## CI/CD

### GitHub Actions

O projeto já possui workflows configurados:

- **CI**: Executa em todo PR
- **Deploy Web**: Automático na main (Vercel)
- **Deploy Convex**: Manual ou via changeset

### Changesets

Para releases versionados:

```bash
# Criar changeset
bun run changeset

# Versionar
bun run changeset:version

# Publicar
bun run changeset:publish
```

## Monitoramento

### Convex

- Dashboard: https://dashboard.convex.dev
- Métricas: Latência, throughput, erros
- Logs: Tempo real

### Vercel

- Analytics: Built-in
- Logs: https://vercel.com/dashboard

### Mobile

- Crashlytics (Firebase)
- Analytics (Expo)

## Rollback

### Web

```bash
# Vercel permite rollback via dashboard
# Ou via CLI:
vercel --prod --version=<versao-anterior>
```

### Convex

```bash
# Reverter para deploy anterior
convex deploy --version=<versao>
```

## Checklist de Deploy

- [ ] Testes passando
- [ ] Lint OK
- [ ] Typecheck OK
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets configurados
- [ ] Domínio configurado
- [ ] SSL ativo
- [ ] Monitoramento ativo

## Suporte

Em caso de problemas:

1. Verifique os logs no dashboard
2. Confira as variáveis de ambiente
3. Teste localmente com `bun run dev`
4. Entre em contato com a equipe
