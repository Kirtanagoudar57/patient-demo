# Patient Management System (Full-Stack)

A modern full-stack patient management application with a **FastAPI** backend and a **React + TypeScript + Vite** frontend.

---

## 🏗️ Project Architecture

```
patient-demo/
├── app/                        # FastAPI Backend Application
│   ├── main.py                 # FastAPI entry point & CORS configuration
│   ├── auth.py                 # JWT authentication & password hashing
│   ├── database.py             # SQLAlchemy engine & session management
│   ├── models.py               # SQLAlchemy database models
│   ├── schemas.py              # Pydantic v2 validation schemas
│   ├── crud.py                 # Database CRUD operations
│   └── routers/                # API route endpoints
│       ├── auth.py             # User register & login endpoints
│       └── patients.py         # Patient CRUD & query endpoints
├── frontend/                   # React + TypeScript + Vite Frontend
│   ├── src/                    # UI components, pages, hooks, services
│   ├── package.json            # Node dependencies
│   ├── vite.config.ts          # Vite configuration & backend proxy
│   └── README.md               # Frontend documentation
├── requirements.txt            # Python backend dependencies
├── create_db.py                # PostgreSQL database initialization script
├── check_table.py              # Database table verification script
├── .env.example                # Template for environment variables
└── .gitignore                  # Git ignore rules for Python & Node
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm
- **PostgreSQL** database

---

### 2. Backend Setup (FastAPI)

1. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   Fill in your PostgreSQL credentials and JWT secret in `.env`:
   ```env
   JWT_SECRET_KEY=your_secret_key_here
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=patient_db
   ```

2. **Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize the Database:**
   ```bash
   python create_db.py
   ```

4. **Start the Backend Server:**
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - API Docs (Swagger UI): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 3. Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment (Optional):**
   ```bash
   cp .env.example .env
   ```
   *(By default, requests to `/api` are automatically proxied to `http://127.0.0.1:8000`)*

4. **Start the Frontend Dev Server:**
   ```bash
   npm run dev
   ```
   - Frontend Dashboard: [http://localhost:5173/](http://localhost:5173/)