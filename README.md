<div align="center">
  <h1>NestJS Authentication Service</h1>
  <p>
    <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
    <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
    <img src="https://img.shields.io/badge/grafana-%23F46800.svg?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana" />
  </p>
  <p>A production-ready authentication service with enterprise-grade security, observability, and DevOps practices</p>
</div>

## 📋 Overview

This authentication service is built with NestJS and provides a complete solution for user authentication in modern web applications. It implements industry best practices for security, observability, and deployment, making it suitable for production environments.

### 🔐 Key Features

- **Secure Authentication Flow**
  - JWT-based stateless authentication
  - Bcrypt password hashing with proper salt rounds
  - Protection against common security vulnerabilities
  - Password complexity enforcement

- **Complete API Suite**
  - User registration with validation
  - Secure login with JWT token issuance
  - Protected routes with JWT verification
  - Comprehensive error handling

- **Production-Ready Infrastructure**
  - Docker containerization with multi-stage builds
  - MongoDB integration with Mongoose ODM
  - CI/CD pipeline with GitHub Actions
  - Automated deployment to AWS EC2

- **Enterprise-Grade Observability**
  - Advanced structured logging with correlation IDs
  - Grafana dashboards for monitoring and alerting
  - Loki for log aggregation and querying
  - Promtail for log collection

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- Docker and Docker Compose
- MongoDB (or use the provided Docker setup)

### Installation

```bash
# Clone the repository
$ git clone https://github.com/yourusername/auth-service.git

# Install dependencies
$ npm install

# Set up environment variables
$ cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

```bash
# Development mode
$ npm run start:dev

# Production mode
$ npm run start:prod

# Using Docker (recommended)
$ docker-compose up -d
```

## 📊 API Documentation

Swagger documentation is available at `/docs` when the application is running.

### Endpoints

| Method | Endpoint        | Description             | Authentication |
| ------ | --------------- | ----------------------- | -------------- |
| POST   | `/auth/signup`  | Register a new user     | None           |
| POST   | `/auth/signin`  | Login and get JWT token | None           |
| GET    | `/auth/welcome` | Welcome page            | JWT required   |
| POST   | `/auth/logout`  | Logout (client-side)    | JWT required   |

### Request Examples

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'
```

## 🔍 Observability

This project includes a complete observability stack:

```bash
# Start the observability stack
$ docker-compose -f docker-compose.observability.yml up -d

# Access Grafana dashboard
Open http://localhost:3200 in your browser
Default credentials: admin/admin
```

### Included Dashboards

- **Auth Service Overview**: Key metrics and error rates
- **Authentication Activity**: Sign-ups and sign-ins over time
- **Error Analysis**: Detailed error breakdowns and trends

## 🛠️ Development

### Project Structure

```
├── src/
│   ├── auth/              # Authentication module
│   │   ├── controllers/   # API endpoints
│   │   ├── dto/           # Data transfer objects
│   │   ├── guards/        # JWT guards
│   │   ├── strategies/    # JWT strategy
│   │   └── services/      # Business logic
│   ├── users/             # Users module
│   │   ├── schemas/       # Mongoose schemas
│   │   └── services/      # User-related services
│   ├── logging/           # Logging configuration
│   └── app.module.ts      # Main application module
├── docker-compose.yml     # Docker configuration
└── docker-compose.observability.yml  # Observability stack
```

## 🚢 Deployment

### Docker Deployment

```bash
# Development environment
$ docker-compose up -d

# Production environment
$ NODE_ENV=production docker-compose up -d
```

### CI/CD Pipeline

The project includes a GitHub Actions workflow that:

1. Runs linting and formatting checks
2. Builds the application
3. Creates a Docker image
4. Deploys to AWS EC2

## 🔧 Environment Variables

| Variable         | Description               | Default                        |
| ---------------- | ------------------------- | ------------------------------ |
| `MONGO_URI`      | MongoDB connection string | `mongodb://mongodb:27017/auth` |
| `JWT_SECRET`     | Secret for JWT signing    | _required_                     |
| `JWT_EXPIRES_IN` | JWT expiration time       | `1d`                           |
| `NODE_ENV`       | Environment               | `development`                  |

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## Environment Variables

The application requires the following environment variables:

```
MONGO_URI=mongodb://localhost:27017/auth
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
```

## Project Structure

```
├── src/
│   ├── auth/           # Authentication module
│   ├── users/          # Users module
│   ├── logging/        # Logging configuration
│   └── main.ts         # Application entry point
├── docker-compose.yml  # Docker configuration
├── Dockerfile          # Docker build configuration
└── .github/workflows/  # CI/CD configuration
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Authentication](https://jwt.io)
- [Swagger Documentation](https://swagger.io)

## License

This project is [MIT licensed](LICENSE).
