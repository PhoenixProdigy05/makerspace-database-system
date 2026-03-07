# Makerspace Management System - Docker Setup

This guide explains how to run the Makerspace Management System using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of available RAM
- Ports 3000, 8080, and 5432 available

## Quick Start

1. **Clone and navigate to the project root:**
   ```bash
   cd "Makerspace Database System"
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - PostgreSQL: localhost:5432

## Services

The Docker Compose setup includes:

1. **PostgreSQL Database** (port 5432)
   - Database: `makerspace_db`
   - User: `postgres`
   - Password: `postgres`
   - Automatically initializes with schema from `System/Database/Makerspace_DB_Schema.sql`

2. **Spring Boot Backend** (port 8080)
   - REST API endpoints
   - JWT authentication
   - File uploads stored in volume
   - Health checks enabled

3. **Next.js Frontend** (port 3000)
   - React application
   - Connects to backend API

## Docker Commands

### Start services:
```bash
docker-compose up
```

### Start in detached mode (background):
```bash
docker-compose up -d
```

### Stop services:
```bash
docker-compose down
```

### Stop and remove volumes (clean slate):
```bash
docker-compose down -v
```

### Rebuild and restart:
```bash
docker-compose up --build
```

### View logs:
```bash
docker-compose logs -f
```

### View logs for specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Execute commands in containers:
```bash
# Access backend container shell
docker-compose exec backend sh

# Access database
docker-compose exec postgres psql -U postgres -d makerspace_db
```

## Environment Variables

### Backend Environment Variables

You can override these in `docker-compose.yml`:

- `SPRING_DATASOURCE_URL`: Database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT tokens (CHANGE IN PRODUCTION!)
- `JWT_EXPIRATION`: JWT token expiration in milliseconds
- `FILE_UPLOAD_DIR`: Directory for file uploads

### Frontend Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8080/api)

## Production Considerations

1. **Change default passwords:**
   - Update PostgreSQL password in `docker-compose.yml`
   - Update JWT secret in `docker-compose.yml`

2. **Use environment files:**
   ```bash
   docker-compose --env-file .env.production up
   ```

3. **Use Docker secrets** for sensitive data in production

4. **Configure reverse proxy** (nginx/traefik) for production

5. **Set up SSL/TLS certificates**

6. **Configure proper backup strategy** for PostgreSQL volumes

## Troubleshooting

### Port conflicts:
If ports 3000, 8080, or 5432 are already in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Frontend on 3001
     - "8081:8080"  # Backend on 8081
   ```

### Database connection issues:
- Ensure PostgreSQL container is healthy before backend starts
- Check health status: `docker-compose ps`

### Build issues:
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`

### Permission issues (Linux):
- Ensure Docker has permission to create volumes
- Check volume mounts: `docker volume ls`

## Data Persistence

- **PostgreSQL data**: Stored in `postgres_data` volume
- **File uploads**: Stored in `backend_uploads` volume

To backup data:
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres makerspace_db > backup.sql

# Backup volumes
docker run --rm -v makerspace_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

## Development Mode

For development, you may want to run services individually:

```bash
# Start only database
docker-compose up postgres

# Run backend locally with IntelliJ/Eclipse
# Run frontend locally with npm run dev
```

## Network

All services are connected via the `makerspace-network` bridge network. Services can communicate using their service names:
- Backend connects to PostgreSQL using hostname `postgres`
- Frontend connects to backend using `http://localhost:8080` (or configured URL)

## Health Checks

The backend includes a health check that verifies the service is running. Check status:
```bash
docker-compose ps
```

## Support

For issues or questions, check the logs first:
```bash
docker-compose logs -f
```


