# Aervion DroneTech Solutions - Contact & Quote Request Microservice

A layered Spring Boot microservice built with **Java 17**, **Spring Web**, **Spring Validation**, and **Spring Mail**. It receives contact form & quote request submissions from the frontend website, validates input payloads, formats HTML email templates, and dispatches notification emails via custom domain SMTP server.

---

## 🏗️ Architecture & Project Structure

```
backend/
├── pom.xml                                  # Maven dependencies (Java 17, Spring Boot 3.2.4)
├── mvnw.cmd                                 # Windows Maven wrapper
└── src/
    └── main/
        ├── java/com/aervion/contact/
        │   ├── AervionContactApplication.java# Spring Boot Main Entrypoint
        │   ├── config/
        │   │   └── CorsConfig.java           # Cross-Origin Security Configuration
        │   ├── controller/
        │   │   └── ContactController.java    # REST API Endpoints (@RestController)
        │   ├── dto/
        │   │   ├── ContactRequest.java       # Request Payload DTO + Bean Validation
        │   │   └── ApiResponse.java          # Standardized JSON Response Wrapper
        │   ├── exception/
        │   │   └── GlobalExceptionHandler.java# @RestControllerAdvice for @Valid & SMTP errors
        │   └── service/
        │       ├── ContactService.java       # Service Interface
        │       └── ContactServiceImpl.java   # Spring Mail & Custom Domain SMTP Implementation
        └── resources/
            └── application.yml              # Configuration & Environment Variables
```

---

## ⚙️ Prerequisites & Configuration

### Dependencies
- **Java 17** or higher JDK
- **Maven 3.8+**
- **Custom Domain SMTP Credentials** (Office 365, Google Workspace, Zoho Mail, or cPanel/Plesk SMTP server)

### Environment Variables (`application.yml`)
Configure the following environment variables on your server or test environment:

| Environment Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `SPRING_MAIL_HOST` | Custom Domain SMTP Server Host | `mail.aerviondronetechsolutions.in` or `smtp.gmail.com` |
| `SPRING_MAIL_PORT` | SMTP Server Port (587 STARTTLS / 465 SSL) | `587` |
| `SPRING_MAIL_USERNAME` | SMTP Auth Username / Email Address | `Info@aerviondronetechsolutions.in` |
| `SPRING_MAIL_PASSWORD` | Secure SMTP Password / App Password | `YourSecurePasswordHere` |
| `SPRING_MAIL_STARTTLS` | Enable STARTTLS encryption | `true` |
| `AERVION_MAIL_FROM` | Sender email address shown on emails | `Info@aerviondronetechsolutions.in` |
| `AERVION_MAIL_TO` | Corporate inbox to receive leads | `Info@aerviondronetechsolutions.in` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:5500,https://aerviondronetechsolutions.in` |

---

## 🚀 Local Testing Instructions

### 1. Build and Run the Microservice
Navigate to the `backend/` directory in your terminal:

```bash
cd backend
mvn clean spring-boot:run
```

The application will start on port `8080`. Verify health status by visiting:
`http://localhost:8080/api/contact/health`

Expected response:
```json
{
  "success": true,
  "message": "Aervion Contact Microservice is online and healthy.",
  "timestamp": "2026-10-01T17:00:00Z"
}
```

### 2. Test Quote Submission via `curl`

#### Success Case:
```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Anbarasan - Enterprise Infra",
    "email": "anbarasan@example.com",
    "phone": "+91 98765 43210",
    "serviceType": "Solar Inspection",
    "message": "We require solar thermal inspection for a 50MW solar park in Salem district."
  }'
```

Expected HTTP 200 Response:
```json
{
  "success": true,
  "message": "Thank you for contacting Aervion DroneTech Solutions Pvt. Ltd.! Your quote request has been submitted successfully.",
  "timestamp": "2026-10-01T17:00:00Z"
}
```

#### Validation Failure Case (HTTP 400):
```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "A",
    "email": "invalid-email",
    "phone": "123",
    "serviceType": "",
    "message": "short"
  }'
```

Expected HTTP 400 Response:
```json
{
  "success": false,
  "message": "Validation failed for one or more fields. Please check your inputs.",
  "timestamp": "2026-10-01T17:00:00Z",
  "errors": {
    "fullName": "Full Name must be between 2 and 100 characters",
    "email": "Please provide a valid email address (e.g. name@company.com)",
    "phone": "Please provide a valid phone number (7 to 20 digits/symbols)",
    "serviceType": "Service selection is required",
    "message": "Project details must be between 10 and 3000 characters"
  }
}
```

---

## 🔒 Secure Production Deployment Steps

### 1. Store Credentials in Secret Manager / System Environment Variables
**NEVER hardcode SMTP passwords in source control.** In production, set environment variables directly:

```bash
export SPRING_MAIL_HOST="smtp.office365.com"
export SPRING_MAIL_PORT="587"
export SPRING_MAIL_USERNAME="Info@aerviondronetechsolutions.in"
export SPRING_MAIL_PASSWORD="<STRONG_GENERIC_OR_APP_PASSWORD>"
export CORS_ALLOWED_ORIGINS="https://aerviondronetechsolutions.in,https://www.aerviondronetechsolutions.in"
```

### 2. Containerization with Docker

Create a `Dockerfile` inside `backend/`:

```dockerfile
# Step 1: Build JAR using JDK 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Step 2: Run Microservice
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/aervion-contact-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and launch container:
```bash
docker build -t aervion-contact-service .
docker run -d -p 8080:8080 \
  -e SPRING_MAIL_HOST="smtp.yourdomain.com" \
  -e SPRING_MAIL_USERNAME="Info@aerviondronetechsolutions.in" \
  -e SPRING_MAIL_PASSWORD="SecretPassword" \
  --name contact-service aervion-contact-service
```

### 3. Nginx Reverse Proxy & SSL Setup

Point Nginx to the Spring Boot microservice with HTTPS enabled:

```nginx
server {
    listen 443 ssl http2;
    server_name api.aerviondronetechsolutions.in;

    ssl_certificate /etc/letsencrypt/live/api.aerviondronetechsolutions.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.aerviondronetechsolutions.in/privkey.pem;

    location /api/contact {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Rate Limiting & CAPTCHA Guidance
- Configure Nginx `limit_req_zone` or Spring Bucket4j rate limiting to limit requests per IP (e.g., max 5 requests per minute).
- For public forms, optionally integrate reCAPTCHA v3 or Turnstile in `contact.js` before dispatching requests to Spring Boot.
