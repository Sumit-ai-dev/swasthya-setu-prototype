import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/swasthya_setu")

def migrate():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Adding is_pregnant column to patients table...")
        try:
            conn.execute(text("ALTER TABLE patients ADD COLUMN is_pregnant BOOLEAN DEFAULT FALSE;"))
            conn.commit()
            print("Migration successful.")
        except Exception as e:
            print(f"Migration failed or already applied: {e}")

if __name__ == "__main__":
    migrate()
