# Transformer Management - Frontend

This is the frontend for the **Orbit** Transformer Management System, a web application designed to manage transformer records and their associated thermal images. This project was built using **Vite**, **React**, **TypeScript**, and **Tailwind CSS**.


---

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js** (v18.x or higher is recommended)
- **npm** (Node Package Manager, comes with Node.js)

You can download Node.js from [nodejs.org](https://nodejs.org/).

---

## ⚙️ Installation

Follow these steps to set up your development environment.



**1. Install Project Dependencies**

This project uses several key libraries that need to be installed. Run the following command in the `frontend` directory to install all required packages from `package.json`:

```bash
npm install
```
This single command will install React, Vite, Tailwind CSS, and other necessary libraries like `react-router-dom` and `lucide-react`.

---

## ▶️ Running the Development Server

Once the installation is complete, you can run the application in development mode.

**1. Start the Vite development server:**

```bash
npm run dev
```

**2. Open the application in your browser:**

Vite will start the server and provide a local URL in the terminal, which is typically:
[http://localhost:5173](http://localhost:5173)

The application will automatically reload if you make any changes to the source files.

---

## 📁 Project Structure

The project follows a standard Vite + React project structure, organized for scalability and maintainability.

```
/frontend
|-- /public               # Static assets
|-- /src
|   |-- /components       # Reusable UI components
|   |   |-- /common       # Layouts, Sidebar, Buttons, etc.
|   |   |-- /transformers # Components specific to transformers
|   |-- /pages            # Main page components for each route
|   |-- App.tsx           # Main application component with routing
|   |-- index.css         # Main CSS file with Tailwind directives
|   |-- main.tsx          # Main entry point for the React app
|-- tailwind.config.js    # Tailwind CSS configuration
|-- vite.config.ts        # Vite configuration
|-- package.json          # Project dependencies and scripts
|-- README.md             # This file
```

---

## 🛠️ Key Libraries Used

- **Vite:** A next-generation frontend build tool that provides a faster and leaner development experience.
- **React:** A JavaScript library for building user interfaces.
- **TypeScript:** A statically typed superset of JavaScript that adds type safety.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **React Router DOM:** For handling client-side routing and navigation between pages.
- **Lucide React:** A beautiful and consistent icon library.

