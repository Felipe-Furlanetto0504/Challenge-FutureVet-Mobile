# 🐾 FutureVet Mobile

Aplicação mobile desenvolvida com React Native + Expo para monitoramento inteligente da saúde animal, gerenciamento de consultas veterinárias, vacinas e integração com sensores IoT.

---

## 📱 Sobre o Projeto

O **FutureVet Mobile** foi criado com o objetivo de facilitar o acompanhamento da saúde de pets através de uma plataforma moderna, intuitiva e integrada com tecnologias IoT.

A aplicação permite:

* Cadastro e gerenciamento de pets;
* Controle de vacinas;
* Agendamento de consultas veterinárias;
* Monitoramento em tempo real via sensores IoT;
* Visualização de dados de saúde dos animais;
* Armazenamento local utilizando AsyncStorage.

O projeto foi desenvolvido utilizando conceitos modernos de desenvolvimento mobile com foco em:

* Experiência do usuário;
* Organização de código;
* Componentização;
* Persistência local;
* Integração com APIs;
* Monitoramento inteligente.

---

# 🚀 Tecnologias Utilizadas

## Mobile

* React Native
* Expo
* JavaScript
* React Navigation
* AsyncStorage
* Expo Linear Gradient
* React Native Safe Area Context

## Navegação

* Bottom Tabs Navigation
* Native Stack Navigation

## Persistência de Dados

* AsyncStorage

## Integração

* API REST
* Comunicação IoT

---

# 📂 Estrutura do Projeto

```bash
FutureVet-Mobile
│
├── src
│   ├── routes
│   │   ├── index.js
│   │   └── tab.routes.js
│   │
│   ├── screens
│   │   ├── Cadastro.js
│   │   ├── Consultas.js
│   │   ├── Home.js
│   │   ├── IoT.js
│   │   ├── Login.js
│   │   ├── Perfil.js
│   │   ├── Sobre.js
│   │   └── vacinas.js
│   │
│   └── theme.js
│
├── App.js
├── package.json
└── app.json
```

---

# 🧠 Funcionalidades

## 🐶 Cadastro de Pets

Permite cadastrar informações dos animais de estimação, armazenando os dados localmente.

---

## 💉 Controle de Vacinas

Acompanhamento das vacinas dos pets com:

* Datas;
* Próximas doses;
* Alertas de vencimento.

---

## 📅 Consultas Veterinárias

Sistema de gerenciamento de consultas contendo:

* Nome do pet;
* Tipo da consulta;
* Data e horário;
* Local da consulta.

---

## 📡 Monitoramento IoT

Tela responsável pelo monitoramento inteligente do animal.

Os sensores simulam:

* Temperatura corporal;
* Frequência cardíaca;
* Atividade física;
* Peso;
* Status online/offline.

A aplicação realiza polling automático para atualização dos dados em tempo real.

---

## 🏠 Dashboard Principal

Tela inicial com:

* Resumo dos pets;
* Vacinas próximas do vencimento;
* Informações rápidas;
* Status do sistema IoT.

---

# ⚙️ Como Executar o Projeto

## 📌 Pré-requisitos

Antes de começar, você precisará ter instalado:

* Node.js
* Git
* Expo CLI
* Android Studio (opcional para emulador)

---

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
```

### 2. Acesse a pasta

```bash
cd FutureVet-Mobile
```

### 3. Instale as dependências

```bash
npm install
```

---

# ▶️ Executando a Aplicação

## Iniciar o projeto

```bash
npm start
```

ou

```bash
npx expo start
```

---

## Executar no Android

```bash
npm run android
```

---

## Executar na Web

```bash
npm run web
```

---

# 🔗 API Base

A aplicação utiliza integração com API local:

```js
const API_BASE = "http://localhost:8080";
```

Caso utilize dispositivo físico, altere para o IP da máquina:

```js
const API_BASE = "http://SEU_IP:8080";
```

---

# 💾 Persistência Local

Os dados são armazenados utilizando:

```js
AsyncStorage
```

Dados persistidos:

* Pets;
* Vacinas;
* Consultas;
* Informações do usuário.

---

# 🎨 Interface

O projeto utiliza:

* Tema customizado;
* Componentes reutilizáveis;
* Design moderno;
* Interface responsiva;
* Ícones do Material Icons e FontAwesome.

---

# 📈 Diferenciais do Projeto

✅ Integração com IoT

✅ Monitoramento em tempo real

✅ Armazenamento local

✅ Organização modular

✅ Navegação fluida

✅ Simulação de sensores inteligentes

✅ Interface moderna e intuitiva

---

# 👨‍💻 Integrantes

* João Victor Caetano  
* João Victor Bueno
* Raul Rezende
* Felipe Furlaneto
* Ryan Vetoriano

---

# 📚 Conceitos Aplicados

Durante o desenvolvimento foram utilizados conceitos como:

* Programação Orientada a Objetos;
* Componentização;
* Gerenciamento de estado;
* Persistência local;
* Navegação entre telas;
* Consumo de API;
* Simulação IoT;
* Responsividade;
* UX/UI.

---

# 📸 Telas do Sistema

## Login

Tela de autenticação do usuário.

## Home

Dashboard principal do sistema.

## IoT

Monitoramento em tempo real dos sensores.

## Consultas

Gerenciamento de consultas veterinárias.

## Vacinas

Controle de vacinação.

## Perfil

Informações do usuário.

---

# 🐾 Objetivo do Projeto

O FutureVet busca unir tecnologia, mobilidade e IoT para melhorar o acompanhamento da saúde animal, oferecendo uma experiência moderna para tutores e clínicas veterinárias.

---

# 📄 Licença

Projeto acadêmico desenvolvido para fins educacionais.
