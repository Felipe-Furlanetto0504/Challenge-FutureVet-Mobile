# 🐾 FutureVet Mobile
Aplicação mobile para gestão e monitoramento inteligente da saúde de pets, com **backend real em Java/Spring Boot** (autenticação JWT e CRUD completo) e integração IoT em tempo real via ESP32-S3, protocolo MQTT e sensores físicos simulados no Wokwi.

Desenvolvido para as disciplinas **Mobile Application Development** e **Disruptive Architectures: IoT, IoB & Generative IA** — FIAP · Challenge 2026, 2º Semestre.

---

## 📋 Índice
- [Sobre o Projeto](#-sobre-o-projeto)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Telas](#-telas)
- [Como Executar](#-como-executar)
- [Integração com a API](#-integração-com-a-api)
- [Integração IoT](#-integração-iot)
- [Circuito ESP32](#-circuito-esp32)
- [Integrantes](#-integrantes)

---

## 📱 Sobre o Projeto
O **FutureVet** resolve um problema real: tutores não conseguem monitorar a saúde do pet entre consultas veterinárias, e o controle de vacinas e agendamentos costuma ficar espalhado em papéis, grupos de WhatsApp ou na memória. O app centraliza tudo — cadastro de pets, carteira de vacinação, agendamento de consultas com a clínica e, complementarmente, uma coleira inteligente que monitora sinais vitais em tempo real.

**Backend de negócio** — API REST em Java/Spring Boot ([`Challenge_Sprint3_Java`](https://github.com/joaocaetano1310/Challenge_Sprint3_Java)), responsável por autenticação, pets, vacinas e consultas. Roda em produção no Render.

### Funcionalidades
| 🔐 **Autenticação** | Login e cadastro reais via API (JWT), com sessão persistente entre aberturas do app |
| 🏠 **Home** | Dashboard com resumo do tutor, status IoT em destaque e próximas vacinas |
| 💉 **Vacinas** | CRUD completo (criar, editar, excluir) integrado à API, com situação calculada pelo backend (atrasada/próxima/em dia) |
| 📡 **Monitoramento** | Leituras IoT : temperatura, FC, atividade e peso |
| 🏥 **Consultas** | Agendamento, reagendamento e cancelamento via API; confirmação e conclusão exclusivas do perfil da clínica |
| 👤 **Perfil** | Dados do tutor (via token), cadastro/exclusão de pets, resumo de vacinas e alternância de tema |
| ℹ️ **Sobre** | Informações do projeto, tecnologias, critérios FIAP e links dos entregáveis |

---

**Fluxo de autenticação e dados de negócio:**
1. App faz `POST /api/auth/login` ou `/api/auth/registro` na API Java — recebe um token JWT.
2. Pets, vacinas e consultas são lidos/gravados via `GET/POST/PUT/DELETE` na mesma API, com estado sincronizado pelo TanStack Query.

---

## 🛠️ Tecnologias
### Mobile
| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.81.5 | Framework mobile |
| Expo | ~54.0.33 | Toolchain e builds |
| React Navigation | ^7 | Navegação entre telas, com guarda de rota por sessão |
| **TanStack Query** | ^5 | Cache, sincronização e estados de loading das chamadas à API |
| react-native-mask-text | ^0.15.0 | Máscaras de CPF, telefone e data |
| MaterialIcons / FontAwesome5 | — | Ícones |

### Backend de negócio (repositório separado)
| Tecnologia | Uso |
|---|---|
| Java 17 + Spring Boot 3 | API REST |
| Spring Security + JWT (jjwt) | Autenticação stateless |
| Flyway + Oracle | Migrações e persistência |
| Render | Deploy em produção |

### IoT
| Tecnologia | Uso |
|---|---|
| ESP32-S3 | Microcontrolador da coleira inteligente |
| Wokwi | Simulador de circuitos online |
| DS18B20 | Sensor de temperatura corporal (1-Wire) |
| MAX30102 | Sensor de frequência cardíaca (I2C) |
| MPU-6050 | Acelerômetro para detecção de atividade (I2C) |
| MQTT (PubSubClient) | Protocolo de comunicação IoT |
| HiveMQ | Broker MQTT público na nuvem |
| Python 3 + paho-mqtt | Servidor bridge MQTT → HTTP REST |

---

## 📂 Estrutura do Projeto
Challenge-FutureVet-Mobile/
│
├── src/
│   ├── services/
│   │   └── Api.js                # Cliente HTTP central: URL base, headers, token, tratamento de erro
│   │
│   ├── hooks/
│   │   ├── useAuth.js            # Login, registro, logout e sessão (TanStack Query)
│   │   ├── useAnimais.js         # CRUD de pets
│   │   ├── useVacinas.js         # CRUD de vacinas
│   │   └── useConsultas.js       # Agendar, reagendar, confirmar, cancelar, concluir
│   │
│   ├── routes/
│   │   ├── index.js              # Roteador raiz — decide Auth vs Tabs a partir da sessão
│   │   └── tab.routes.js         # Navegação por abas com suporte a tema
│   │
│   ├── screens/
│   │   ├── Login.js              # Autenticação via API (JWT)
│   │   ├── Cadastro.js           # Cadastro de novo usuário via API
│   │   ├── Home.js               # Dashboard principal
│   │   ├── vacinas.js            # CRUD de vacinas integrado à API
│   │   ├── Monitoramento.js      # Monitor IoT em tempo real
│   │   ├── Consultas.js          # CRUD de consultas integrado à API
│   │   ├── Perfil.js             # Dados do tutor, pets e tema
│   │   └── Sobre.js              # Sobre o projeto e o time
│   │
│   └── theme.js                  # Sistema de temas light/dark
│
├── App.js                        # Raiz com QueryClientProvider + ThemeProvider
├── app.json                      # Configuração Expo
└── package.json

### IoT (pasta separada no repositório)
iot/
├── sketch.ino                    # Firmware ESP32-S3 (C++)
├── diagram.json                  # Circuito Wokwi
├── libraries.txt                 # Bibliotecas necessárias no Wokwi
└── petlink_server.py             # Servidor Python (bridge MQTT + API REST)

---

## 📺 Telas

### 🔐 Login / Cadastro
- Login e cadastro autenticam contra a API real (`/api/auth/login`, `/api/auth/registro`) com JWT.
- Sessão persiste entre aberturas do app — token salvo, validado a cada chamada.
- Rotas internas são inacessíveis sem sessão válida (guarda de rota estrutural no navegador).

### 🏠 Home
- Saudação com nome do tutor (lido da sessão)
- Atalhos para todas as seções
- Card IoT com última leitura em tempo real (temperatura, FC, atividade)
- Lista de próximas vacinas ordenada por urgência, com situação calculada pela API
- Resumo dos pets cadastrados

### 💉 Vacinas
- CRUD completo (criar, editar, excluir) via API, vinculado a um pet real
- Situação (atrasada/próxima/em dia) calculada pelo backend
- Cadastro/edição via modal bottom-sheet

### 📡 Monitoramento
- Indicador Online/Offline em tempo real
- Seletor de pet (carregado via API)
- 4 cards de sensores: temperatura, frequência cardíaca, atividade, peso
- Status fisiológico por espécie (cão, gato, coelho)
- Alertas dinâmicos quando sensor ultrapassa limite

### 🏥 Consultas
- Agendamento, reagendamento e cancelamento (com motivo) via API
- CRUD completo com modal bottom-sheet

### 👤 Perfil
- Avatar com inicial do nome, dados vindos da sessão autenticada
- Cadastro e exclusão de pets (espécie, raça, idade, porte, peso) via API
- Resumo de vacinas por pet com próximo vencimento
- **Switch de tema Dark/Light**
- Logout encerra a sessão de verdade (token removido)

### ℹ️ Sobre
- Descrição do problema e da solução
- Links clicáveis para GitHub e vídeo pitch no YouTube
- Lista de tecnologias utilizadas
- Critérios de avaliação FIAP com pontuação
- Time com links para GitHub de cada integrante

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

📺 https://youtu.be/wy1oHOzKFvE