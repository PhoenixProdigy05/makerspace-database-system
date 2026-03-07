# Makerspace Database System

A comprehensive management system for makerspaces, featuring booking management, workshop coordination, user management, and inventory tracking.

## 🚀 Features

- **User Management**: Registration, authentication, and profile management
- **Booking System**: Equipment and workspace reservations
- **Workshop Management**: Create and manage workshops with registrations
- **Inventory Tracking**: Monitor tools, equipment, and supplies
- **Gallery**: Display project photos and makerspace activities
- **Contact Management**: Handle member communications
- **Article System**: Share news and announcements

## 🛠️ Tech Stack

### Backend
- **Spring Boot**: Java-based REST API framework
- **PostgreSQL**: Primary database
- **JWT Authentication**: Secure user authentication
- **Flyway**: Database migration management

### Frontend
- **Next.js**: React-based web framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

### DevOps
- **Docker**: Containerized deployment
- **Docker Compose**: Multi-container orchestration

## 📋 Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of available RAM
- Ports 3000, 8080, and 5432 available

## 🚀 Quick Start

1. **Clone and navigate to the project:**
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

## 📁 Project Structure

```
Makerspace Database System/
├── System/
│   ├── Backend/                 # Spring Boot application
│   ├── Frontend/               # Next.js application
│   ├── Database/               # Database schema and scripts
│   ├── docker-compose.yml      # Docker orchestration
│   └── README-DOCKER.md        # Detailed Docker setup guide
├── Documentation/              # Project documentation
└── Pictures/                   # Gallery images and assets
```

## 🔧 Development

### Backend Development
- Navigate to `System/Backend`
- Run with Maven: `mvn spring-boot:run`
- API documentation available at `/swagger-ui.html`

### Frontend Development
- Navigate to `System/Frontend`
- Install dependencies: `npm install`
- Run development server: `npm run dev`

## 📊 Database

- **Database**: PostgreSQL
- **Connection**: localhost:5432
- **Name**: makerspace_db
- **User**: postgres
- **Password**: postgres

Database schema is automatically initialized with Flyway migrations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **PhoenixProdigy05** - *Initial development*

## 📞 Support

For support and questions, please open an issue in the repository.
