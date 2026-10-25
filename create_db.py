import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

load_dotenv()

def create_database():
    try:
        db_user = os.getenv("DB_USER", "postgres")
        db_password = os.getenv("DB_PASSWORD", "")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME", "patient_db")

        # Connect to the default 'postgres' database to create a new one
        conn = psycopg2.connect(
            dbname="postgres",
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        # We need autocommit to be True because CREATE DATABASE cannot run inside a transaction block
        conn.autocommit = True
        
        cursor = conn.cursor()
        
        # Check if the database already exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (db_name,))
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(db_name)))
            print(f"✅ Database '{db_name}' created successfully!")
        else:
            print(f"Database '{db_name}' already exists.")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Failed to create database: {e}")

if __name__ == "__main__":
    create_database()
