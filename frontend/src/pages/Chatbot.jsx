import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI companion. How are you feeling today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = 'http://localhost:5000';
  const { token } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { text: userMessage.text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const botMessage = { text: res.data.response, sender: 'bot', emotion: res.data.diagnosed_emotion };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error", err);
      setMessages(prev => [...prev, { text: "I'm having trouble connecting right now. Please try again later.", sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion) => {
    if (!emotion) return 'var(--primary)';
    const colors = {
      HAPPY: 'var(--emotion-happy)',
      SAD: 'var(--emotion-sad)',
      ANGRY: 'var(--emotion-angry)',
      ANXIOUS: 'var(--emotion-anxious)',
      NEUTRAL: 'var(--emotion-neutral)',
    };
    return colors[emotion] || 'var(--primary)';
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '1rem', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>AI Companion</h1>
        <p>A safe space to share your thoughts.</p>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Chat window */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex gap-3" style={{ maxWidth: '80%', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: msg.sender === 'user' ? 'var(--surface-hover)' : 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {msg.sender === 'user' ? <User size={20} color="var(--text)" /> : <Bot size={20} color={getEmotionColor(msg.emotion)} />}
                </div>
                <div style={{ 
                  padding: '1rem 1.25rem', 
                  borderRadius: '1rem', 
                  background: msg.sender === 'user' ? 'var(--primary-dark)' : 'rgba(30, 41, 59, 0.8)',
                  border: msg.sender === 'bot' ? `1px solid ${getEmotionColor(msg.emotion)}33` : 'none',
                  borderTopRightRadius: msg.sender === 'user' ? '0.2rem' : '1rem',
                  borderTopLeftRadius: msg.sender === 'bot' ? '0.2rem' : '1rem',
                }}>
                  <p style={{ margin: 0, color: 'white', lineHeight: '1.6' }}>{msg.text}</p>
                  {msg.emotion && msg.emotion !== 'NEUTRAL' && (
                    <span style={{ fontSize: '0.75rem', color: getEmotionColor(msg.emotion), marginTop: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      DETECTED: {msg.emotion}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} color="var(--primary)" />
                </div>
                <div style={{ padding: '1rem 1.25rem', borderRadius: '1rem', background: 'rgba(30, 41, 59, 0.8)', borderTopLeftRadius: '0.2rem' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>Thinking...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.5)' }}>
          <form onSubmit={sendMessage} className="flex gap-2">
            <input 
              type="text" 
              className="input" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              style={{ flex: 1, padding: '1rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }} disabled={!input.trim() || loading}>
              <Send size={20} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
