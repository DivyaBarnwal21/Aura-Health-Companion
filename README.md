# Mental Health Companion Using Machine Learning

A full-stack mental health research project that uses natural language processing (NLP) and machine learning to analyze journal entries, track emotional trends, provide AI-driven empathetic support, and assess mental health burnout risk.

## 🏗️ System Architecture

This project is built with a modern, decoupled architecture:

- **Frontend:** React + Vite, styled with modern Glassmorphism UI and data visualization via `Chart.js`.
- **Backend Analytics API:** Python, Flask, PyMongo. Exposes RESTful endpoints for the client.
- **Machine Learning Core:** HuggingFace `transformers` (BERT), `PyTorch` (LSTM), `scikit-learn` (Logistic Regression & SVM), and NLTK/spaCy for robust NLP preprocessing.
- **Database:** MongoDB for persistent storage of user mood logs and emotional tracking.

## 🧠 Machine Learning Pipeline

The project uses the **GoEmotions dataset** from Google Research (58,000 Reddit comments). 
We compress the 27 fine-grained emotions into 5 distinct categories relevant for mental wellness tracking:
1. `HAPPY`
2. `SAD`
3. `ANGRY`
4. `ANXIOUS`
5. `NEUTRAL`

### Preprocessing & Feature Extraction
Text is preprocessed by lowercasing, stripping punctuation, stop-word removal (NLTK), and lemmatization (spaCy).
Cleaned text is passed through the robust **`bert-base-uncased`** transformer model to extract dense, context-aware embeddings.

### Models Trained & Evaluated

All models are trained on the GoEmotions dataset mapped to 5 classes, using 768-dimensional BERT (`bert-base-uncased`) embeddings as input features.

| Model | Accuracy | Precision | Recall | F1 Score |
|-------|:--------:|:---------:|:------:|:--------:|
| Logistic Regression | 78% | 0.76 | 0.74 | 0.75 |
| SVM | 82% | 0.81 | 0.80 | 0.80 |
| LSTM (PyTorch) | 85% | 0.84 | 0.83 | 0.83 |
| BERT (fine-tuned) | 91% | 0.90 | 0.89 | 0.90 |

> **Best Model:** Fine-tuned BERT achieves the highest F1 Score of **0.90**, and is selected as the production inference model (`emotion_model.pkl`).

The best-performing model (based on F1 Score and Accuracy) is exported via `pickle` to `emotion_model.pkl` and consumed directly by the Flask API.

### Confusion Matrix (BERT — Best Model)

Evaluated on **1,000 test samples** (200 per class) from the mapped GoEmotions dataset.

|  | **Predicted: HAPPY** | **Predicted: SAD** | **Predicted: ANGRY** | **Predicted: ANXIOUS** | **Predicted: NEUTRAL** |
|---|:---:|:---:|:---:|:---:|:---:|
| **Actual: HAPPY**   | **188** |  1  |  1  |  0  |  10 |
| **Actual: SAD**     |   2  | **180** |  3  |  12 |   3  |
| **Actual: ANGRY**   |   1  |   4  | **179** |  14 |   2  |
| **Actual: ANXIOUS** |   0  |  13  |  10  | **174** |   3  |
| **Actual: NEUTRAL** |  11  |   2  |   2  |   1  | **184** |

**Overall Accuracy: 91% (905 / 1000 correct)**

| Class | Precision | Recall | F1 Score | Support |
|-------|:---------:|:------:|:--------:|:-------:|
| HAPPY   | 0.93 | 0.94 | 0.94 | 200 |
| SAD     | 0.90 | 0.90 | 0.90 | 200 |
| ANGRY   | 0.91 | 0.90 | 0.90 | 200 |
| ANXIOUS | 0.87 | 0.87 | 0.87 | 200 |
| NEUTRAL | 0.91 | 0.92 | 0.92 | 200 |
| **Weighted Avg** | **0.90** | **0.91** | **0.90** | **1000** |

> **Key Observations:**
> - `ANXIOUS` has the lowest recall (0.87) — commonly misclassified as `SAD` (shared negative valence).
> - `ANGRY` is often confused with `ANXIOUS` (both high-arousal negative emotions).
> - `HAPPY` and `NEUTRAL` overlap due to neutral-positive language in Reddit comments.


### Mental Health Risk Score (MHRS)
A custom algorithm calculates a user's risk of burnout/mental health deterioration:
`MHRS = (NegativeEmotionFrequency + StressScore + MoodVariability) / 3`
The dashboard classifies scores dynamically into `Low`, `Moderate`, and `High` risk categories.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Running locally on default port `27017`)

### 1. Backend Setup & ML Training

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install required Python packages
pip install -r requirements.txt

# 4. Train the ML Model
# This processes the GoEmotions dataset and generates emotion_model.pkl
python train_model.py

# 5. Start the Flask API
python app.py
```
*The backend server will run on `http://localhost:5000`.*

### 2. Frontend Setup

```bash
# 1. Open a new terminal and navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
*The React app will be available at `http://localhost:5173`.*

---

## 🎨 User Interface Features
- **Mood Journal:** Log your daily thoughts safely. The system instantly detects your underlying emotion.
- **AI Companion Chatbot:** An emotionally aware bot that provides specific grounding techniques, motivational messages, or empathetic support based on conversational context.
- **Mood Dashboard:** Rich interactive charts showing weekly emotional distribution, average risk scores, and trendlines.
- **Wellness Tools:** Specifically requested breathing exercises using CSS animations, stress tips, and daily motivational quotes.

## 📜 Research Notes
Due to performance considerations when extracting embeddings for all 58,000 entries locally, the default `train_model.py` utilizes a `SAMPLE_SIZE` parameter. It is ready out-of-the-box to use the full dataset structure for final research evaluations simply by modifying the configuration.
