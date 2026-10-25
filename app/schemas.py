# Import Pydantic features
# Why we use Pydantic: 
# Pydantic is used for data validation and parsing. It ensures that the incoming data 
# matches the required types and constraints, catching errors early and making our API robust.
from pydantic import BaseModel, Field, field_validator, model_validator, computed_field
from typing import Optional, Literal

# ==========================================
# PYDANTIC SCHEMAS (For Request/Response Validation)
# ==========================================

# Why do we have both a Pydantic model and a SQLAlchemy model?
# - Pydantic models are used for validating data coming in and out of our API (JSON).
# - SQLAlchemy models are used for interacting with the database (SQL).
# They serve different purposes, so we keep them separate.

# This is a nested model. It will be used inside the PatientSchema model.
class Address(BaseModel):
    city: str
    state: str

# This is our main Pydantic schema representing a Patient for API requests
# We renamed it to PatientSchema to avoid confusion with the PatientDB model.
class PatientSchema(BaseModel):
    # Each field has a type hint, which Pydantic uses for validation
    id: int
    # Field() is used to add constraints directly to a field (e.g., min length, range)
    name: str = Field(..., min_length=2, max_length=50, description="Name must be 2-50 characters")
    age: int = Field(..., gt=0, le=120, description="Age must be between 1 and 120")
    
    # Literal enforces that only specific string values are accepted
    gender: Literal["Male", "Female", "Other"] = Field(..., description="Gender must be Male, Female, or Other")
    
    # Optional fields (can be omitted or set to None)
    disease: Optional[str] = None
    guardian_name: Optional[str] = None
    
    # Nested model usage
    address: Address

    # field_validator is a decorator used to validate a specific field with custom logic
    @field_validator('name')
    @classmethod
    def validate_name(cls, value: str):
        # Remove unnecessary surrounding spaces
        cleaned_value = value.strip()
        
        # Reject an empty name after stripping spaces
        if not cleaned_value:
            raise ValueError('Name cannot be empty or just spaces')
            
        # Reject names that are too short
        if len(cleaned_value) < 2:
            raise ValueError('Name is too short')
            
        return cleaned_value

    # model_validator is used to validate the entire model, 
    # checking relationships between multiple fields
    @model_validator(mode='after')
    def check_guardian_for_minors(self):
        # Validation: If age is less than 18, guardian_name is required
        if self.age < 18 and not self.guardian_name:
            raise ValueError('Guardian required for minors.')
        return self

    # computed_field is a decorator used to create a read-only field 
    # whose value is calculated dynamically based on other fields.
    @computed_field
    def patient_type(self) -> str:
        # If age >= 18 return "Adult", otherwise return "Minor"
        if self.age >= 18:
            return 'Adult'
        else:
            return 'Minor'

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
