# Use lightweight Java image
FROM eclipse-temurin:17-jdk-jammy

# Set working directory
WORKDIR /app

# Copy built jar from target
COPY target/*.jar app.jar

# Render assigns PORT automatically
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["java","-Dserver.port=${PORT}","-jar","app.jar"]