# Backend README

## Overview

This backend uses Express + Socket.IO and now supports multi-instance realtime sync with Redis.

When you run more than one backend server:

- each client socket stays connected to one backend instance
- Redis pub/sub keeps Socket.IO events synced across all backend instances
- room broadcasts, direct socket emits, chat, typing, drawing, file sync, and presence continue to work across servers

The Redis adapter is configured in [src/socketCluster.ts](./src/socketCluster.ts) and attached in [src/server.ts](./src/server.ts).

## Environment

Create `server/.env` with values like:

```env
PORT=3000
NODE_ENV=development
REDIS_ADDR=127.0.0.1:6379
REDIS_PASSWORD=redis_2025
REDIS_USERNAME_TTL_SECONDS=45
SOCKET_IO_TRANSPORTS=websocket
```

You can also use:

- `REDIS_URL`
- `REDIS_HOST` and `REDIS_PORT`
- optional `REDIS_USERNAME`
- optional `REDIS_DB`

## Scripts

- `npm run dev`
  Starts one backend instance.

- `npm run dev:cluster`
  Starts two backend instances for local multi-instance testing.

- `npm run check:cluster`
  Starts two backend instances and two test clients, then verifies cross-instance sync automatically.

- `npm run build`
  Builds the backend TypeScript output.

## Local Multi-Instance Test

### 1. Start Redis

Make sure Redis is running locally on the address from `server/.env`.

### 2. Start the backend cluster

From `server`:

```bash
npm run dev:cluster
```

This starts:

- `server-1` on `http://127.0.0.1:4101`
- `server-2` on `http://127.0.0.1:4102`

### 3. Start the frontend

From `client`:

```bash
npm run dev
```

### 4. Open two browser windows

Open one client against backend instance 1:

```text
http://localhost:5173/?backendInstance=1
```

Open another client against backend instance 2:

```text
http://localhost:5173/?backendInstance=2
```

You can also use explicit backend URLs:

```text
http://localhost:5173/?backend=http://127.0.0.1:4101
http://localhost:5173/?backend=http://127.0.0.1:4102
```

### 5. Join the same room

Use the same room ID in both browser windows.

That gives you the exact local test you want:

- one client connected to backend server 1
- one client connected to backend server 2
- Redis syncing the Socket.IO traffic between them

## What To Verify

After both clients join the same room:

- user join events appear in both windows
- chat messages from one window appear in the other
- file changes sync across windows
- drawing sync works
- typing and online/offline state sync across servers

## Important Note

For Socket.IO clustering, you do not test by making one socket bounce between two servers.

The correct test is:

- client A connects to server 1
- client B connects to server 2
- both join the same room
- Redis keeps them in sync

That is exactly what `dev:cluster` and `check:cluster` are for.
