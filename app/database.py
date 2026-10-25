import os
from dotenv import load_dotenv
# Import create_engine to establish a connection to the database
from sqlalchemy import create_engine
# Import sessionmaker to create a factory for database sessions, and declarative_base to create a base class for models
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from .env file
load_dotenv()

# 1. Database Connection Configuration
# We read our database credentials from environment variables to keep sensitive data secure.
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "patient_db")

# This is the connection string that tells our app how to connect to the database.
# Can also be set directly via DATABASE_URL if preferred.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# 2. What is SQLAlchemy?
# SQLAlchemy is an ORM (Object-Relational Mapper) for Python.
# It lets us interact with our SQL database using Python code and objects instead of writing raw SQL queries.

# 3. What is an Engine?
# The Engine is the starting point for any SQLAlchemy application.
# It acts as a "control center" that manages the actual connection to the database.
# We create the engine using our database URL.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 4. What is SessionLocal?
# A "Session" is like a temporary workspace where we load, save, and update database records.
# "SessionLocal" is a factory that creates new, independent database sessions for each request.
# We set autocommit=False and autoflush=False so we have manual control over saving changes.
# The session is bound to our engine so it knows how to talk to the database.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. What is declarative_base()?
# declarative_base() creates a foundational (base) class for all our database models.
# Later, when we create Python classes to represent our database tables (like a Patient table),
# they will inherit from this Base class so SQLAlchemy knows how to map them to the database.
Base = declarative_base()

# ==========================================
# DATABASE DEPENDENCY
# ==========================================
# What is get_db()?
# This function is a dependency that creates a new database session for each request,
# and automatically closes it when the request is finished.
def get_db():
    db = SessionLocal()
    try:
        yield db # This gives the session to our endpoint
    finally:
        db.close() # This ensures the connection is closed even if an error happens

# 6. Why is database.py separated from the API routes?
# We separate database.py from main.py to keep our code organized and clean (Separation of Concerns).
# main.py should only handle our API routes (the "endpoints"), while database.py handles the connection setup.
# This makes our project easier to maintain and read as it grows!

# A small function to test the database connection
def test_connection():
    try:
        # Attempt to connect to the database using the engine
        connection = engine.connect()
        # If successful, print a success message
        print("✅ Connected to PostgreSQL successfully!")
        # Close the connection after testing
        connection.close()
    except Exception as e:
        # If there is an error, print a failure message along with the error
        print("❌ Connection failed:", e)

# This block ensures that test_connection() only runs if we execute this file directly
if __name__ == "__main__":
    test_connection()
