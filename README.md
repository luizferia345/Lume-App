# 🧠 Lume — App de Bem-Estar e Saúde Mental com IA
© 2026 Luiz Dias. Todos os direitos reservados.

Aplicativo mobile em **React Native (Expo SDK 54)** para Android e iOS, focado em acolhimento emocional, check-in diário de humor/ansiedade/sono, diário emocional, exercícios de respiração guiada (4-4-4-4) e conversa empática com IA (Anthropic Claude + Supabase).

---

## 📁 Estrutura do Projeto

```text
Lume-App/
├── App.js                              ← Navegação principal, Onboarding e controle de sessão
├── app.json                            ← Configuração Expo (Lume, ícones, splash, permissões)
├── eas.json                            ← Perfis de compilação EAS Build (APK e AAB Play Store)
├── package.json
├── supabase/
│   ├── schema.sql                      ← Tabelas, RLS e RPC de exclusão de conta (LGPD)
│   └── functions/lume-chat/index.ts    ← Edge Function segura para a API da Anthropic
└── src/
    ├── config/
    │   ├── env.js                      ← Variáveis de ambiente (Supabase, RevenueCat)
    │   └── env.example.js
    ├── theme/
    │   └── index.js                    ← Paleta de cores e espaçamentos
    ├── components/
    │   ├── BottomNav.js                ← Barra de navegação inferior acessível
    │   ├── CrisisModal.js              ← Apoio em crise (CVV 188 / SAMU 192) e Respiração 4-4-4-4
    │   └── LegalModal.js               ← Política de Privacidade, Termos (EULA) e Aviso Médico
    ├── hooks/
    │   ├── useAuth.js                  ← Estado de autenticação persistente
    │   └── usePremium.js               ← Status Premium e saldo de tokens
    ├── lib/
    │   ├── supabase.js                 ← Cliente Supabase, Auth, Check-ins, Diário, Chat e LGPD
    │   ├── ai.js                       ← Integração Claude Sonnet 4 + detecção preventiva de crise
    │   ├── purchases.js                ← Integração RevenueCat (Tokens e Assinatura Premium)
    │   └── ads.js                      ← Integração Google Mobile Ads (Rewarded Ads)
    └── screens/
        ├── OnboardingScreen.js         ← Boas-vindas e consentimento LGPD
        ├── AuthScreen.js               ← Login, Cadastro e Recuperação de Senha (E-mail/Senha)
        ├── HomeScreen.js               ← Dashboard, ofensiva (streak), gráfico 7 dias e anúncios
        ├── CheckinScreen.js            ← Check-in diário em 2 etapas
        ├── ChatScreen.js               ← Chat com Lume IA com histórico persistente
        ├── JournalScreen.js            ← Diário emocional com filtros, leitura completa e exclusão
        └── ProfileScreen.js            ← Planos, exportação de dados (LGPD) e exclusão de conta
```

---

## 🚀 Como Rodar e Compilar o APK para Android

### Pré-requisito no Windows
Certifique-se de ter o **Node.js LTS** instalado (via [nodejs.org](https://nodejs.org/) ou `winget install OpenJS.NodeJS.LTS`).

### 1. Configurar variáveis de ambiente
Edite [`src/config/env.js`](./src/config/env.js) (ou crie um arquivo `.env` na raiz) com suas chaves do **Supabase** e **RevenueCat**:
```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
EXPO_PUBLIC_REVENUECAT_API_KEY=public_sdk_key
```

### 2. Subir o app em modo de desenvolvimento
```bash
npm start
```

### 3. Gerar o APK instalável para Android (na nuvem do Expo EAS — sem precisar do Android Studio)
```bash
npx eas-cli login
npm run build:apk
```
Ao finalizar, o EAS exibirá um **link e QR Code** para baixar e instalar o `.apk` diretamente no seu celular Android.

---

## ⚠️ Aviso Importante
O **Lume** é um suporte complementar ao autocuidado e **não substitui** atendimento psicológico ou psiquiátrico. Em caso de crise, ligue gratuitamente para o **CVV: 188** (24h).
