# Architect Ledger - Enterprise Finance Dashboard

A scalable, full-stack financial dashboard designed to gracefully track, manage, and visualize corporate income, expenses, and transaction logs. This application consists of a robust Spring Boot backend paired with a reactive, modern React frontend.

![Architect Ledger](https://via.placeholder.com/1000x500?text=Architect+Ledger+Dashboard)

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 (bootstrapped with Vite)
- **Language**: JavaScript (ES6+)
- **Routing**: React Router DOM (v6)
- **Data Fetching**: Axios
- **Visualization**: Recharts (for Dashboard interactive analytics)
- **Styling**: Vanilla CSS (Tailor-made sleek, modern UI with rich micro-animations)
- **Iconography**: Lucide-React

### Backend
- **Framework**: Spring Boot 3.2.3
- **Language**: Java 21
- **Security**: Spring Security with JSON Web Tokens (JJWT 0.12.5) for stateless authentication
- **Database Mapping**: Spring Data JPA (Hibernate)
- **Database Engine**: H2 In-Memory Database (Easily expandable for MySQL deployment)
- **Utilities**: Lombok (boilerplate reduction), Maven

---

## ✨ Features

- **Robust Authentication**: Secure User Registration and Login endpoints. Authenticated securely via stateless JSON Web Tokens (JWT).
- **Interactive Dashboard**: A responsive dashboard that fetches live statistics including Total Income, Total Expenses, and Net Balance. Includes beautiful dynamic charts plotting financial health.
- **Transaction/Record Management**: Create, view, update, and manage financial records (Expenses and Income), categorized intelligently to track spending habits. Includes real-time asynchronous API validation.
- **Security & Authorization Levels**: Built-in User (`USER`), Analyst (`ANALYST`), and Administrator (`ADMIN`) roles. Viewers are restricted to their datasets while Admins have an overarching view.
- **Audit Logging**: Every sensitive action (creation of records, updates, and profile edits) is automatically recorded in the database's transparent `audit_logs` tracking table.
- **Profile Configuration**: Dedicated configuration user interface to view and modify user settings and securely rotate passwords.

---

## 🏗 System Architecture

The application adopts a standard 3-tier architecture:

1. **Presentation Layer (React Dashboard)**:
   A decoupled Single Page Application (SPA). The frontend communicates exclusively via secure RESTful APIs sending `Authorization: Bearer <token>` headers via Axios interceptors.

2. **Application Layer (Spring Boot API)**:
   Follows the Controller-Service-Repository pattern. 
   - **Controllers**: Receives HTTP input, processes roles, and formats Standard HTTP REST structures.
   - **Services**: Manages core business logic (`TransactionService`, `AuthService`, `UserService`). Includes `@Transactional(readOnly = true)` data-integrity protections and concurrency lock-safety.
   - **Security**: Configured with strict CORS policies (`SecurityConfig`) and robust Filter Chains.

3. **Data Layer (H2/MySQL Database)**:
   Manages `users`, `transactions`, and `audit_logs` entities with strict foreign-key referential integrities.

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18+) and npm
- **Java Development Kit** (JDK 21)
- **Apache Maven** (v3.8+)

### 1. Starting the Backend Server
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd architect-ledger/backend
   ```
2. Build the application and run safely:
   ```bash
   mvn clean install -DskipTests
   ```
3. Run the Spring Boot application (Disabling devtools automatic detach shutdowns):
   ```bash
   SPRING_DEVTOOLS_RESTART_ENABLED=false mvn spring-boot:run
   ```
   *The backend REST API will become fully available at `http://localhost:8080`.*

### 2. Starting the Frontend UI Server
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd architect-ledger/frontend
   ```
2. Install the necessary Node packages:
   ```bash
   npm install
   ```
3. Start the bleeding-edge Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be globally available at `http://localhost:5173`.*

---

## 🔌 API Documentation
For an exhaustive, comprehensive breakdown of all the Controller endpoints and their specific operations, refer to the included `API_DOCUMENTATION.md` markdown file in this repository.

---

## ⚙️ Production Configuration 
If you intend to transition from the H2 In-Memory DB to a separate database server (e.g. Production MySQL), update `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://production.database.server:3306/architect_ledger
    username: my_production_user
    password: super_secure_password
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
```

Be sure to also update CORS allowed-origins inside `application.yml` targeting your exact internet domain.

---
*Created for the Architect Ledger Finance Organization.*
