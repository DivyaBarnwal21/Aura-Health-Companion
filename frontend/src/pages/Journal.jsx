import { useState } from 'react';
import axios from 'axios';
import { Send, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000';

export default function Journal() {
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const analyzeMood = async () => {
    if (!entry.trim()) return;
    setLoading(true);
    setResult(null);
    setSaved(false);
    setError('');

    try {
      // Step 1: Analyze emotion via ML backend
      const analyzeRes = await axios.post(`${API_URL}/analyze`, { text: entry }, authHeaders);
      setResult(analyzeRes.data);

      // Step 2: Log mood to this user's MongoDB record
      await axios.post(`${API_URL}/log_mood`, {
        text: entry,
        emotion: analyzeRes.data.emotion,
        risk_score: analyzeRes.data.risk_score,
      }, authHeaders);
      setSaved(true);
    } catch (err) {
      console.error("Error analyzing mood:", err);
      setError(err.response?.data?.error || 'Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      HAPPY: 'var(--emotion-happy)',
      SAD: 'var(--emotion-sad)',
      ANGRY: 'var(--emotion-angry)',
      ANXIOUS: 'var(--emotion-anxious)',
      NEUTRAL: 'var(--emotion-neutral)',
    };
    return colors[emotion] || 'var(--emotion-neutral)';
  };

  const riskColor = result?.risk_score > 0.6
    ? 'var(--danger)'
    : result?.risk_score > 0.3
    ? 'var(--warning)'
    : 'var(--success)';

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <h1 className="text-3xl font-bold mb-6 text-center">Mood Journal</h1>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>How are you feeling right now?</h3>
        <textarea
          className="input"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="I feel overwhelmed with work today... or I had a great conversation with a friend..."
          style={{ minHeight: '150px', marginBottom: '1.5rem', fontSize: '1.1rem' }}
        />
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem',
            color: '#fca5a5', fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        <div className="flex justify-between items-center">
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Powered by GoEmotions ML Model</p>
          <button
            className="btn btn-primary"
            onClick={analyzeMood}
            disabled={loading || !entry.trim()}
          >
            {loading ? 'Analyzing...' : <> Analyze & Save <Send size={18} /></>}
          </button>
        </div>
      </div>

      {result && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', borderTop: `4px solid ${getEmotionColor(result.emotion)}` }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} color={getEmotionColor(result.emotion)} /> Analysis Complete
          </h2>

          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
              <p className="text-muted" style={{ marginBottom: '0.5rem' }}>Primary Emotion Detected</p>
              <h1 style={{ margin: 0, color: getEmotionColor(result.emotion) }}>{result.emotion}</h1>
              <p style={{ marginTop: '0.5rem', margin: 0, textTransform: 'capitalize' }}>
                Sentiment: {result.sentiment}
              </p>
            </div>

            <div style={{ flex: 1, padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                <p className="text-muted" style={{ margin: 0 }}>Mental Health Risk Score</p>
                <AlertCircle size={16} color="var(--text-muted)" />
              </div>
              <div className="flex items-end gap-2">
                <h1 style={{ margin: 0, color: riskColor }}>{(result.risk_score * 100).toFixed(0)}</h1>
                <span style={{ fontSize: '1.5rem', paddingBottom: '4px', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', marginTop: '1rem', overflow: 'hidden' }}>
                <div style={{ width: `${result.risk_score * 100}%`, height: '100%', background: riskColor, transition: 'width 1s ease' }} />
              </div>
              <p style={{ marginTop: '0.75rem', margin: 0, fontSize: '0.9rem' }}>
                {result.risk_score > 0.6
                  ? '⚠️ High Risk — We recommend our Wellness exercises.'
                  : result.risk_score > 0.3
                  ? '🔶 Moderate Risk — Keep monitoring your mood.'
                  : '✅ Low Risk — You are doing great!'}
              </p>
            </div>
          </div>

          {saved && (
            <div className="flex items-center gap-2" style={{ marginTop: '1.5rem', color: 'var(--success)' }}>
              <CheckCircle size={20} />
              <span>Entry securely saved to your personal history.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
