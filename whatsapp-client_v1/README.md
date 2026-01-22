# 📦 WhatsApp Client App

---

## 🧰 Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching & Caching**: TanStack React Query
- **Routing**: Wouter
- **API Communication**: Axios
- **monday.com SDK**: monday-sdk-js

---

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** ≥ 18
- **npm** ≥ 9
- **monday Apps CLI**

```bash
npm install -g @mondaycom/apps-cli
```

### Install Dependencies

```bash
npm install
```

---

## Running the Project

### Development Mode

Runs the app locally with hot reload:

```bash
npm run dev
```

Default URL:

```
http://localhost:5173
```

---

### Preview Production Build

```bash
npm run build
npm run preview
```

---

## Build

Creates a production-ready build in the `dist/` folder:

```bash
npm run build
```

This command performs:

- TypeScript build (`tsc -b`)
- Vite production build (`vite build --mode production`)

---

## Deployment (monday.com)

This project is deployed as a **client-side monday.com app**.

### Deploy Command

```bash
npm run deploy
```

The deploy script:

1. Builds the project
2. Pushes the `dist/` folder to monday using the Apps CLI

```bash
mapps code:push \
  --client-side \
  --directoryPath ./dist/ \
  -i 11494117
```

> ⚠️ Replace the app ID if deploying to a different monday app.

---

## 📚 Libraries Documentation

### 🟦 monday-sdk-js

Used to interact with the monday.com platform (context, authentication, API).

**Documentation**

- [https://developer.monday.com/apps/docs/monday-sdk-js](https://developer.monday.com/apps/docs/monday-sdk-js)

---

### 🔄 @tanstack/react-query

Handles server state, caching, and async data fetching.

**Documentation**

- [https://tanstack.com/query/latest](https://tanstack.com/query/latest)

---

### 🧭 wouter

A minimal routing solution for React.

**Documentation**

- [https://github.com/molefrog/wouter](https://github.com/molefrog/wouter)

---

### 🐻 zustand

Lightweight global state management.

**Documentation**

- [https://zustand-demo.pmnd.rs/](https://zustand-demo.pmnd.rs/)

---

## 🧹 Linting

Run ESLint:

```bash
npm run lint
```
