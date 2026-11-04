# 🐾 FutureVet Mobile

Aplicativo mobile para tutores de pets acompanharem a saúde dos animais: cadastro de pets, carteira de vacinação, agendamento de consultas com a clínica e notificações sobre cada mudança. Os dados vêm de uma **API REST real em Java/Spring Boot**, com autenticação JWT.

Desenvolvido para **Mobile Application Development** — FIAP · Challenge 2026 (parceria Clyvo Vet), 2º semestre · **Sprint 4 (entrega final)**.

---

## 📋 Índice
- [Instalar o app publicado](#-instalar-o-app-publicado)
- [O que mudou na Sprint 4](#-o-que-mudou-na-sprint-4)
- [Sobre o projeto](#-sobre-o-projeto)
- [Notificações](#-notificações)
- [Telas](#-telas)
- [Arquitetura](#-arquitetura)
- [Integração com a API](#-integração-com-a-api)
- [Tecnologias](#-tecnologias)
- [Como executar localmente](#-como-executar-localmente)
- [Como gerar e publicar o build](#-como-gerar-e-publicar-o-build)
- [Integrantes](#-integrantes)
- [Vídeo](#-vídeo)

---

## 📲 Instalar o app publicado

O app está publicado no **Firebase App Distribution** (Android).

| | |
|---|---|
| Versão | **1.0.0** |
| Commit do build | **`COMMIT_DO_BUILD`** |
| Plataforma | Android (APK) |

1. Abra o convite do Firebase App Distribution enviado para o seu e-mail.
2. Siga o link no celular Android e instale o **Firebase App Tester** quando for pedido.
3. No App Tester, toque em **FutureVet** → **Download**. Se o Android pedir, permita a instalação de apps desta fonte.
4. Abra o app e confira em **Sobre → Versão publicada** que o commit exibido é o mesmo da tabela acima.

> **Primeiro acesso do dia:** a API roda no plano gratuito do Render, que desliga o servidor quando fica parado. O primeiro login pode levar até 1 minuto; o app avisa "Conectando ao servidor" enquanto isso. As próximas ações são rápidas.

---

## 🚀 O que mudou na Sprint 4

| Requisito | O que foi feito |
|---|---|
| **Publicação** | Build Android com EAS Build e distribuição pelo Firebase App Distribution. Ícone, splash e pacote `br.com.fiap.futurevet` configurados. |
| **Identificação da versão** | A tela Sobre mostra a versão e o **hash do commit** usado no build, lido automaticamente pelo `app.config.js`. |
| **Notificações** | Notificações locais disparadas por eventos reais: avisos gerados pelo backend (consulta confirmada, cancelada ou concluída pela clínica, vacina registrada) e lembrete 1 hora antes de cada consulta. Tocar na notificação abre a tela correspondente. |
| **Arquitetura** | Nenhuma tela faz chamada HTTP. Regras de negócio saíram das telas para `services/`, o acesso a dados fica em `hooks/` (TanStack Query) e funções repetidas foram centralizadas em `utils/`. |
| **CRUD de pets** | Edição de pet adicionada ao Perfil (`PUT /api/animais/{id}`), completando criar, listar, editar e excluir. |
| **Experiência** | Aviso de servidor acordando no login e no cadastro; card da coleira removido da Home, que agora mostra o total de consultas ativas. |

---

## 📱 Sobre o projeto

**Problema:** o controle de vacinas e consultas de um pet costuma ficar espalhado em papéis, mensagens e na memória do tutor. Doses atrasam, consultas são esquecidas e o tutor só descobre que a clínica confirmou ou cancelou um horário quando liga para perguntar.

**Solução:** o FutureVet centraliza tudo em um app conectado à clínica. O tutor cadastra seus pets, mantém a carteira de vacinação, agenda consultas e recebe uma notificação sempre que a clínica age sobre um agendamento ou registra uma vacina.

---

## 🔔 Notificações

As notificações são **locais** (`expo-notifications`), sempre disparadas por um evento real do sistema e exibidas automaticamente durante o uso do app.

### 1. Avisos da clínica (evento no backend)

```
Clínica confirma a consulta na API Java
        │
        ▼
Backend publica o evento e grava o aviso do tutor  (GET /api/notificacoes)
        │
        ▼
App consulta os avisos a cada 20 s enquanto está aberto  (hooks/useNotificacoes.js)
        │
        ▼
Aviso novo e não lido → notificação "Consulta confirmada ✅"
        │
        ▼
Toque na notificação → abre a aba Consultas
```

| Evento no backend | Notificação | Ao tocar, abre |
|---|---|---|
| `CONSULTA_CONFIRMADA` | Consulta confirmada ✅ | Consultas |
| `CONSULTA_CANCELADA` | Consulta cancelada | Consultas |
| `CONSULTA_REALIZADA` | Atendimento registrado | Consultas |
| `CONSULTA_REAGENDADA` | Consulta reagendada | Consultas |
| `VACINA_REGISTRADA` | Vacina registrada 💉 | Vacinas |
| `REFORCO_REGISTRADO` | Reforço registrado 💉 | Vacinas |

No primeiro login em um aparelho, os avisos antigos são marcados como vistos sem disparar, para o tutor não receber dezenas de notificações de uma vez.

### 2. Lembrete de consulta (ação do usuário)

- Ao **agendar** ou **reagendar** uma consulta, o app agenda uma notificação para **1 hora antes** do horário.
- Ao **cancelar** ou **concluir**, o lembrete é removido. Se a clínica cancelar por outro aparelho, o lembrete também é removido na próxima atualização da lista.
- Ao **sair da conta**, todos os lembretes do aparelho são apagados.

### Como testar
1. Entre como tutor e agende uma consulta para daqui a **61 minutos**. Em cerca de 1 minuto chega "Consulta de [pet] em 1 hora".
2. Com o app aberto, entre como **clínica (ADMIN)** no sistema web da API e confirme a consulta. Em até 20 segundos chega "Consulta confirmada ✅" no celular do tutor.
3. Toque na notificação: o app abre direto na aba Consultas.

---

## 📺 Telas

### 🔐 Login / Cadastro
- Login e cadastro na API (`/api/auth/login`, `/api/auth/registro`) com JWT.
- Validação de e-mail, senha, CPF e telefone, com máscaras.
- Sessão salva no aparelho: o usuário continua logado ao reabrir o app.
- Rotas internas só existem para quem tem sessão válida.
- Aviso de "Conectando ao servidor" quando a API demora a responder.

### 🏠 Início
- Saudação com o nome do tutor.
- Resumo com número de pets, vacinas e consultas ativas.
- Atalhos para Vacinas, Consultas, Monitor e Perfil.
- Próximas doses ordenadas por urgência e lista de pets.

### 💉 Vacinas
- CRUD completo (criar, editar, excluir) vinculado a um pet.
- Situação calculada pelo backend: atrasada, próxima ou em dia.

### 📡 Monitoramento
- Painel da coleira inteligente: temperatura, frequência cardíaca, atividade e peso.
- Faixas de referência por espécie (cão, gato, coelho).
- Modelo preditivo que compara cada leitura com a linha de base do próprio pet (z-score) e recomenda consulta quando encontra anomalia.
- **As leituras vêm de um simulador** (`services/coleira.js`). O hardware físico (ESP32-S3 com sensores) é tratado na disciplina de IoT; para ligar a coleira real basta trocar esse arquivo, sem alterar a tela.

### 🏥 Consultas
- Agendar, reagendar e cancelar (com motivo).
- Perfil da clínica (ADMIN) também confirma e conclui atendimentos.
- Lembrete automático 1 hora antes de cada consulta.

### 👤 Perfil
- Dados do tutor vindos da sessão.
- Cadastro, **edição** e exclusão de pets.
- Resumo de vacinas de cada pet.
- Alternância de tema claro/escuro, salva no aparelho.
- Sair da conta.

### ℹ️ Sobre
- Problema e solução.
- **Versão e hash do commit** do build instalado.
- Links do repositório e do vídeo, tecnologias e integrantes.

---

## 🧱 Arquitetura

As telas só cuidam da interface. Toda chamada à API e toda regra de negócio passa por camadas separadas:

```
screens/  →  hooks/  →  services/  →  API Java (Render)
   UI        estado e cache       HTTP, notificações,
             (TanStack Query)     regras de negócio
```

```
Challenge-FutureVet-Mobile/
├── src/
│   ├── services/
│   │   ├── Api.js                 # Cliente HTTP: URL base, token JWT e tratamento de erro
│   │   ├── notificacoes.js        # Canal Android, permissão, lembretes e avisos do backend
│   │   ├── anomalias.js           # Modelo preditivo (z-score) e faixas por espécie
│   │   └── coleira.js             # Fonte das leituras da coleira (simulador)
│   │
│   ├── hooks/
│   │   ├── useAuth.js             # Sessão, login, registro e logout
│   │   ├── useAnimais.js          # CRUD de pets
│   │   ├── useVacinas.js          # CRUD de vacinas
│   │   ├── useConsultas.js        # Agenda + lembretes de consulta
│   │   ├── useNotificacoes.js     # Busca avisos do backend e dispara notificações
│   │   ├── useLeiturasColeira.js  # Histórico de leituras e avaliação de anomalia
│   │   └── useDemora.js           # Detecta requisição lenta (servidor acordando)
│   │
│   ├── utils/
│   │   ├── datas.js               # Conversão entre DD/MM/AAAA e ISO
│   │   └── especie.js             # Emoji por espécie
│   │
│   ├── routes/
│   │   ├── index.js               # Stack raiz: decide entre login e app pela sessão
│   │   ├── tab.routes.js          # Abas do app
│   │   └── navegacao.js           # Referência do navegador e abertura de tela pela notificação
│   │
│   ├── screens/                   # Login, Cadastro, Home, Vacinas, Monitoramento,
│   │                              # Consultas, Perfil, Sobre
│   └── theme.js                   # Temas claro/escuro e componentes Button e Chip
│
├── assets/                        # Ícone, splash e ícone de notificação
├── app.json                       # Configuração do Expo (pacote Android, plugins)
├── app.config.js                  # Injeta o hash do commit no build
├── eas.json                       # Perfil de build do APK
└── App.js                         # QueryClientProvider + ThemeProvider + rotas
```

---

## 🔗 Integração com a API

Backend: **[Challenge_Sprint4_Java](https://github.com/joaocaetano1310/Challenge_Sprint4_Java)** (Java 17, Spring Boot 3, Spring Security + JWT, Oracle), publicado em `https://challenge-sprint3-java.onrender.com`.

| Recurso | Endpoints usados pelo app |
|---|---|
| Autenticação | `POST /api/auth/login` · `POST /api/auth/registro` |
| Pets | `GET` · `POST /api/animais` · `PUT` · `DELETE /api/animais/{id}` |
| Vacinas | `GET` · `POST /api/vacinas` · `PUT` · `DELETE /api/vacinas/{id}` |
| Consultas | `GET` · `POST /api/consultas` · `PUT /api/consultas/{id}` · `POST /api/consultas/{id}/confirmar` · `/cancelar` · `/concluir` |
| Notificações | `GET /api/notificacoes` |

Todas as rotas, exceto login e registro, exigem o header `Authorization: Bearer <token>`.

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React Native 0.81 + Expo SDK 54 | App mobile |
| React Navigation 7 | Stack + abas, com guarda de rota por sessão |
| TanStack Query 5 | Cache, sincronização e estados de carregamento |
| expo-notifications | Notificações locais e canal Android |
| expo-constants | Leitura da versão e do commit do build |
| AsyncStorage | Sessão, tema e controle de lembretes |
| react-native-mask-text | Máscaras de CPF, telefone, data e hora |
| EAS Build | Geração do APK |
| Firebase App Distribution | Distribuição do app para testers |

---

## 💻 Como executar localmente

Pré-requisitos: Node.js 20+, app **Expo Go** no celular (ou emulador Android).

```bash
git clone https://github.com/Felipe-Furlanetto0504/Challenge-FutureVet-Mobile.git
cd Challenge-FutureVet-Mobile
npm install
npx expo start -c
```

Escaneie o QR code com o Expo Go. No Expo Go aparece um aviso de que push remoto não é suportado; ele pode ser ignorado, porque o app usa notificações locais. Para ver as notificações exatamente como no app publicado, use o APK.

---

## 📦 Como gerar e publicar o build

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

1. O EAS gera o APK a partir do último commit; o hash desse commit aparece na tela Sobre.
2. No Firebase Console → **App Distribution**, envie o APK para o app Android `br.com.fiap.futurevet`.
3. Em **Testers & Groups**, adicione o e-mail do professor e distribua a versão.

---

## 👥 Integrantes

| Nome | RM | GitHub |
|---|---|---|
| Felipe Furlanetto | RM562766 | [@Felipe-Furlanetto0504](https://github.com/Felipe-Furlanetto0504) |
| Raul Rezende Iemini Aguiar | RM564002 | [@Raul-Rezende](https://github.com/Raul-Rezende) |
| João Victor Caetano Alves da Silva | RM562074 | [@joaocaetano1310](https://github.com/joaocaetano1310) |
| Ryan Victor da Silva Vetoriano | RM565667 | [@ryanvetoriano](https://github.com/ryanvetoriano) |
| João Victor Bueno Castelini da Silva | RM564115 | [@Buenozw](https://github.com/Buenozw) |

---

## 🎥 Vídeo

📺 **Sprint 4:** https://youtu.be/rpl7_FdFwog?si=wEKf39iBLd3z4wmQ
