# Development with Docker Compose

## Quick Start

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up --build -d

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Web | http://localhost:3000 | Next.js Dashboard |
| API | http://localhost:3001 | NestJS API |
| MongoDB | localhost:27017 | MongoDB Database |

## MongoDB Credentials

- Username: `admin`
- Password: `admin123`
- Database: `bling-orders`

## Connect to MongoDB

```bash
docker exec -it bling-mongodb mongosh -u admin -p admin123
```

## View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

## Rebuild After Changes

```bash
docker-compose up --build
```

## Create Admin User

After starting, create an admin user via API:

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123","name":"Admin"}'
```
