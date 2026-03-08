"""
Medical Data Seeding Script
============================
Seeds the pgvector database with sample medical guidelines.

Follows the RAG ingestion pipeline:
  1. Load raw medical text data
  2. Chunk text using RecursiveCharacterTextSplitter (size=700, overlap=100)
  3. Generate embeddings via configured provider (local HuggingFace or Bedrock)
  4. Insert into PGVector

Usage:
  PYTHONPATH=. python app/scripts/seed_medical_data.py
"""

import logging
import hashlib
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.services.rag_service import vector_store, search_patient_query, build_medical_assistant_prompt
from app.scripts.init_db import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Sample Medical Guidelines (simulating WHO / IMNCI / Ayushman Bharat data)
# In production, these would be loaded from PDFs, APIs, or file storage.
# ---------------------------------------------------------------------------
SAMPLE_MEDICAL_TEXTS = [
    {
        "source": "WHO Fever Management Guidelines 2023",
        "content": (
            "Fever is defined as a body temperature above 38°C (100.4°F). "
            "For general fever management, use paracetamol or acetaminophen. "
            "Do not use aspirin for children due to the risk of Reye's syndrome. "
            "Keep the patient hydrated with Oral Rehydration Salts (ORS) or clean drinking water. "
            "If a fever exceeds 39°C (102.2°F) or lasts for more than 3 days, seek immediate medical attention. "
            "Monitor the patient for danger signs such as difficulty breathing, persistent vomiting, and lethargy. "
            "For fever with rash, consider measles or dengue and refer to a higher facility."
        ),
    },
    {
        "source": "IMNCI Protocol India - Diarrhea Treatment",
        "content": (
            "Diarrhea is the passage of 3 or more loose or liquid stools per day. "
            "The primary treatment for diarrhea is rehydration using ORS (Oral Rehydration Solution). "
            "Prepare ORS by dissolving one packet in 1 litre of clean water. "
            "For children under 5 years, provide Zinc supplementation (10-20 mg/day) for 10-14 days "
            "to reduce duration and severity. "
            "Continue breastfeeding during diarrhea episodes. "
            "Refer immediately to a hospital if there is blood in the stool, "
            "signs of severe dehydration (sunken eyes, lethargy, unable to drink), "
            "or if diarrhea persists for more than 14 days."
        ),
    },
    {
        "source": "Ayushman Bharat PM-JAY Child Health Guidelines",
        "content": (
            "For infants under 2 months of age, any sign of illness should be taken seriously. "
            "Danger signs include poor feeding, convulsions (seizures), fast breathing (60 breaths/min or more), "
            "severe chest indrawing, or a very high (above 37.5°C) or very low body temperature (below 35.5°C). "
            "If any danger signs are present, refer the infant immediately to a secondary or tertiary care hospital. "
            "Do not attempt home treatment for infants showing danger signs."
        ),
    },
    {
        "source": "WHO Cough and Cold Management 2023",
        "content": (
            "Most coughs and colds are caused by viruses and do not require antibiotics. "
            "Recommend rest, adequate fluid intake, and warm beverages for sore throat relief. "
            "Honey can be given to children above 1 year for cough relief — do NOT give honey to infants under 1 year. "
            "If cough persists for more than 2 weeks, or is accompanied by high fever, blood in sputum, "
            "or difficulty breathing, refer to a healthcare facility for TB screening. "
            "Pneumonia signs include fast breathing, chest indrawing, and stridor; refer immediately."
        ),
    },
    {
        "source": "ASHA Worker Handbook - Maternal Health",
        "content": (
            "All pregnant women should attend at least 4 antenatal check-ups during pregnancy. "
            "Danger signs during pregnancy include severe headache, blurred vision, convulsions, "
            "vaginal bleeding, severe abdominal pain, and reduced foetal movement. "
            "If any danger sign is observed, refer the mother immediately to a hospital. "
            "Iron and folic acid supplementation should continue throughout pregnancy (100mg iron + 500mcg folic acid daily). "
            "Ensure institutional delivery at a government facility under Janani Suraksha Yojana (JSY) scheme."
        ),
    },
    {
        "source": "National Health Mission - Nutrition Guidelines",
        "content": (
            "During fever, the body needs extra energy and fluids. "
            "Eat light, easily digestible foods like khichdi, dal rice, banana, and curd. "
            "Avoid oily, spicy, and heavy foods during illness. "
            "For children with fever, continue breastfeeding and offer small, frequent meals. "
            "ORS and clean drinking water should be given regularly to prevent dehydration. "
            "Once fever subsides, gradually return to a normal diet with extra portions to recover lost nutrition."
        ),
    },
    {
        "source": "WHO & NHM - Hypertension Diet Guidelines 2024",
        "content": (
            "Hypertension (High Blood Pressure) management requires significant dietary changes. "
            "The primary recommendation is reducing salt (sodium) intake to less than 5g per day. "
            "Follow the DASH diet: increase intake of fruits, vegetables, and whole grains. "
            "Increase potassium-rich foods (bananas, potatoes, spinach) to help lower blood pressure. "
            "Limit saturated fats and eliminate trans fats found in processed and fried foods. "
            "Maintain a healthy weight and limit alcohol consumption to 1-2 drinks per day. "
            "For severe hypertension, consult a doctor for medication alongside dietary changes."
        ),
    },
    {
        "source": "WHO & IMAI Clinical Emergency Standards 2024",
        "content": (
            "Clinical Emergency Signs (RED TRIAGE) requiring immediate hospital referral: "
            "Chest pain (suspected heart attack or cardiac event), severe difficulty breathing or gasping, "
            "unconsciousness or inability to wake up, sudden weakness on one side of the body (stroke sign), "
            "severe profuse bleeding that won't stop, and ingestion of poison or toxic substances. "
            "For chest pain: Keep the patient calm, do not allow physical exertion, and transport to a facility with ECG capability. "
            "Any patient with airway, breathing, or circulation (ABC) compromise must be treated as an absolute emergency."
        ),
    },
]


def seed_database():
    """Seeds the pgvector database with chunked medical guideline documents."""
    logger.info("Starting database seeding process...")

    # 1. Ensure DB tables and pgvector extension exist
    init_db()

    # 2. Setup Chunking Strategy (Optimized for medical structured paragraphs)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=100,
        length_function=len,
        is_separator_regex=False,
    )

    # 3. Process and chunk medical texts
    documents_to_add = []
    chunk_ids = []
    
    for doc in SAMPLE_MEDICAL_TEXTS:
        chunks = text_splitter.split_text(doc["content"])
        for i, chunk in enumerate(chunks):
            chunk_content = chunk.strip()
            # Deterministic ID for deduplication: hash(source + chunk_content)
            unique_id = hashlib.sha256(f'{doc["source"]}_{chunk_content}'.encode()).hexdigest()
            
            documents_to_add.append(
                Document(
                    page_content=chunk_content,
                    metadata={
                        "source": doc["source"],
                        "document_type": "guideline",
                        "section": f"part_{i+1}",
                        "chunk_index": i
                    },
                )
            )
            chunk_ids.append(unique_id)

    # 4. Insert into PGVector with Deduplication IDs
    if documents_to_add:
        logger.info(f"Adding {len(documents_to_add)} chunks to PGVector...")
        # Add indexing (HNSW) before inserting to speed up searches. PGVector driver creates this if it doesn't exist
        try:
            vector_store.create_hnsw_index(
                max_elements=10000, 
                ef_construction=64, 
                m=16
            )
            logger.info("Ensured HNSW index exists on vector store.")
        except Exception as e:
            logger.info("HNSW index might already exist or driver auto-manages it.")
            
        vector_store.add_documents(documents=documents_to_add, ids=chunk_ids)
        logger.info("✅ Successfully seeded database with medical rules (deduplicated).")

        # Hallucination safety test
        queries = [
            "I have fever and body ache",
            "What food should I eat during fever?",
            "Is paracetamol safe for a 1-month old infant?",
            "What medicine cures cancer instantly?"  # Hallucination test
        ]
        
        for q in queries:
            print(f"\n=== Test: {q} ===")
            context, sources = search_patient_query(q, top_k=3, threshold=0.15)
            print(f"Sources: {sources}")
            
            # Test Prompt Guardrails directly
            prompt = build_medical_assistant_prompt(message=q, context=context, history=[], language="en")
            print("\n--- Prompt Setup Output ---")
            if "No relevant medical guidelines were found" in context:
                print("GUARDRAIL TRIGGERED: Context is empty, will fallback safely.")
            else:
                print(f"CONTEXT LOADED: {len(context)} chars")
    else:
        logger.warning("No documents to add.")


if __name__ == "__main__":
    seed_database()
