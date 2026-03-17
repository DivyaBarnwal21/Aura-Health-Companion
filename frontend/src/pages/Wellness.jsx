import { useState, useEffect } from 'react';
import { Wind, Quote, Coffee } from 'lucide-react';

export default function Wellness() {
  const [inhale, setInhale] = useState(true);

  useEffect(() => {
    // 4 seconds inhale, 6 seconds exhale basic breathing
    const interval = setInterval(() => {
      setInhale(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const quotes = [
    "Your present circumstances don't determine where you can go; they merely determine where you start.",
    "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
    "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared and anxious. Having feelings doesn't make you a negative person. It makes you human.",
    "What mental health needs is more sunlight, more candor, and more unashamed conversation."
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <h1 className="text-3xl font-bold mb-6 text-center" style={{ marginBottom: '2rem' }}>Wellness Tools</h1>
      
      <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
        
        {/* Breathing Exercise */}
        <div className="glass-panel" style={{ flex: 1, padding: '3rem', minWidth: '300px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Wind size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>Guided Breathing</h3>
          <p>Follow the circle to regulate your nervous system.</p>
          
          <div style={{ 
            marginTop: '2rem',
            width: '200px', 
            height: '200px', 
            borderRadius: '50%', 
            background: 'rgba(99, 102, 241, 0.1)',
            border: '2px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 5s ease-in-out',
            transform: inhale ? 'scale(1.2)' : 'scale(0.8)',
            boxShadow: inhale ? '0 0 40px rgba(99, 102, 241, 0.4)' : 'none'
          }}>
            <h2 style={{ margin: 0, transition: 'opacity 1s', color: 'var(--primary)' }}>{inhale ? 'Inhale...' : 'Exhale...'}</h2>
          </div>
        </div>

        <div className="flex flex-col gap-6" style={{ flex: 1, minWidth: '300px' }}>
          {/* Motivation Quote */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
             <Quote size={30} color="var(--success)" style={{ marginBottom: '1rem' }} />
             <h3>Daily Motivation</h3>
             <blockquote style={{ fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--text-muted)', borderLeft: '4px solid var(--success)', paddingLeft: '1rem', marginTop: '1rem' }}>
               "{randomQuote}"
             </blockquote>
          </div>

          {/* Stress Management Tips */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
             <Coffee size={30} color="var(--warning)" style={{ marginBottom: '1rem' }} />
             <h3>Stress Management Tips</h3>
             <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
               <li style={{ marginBottom: '0.5rem' }}>Practice the 5-4-3-2-1 grounding technique when anxious.</li>
               <li style={{ marginBottom: '0.5rem' }}>Step away from screens for 5 minutes every hour.</li>
               <li style={{ marginBottom: '0.5rem' }}>Try writing your thoughts down in our Journal to externalize them.</li>
               <li style={{ marginBottom: '0.5rem' }}>Stay hydrated: drink at least 8 glasses of water a day.</li>
             </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
}
