# Database Migration Guide for Render

This guide explains how to set up and migrate the Makerspace database on Render PostgreSQL.

## Prerequisites

- Render account (free tier available)
- Access to Render Dashboard
- PostgreSQL database instance created on Render

## Database Setup Options

### Option 1: Automatic Schema Creation (Recommended)

The Spring Boot backend includes a `DataInitializer` component that automatically creates all necessary tables and columns on startup. This is the easiest approach for fresh deployments.

**Steps:**
1. Deploy the backend service to Render
2. Ensure `SPRING_PROFILES_ACTIVE=render` is set
3. The application will automatically create all tables on first run
4. Check logs for "All database migrations executed successfully"

### Option 2: Manual Schema Import

If you need to import an existing database or have specific schema requirements:

**Steps:**
1. Connect to your Render PostgreSQL database using psql or pgAdmin
2. Use the connection string from Render dashboard
3. Run the schema SQL file:
   ```bash
   psql $DATABASE_URL -f System/Database/Makerspace_DB_Schema.sql
   ```

## Environment Variables

Set these in your Render dashboard for the backend service:

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | `render` | Activates Render-specific configuration |
| `DATABASE_URL` | Auto-generated | Render provides this |
| `DATABASE_USERNAME` | Auto-generated | Render provides this |
| `DATABASE_PASSWORD` | Auto-generated | Render provides this |
| `JWT_SECRET` | Generate a strong secret | Used for token signing |
| `JWT_EXPIRATION` | `86400000` | 24 hours in milliseconds |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL |
| `FILE_UPLOAD_DIR` | `/app/uploads` | Render disk mount path |

## Troubleshooting

### Migration Failures

If automatic migrations fail:
1. Check Render logs for SQL errors
2. Verify database connection credentials
3. Ensure `SPRING_PROFILES_ACTIVE=render` is set
4. Check that Flyway is not conflicting with DataInitializer

### Missing Columns

If you see errors like `column "X" does not exist`:
1. The DataInitializer will auto-create missing columns on restart
2. Or manually run ALTER TABLE statements from the migration logs

### Database Reset

To completely reset the database:
1. Use Render dashboard to reset the PostgreSQL instance
2. Redeploy the backend service
3. All tables will be recreated automatically

## Schema Reference

### Core Tables
- `users` - User accounts and profiles
- `bookings` - Equipment/workspace bookings
- `inventory_items` - Equipment inventory
- `workshops` - Workshop events
- `workshop_registrations` - User workshop signups
- `articles` - Blog posts and articles
- `activities` - System activity logs
- `project_tasks` - Project task management
- `gallery` - Image gallery entries
- `contacts` - Contact form submissions

### Automatic Migrations Include
- User columns: `assigned_area`, `status`, notification preferences
- Booking columns: `equipment_item_id`, `equipment_quantity`
- All new tables with proper indexes and constraints
- Foreign key relationships

## Security Notes

- Never commit database credentials to version control
- Use Render's built-in environment variable management
- Enable SSL connections for database access
- Regularly backup your PostgreSQL data via Render dashboard
