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

- Java 21 (for Spring Boot backend) - [Java Downloads](https://www.oracle.com/apac/java/technologies/downloads/)

- Maven 3.9+ (build tool, usually bundled with IntelliJ / Spring Boot) - [Download](https://maven.apache.org/download.cgi)

- Node.js (v18.x or higher is recommended) - [nodejs.org](https://nodejs.org/)

- npm (Node Package Manager, comes with Node.js)

- PostgreSQL 17 (database, use pgAdmin for management) - [PostgreSQL Downloads](https://www.postgresql.org/download/)

---

### Frontend Setup (React + Vite + Tailwind)

1. Go to frontend foldeer:
```bash
git clone https://github.com/Orbit-Transformer-Management/Transformer-Management
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

4. Open the app in browser: http://localhost:5173

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE transformer_db;
```

2. Spring Boot will auto-generate tables (using JPA).

3. If needed, you can insert sample data manually via pgAdmin or SQL scripts.
 

### API Endpoints (Phase 1)

#### Transformer APIs

| Method | Endpoint                                      | Description                                |
|--------|-----------------------------------------------|--------------------------------------------|
| GET    | `/api/v1/transformers`                        | Get all transformers                       |
| GET    | `/api/v1/transformers/{transformerNumber}`    | Get a transformer by transformer number     |
| GET    | `/api/v1/transformers/{transformerNumber}/image` | Get the **baseline image** of a transformer |
| POST   | `/api/v1/transformers`                        | Create a new transformer                    |
| POST   | `/api/v1/transformers/{transformerNumber}/image` | Upload **baseline image** for transformer   |
| DELETE | `/api/v1/transformers/{transformerNumber}`    | Delete a transformer by transformer number  |

---

#### Inspection APIs

| Method | Endpoint                                                | Description                                      |
|--------|---------------------------------------------------------|--------------------------------------------------|
| GET    | `/api/v1/inspections`                                   | Get all inspections                              |
| GET    | `/api/v1/inspections/{inspectionNumber}`                | Get an inspection by inspection number           |
| GET    | `/api/v1/transformers/{transformerNumber}/inspections`  | Get all inspections of a specific transformer    |
| GET    | `/api/v1/inspections/{inspectionNumber}/image`          | Get inspection image                             |
| POST   | `/api/v1/inspections`                                   | Create a new inspection                          |
| POST   | `/api/v1/inspections/{inspectionNumber}/image`          | Upload inspection image                          |
| DELETE | `/api/v1/inspections/{inspectionNumber}`                | Delete an inspection                             |


## 🚧 Known Limitations / Future Work

- User authentication/authorization not yet implemented (anyone can access endpoints).

- No automated anomaly detection yet — currently, only metadata and image upload supported.

## 👩‍💻 Contributors

- Team Orbit
