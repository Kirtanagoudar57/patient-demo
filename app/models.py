# Import SQLAlchemy features for our database models
from sqlalchemy import Column, Integer, String
from app.database import Base

# ==========================================
# SQLALCHEMY DATABASE MODEL
# ==========================================

# What is a SQLAlchemy model?
# A SQLAlchemy model is a Python class that maps to a database table. It defines the structure 
# of the data as it will be stored in PostgreSQL.

# Why does PatientDB inherit from Base?
# 'Base' is a SQLAlchemy class that keeps track of all our database models. By inheriting from it,
# we tell SQLAlchemy that PatientDB is a model that should be created as a table in the database.
class PatientDB(Base):
    # What is __tablename__?
    # It tells SQLAlchemy the exact name of the table to create in PostgreSQL.
    __tablename__ = "patients"

    # What is Column?
    # Column tells SQLAlchemy that this attribute represents a column in the database table.
    
    # What is Integer? What is String?
    # These specify the data types for the columns in the database.
    
    # What is primary_key=True?
    # It marks this column as the unique identifier for each row in the table.
    
    # What is index=True?
    # It creates a database index for this column, which makes searching by this column much faster.
    id = Column(Integer, primary_key=True, index=True)
    
    # What does nullable=False mean?
    # It means this column cannot be empty. It is a required field in the database.
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    
    # Optional fields in the database (nullable=True is the default behavior if omitted)
    disease = Column(String, nullable=True)
    guardian_name = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
