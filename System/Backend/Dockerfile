# Multi-stage build for Spring Boot backend
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# First, copy only the POM file to leverage Docker cache
COPY pom.xml ./

# Download dependencies (this step is cached unless pom.xml changes)
RUN mvn -B -e dependency:go-offline

# Copy source code
COPY src ./src/

# Build the application (skip tests)
RUN mvn -B -e -DskipTests clean package

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

