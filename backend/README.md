# WhatsApp monday App – Backend

This service provides the **backend integration between WhatsApp and monday.com**. It handles authentication, WhatsApp sessions, real‑time communication, database persistence, and monday API interactions.

---

## 🧰 Tech Stack

- **Server Framework**: Fastify
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Auth**: JWT, OAuth2
- **WhatsApp Integration**: Baileys
- **Real-time**: Socket.IO
- **monday SDK**: monday-sdk-js
- **QR Codes**: qrcode, qrcode-terminal

---

## 📥 Installation

### Prerequisites

Make sure you have installed:

- **Node.js** ≥ 18
- **npm** or **pnpm**
- **PostgreSQL**

---

### Install Dependencies

```bash
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the project:

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
MONDAY_CLIENT_ID=your_monday_client_id
MONDAY_CLIENT_SECRET=your_monday_client_secret
MONDAY_SIGNING_SECRET=your_monday_signing_secret
```

> Adjust variables based on your infrastructure and monday app configuration.

---

## 🏃 Running the Project

### Development Mode

Runs the server with hot reload:

```bash
npm run dev
```

Entry file:

```
src/index.ts
```

---

### Production Mode

Build the project:

```bash
npm run build
```

Start the server:

```bash
npm start
```

The compiled output runs from:

```
dist/src/index.js
```

---

## 🏗️ Build

```bash
npm run build
```

This command:

- Compiles TypeScript
- Rewrites path aliases using `tsc-alias`

---

## 🧬 Database (Drizzle ORM)

### Generate Migrations

```bash
npm run generate
```

### Run Migrations

```bash
npm run migrate
```

### Push Schema (Dev)

```bash
npm run push
```

---

## 🔐 Authentication

### JWT

- Used for API authentication
- Managed via `@fastify/jwt`

### OAuth2 (monday)

- Handles monday.com OAuth flow
- Implemented using `simple-oauth2`

---

## 📡 WhatsApp Integration

This service uses **Baileys** to manage WhatsApp Web sessions.

Features:

- QR code generation for login
- Persistent WhatsApp sessions
- Message send/receive handling

QR codes are generated using:

- `qrcode`
- `qrcode-terminal`

---

## 🔄 Real-time Communication

Real-time events are handled via **Socket.IO**:

- WhatsApp connection status
- Incoming messages
- Session updates

---

## 📚 Key Libraries Documentation

### 🟦 monday-sdk-js

Used to communicate with the monday.com API.

Documentation:

- [https://developer.monday.com/apps/docs/monday-sdk-js](https://developer.monday.com/apps/docs/monday-sdk-js)

---

### ⚡ Fastify

High-performance Node.js web framework.

Documentation:

- [https://www.fastify.io/docs/latest/](https://www.fastify.io/docs/latest/)

---

### 🧬 Drizzle ORM

Type-safe SQL ORM for PostgreSQL.

Documentation:

- [https://orm.drizzle.team/](https://orm.drizzle.team/)

---

### 📲 Baileys (WhatsApp)

WhatsApp Web API client.

Documentation:

- [https://github.com/WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)

---

### 🔌 Socket.IO

Real-time bidirectional communication.

Documentation:

- [https://socket.io/docs/v4/](https://socket.io/docs/v4/)

---

## 🧹 Linting

Run linter:

```bash
npm run lint
```

Fix lint issues automatically:

```bash
npm run lint:fix
```

---

## 📌 Notes

- Ensure PostgreSQL is running before starting the server
- WhatsApp sessions may require persistent storage
- monday OAuth credentials must match the monday app configuration
