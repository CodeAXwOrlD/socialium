# Socialium Docker Setup

## 🐳 What's Included

This Docker Compose setup includes all the services you need to run Socialium without any local installation:

- **PostgreSQL 15** - Database (replaces SQLite)
- **Redis 7** - Cache and scheduler job store
- **Qdrant** - Vector database for AI embeddings
- **Backend (FastAPI)** - Python API server
- **Frontend (Next.js)** - React web application

## 🚀 Quick Start

### Option 1: Use the startup script (Recommended)

```bash
./docker-start.sh
```

### Option 2: Manual commands

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

## 📍 Access Points

Once all services are running:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| Qdrant Dashboard | http://localhost:6333/dashboard |

## 🔧 Configuration

### Environment Variables

The Docker Compose file reads from your existing `.env` files. Make sure these are set:

**Backend (.env)** - Already configured:
- ✅ OpenAI API Key
- ✅ Groq API Key
- ✅ Supabase credentials
- ✅ Twilio credentials (including TWILIO_VERIFY_SERVICE_SID)
- ✅ WhatsApp (WapiHub) credentials
- ✅ Langfuse & PostHog monitoring

**Frontend (.env.local)** - Already configured:
- ✅ NEXT_PUBLIC_API_URL
- ✅ PostHog keys

## 🐛 Useful Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f redis
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Stop Services

```bash
# Stop but keep data
docker compose down

# Stop and delete volumes (WARNING: deletes all data)
docker compose down -v
```

### Database Access

```bash
# Connect to PostgreSQL
docker exec -it socialium-db psql -U socialium_user -d socialium

# List tables
\dt

# Quit
\q
```

### Redis Access

```bash
# Connect to Redis
docker exec -it socialium-cache redis-cli

# Test Redis
PING

# Quit
QUIT
```

## 🔄 Development Workflow

With Docker, your code is mounted as volumes, so:

1. **Edit code** on your local machine
2. **Changes auto-reload** in the containers
3. **No rebuild needed** for code changes

Only rebuild when you:
- Change `requirements.txt` (backend)
- Change `package.json` (frontend)
- Modify `Dockerfile`

```bash
docker compose up -d --build
```

## 🆘 Troubleshooting

### Port already in use

If you get port conflicts:

```bash
# Find what's using the port
lsof -i :8000
lsof -i :3000

# Kill the process
kill -9 <PID>

# OR change the port in docker-compose.yml
# Example: Change "8000:8000" to "8001:8000"
```

### Services not starting

```bash
# Check Docker Desktop is running
docker info

# Check logs for errors
docker compose logs backend
docker compose logs frontend

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

### Database connection errors

Wait for PostgreSQL to be ready (check the health status):

```bash
docker compose ps
```

Look for `healthy` status on the database.

### Clean slate (nuclear option)

```bash
# Stop everything and delete all data
docker compose down -v

# Rebuild and start fresh
docker compose up -d --build
```

## 📊 Service Health Checks

All services have health checks configured:

- **PostgreSQL**: Checks if database is accepting connections
- **Redis**: Checks if Redis is responding to PING
- **Backend**: Waits for database and Redis before starting
- **Frontend**: Waits for backend before starting

Check health status:

```bash
docker compose ps
```

## 🎯 Next Steps

1. **Start Docker Desktop** (if not already running)
2. **Run the startup script**: `./docker-start.sh`
3. **Wait 30 seconds** for all services to initialize
4. **Open browser**: http://localhost:3000
5. **Test OTP**: The phone OTP should now work with Redis running!

## 💡 Tips

- **First build** takes 2-3 minutes (installing dependencies)
- **Subsequent starts** are much faster
- **Hot reload** works for both frontend and backend
- **Docker Desktop** shows resource usage in the menu bar
- **Volumes** persist data between restarts (database, cache)

## 🆘 Still having issues?

```bash
# Check Docker version
docker --version
docker compose version

# Verify .env files exist
ls -la backend/.env
ls -la frontend/.env.local

# Manual start with verbose logs
docker compose up --verbose
```
