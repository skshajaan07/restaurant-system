# Indian Delights Restaurant App

A full-stack React application for a restaurant, featuring a menu, shopping cart, and order placement system.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express
- **Database**: SQLite (via `better-sqlite3`)
- **Build Tool**: Vite

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

## Getting Started

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

    The application will start on `http://localhost:3000`.
    The database (`restaurant.db`) will be automatically created and seeded with initial menu items on the first run.

## Project Structure

- `src/App.tsx`: Main React application component.
- `src/db.ts`: Database initialization and schema.
- `server.ts`: Express server entry point (handles API and Vite middleware).
- `src/index.css`: Global styles (Tailwind CSS).

## API Endpoints

- `GET /api/menu`: Fetch all menu items.
- `POST /api/orders`: Place a new order.
- `POST /api/contact`: Submit a contact form message.
