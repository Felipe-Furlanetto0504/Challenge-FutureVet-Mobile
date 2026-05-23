# 🐾 FutureVet Mobile

Aplicação mobile para monitoramento inteligente da saúde de pets, com integração IoT em tempo real via ESP32-S3, protocolo MQTT e sensores físicos simulados no Wokwi.

Desenvolvido para a disciplina **Disruptive Architectures: IoT, IoB & Generative IA** — FIAP · 1º Sprint 2025.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Telas](#-telas)
- [Como Executar](#-como-executar)
- [Integração IoT](#-integração-iot)
- [Circuito ESP32](#-circuito-esp32)
- [Integrantes](#-integrantes)

---

## 📱 Sobre o Projeto

O **FutureVet** resolve um problema real: tutores não conseguem monitorar a saúde do pet entre consultas veterinárias. Febre, alterações cardíacas e inatividade passam despercebidas até ser tarde.

A solução conecta uma coleira inteligente com ESP32-S3 ao celular do tutor via MQTT. Os sensores coletam temperatura corporal, frequência cardíaca e nível de atividade continuamente — o app exibe alertas em tempo real e mantém o histórico de saúde do pet.

### Funcionalidades

| Módulo | Descrição |
|---|---|
| 🏠 **Home** | Dashboard com resumo do pet, status IoT em destaque e próximas vacinas |
| 💉 **Vacinas** | CRUD completo com alertas de vencimento por contagem de dias |
| 📡 **Monitoramento** | Leituras IoT em tempo real: temperatura, FC, atividade e peso |
| 🏥 **Consultas** | Histórico veterinário com captura de leitura IoT no momento da consulta |
| 👤 **Perfil** | Dados do tutor, cadastro de pets com espécie/raça e alternância de tema |
| ℹ️ **Sobre** | Informações do projeto, tecnologias, critérios FIAP e links dos entregáveis |

---

## 🏗️ Arquitetura

```
┌─────────────────┐    MQTT     ┌──────────────────┐    HTTP REST   ┌──────────────┐
│   ESP32-S3      │ ──────────► │  HiveMQ (Cloud)  │ ◄──────────── │  App Mobile  │
│   (Wokwi)       │             │  broker.hivemq   │                │ React Native │
│                 │             └──────────────────┘                └──────────────┘
│ DS18B20 (temp)  │                      │                                 ▲
│ MAX30102 (FC)   │                      │ MQTT subscribe                  │
│ MPU-6050 (ativ) │                      ▼                                 │
└─────────────────┘             ┌──────────────────┐    API :8080          │
                                │ petlink_server.py│ ─────────────────────┘
                                │ Python + paho    │
                                └──────────────────┘
```

**Fluxo de dados:**
1. ESP32-S3 coleta leituras dos sensores a cada 5 segundos
2. Publica JSON no tópico `petlink/sensors/rex` via MQTT no HiveMQ
3. `petlink_server.py` assina o tópico e armazena as leituras em buffer
4. App faz `fetch` na API REST a cada 5 segundos e atualiza a UI

---

## 🛠️ Tecnologias

### Mobile
| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.81.5 | Framework mobile |
| Expo | ~54.0.33 | Toolchain e builds |
| React Navigation | ^7 | Navegação entre telas |
| AsyncStorage | ^2.2.0 | Persistência local |
| Expo Linear Gradient | ~15.0.8 | Gradientes de UI |
| MaterialIcons / FontAwesome5 | — | Ícones |

### IoT / Backend
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

```
Challenge-FutureVet-Mobile/
│
├── src/
│   ├── routes/
│   │   ├── index.js              # Roteador raiz (auth vs tabs)
│   │   └── tab.routes.js         # Navegação por abas com suporte a tema
│   │
│   ├── screens/
│   │   ├── Login.js              # Autenticação local
│   │   ├── Cadastro.js           # Cadastro de novo usuário
│   │   ├── Home.js               # Dashboard principal
│   │   ├── vacinas.js            # CRUD de vacinas
│   │   ├── Monitoramento.js      # Monitor IoT em tempo real
│   │   ├── Consultas.js          # CRUD de consultas veterinárias
│   │   ├── Perfil.js             # Dados do usuário, pets e tema
│   │   └── Sobre.js              # Sobre o projeto e o time
│   │
│   └── theme.js                  # Sistema de temas light/dark + Button + Chip
│
├── App.js                        # Raiz com ThemeProvider
├── app.json                      # Configuração Expo
└── package.json
```

### IoT (pasta separada no repositório)
```
iot/
├── sketch.ino                    # Firmware ESP32-S3 (C++)
├── diagram.json                  # Circuito Wokwi
├── libraries.txt                 # Bibliotecas necessárias no Wokwi
└── petlink_server.py             # Servidor Python (bridge MQTT + API REST)
```

---

## 📺 Telas

### 🏠 Home
- Saudação com nome do usuário (lido do AsyncStorage)
- Atalhos para todas as seções
- Card IoT com última leitura em tempo real (temperatura, FC, atividade)
- Lista de próximas vacinas ordenada por urgência com badge de dias
- Resumo dos pets cadastrados

### 💉 Vacinas
- Lista de vacinas com data de aplicação e próxima dose
- Cadastro via modal bottom-sheet
- Badge colorido por urgência (vermelho ≤7 dias, laranja ≤30, verde)

### 📡 Monitoramento
- Indicador Online/Offline em tempo real
- Seletor de pet (carrega pets do AsyncStorage)
- 4 cards de sensores: temperatura, frequência cardíaca, atividade, peso
- Status fisiológico por espécie (cão, gato, coelho)
- Alertas dinâmicos quando sensor ultrapassa limite
- Log MQTT com os últimos 20 payloads recebidos

### 🏥 Consultas
- Card de próxima consulta agendada em destaque com contagem de dias
- Filtro por status (Agendada / Realizada / Cancelada) e por pet
- CRUD completo com modal bottom-sheet
- Captura de leitura IoT no momento da consulta (temperatura + FC + score)

### 👤 Perfil
- Avatar com inicial do nome
- Visualização e edição de dados pessoais
- Cadastro de pets com espécie, raça, idade, tamanho e peso
- Resumo de vacinas por pet com próximo vencimento
- **Switch de tema Dark/Light** — persiste no AsyncStorage

### ℹ️ Sobre
- Descrição do problema e da solução
- Links clicáveis para GitHub e vídeo pitch no YouTube
- Lista de tecnologias utilizadas
- Critérios de avaliação FIAP com pontuação
- Time com links para GitHub de cada integrante

---

## ⚙️ Como Executar

### Pré-requisitos

- Node.js 18+
- Git
- Expo CLI (`npm install -g expo-cli`)
- Expo Go no celular **ou** Android Studio / Xcode para emulador

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/Challenge-FutureVet-Mobile.git
cd Challenge-FutureVet-Mobile
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Iniciar o app

```bash
npx expo start
```

Escaneie o QR code com o Expo Go (Android/iOS) ou pressione `a` para abrir no emulador Android.

---

## 📡 Integração IoT

A tela de Monitoramento consome uma API REST servida pelo `petlink_server.py`, que por sua vez recebe dados do ESP32 via MQTT.

### 1. Instalar dependência Python

```bash
pip install paho-mqtt
```

### 2. Iniciar o servidor

```bash
python petlink_server.py
```

O servidor imprime automaticamente o IP da máquina na rede local:

```
════════════════════════════════════════════════════════════
  PetLink — Servidor HTTP + Bridge MQTT
  Local:   http://localhost:8080/api/status
  Rede:    http://192.168.1.100:8080/api/status  ← use no app
  MQTT:    broker.hivemq.com → petlink/sensors/#
════════════════════════════════════════════════════════════

  No Monitoramento.js do app, coloque:
    const API_BASE = "http://192.168.1.100:8080";
```

### 3. Configurar o IP no app

Abra `src/screens/Monitoramento.js` e altere:

```js
// Linha 7 — troque pelo IP exibido no terminal do servidor
const API_BASE = "http://192.168.1.100:8080";
```

> **Emulador Android:** use `http://10.0.2.2:8080`
> **Emulador iOS:** use `http://127.0.0.1:8080`
> **Device físico:** use o IP real do PC. Celular e PC devem estar na mesma rede Wi-Fi.

### 4. Iniciar a simulação no Wokwi

Acesse o projeto no Wokwi e clique em ▶ Play. O Serial Monitor exibirá:

```
[00001] rex | T:38.5°C | HR:87 bpm | Act:0.32 | Steps:38/min | MQTT:OK
```

### 5. Verificar a conexão completa

Abra no navegador: `http://localhost:8080/api/status`

```json
{
  "mqtt_connected": true,
  "last_wokwi_msg": "14:23:05",
  "pets": {
    "rex": {
      "source": "wokwi_mqtt",
      "last_temp": 38.5,
      "last_hr": 87,
      "age_seconds": 2.1
    }
  }
}
```

Quando `source` for `"wokwi_mqtt"`, o app está recebendo dados reais do ESP32. O badge na tela de Monitoramento ficará **verde — Online**.

### Endpoints da API

| Endpoint | Descrição |
|---|---|
| `GET /api/latest/{pet_id}` | Leitura mais recente do pet |
| `GET /api/history/{pet_id}` | Histórico da sessão |
| `GET /api/readings` | Todas as leituras recentes |
| `GET /api/status` | Diagnóstico completo da conexão |

---

## 🔌 Circuito ESP32

### Componentes

| Componente | Pino ESP32-S3 | Protocolo | Função |
|---|---|---|---|
| DS18B20 | GPIO4 + R 4.7kΩ | 1-Wire | Temperatura corporal |
| MPU-6050 | GPIO8 (SDA) / GPIO9 (SCL) | I2C | Acelerômetro / atividade |
| OLED SSD1306 | GPIO8 (SDA) / GPIO9 (SCL) | I2C | Display local |
| LED Verde | GPIO5 | Digital | Pisca a cada MQTT publicado |
| LED Vermelho | GPIO6 | Digital | Liga quando há alerta de saúde |
| LED Azul | GPIO7 | Digital | Indica WiFi conectado |

### Tópicos MQTT

| Tópico | Direção | Conteúdo |
|---|---|---|
| `petlink/sensors/rex` | ESP32 → HiveMQ | JSON com leituras dos sensores |
| `petlink/status/rex` | ESP32 → HiveMQ | Status de conexão (retain=true) |
| `petlink/sensors/#` | HiveMQ → Servidor | Assinatura de todos os pets |

### Payload publicado pelo ESP32

```json
{
  "pet_id": "rex",
  "pet_name": "Rex",
  "species": "dog",
  "sensors": {
    "temperature_celsius": 38.5,
    "heart_rate_bpm": 87,
    "activity_score": 0.32,
    "steps_last_minute": 38,
    "weight_kg": 28.3
  },
  "battery_pct": 95,
  "health_score": 92.0,
  "alerts": [],
  "protocol": "MQTT",
  "firmware": "1.2.0"
}
```

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
