# Dominus Barber

Aplicativo mobile-first de gestão para barbearias, focado na visão do barbeiro/cabeleireiro. Funciona **100% offline**, sem servidor e sem banco de dados externo — todos os dados ficam salvos no navegador/dispositivo via `localStorage`.

![Dominus Barber](public/logo-login.png)

## 📱 Baixar o APK

O APK pronto para instalação no Android está na raiz do repositório: **[Dominus-Barber.apk](./Dominus-Barber.apk)**.

Para instalar:
1. Baixe o arquivo `Dominus-Barber.apk` no seu celular Android.
2. Ative **"Instalar apps de fontes desconhecidas"** (Configurações → Segurança).
3. Abra o APK e toque em **Instalar**.
4. Pronto — o ícone **Dominus Barber** aparece na tela inicial.

## ✨ Funcionalidades

### 🔐 Login local
- Tela inicial com logo, campos de E-mail e Senha (validação local simples).
- Botão **"Entrar no Painel"** e **"Entrar como Visitante (Demo)"** (1 clique).
- Botão **"Sair"** no topo para encerrar a sessão.

### 📅 Agenda
- Saudação ao barbeiro e contador de atendimentos do dia.
- Seletor horizontal de **14 dias** (semana atual Dom→Sáb + próxima semana).
- Botão no topo abre **seletor de datas nativo** para pular para qualquer dia.
- Filtros rápidos: **Dia**, **Hoje**, **Futuros** (próximos 7 dias), **Mês**, **Ver todos**.
- Lista de agendamentos com horário, cliente, serviço, valor e status (Pendente/Concluído).
- Ações por card: **Concluir** (soma no lucro) e **Cancelar/Excluir**.
- Botão flutuante **+** para novo agendamento.

### ➕ Novo Agendamento
- Nome do cliente.
- Seleção múltipla de serviços:
  - Corte Degradê / Social — R$ 45,00
  - Barba Terapia / Navalha — R$ 35,00
  - Sobrancelha — R$ 15,00
  - Combo Corte + Barba — R$ 70,00
- Cálculo automático do valor total.
- Seletor de dia e grade de horários disponíveis (desabilita horários ocupados ou bloqueados).
- Botão **"Confirmar Agendamento"** salva no `localStorage` e volta à Agenda.

### ⏰ Horários
- Configuração por dia da semana (Segunda a Domingo) com toggle **Ativo/Folga**.
- Horário de abertura, intervalo de almoço e encerramento.
- **Bloqueio Rápido**: selecione dia e horário específico para bloquear (ex.: compromisso pessoal). Reflete imediatamente na aba Agendar.

### 💰 Lucro
- Filtro de período: **Hoje**, **Esta Semana**, **Este Mês**.
- Card principal com **Lucro Total** (somado dos atendimentos concluídos).
- Mini cards: Cortes realizados, Barbas realizadas, Ticket Médio.
- **Gráfico de pizza 2D** com faturamento por tipo de serviço (Cortes, Barbas, Sobrancelha, Combos).
- Lista de atendimentos concluídos com data, cliente, serviço e valor.
- Botão **"Restaurar Dados de Exemplo"** para resetar o estado inicial.

## 🧰 Tecnologias utilizadas

| Tecnologia | Versão | Uso |
|---|---:|---|
| [React](https://react.dev/) | 19.x | Biblioteca de UI para construção da interface componentizada |
| [Vite](https://vite.dev/) | 8.x | Bundler e dev server ultrarrápido, com HMR |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Framework CSS utility-first para estilização responsiva |
| [@tailwindcss/vite](https://tailwindcss.com/docs/installation/using-vite) | 4.x | Integração oficial do Tailwind 4 com Vite |
| [Lucide React](https://lucide.dev/) | 1.x | Ícones SVG limpos e consistentes |
| [Capacitor](https://capacitorjs.com/) | 8.x | Runtime para empacotar a web app como app nativo Android |
| [@capacitor/android](https://capacitorjs.com/docs/android) | 8.x | Plataforma Android do Capacitor |
| [Java (JDK 21)](https://adoptium.net/) | 21 | Compilação do projeto Android/Gradle |
| [Android Gradle Plugin](https://developer.android.com/build) | 8.x | Build do APK |
| [Sharp](https://sharp.pixelplumbing.com/) | 0.34.x | Geração de ícones PNG em múltiplas resoluções |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | - | Composição segura de classes Tailwind |

## 🏗️ Arquitetura

- **Sem backend**: toda a lógica roda no cliente.
- **Persistência local**: `localStorage` para usuário, agendamentos, horários e bloqueios.
- **PWA-ready**: `manifest.json` e `sw.js` para instalação via navegador.
- **Nativo Android**: empacotado com Capacitor para gerar APK instalável.
- **Mobile-first**: layout otimizado para tela de celular (max-width 430px), barra de navegação inferior fixa.

## 📁 Estrutura do projeto

```
.
├── android/                 # Projeto Android (Capacitor)
├── public/
│   ├── icon.svg             # Ícone vetorial
│   ├── manifest.json        # Manifesto PWA
│   └── sw.js                # Service Worker
├── src/
│   ├── App.jsx              # Componente principal (todas as telas)
│   ├── index.css            # Tema Tailwind + estilos globais
│   └── main.jsx             # Entry point React
├── scripts/
│   └── generate-icons.mjs   # Gera PNGs de ícones a partir do SVG
├── capacitor.config.json    # Configuração do Capacitor
├── index.html
├── package.json
├── vite.config.js
└── Dominus-Barber.apk       # APK pronto para instalar
```

## 🚀 Rodando localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18+ (recomendado 20+)
- npm 9+

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Guuuuuya/barbapp.git
cd barbapp

# Instale as dependências
npm install

# Rode em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

### Build de produção

```bash
npm run build
npm run preview   # pré-visualiza o build
```

## 📦 Gerando o APK (Android)

### Pré-requisitos
- [JDK 21](https://adoptium.net/)
- [Android Studio](https://developer.android.com/studio) (ou Android SDK + command-line tools)
- Variáveis de ambiente: `JAVA_HOME` e `ANDROID_HOME` configuradas

### Passos

```bash
# Build da web
npm run build

# Sincronizar com o projeto Android
npx cap sync android

# Gerar o APK debug
cd android
./gradlew assembleDebug
```

O APK será gerado em:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Instalar no celular via USB

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

(Requer **Depuração USB** ativada no celular.)

## 🎨 Paleta de cores

| Cor | Hex | Uso |
|---|---|---|
| Fundo | `#121212` | Fundo principal |
| Card | `#1E1E1E` | Cards e modais |
| Borda | `#2C2C2E` | Bordas sutis |
| Dourado | `#D4A359` | Destaque, botões principais, seleção ativa |
| Verde esmeralda | `#2ECC71` | Lucro, status concluído |
| Texto | `#FFFFFF` | Texto principal |
| Texto secundário | `#A0A0A0` | Labels e descrições |

## 📄 Licença

Este projeto é de uso livre para fins de estudo e portfólio.

---

Feito com React, Tailwind CSS e Capacitor.
