import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Activity, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', padding: '4rem 0', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #6366f1, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Your AI Mental Health Companion
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '3rem' }}>
          Discover emotional clarity with machine learning. Track your moods, chat with an empathetic AI assistant, and visualize your mental health journey.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/journal" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '1.1rem' }}>
            Start Journaling <ArrowRight size={20} />
          </Link>
          <Link to="/chatbot" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: '1.1rem' }}>
            Talk to AI
          </Link>
        </div>
      </div>

      <div className="flex gap-6 justify-center" style={{ marginTop: '4rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ padding: '2rem', flex: '1', minWidth: '300px' }}>
          <Brain size={40} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h3>Emotion Detection</h3>
          <p>Powered by BERT embeddings and Scikit-learn, our system understands your nuanced emotions with high accuracy from your journal entries.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', flex: '1', minWidth: '300px' }}>
          <Activity size={40} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
          <h3>Risk Assessment</h3>
          <p>We analyze semantic intensity and mood variability to calculate a personalized Mental Health Risk Score to keep you aware of burnout.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', flex: '1', minWidth: '300px' }}>
          <ShieldCheck size={40} color="var(--warning)" style={{ marginBottom: '1.5rem' }} />
          <h3>Private & Secure</h3>
          <p>Your entries are stored securely using MongoDB and processed directly by our secure Flask backend API.</p>
        </div>
      </div>
    </div>
  );
}
