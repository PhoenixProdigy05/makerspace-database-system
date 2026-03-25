# Makerspace Management System - Preproduction Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Layer](#database-layer)
4. [Backend API](#backend-api)
5. [Frontend Application](#frontend-application)
6. [Deployment & Infrastructure](#deployment--infrastructure)
7. [Security Implementation](#security-implementation)
8. [Feature Modules](#feature-modules)
9. [Development Environment](#development-environment)
10. [Testing & Quality Assurance](#testing--quality-assurance)
11. [Performance Considerations](#performance-considerations)
12. [Known Limitations & Future Enhancements](#known-limitations--future-enhancements)

---

## System Overview

The Makerspace Management System is a comprehensive web-based platform designed to manage all aspects of makerspace operations. The system provides tools for user management, resource booking, workshop coordination, inventory tracking, and project collaboration.

### Key Features
- **User Management**: Role-based access control (Admin, Staff, Member)
- **Booking System**: Tool and resource reservation with approval workflow
- **Workshop Management**: Workshop scheduling, registration, and attendance tracking
- **Inventory Management**: Real-time inventory tracking with threshold alerts
- **Project Collaboration**: Workspace management and project tracking
- **Gallery System**: Photo and media sharing capabilities
- **Article Publishing**: Content management system for announcements and tutorials
- **File Management**: Attachment system for documents and media

---

## Architecture

The system follows a modern microservices-inspired architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│  (Spring Boot)  │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Next.js 16.0.1 with React 19.2.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives with custom components
- **Animations**: GSAP (GreenSock Animation Platform)
- **Charts**: Recharts for data visualization
- **Calendar**: FullCalendar for scheduling
- **Icons**: Lucide React & React Icons

#### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA with Hibernate
- **Security**: Spring Security with JWT authentication
- **API Documentation**: OpenAPI/Swagger
- **Database Migrations**: Flyway
- **File Upload**: Multipart file handling

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Configurable for production
- **File Storage**: Local filesystem with volume mounting
- **Health Checks**: Actuator endpoints for monitoring

---

## Database Layer

### Database Schema Overview

The PostgreSQL database consists of 8 core tables that support all system functionality:

#### Core Tables

**Users Table**
- Primary user management with role-based access control
- Supports Admin, Staff, and Member roles
- Includes notification preferences and staff categorization
- UUID-based primary keys for security

**Bookings Table**
- Central booking system for tools and resources
- Status workflow: PENDING → APPROVED/REJECTED → COMPLETED/CANCELLED
- Progress tracking (0-100%)
- Integration with attachment system for project documentation

**Workshops & Workshop_Registrations**
- Workshop management with capacity constraints
- User registration tracking
- Status management (SCHEDULED, CANCELLED, COMPLETED)

**Inventory_Items Table**
- Real-time inventory management
- Threshold-based alerting system
- Supplier and location tracking
- SKU-based identification

**Articles Table**
- Content management for announcements and tutorials
- Draft/Published workflow
- Tag-based categorization
- Author tracking and publication scheduling

**Attachments Table**
- Generic file attachment system
- Polymorphic relationships to multiple entity types
- File metadata and ownership tracking

### Database Design Principles
- **UUID Primary Keys**: Enhanced security and global uniqueness
- **Audit Fields**: Created/updated timestamps on all entities
- **Referential Integrity**: Foreign key constraints with proper cascading
- **Data Validation**: CHECK constraints for business rules
- **Indexing Strategy**: Optimized for common query patterns

---

## Backend API

### API Architecture

The Spring Boot backend provides a RESTful API with the following characteristics:

#### Security Layer
- **JWT Authentication**: Stateless token-based authentication
- **Role-Based Authorization**: Method-level security with @PreAuthorize
- **CORS Configuration**: Cross-origin resource sharing for frontend integration
- **Password Security**: BCrypt hashing for password storage

#### Controller Layer
The API is organized into 12 main controllers:

1. **AuthController**: Authentication endpoints (login, registration)
2. **UserController**: User management and profile operations
3. **BookingController**: Booking CRUD operations and workflow management
4. **WorkshopController**: Workshop management and registration
5. **InventoryController**: Inventory item management
6. **ArticleController**: Content management and publishing
7. **GalleryController**: Media gallery operations
8. **AttachmentController**: File upload and management
9. **ProjectWorkspaceController**: Project collaboration features
10. **ActivityController**: User activity tracking
11. **ContactController**: Communication and messaging
12. **DashboardController**: Analytics and reporting data

#### Service Layer
Business logic is encapsulated in service classes with:
- Transaction management with @Transactional
- Exception handling with custom exceptions
- Validation using Bean Validation annotations
- Logging for debugging and monitoring

#### Data Transfer Objects (DTOs)
Comprehensive DTO layer for:
- Request/response payload standardization
- Data validation and transformation
- API versioning support
- Security (exposing only necessary fields)

### API Endpoints Summary

#### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - New user registration
- `POST /api/auth/refresh` - Token refresh

#### User Management
- `GET /api/users` - List users (admin/staff)
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user profile
- `DELETE /api/users/{id}` - Delete user (admin)

#### Bookings
- `GET /api/bookings` - List bookings with filtering
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{id}/approve` - Approve booking
- `PUT /api/bookings/{id}/reject` - Reject booking
- `PUT /api/bookings/{id}/progress` - Update booking progress

#### Workshops
- `GET /api/workshops` - List workshops
- `POST /api/workshops` - Create workshop (staff)
- `POST /api/workshops/{id}/register` - Register for workshop
- `DELETE /api/workshops/{id}/register` - Cancel registration

#### Inventory
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/{id}` - Update inventory
- `GET /api/inventory/alerts` - Low stock alerts

---

## Frontend Application

### Application Structure

The Next.js frontend follows a modern React architecture with:

#### Routing Structure
```
/app
├── (auth)/login/page.tsx          # Authentication pages
├── dashboard/page.tsx             # Main dashboard
├── bookings/page.tsx              # Booking management
├── workshops/page.tsx             # Workshop browsing
├── inventory/page.tsx             # Inventory viewing
├── /staff/                        # Staff-only routes
│   ├── dashboard/page.tsx         # Staff dashboard
│   ├── users/page.tsx             # User management
│   ├── inventory/page.tsx         # Inventory management
│   ├── workshops/page.tsx         # Workshop management
│   └── gallery/page.tsx           # Gallery management
└── /profile/                      # User profile pages
```

#### Component Architecture

**UI Components** (`/components/ui/`)
- Reusable Radix UI-based components
- Consistent design system with Tailwind CSS
- TypeScript interfaces for type safety
- Accessibility compliance

**Feature Components** (`/components/`)
- `GalleryCarousel.tsx` - Image carousel with GSAP animations
- `UserDialog.tsx` - User creation/editing modal
- `InventoryItemDialog.tsx` - Inventory management modal
- `AttachmentUpload.tsx` - File upload component
- `ProtectedRoute.tsx` - Authentication wrapper

**Layout Components**
- `Header.tsx` - Main navigation header
- `Sidebar.tsx` - Role-based navigation
- `StaffSidebar.tsx` - Staff-specific navigation
- `MemberSidebar.tsx` - Member-specific navigation

#### State Management
- **React Context**: Authentication state management
- **Local State**: Component-level state with useState
- **Server State**: Data fetching with useEffect and fetch API
- **Form State**: Controlled components with validation

#### Styling & Design
- **Tailwind CSS 4.0**: Utility-first styling
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Configurable theme system
- **Animations**: GSAP for complex animations
- **Icons**: Lucide React icon library

### Key Features Implementation

#### Authentication Flow
- JWT token storage in localStorage
- Automatic token refresh
- Route protection with ProtectedRoute component
- Role-based UI rendering

#### Booking System
- Interactive booking creation with validation
- Real-time status updates
- Progress tracking with visual indicators
- File attachment support

#### Dashboard Analytics
- Recharts-based data visualization
- Member activity charts
- Booking statistics
- Inventory alerts

#### Responsive Design
- Mobile-optimized layouts
- Touch-friendly interactions
- Progressive enhancement
- Cross-browser compatibility

---

## Deployment & Infrastructure

### Docker Configuration

The system uses Docker Compose for containerized deployment with the following services:

#### Production Services
1. **PostgreSQL Database** (`postgres`)
   - PostgreSQL 15 Alpine
   - Persistent data volume
   - Health checks and restart policies
   - Schema initialization on startup

2. **Spring Boot Backend** (`backend`)
   - Multi-stage Docker build
   - Environment variable configuration
   - Health checks with Actuator
   - Volume mounting for file uploads

3. **Next.js Frontend** (`frontend`)
   - Production-optimized build
   - Static asset optimization
   - Environment-specific configuration

#### Development Services
1. **Backend Development** (`backend-dev`)
   - Maven-based hot reload
   - Source code mounting
   - Development dependencies
   - Debugging support

2. **Frontend Development** (`frontend-dev`)
   - Node.js development environment
   - Hot module replacement
   - Development server configuration

### Environment Configuration

#### Backend Environment Variables
```bash
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/makerspace_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION=86400000

# Server Configuration
SERVER_PORT=8080
FILE_UPLOAD_DIR=/app/uploads
```

#### Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:9091/api

# Development Settings
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

### Volume Management
- **PostgreSQL Data**: Persistent database storage
- **Backend Uploads**: File upload storage
- **Maven Cache**: Dependency caching for development
- **NPM Cache**: Node.js dependency caching

---

## Security Implementation

### Authentication & Authorization

#### JWT Implementation
- **Token Structure**: Header, Payload, Signature
- **Claims**: User ID, roles, expiration
- **Refresh Mechanism**: Automatic token renewal
- **Storage**: Client-side localStorage with HttpOnly alternatives

#### Role-Based Access Control
- **Admin**: Full system access
- **Staff**: Management functions for assigned areas
- **Member**: Self-service functionality

#### API Security
- **CORS Configuration**: Restricted origins in production
- **Rate Limiting**: Configurable request limits
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries

### Data Protection
- **Password Hashing**: BCrypt with salt
- **File Upload Security**: Type validation and size limits
- **XSS Prevention**: Input sanitization and output encoding
- **CSRF Protection**: Token-based CSRF protection

---

## Feature Modules

### User Management Module
- User registration and profile management
- Role assignment and permissions
- Notification preferences
- Activity tracking and history

### Booking System Module
- Resource reservation workflow
- Approval/rejection process
- Progress tracking
- File attachment support
- Calendar integration

### Workshop Management Module
- Workshop creation and scheduling
- Registration management
- Attendance tracking
- Capacity management
- Instructor assignment

### Inventory Management Module
- Real-time stock tracking
- Threshold-based alerts
- Supplier management
- Location tracking
- SKU-based identification

### Gallery Module
- Image upload and organization
- Carousel display with animations
- Category management
- Metadata tracking

### Article Management Module
- Content creation and editing
- Draft/publish workflow
- Tag-based categorization
- Publication scheduling
- Author attribution

---

## Development Environment

### Prerequisites
- Docker Desktop
- Node.js 20+ (for local development)
- Java 17+ (for local backend development)
- Git

### Setup Instructions

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd makerspace-database-system
   ```

2. **Start Development Environment**
   ```bash
   cd System
   docker-compose up backend-dev frontend-dev postgres
   ```

3. **Access Applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:9091
   - API Documentation: http://localhost:9091/swagger-ui.html
   - Database: localhost:5432

### Development Workflow
- **Hot Reload**: Automatic code reloading in development
- **Database Migrations**: Flyway-managed schema changes
- **API Testing**: Swagger UI for endpoint testing
- **Frontend Development**: Next.js development server

---

## Testing & Quality Assurance

### Backend Testing
- **Unit Tests**: JUnit 5 with Spring Boot Test
- **Integration Tests**: @SpringBootTest for full application testing
- **Security Tests**: Spring Security Test framework
- **API Tests**: MockMvc for endpoint testing

### Frontend Testing
- **Component Tests**: React Testing Library
- **Integration Tests**: End-to-end testing capabilities
- **Type Checking**: TypeScript compilation
- **Linting**: ESLint configuration

### Quality Assurance
- **Code Coverage**: Target >80% coverage
- **Static Analysis**: SonarQube integration potential
- **Security Scanning**: Dependency vulnerability checks
- **Performance Testing**: Load testing capabilities

---

## Performance Considerations

### Database Optimization
- **Indexing Strategy**: Optimized for common query patterns
- **Connection Pooling**: HikariCP configuration
- **Query Optimization**: JPA query optimization
- **Caching**: Application-level caching where appropriate

### Frontend Performance
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Lazy Loading**: Component and route lazy loading

### API Performance
- **Pagination**: Large dataset pagination
- **Compression**: GZIP response compression
- **Caching Headers**: HTTP caching strategies
- **Async Processing**: Non-blocking operations

---

## Known Limitations & Future Enhancements

### Current Limitations
1. **File Storage**: Local filesystem only (no cloud storage integration)
2. **Email Notifications**: Basic notification system
3. **Mobile App**: No native mobile application
4. **Advanced Analytics**: Limited reporting capabilities
5. **Multi-tenancy**: Single organization support only

### Planned Enhancements
1. **Cloud Storage Integration**: AWS S3 or Google Cloud Storage
2. **Advanced Notification System**: Email, SMS, push notifications
3. **Mobile Application**: React Native or Flutter mobile app
4. **Advanced Analytics**: Custom dashboard builder
5. **Multi-organization Support**: Multi-tenancy architecture
6. **API Rate Limiting**: Advanced rate limiting and throttling
7. **Real-time Features**: WebSocket integration for live updates
8. **Advanced Search**: Elasticsearch integration
9. **Workflow Automation**: Custom workflow engine
10. **Integration APIs**: Third-party system integrations

---

## Conclusion

The Makerspace Management System represents a comprehensive solution for makerspace operations management. With its modern technology stack, robust security implementation, and scalable architecture, the system is well-positioned for production deployment and future enhancements.

The system successfully addresses the core needs of makerspace management while maintaining flexibility for growth and customization. The modular architecture allows for easy maintenance and feature additions, while the comprehensive documentation supports both development and operational requirements.

For deployment instructions, please refer to the `README-DOCKER.md` file in the System directory. For implementation details, refer to the `IMPLEMENTATION_ANALYSIS.md` file.
