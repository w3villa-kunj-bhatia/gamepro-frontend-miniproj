# GamePro Frontend

This is the frontend client for the GamePro application. It is a Single Page Application (SPA) built with React and Vite, utilizing Tailwind CSS for styling.

## Features

- **Modern UI:** Responsive design built with Tailwind CSS.
- **State Management:** React Context API for Authentication and Theme management.
- **Routing:** React Router DOM for seamless navigation.
- **API Integration:** Axios setup with interceptors for handling JWT tokens and errors.
- **Protected Routes:** Higher-order components to secure dashboard and profile pages.

## Tech Stack

- React.js
- Vite (Build Tool)
- Tailwind CSS & PostCSS
- Axios
- React Router DOM

## Prerequisites

- Node.js (v14 or higher)
- The **GamePro Backend** server running locally or deployed.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd gamepro-frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory (optional for dev, mandatory for production if backend URL differs):

    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

    _Note: In development, `vite.config.js` proxies `/api` requests to `http://localhost:5000` automatically._

## Running the Application

- **Development Server:**

  ```bash
  npm run dev
  ```

  Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

- **Build for Production:**

  ```bash
  npm run build
  ```

  This builds the app for production to the `dist` folder.

- **Preview Production Build:**
  ```bash
  npm run preview
  ```

## Project Structure

- `src/api` - Axios configuration and API calls.
- `src/auth` - Authentication context and route protection.
- `src/components` - Reusable UI components (Navbar, Loader, etc.).
- `src/context` - Global state providers (Theme, etc.).
- `src/pages` - Main application pages (Dashboard, Login, Profile, etc.).
- `src/routes` - App routing configuration.
