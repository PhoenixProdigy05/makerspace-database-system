# Multi-stage build for Spring Boot backend
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# First, copy only the POM file to leverage Docker cache
COPY pom.xml ./

# Download dependencies (this step is cached unless pom.xml changes)
RUN mvn -B -e dependency:go-offline

# Copy source code
COPY src ./src/

# Build the application (skip tests for faster builds)
RUN mvn -B -e -DskipTests clean package

# Runtime stage - Use Alpine for smaller image size
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install wget for health checks and curl for debugging
RUN apk add --no-cache wget curl

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R nobody:nobody /app/uploads

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render will set PORT env var)
EXPOSE 8080

# Health check for Render
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/actuator/health || exit 1

# Run the application with proper user for security
USER nobody

# Set Java options for production
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseStringDeduplication"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

