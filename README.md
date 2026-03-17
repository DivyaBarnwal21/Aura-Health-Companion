# 🧠 Aura - Your AI Mental Health Companion

Aura is a full-stack mental health research and wellness application that leverages Natural Language Processing (NLP) and Machine Learning to provide emotional insights, empathetic support, and personalized wellness tools.

---

## 🚀 Key Features

- **🎭 Intelligent Mood Journal:** Log your daily thoughts and receive instant emotional analysis (Happy, Sad, Angry, Anxious, Neutral) using a fine-tuned BERT model.
- **🤖 Empathetic AI Chatbot:** An emotionally aware companion that provides grounding techniques, motivational support, and a safe space to talk.
- **📊 Wellness Dashboard:** Visualize your emotional trends with interactive charts (Chart.js), track your Mental Health Risk Score (MHRS), and monitor progress over time.
- **🌿 Wellness Toolset:** Access curated breathing exercises, stress management tips, and daily motivational quotes designed to improve mental well-being.
- **🔒 Secure & Private:** Local data persistence with MongoDB and secure user authentication via JWT.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** CSS3 (Modern Glassmorphism UI)
- **Visualization:** Chart.js & React-Chartjs-2
- **Icons:** Lucide-React

### Backend
- **Framework:** Flask (Python)
- **Database:** MongoDB (via PyMongo)
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt
- **Environment:** Python-dotenv

### Machine Learning
- **Model:** BERT (`bert-base-uncased`) fine-tuned on the GoEmotions dataset.
- **Libraries:** Transformers (HuggingFace), PyTorch, Scikit-learn, NLTK, SpaCy.

---

## 📂 Project Structure

```text
mental-health-companion/
├── frontend/                # React Vite Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page views (Journal, Chatbot, Dashboard, etc.)
│   │   ├── context/         # Auth and Global State
│   │   └── services/        # API communication
├── backend/                 # Flask API Server
│   ├── app.py               # Main application entry point
│   ├── train_model.py       # ML Pipeline and Model training
│   ├── emotion_model.pkl    # Trained inference model
│   └── .env                 # Environment variables (Local only)
└── README.md                # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: v18 or higher
- **Python**: v3.10 or higher
- **MongoDB**: Running locally on port `27017`

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (Create a `.env` file):
   ```env
   JWT_SECRET=your_secret_key
   MONGO_URI=mongodb://localhost:27017
   PORT=5000
   ```
5. Start the server:
   ```bash
   python app.py
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🧠 Machine Learning Insight

Aura uses the **GoEmotions** dataset, compressing 27 fine-grained emotions into 5 core mental health categories. Our production model (BERT) achieves a **91% accuracy** and a **0.90 F1-score**, ensuring highly reliable emotional detection for your journal entries.

### Mental Health Risk Score (MHRS)
Our custom algorithm calculates risk based on:
- **Negative Emotion Frequency**: Prevalence of Sad/Anxious/Angry moods.
- **Mood Variability**: Fluctuations in emotional state over the last 7 days.
- **Contextual Stress**: AI-detected stress levels in current communications.

---

## 📸 Screenshots

![Aura Home Page](https://raw.githubusercontent.com/DivyaBarnwal21/Aura-Health-Companion/master/.github/screenshots/home.png)
*(Note: Replace with actual hosted paths if available)*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License.
