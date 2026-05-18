# ClearPath Backend API

Universal addiction recovery companion — Node.js REST API with Claude AI integration.

---

## Tech stack

- **Runtime**: Node.js 20 LTS + Express
- **Database**: PostgreSQL 16 via Prisma ORM
- **AI**: Anthropic Claude API (streaming)
- **Auth**: JWT (access + refresh tokens)
- **Jobs**: BullMQ + Redis
- **Security**: Helmet, CORS, rate limiting, bcrypt

---

## Quick start

### 1. Prerequisites

```bash
node -v   # must be 20+
psql --version  # PostgreSQL 16
redis-server --version  # Redis 7+
```

### 2. Clone and install

```bash
git clone https://github.com/yourname/clearpath-backend.git
cd clearpath-backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your values:
#   DATABASE_URL   — your PostgreSQL connection string
#   JWT_SECRET     — random 64+ char string
#   JWT_REFRESH_SECRET — another random 64+ char string
#   ANTHROPIC_API_KEY — from console.anthropic.com
#   REDIS_URL      — your Redis URL
```

### 4. Set up the database

```bash
# Create the database in PostgreSQL first:
psql -U postgres -c "CREATE DATABASE clearpath_db;"
psql -U postgres -c "CREATE USER clearpath WITH PASSWORD 'yourpassword';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE clearpath_db TO clearpath;"

# Run Prisma migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed with a test user (development only)
npm run db:seed
```

### 5. Start the server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:3000**

---

## API reference

All routes are prefixed with `/v1`.

### Health
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | No | Server + DB health check |

### Authentication
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, returns JWT tokens |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | No | Logout |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset with token |

### Users
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/users/me` | Yes | Get current user |
| PATCH | `/users/me` | Yes | Update profile |
| DELETE | `/users/me` | Yes | Delete account (GDPR) |
| GET | `/users/me/stats` | Yes | Streak, totals, triggers |
| GET | `/users/me/export` | Yes | Full data export (GDPR) |

### Logs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/logs` | Yes | Create a log entry |
| GET | `/logs` | Yes | Get logs (filterable) |
| GET | `/logs/today` | Yes | Today's logs + summary |
| DELETE | `/logs/:id` | Yes | Delete a log entry |

### AI Companion
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/ai/chat` | Yes | Chat (streaming SSE) |
| GET | `/ai/messages` | Yes | Message history |
| GET | `/ai/usage` | Yes | Daily usage vs limit |

---

## Example requests

### Register
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123","name":"Jean"}'
```

### Login
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}'
```

### Update profile
```bash
curl -X PATCH http://localhost:3000/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"addictions":["smoking","alcohol"],"stage":"cutting","dailyGoal":5}'
```

### Log a craving
```bash
curl -X POST http://localhost:3000/v1/logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"resisted","addiction":"smoking","trigger":"stress","outcome":"resisted","mood":"okay"}'
```

### Chat with AI (streaming)
```bash
curl -X POST http://localhost:3000/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"I am really stressed and want to smoke right now","history":[]}'
```

The AI endpoint returns Server-Sent Events (SSE). In your React Native app, use the `EventSource` or `fetch` with streaming to consume the response token by token.

---

## Deploying to production

### Option A — Railway (easiest, 5 minutes)
1. Push code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add PostgreSQL and Redis plugins
4. Set environment variables in Railway dashboard
5. Deploy — Railway handles everything

### Option B — VPS (DigitalOcean, Hetzner)
```bash
# On your server
git clone your-repo
npm install --production
npm run db:migrate
npm run db:generate

# Use PM2 for process management
npm install -g pm2
pm2 start src/index.js --name clearpath-api
pm2 save
pm2 startup
```

### Option C — Docker
```bash
docker build -t clearpath-api .
docker run -p 3000:3000 --env-file .env clearpath-api
```

---

## Security checklist before launch

- [ ] Set strong random values for JWT_SECRET and JWT_REFRESH_SECRET (min 64 chars)
- [ ] Set ENCRYPTION_KEY to exactly 32 characters
- [ ] Set NODE_ENV=production
- [ ] Enable SSL on your database connection (add ?sslmode=require to DATABASE_URL)
- [ ] Set ALLOWED_ORIGINS to your actual app domain only
- [ ] Sign Data Processing Agreement with Anthropic before processing user data
- [ ] Review and publish your Privacy Policy and Terms of Service
- [ ] Set up database backups (daily minimum)
- [ ] Configure error alerting (Sentry, etc.)

---

## Crisis safety

The AI module automatically detects crisis signals in user messages. When detected:
- A `crisis` event is sent via SSE with localised helpline numbers
- The message is flagged in the database (`crisis_flagged: true`)
- The AI response always encourages professional help

Crisis detection is based on keyword matching. It is a safety net — not a clinical tool. Always include crisis helpline information visibly in your app UI regardless of detection.

---

## Licence

Proprietary — ClearPath. All rights reserved.
