# Inventory Management Frontend

This is the frontend application for the Inventory Management System, built with React, TypeScript, and Vite.

## Tech Stack

- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Icons**: Lucide React

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager

## Local Setup

1. **Install Dependencies**:
   ```bash
   yarn install
   ```

2. **Run Development Server**:
   ```bash
   yarn dev
   ```
   The application will start at `http://localhost:5173` (default Vite port).

3. **Build for Production**:
   ```bash
   yarn build
   ```
   The output will be in the `dist` directory.

## Docker

To build and run this service using Docker (served via Nginx):

```bash
docker build -t inventory-frontend .
docker run -p 3000:80 inventory-frontend
```

## Project Structure

- `src/api`: API client and service functions.
- `src/components`: Reusable UI components (Layout, ProtectedRoute).
- `src/context`: React Context definitions (AuthContext).
- `src/pages`: Main application pages (Login, Register, Dashboard, Items, Categories, Transactions).
