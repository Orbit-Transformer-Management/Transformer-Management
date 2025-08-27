# ⚡ Orbit – Transformer Management System

Orbit is a web-based system designed to **digitize and streamline routine thermal inspections of distribution transformers**.  
Currently, inspections are manual, time-consuming, and error-prone. This project lays the foundation for an end-to-end inspection workflow.

---

## 📌 Current Implementation (Phase 1)

We have completed **Phase 1 – Transformer and Baseline Image Management**, which includes:

### Admin Interface for Transformer Management
- Add new transformer records  
- View and edit existing transformer records  
- Delete transformer records if required  

### Thermal Image Upload and Tagging
- Upload **thermal images** linked to specific transformers  
- Support for two image types:  
  - **Baseline**: Reference images for comparisons  
  - **Maintenance**: Images from periodic inspections  
- Each image is stored with metadata:  
  - Upload date/time  
  - Image type (Baseline / Maintenance)  
  - Uploader (admin ID or name)  

### Categorization by Environmental Conditions
- While uploading baseline images, users must select environmental conditions:  
  - Sunny  
  - Cloudy  
  - Rainy  
- Images are stored and searchable by these conditions  

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite + TypeScript + Tailwind CSS)  
- **Backend**: Java with Spring Boot (RESTful API)  
- **Database**: Relational DB (PostgreSQL)  

---

## 🚀 Setup Guide

## Prerequisites

Make sure the following are installed:

- Java 17+ (for Spring Boot backend) - [Java Downloads](https://www.oracle.com/apac/java/technologies/downloads/)

- Maven 3.9+ (build tool, usually bundled with IntelliJ / Spring Boot) - [Download](https://maven.apache.org/download.cgi)

- Node.js (v18.x or higher is recommended) - [nodejs.org](https://nodejs.org/)

- npm (Node Package Manager, comes with Node.js)

- PostgreSQL 17 (database, use pgAdmin for management) - [PostgreSQL Downloads](https://www.postgresql.org/download/)

---

## Backend Setup (Spring Boot + PostgreSQL)

1. Clone the repository:
```bash
git clone https://github.com/Orbit-Transformer-Management
cd backend
```

2. Configure database connection in `application.properties`:
```bash
spring.datasource.url=jdbc:postgresql://localhost:5432/transformer_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

3. Build and run the backend
```bash
mvn spring-boot:run
```

### Frontend Setup (React + Vite + Tailwind)

1. Go to frontend foldeer:
```bash
cd frontend
```

2. Install dependacies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open the app in browser: http://localhost:5000
 

### API Endpoints (Phase 1)

| Method   | Endpoint                       | Description                         |
| -------- | ------------------------------ | ----------------------------------- |
| `GET`    | `/api/v1/transformer`          | Get all transformers                |
| `GET`    | `/api/v1/transformer?region=X` | Get transformers filtered by region |
| `GET`    | `/api/v1/transformer?type=X`   | Get transformers filtered by type   |
| `POST`   | `/api/v1/transformer`          | Add a new transformer               |
| `PUT`    | `/api/v1/transformer`          | Update an existing transformer      |
| `DELETE` | `/api/v1/transformer/{id}`     | Delete transformer by ID            |

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE transformer_db;
```

2. Spring Boot will auto-generate tables (using JPA).

3. If needed, you can insert sample data manually via pgAdmin or SQL scripts.

## 🚧 Known Limitations / Future Work

- User authentication/authorization not yet implemented (anyone can access endpoints).

- No automated anomaly detection yet — currently, only metadata and image upload supported.

## 👩‍💻 Contributors

- Team Orbit
