import os
import shutil

from pypdf import PdfReader
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

# ----------------------------
# Load Environment
# ----------------------------
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="IntelPlant AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Store latest uploaded PDF text
pdf_text = ""


class Question(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "Welcome to IntelPlant AI 🚀"}


@app.get("/test-ai")
def test_ai():
    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents="Say Hello from IntelPlant AI."
    )

    return {"reply": response.text}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global pdf_text

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    reader = PdfReader(file_path)
    page_count = len(reader.pages)

    pdf_text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            pdf_text += page_text + "\n"

    return {
        "status": "success",
        "filename": file.filename,
        "characters": len(pdf_text),
        "pages": page_count,
        "preview": pdf_text[:500]
    }


@app.get("/summary")
def summary():
    global pdf_text

    if pdf_text == "":
        return {"error": "Please upload a PDF first"}

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=f"""
You are IntelPlant AI.

Summarize this industrial document in simple bullet points.

Document:

{pdf_text[:6000]}
"""
        )

        return {
            "summary": response.text
        }

    except Exception as e:
        return {
            "error": str(e)
        }


@app.post("/ask")
def ask_ai(data: Question):
    global pdf_text

    if pdf_text == "":
        return {
            "error": "Please upload a PDF first."
        }

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=f"""
You are IntelPlant AI.

Industrial Document:

{pdf_text[:12000]}

User Question:

{data.question}

Answer ONLY from the document.
- Give complete and meaningful answers.
- If the answer is partially available, explain using the available information.
- Only if the answer is completely missing, reply:
"The uploaded document does not contain this information."
"""

        )
        print("Characters:", len(pdf_text))
        print("Preview:")
        print(pdf_text[:1000])

        return {
            "answer": response.text
        }

    except Exception as e:
        return {
            "error": str(e)
        }


@app.get("/models")
def models():
    model_list = client.models.list()

    return {
        "models": [m.name for m in model_list]
    }