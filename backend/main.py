from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

app = FastAPI()

# Mengizinkan akses dari Frontend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Muat model dan vectorizer (sesuaikan nama file jika berbeda)
model = joblib.load("models/model_kelas_final.joblib")
# Jika ada vectorizer terpisah, muat di sini:
# vectorizer = joblib.load("models/tfidf_vectorizer.joblib")

class TextInput(BaseModel):
    text: str

@app.get("/")
def home():
    return {"status": "Backend API Typoku Running!"}

@app.post("/predict")
def predict(data: TextInput):
    # Proses prediksi
    # Jika model sudah berupa Pipeline (TF-IDF + SVM):
    prediction = model.predict([data.text])[0]
    
    # Jika vectorizer terpisah, gunakan:
    # text_vec = vectorizer.transform([data.text])
    # prediction = model.predict(text_vec)[0]
    
    return {"input_text": data.text, "prediction": str(prediction)}