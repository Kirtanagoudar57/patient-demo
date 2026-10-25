from fastapi import FastAPI
from app.database import engine
from app.models import Base
from app.routers import patients, auth

# ==========================================
# DATABASE CREATION
# ==========================================
# What does this line do?
# Base.metadata.create_all(bind=engine) looks at all the classes that inherit from 'Base' 
# (like our PatientDB model) and creates the corresponding tables in the PostgreSQL database.
# The 'bind=engine' tells it to use our specific database connection to do this.
# If the table already exists, it won't overwrite or delete it.
Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include our separated router for patients
app.include_router(auth.router)
app.include_router(patients.router)

if __name__ == "__main__":
    import uvicorn
    # Start the application server on port 8000
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
