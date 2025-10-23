# ⚡ Orbit – Transformer Management System

Orbit is a web-based system designed to **digitize and streamline routine thermal inspections of distribution transformers**. Currently, inspections are manual, time-consuming, and error-prone. This project lays the foundation for an end-to-end inspection workflow.

---

## ⚙️ Phase 3 – Interactive Annotation & Feedback Loop

We have completed phase 3 focusing on enhancing user control, data accuracy, and model improvement.

### 🖊️ Interactive Annotation Tools

On the anomaly detection view, inspectors can now directly interact with the AI-detected anomalies by:

* Adjusting existing anomaly markers (resize, reposition)
* Deleting incorrect detections
* Adding new anomaly markers by drawing bounding boxes

Each annotation captures:

* Annotation type (added / edited / deleted)  
* Optional comments or notes  
* Timestamp and user ID  

This feature empowers users to refine detections and ensure high-quality inspection records.

### 🗃️ Metadata and Annotation Persistence

All annotation changes are automatically captured and saved in the backend.  
Each record includes:

* User ID  
* Timestamp  
* Image ID  
* Transformer ID  
* Action taken  

When the same image is revisited, existing annotations are automatically reloaded, maintaining a consistent inspection history.

### 🔁 Feedback Integration for Model Improvement

The system now facilitates the automatic collection of high-quality training data, enabling continuous model retraining (Finetuning).

- Feedback Log Generation: A service endpoint allows for the export of a structured JSON log containing:
   - The Final Human-Validated Annotations
   - Annotator metadata

- Automated Retraining Readiness: This exportable log can be formatted for direct ingestion to Roboflow, setting up the automated finetuning of the model when enough new, corrected data is accumulated.

---

## 📌 Phase 2 – Automated Fault Detection & Inspection Comments

In phase 2 we introduced AI-powered analysis and feedback management, enhancing the system’s intelligence and usability.

### 🔍 Roboflow AI Integration

Integrated Roboflow model trained on transformer thermal imagery.

On uploading a maintenance image, the backend automatically:

* Sends the image to the Roboflow API for inference
* Receives detected fault bounding boxes, labels, and confidence scores
* Stores the prediction JSON in the database
* Annotated images are displayed in the inspection page

### 🧠 Fault Detection Workflow

Detected anomalies (e.g., hotspots, loose connections) are classified as:

* Normal
* Potential Fault
* Fault

The results are visually rendered on the uploaded image with color-coded bounding boxes.

### 💬 Inspection Comment System

Inspectors can add comments and observations on each inspection. Each comment includes:

* Author name
* Comment text
* Timestamp

Comments are stored in a dedicated table linked to the inspection. Admins can view and manage all past discussions on a transformer’s inspection history.

---

## 🗂️ Phase 1 – Transformer and Baseline Image Management

Phase 1 laid the foundation for managing transformers and baseline images.

### Admin Interface for Transformer Management

* Add new transformer records
* View and edit existing transformer records
* Delete transformer records if required

### Thermal Image Upload and Tagging

* Upload **thermal images** linked to specific transformers
* Support for two image types:

  * **Baseline**: Reference images for comparisons
  * **Maintenance**: Images from periodic inspections
* Each image is stored with metadata:

  * Upload date/time
  * Image type (Baseline / Maintenance)
  * Uploader (admin ID or name)

### Categorization by Environmental Conditions

* While uploading baseline images, users must select environmental conditions:

  * Sunny
  * Cloudy
  * Rainy
* Images are stored and searchable by these conditions.

---

## 🧩 API Endpoints

### Phase 1 – Transformer & Inspection Management

| Method | Endpoint                                             | Description                                   |
| ------ | ---------------------------------------------------- | --------------------------------------------- |
| GET    | /api/v1/transformers                                 | Get all transformers                          |
| GET    | /api/v1/transformers/{transformerNumber}             | Get a transformer by transformer number       |
| GET    | /api/v1/transformers/{transformerNumber}/image       | Get the **baseline image** of a transformer   |
| POST   | /api/v1/transformers                                 | Create a new transformer                      |
| POST   | /api/v1/transformers/{transformerNumber}/image       | Upload **baseline image** for transformer     |
| DELETE | /api/v1/transformers/{transformerNumber}             | Delete a transformer by transformer number    |
| GET    | /api/v1/inspections                                  | Get all inspections                           |
| GET    | /api/v1/inspections/{inspectionNumber}               | Get an inspection by inspection number        |
| GET    | /api/v1/transformers/{transformerNumber}/inspections | Get all inspections of a specific transformer |
| GET    | /api/v1/inspections/{inspectionNumber}/image         | Get inspection image                          |
| POST   | /api/v1/inspections                                  | Create a new inspection                       |
| POST   | /api/v1/inspections/{inspectionNumber}/image         | Upload inspection image                       |
| DELETE | /api/v1/inspections/{inspectionNumber}               | Delete an inspection                          |

### Phase 2 – AI Integration & Comment System

| Method | Endpoint                                       | Description                                     |
| ------ | ---------------------------------------------- | ----------------------------------------------- |
| GET    | /api/v1/inspections/{inspectionNumber}/comment | Retrieve all comments for a specific inspection |
| POST   | /api/v1/inspections/{inspectionNumber}/comment | Add a new comment to a specific inspection      |
| GET    | /api/v1/inspections/{inspectionNumber}/analyze | Retrieve AI model predictions for an inspection |
| PUT    | /api/v1/inspections/{inspectionNumber}/analyze | Update AI model predictions for an inspection   |

### Phase 3 – Interactive Annotation & Feedback APIs

| Method  | Endpoint                                                | Description                                                      |
| ------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| GET     | /api/v1/inspections/{inspectionNumber}/analyze/timeline | Retrieve timeline of all annotation edits for a given inspection |
| GET     | /api/v1/inspections/analyze/timeline/all                | Retrieve timeline of all annotation edits across inspections     |
| GET     | /api/v1/inspections/analyze/all                         | Retrieve all detections across inspections                       |
| POST    | /api/v1/inspections/{inspectionNumber}/analyze          | Add a new anomaly annotation                                     |
| PUT     | /api/v1/inspections/analyze/{detectId}                  | Update or modify existing anomaly annotation                     |
| DELETE  | /api/v1/inspections/analyze/{detectId}                  | Delete a detection or annotation                                 |

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite + TypeScript + Tailwind CSS)
* **Backend**: Java with Spring Boot (RESTful API)
* **Database**: Relational DB (PostgreSQL)

---

## 🚀 Setup Guide

### Prerequisites

Make sure the following are installed:

* Java 21 (for Spring Boot backend) - [Java Downloads](https://www.oracle.com/apac/java/technologies/downloads/)
* Maven 3.9+ (build tool, usually bundled with IntelliJ / Spring Boot) - [Download](https://maven.apache.org/download.cgi)
* Node.js (v18.x or higher is recommended) - [nodejs.org](https://nodejs.org/)
* npm (Node Package Manager, comes with Node.js)
* PostgreSQL 17 (database, use pgAdmin for management) - [PostgreSQL Downloads](https://www.postgresql.org/download/)

---

### Frontend Setup (React + Vite + Tailwind)

1. Go to frontend folder:

```bash
git clone https://github.com/Orbit-Transformer-Management/Transformer-Management
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run development server:

```bash
npm run dev
```

4. Open the app in browser: [http://localhost:5173](http://localhost:5173)

### Database Setup

1. Create PostgreSQL database:

```sql
CREATE DATABASE transformer_db;
```

2. Spring Boot will auto-generate tables (using JPA).
3. If needed, you can insert sample data manually via pgAdmin or SQL scripts.

---

## 🚧 Known Limitations / Future Work

* User authentication/authorization not yet implemented (anyone can access endpoints).
* No user profile or role management is available.
* The Roboflow AI model cannot be retrained dynamically using user inputs or feedback.
* Fault detection results rely solely on the pre-trained model without continuous learning capability.

---

## 👩‍💻 Contributors

* Team Orbit
