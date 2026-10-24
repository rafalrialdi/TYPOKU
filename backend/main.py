import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
from dotenv import load_dotenv
from google import genai

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("models/model_kelas_final.joblib")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class TextInput(BaseModel):
    text: str

class TypoInput(BaseModel):
    text: str

class ParafraseInput(BaseModel):
    text: str
    style: str = "akademik"

class TerjemahInput(BaseModel):
    text: str
    target_lang: str = "en"

@app.get("/")
def home():
    return {"status": "Backend API Typoku Running!"}

@app.post("/predict")
def predict(data: TextInput):
    prediction = model.predict([data.text])[0]
    return {"input_text": data.text, "prediction": str(prediction)}

# --- ENDPOINT BARU: CEK TYPO ---
@app.post("/api/cek-typo")
async def cek_typo(data: TypoInput):
    if not data.text:
        return {"status": "error", "message": "Teks tidak boleh kosong"}
    
    try:
        prompt = f"""
Analisis teks berikut untuk mencari kata-kata yang salah ketik (typo) atau tidak baku dalam bahasa Indonesia.
Teks: "{data.text}"

Kembalikan hasilnya HANYA DALAM FORMAT JSON array seperti ini tanpa teks lain di luar JSON:
[
  {{"kata_salah": "apotik", "saran_perbaikan": "apotek", "keterangan": "Tidak baku"}},
  {{"kata_salah": "analisa", "saran_perbaikan": "analisis", "keterangan": "Tidak baku"}}
]
Jika tidak ada typo sama sekali, kembalikan array kosong: []
"""
        response = await client.aio.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
        )
        
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()
        
        hasil_json = json.loads(raw_text)
        
        return {
            "status": "success",
            "original_text": data.text,
            "typo_list": hasil_json
        }
        
    except Exception as e:
        return {"status": "error", "message": f"Gagal mendeteksi typo: {str(e)}"}

# --- ENDPOINT PARAFRASE & TERJEMAHAN LAMA ---
@app.post("/api/parafrase")
async def parafrase(data: ParafraseInput):
    if not data.text:
        return {"status": "error", "message": "Teks tidak boleh kosong"}
    
    try:
        prompt = f"Parafrase teks berikut dengan gaya {data.style} agar sesuai standar naskah ilmiah/akademik. Langsung berikan hasil perbaikannya:\n\n{data.text}"
        response = await client.aio.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
        )
        return {"status": "success", "result_text": response.text}
    except Exception as e:
        return {"status": "error", "message": f"Gagal terhubung ke Gemini: {str(e)}"}

@app.post("/api/terjemah")
async def terjemah(data: TerjemahInput):
    if not data.text:
        return {"status": "error", "message": "Teks tidak boleh kosong"}
        
    try:
        bahasa_tujuan = "Bahasa Inggris" if data.target_lang == "en" else "Bahasa Indonesia"
        prompt = f"Terjemahkan teks berikut ke {bahasa_tujuan} dengan terminologi akademik yang presisi. Langsung berikan hasil terjemahannya:\n\n{data.text}"
        response = await client.aio.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
        )
        return {
            "status": "success", 
            "source_language": "id" if data.target_lang == "en" else "en",
            "target_language": data.target_lang,
            "result_text": response.text
        }
    except Exception as e:
        return {"status": "error", "message": f"Gagal terhubung ke Gemini: {str(e)}"}