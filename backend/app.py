
import jwt
import bcrypt
import pickle
import numpy as np
import torch
import spacy
import string
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from transformers import AutoTokenizer, AutoModel
import nltk
from nltk.corpus import stopwords
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow all origins for local development

# ── Config ──────────────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "aura_super_secret_jwt_key_2024")
JWT_EXP_HOURS = 48

# ── Database ─────────────────────────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    client.server_info()
    db = client.mental_db
    print(f"✅ Successfully connected to MongoDB at {MONGO_URI}")
except Exception as e:
    print("⚠️ Could not connect to MongoDB. Make sure it is running locally.")
    print(f"Error: {e}")
    db = None

# ── ML Models ────────────────────────────────────────────────────────────────
MODEL_PATH = "emotion_model.pkl"
BERT_MODEL_NAME = "bert-base-uncased"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

stop_words = set(stopwords.words('english'))
nlp = spacy.load("en_core_web_sm")
tokenizer = AutoTokenizer.from_pretrained(BERT_MODEL_NAME)
bert_model = AutoModel.from_pretrained(BERT_MODEL_NAME).to(DEVICE)
bert_model.eval()

try:
    with open(MODEL_PATH, "rb") as f:
        model_data = pickle.load(f)
    print("✅ Successfully loaded emotion classification model.")
except Exception as e:
    print(f"⚠️ Could not load emotion model at {MODEL_PATH}. Run train_model.py first.")
    model_data = None


# ── Helpers ──────────────────────────────────────────────────────────────────
def preprocess_text(text):
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    doc = nlp(text)
    tokens = [token.lemma_ for token in doc if str(token) not in stop_words]
    return " ".join(tokens)

def get_bert_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128, padding=True).to(DEVICE)
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.pooler_output.cpu().numpy()

def predict_emotion(text):
    if not model_data:
        words = text.lower().split()
        if any(w in words for w in ['sad', 'depressed', 'cry', 'crying']): return "SAD"
        if any(w in words for w in ['angry', 'mad', 'furious', 'angry']): return "ANGRY"
        if any(w in words for w in ['anxious', 'nervous', 'scared', 'worry', 'anxiety']): return "ANXIOUS"
        if any(w in words for w in ['happy', 'great', 'good', 'joy', 'excited']): return "HAPPY"
        return "NEUTRAL"
    processed = preprocess_text(text)
    embedding = get_bert_embedding(processed)
    ml_model = model_data["model"]
    pred_idx = ml_model.predict(embedding)[0]
    return model_data["id_to_emotion"][pred_idx]

def get_sentiment(emotion):
    return {"HAPPY": "positive", "NEUTRAL": "neutral"}.get(emotion, "negative")

def calculate_mhrs(user_id, current_emotion):
    if db is None:
        return 0.5
    last_week = datetime.utcnow() - timedelta(days=7)
    logs = list(db.mood_logs.find({"user_id": user_id, "timestamp": {"$gte": last_week}}))
    if not logs:
        return 0.7 if current_emotion in ["SAD", "ANXIOUS", "ANGRY"] else 0.2
    neg = sum(1 for l in logs if l.get("emotion") in ["SAD", "ANXIOUS", "ANGRY"])
    cur_neg = 1 if current_emotion in ["SAD", "ANXIOUS", "ANGRY"] else 0
    neg_freq = (neg + cur_neg) / (len(logs) + 1)
    stress = {"positive": 0.0, "neutral": 0.3, "negative": 0.8}.get(get_sentiment(current_emotion), 0.5)
    switches = sum(1 for i in range(1, len(logs)) if logs[i]["emotion"] != logs[i-1]["emotion"])
    variability = switches / (len(logs) + 1)
    return round(min((neg_freq + stress + variability) / 3, 1.0), 2)


# ── JWT Auth Middleware ───────────────────────────────────────────────────────
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user_id = data["user_id"]
            request.username = data["username"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired, please login again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


# ── Auth Endpoints ────────────────────────────────────────────────────────────
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password are required"}), 400

    if db is None:
        return jsonify({"error": "Database not connected"}), 500

    username = data['username'].strip().lower()
    email = data.get('email', '').strip().lower()

    if db.users.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 409

    if email and db.users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt(rounds=8))

    user = {
        "username": username,
        "email": email,
        "password": hashed_pw,
        "created_at": datetime.utcnow(),
        "full_name": data.get('full_name', username)
    }
    result = db.users.insert_one(user)
    user_id = str(result.inserted_id)

    token = jwt.encode(
        {"user_id": user_id, "username": username, "exp": datetime.utcnow() + timedelta(hours=JWT_EXP_HOURS)},
        JWT_SECRET, algorithm="HS256"
    )

    return jsonify({
        "message": "Account created successfully!",
        "token": token,
        "user": {"id": user_id, "username": username, "full_name": user["full_name"]}
    }), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password are required"}), 400

    if db is None:
        return jsonify({"error": "Database not connected"}), 500

    username = data['username'].strip().lower()
    user = db.users.find_one({"username": username})

    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        return jsonify({"error": "Invalid username or password"}), 401

    user_id = str(user['_id'])
    token = jwt.encode(
        {"user_id": user_id, "username": username, "exp": datetime.utcnow() + timedelta(hours=JWT_EXP_HOURS)},
        JWT_SECRET, algorithm="HS256"
    )

    return jsonify({
        "message": "Login successful!",
        "token": token,
        "user": {"id": user_id, "username": username, "full_name": user.get("full_name", username)}
    })


@app.route('/me', methods=['GET'])
@token_required
def get_profile():
    from bson import ObjectId
    user = db.users.find_one({"_id": ObjectId(request.user_id)}, {"password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["_id"] = str(user["_id"])
    return jsonify({"user": user})


# ── Core Endpoints (Protected) ────────────────────────────────────────────────
@app.route('/analyze', methods=['POST'])
@token_required
def analyze():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    text = data['text']
    emotion = predict_emotion(text)
    sentiment = get_sentiment(emotion)
    risk_score = calculate_mhrs(request.user_id, emotion)
    return jsonify({"emotion": emotion, "sentiment": sentiment, "risk_score": risk_score})


@app.route('/chat', methods=['POST'])
@token_required
def chat():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    text = data['text']
    emotion = data.get('emotion') or predict_emotion(text)

    responses = {
        "SAD": "I'm sorry you're feeling this way. Sometimes journaling or taking a short break can help. Remember I'm here to listen. 💙",
        "ANXIOUS": "It sounds like you're feeling overwhelmed. Try the 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. You've got this! 🌿",
        "ANGRY": "I understand you're frustrated. Stepping away for a moment or practising deep calming breaths can really help. 🫁",
        "HAPPY": "That's wonderful to hear! Hold onto this positive energy and appreciate what's making you feel good today. 🌟",
        "NEUTRAL": "Thank you for sharing. How else can I support your wellness today? 🤝"
    }

    # Save to chat_history
    if db is not None:
        db.chat_history.insert_one({
            "user_id": request.user_id,
            "username": request.username,
            "user_message": text,
            "bot_response": responses.get(emotion, responses["NEUTRAL"]),
            "emotion": emotion,
            "timestamp": datetime.utcnow()
        })

    return jsonify({"response": responses.get(emotion, responses["NEUTRAL"]), "diagnosed_emotion": emotion})


@app.route('/log_mood', methods=['POST'])
@token_required
def log_mood():
    data = request.json
    if not data or 'text' not in data or 'emotion' not in data:
        return jsonify({"error": "Missing required fields"}), 400
    if db is None:
        return jsonify({"error": "Database not connected"}), 500

    log_entry = {
        "user_id": request.user_id,
        "username": request.username,
        "text": data['text'],
        "emotion": data['emotion'],
        "risk_score": data.get('risk_score', 0),
        "timestamp": datetime.utcnow()
    }
    db.mood_logs.insert_one(log_entry)
    return jsonify({"message": "Mood logged successfully"})


@app.route('/mood_trends', methods=['GET'])
@token_required
def mood_trends():
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
    days = int(request.args.get('days', 7))
    time_limit = datetime.utcnow() - timedelta(days=days)
    logs = list(db.mood_logs.find(
        {"user_id": request.user_id, "timestamp": {"$gte": time_limit}},
        {"_id": 0}
    ).sort("timestamp", 1))
    return jsonify({"logs": logs})


@app.route('/chat_history', methods=['GET'])
@token_required
def get_chat_history():
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
    limit = int(request.args.get('limit', 50))
    history = list(db.chat_history.find(
        {"user_id": request.user_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit))
    history.reverse()
    return jsonify({"history": history})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
