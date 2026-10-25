from database import engine
from sqlalchemy import text

def check_table():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        tables = [row[0] for row in result]
        
        if "patients" in tables:
            print("✅ SUCCESS! The 'patients' table exists in PostgreSQL!")
            
            # Check the columns
            col_result = connection.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'patients'"))
            print("\nColumns in 'patients':")
            for col in col_result:
                print(f" - {col[0]}: {col[1]}")
        else:
            print("❌ The 'patients' table was not found.")

if __name__ == "__main__":
    check_table()
