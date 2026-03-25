# Cloud Deployment Guide - Render + Vercel

This guide explains how to deploy the Makerspace Management System to production using Render for the backend/database and Vercel for the frontend.

## Prerequisites

- GitHub repository with the code
- Render account (free tier available)
- Vercel account (free tier available)
- Domain names (optional, for custom URLs)

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Render        │    │   Render        │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│   Next.js       │    │   Spring Boot   │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Step 1: Deploy Backend & Database to Render

### 1.1 Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `makerspace-db`
   - Database Name: `makerspace_db`
   - User: `makerspace`
   - Plan: Free (or paid for production)
4. Click "Create Database"

### 1.2 Deploy Spring Boot Backend

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `makerspace-backend`
   - Environment: Docker
   - Root Directory: `System/Backend`
   - Branch: `main` (or your production branch)
   - Plan: Free (or paid for production)

4. Add Environment Variables:
   ```
   DATABASE_URL: [from database connection string]
   DATABASE_USERNAME: [from database]
   DATABASE_PASSWORD: [from database]
   JWT_SECRET: [generate a strong secret]
   JWT_EXPIRATION: 86400000
   FRONTEND_URL: https://your-vercel-app.vercel.app
   FILE_UPLOAD_DIR: /app/uploads
   SPRING_PROFILES_ACTIVE: render
   ```

5. Add Disk Storage:
   - Click "Advanced" → "Add Disk"
   - Name: `makerspace-uploads`
   - Mount Path: `/app/uploads`
   - Size: 1GB (or as needed)

6. Click "Create Web Service"

### 1.3 Import Database Schema

1. Once the database is ready, connect to it using pgAdmin or psql
2. Run the schema from `System/Database/Makerspace_DB_Schema.sql`
3. Or use the Render dashboard to run the SQL file

## Step 2: Deploy Frontend to Vercel

### 2.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the `System/Frontend` directory

### 2.2 Configure Build Settings

1. Framework Preset: Next.js
2. Build Command: `npm run build`
3. Output Directory: `.next`
4. Install Command: `npm install`

### 2.3 Add Environment Variables

1. Go to Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_API_URL: https://your-backend-name.onrender.com/api
   ```

### 2.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Note your Vercel URL for the next step

## Step 3: Update CORS Configuration

### 3.1 Backend CORS Update

1. In your Render backend service, update the FRONTEND_URL environment variable
2. Set it to your actual Vercel URL: `https://your-app-name.vercel.app`
3. Redeploy the backend service

### 3.2 Frontend API URL Update

1. In Vercel, update the NEXT_PUBLIC_API_URL environment variable
2. Set it to your actual Render backend URL: `https://your-backend-name.onrender.com/api`
3. Redeploy the frontend

## Step 4: Verify Deployment

### 4.1 Health Checks

1. Backend health: `https://your-backend-name.onrender.com/actuator/health`
2. Frontend: `https://your-app-name.vercel.app`
3. Test API endpoints via browser or Postman

### 4.2 Functionality Testing

1. User registration and login
2. File uploads (gallery functionality)
3. Workshop management
4. All CRUD operations

## Environment Variables Reference

### Backend (Render)
```
DATABASE_URL: postgresql://user:password@host:port/database
DATABASE_USERNAME: your_db_user
DATABASE_PASSWORD: your_db_password
JWT_SECRET: your-super-secret-jwt-key
JWT_EXPIRATION: 86400000
FRONTEND_URL: https://your-app.vercel.app
FILE_UPLOAD_DIR: /app/uploads
SPRING_PROFILES_ACTIVE: render
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL: https://your-backend.onrender.com/api
```

## Custom Domain Setup (Optional)

### Vercel Frontend
1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS instructions

### Render Backend
1. In Render dashboard, go to Service Settings → Custom Domains
2. Add your custom domain
3. Follow DNS instructions
4. Update CORS configuration accordingly

## Monitoring and Logs

### Render
- View logs in the dashboard under Logs tab
- Monitor database performance
- Set up alerting for errors

### Vercel
- View logs in Vercel dashboard
- Monitor build performance
- Set up analytics

## Backup Strategy

### Database Backup
- Render automatically backs up PostgreSQL databases
- Configure additional backups if needed
- Test restore procedures

### File Uploads
- Consider cloud storage for file uploads (AWS S3, etc.)
- Implement backup strategy for uploaded files

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **HTTPS**: Both platforms provide SSL certificates
3. **CORS**: Restrict to your production domains only
4. **Database**: Use strong passwords and secure connections
5. **JWT**: Use a strong, randomly generated secret

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check that FRONTEND_URL matches your Vercel domain
2. **Database Connection**: Verify DATABASE_URL format and credentials
3. **Build Failures**: Check logs for missing dependencies or configuration errors
4. **File Uploads**: Ensure disk storage is properly configured

### Debugging Steps

1. Check service logs in respective dashboards
2. Verify environment variables are set correctly
3. Test API endpoints directly
4. Check network connectivity between services

## Cost Optimization

- Use free tiers for development/testing
- Monitor usage and upgrade as needed
- Consider auto-scaling for production
- Optimize database queries and file storage

## Next Steps

1. Set up CI/CD pipelines for automated deployments
2. Configure monitoring and alerting
3. Implement automated testing
4. Set up staging environment for testing changes
5. Plan for disaster recovery
