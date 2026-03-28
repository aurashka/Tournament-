import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { Trophy, Shield, Play, User, Mail, Lock, Gamepad2 } from 'lucide-react';

export const Auth: React.FC<{ mode: 'login' | 'signup' }> = ({ mode }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ign: '',
    age: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Bootstrap first admin
        const isAdmin = formData.email === 'smartharshitmaan@gmail.com';
        
        await set(ref(db, `users/${user.uid}`), {
          uid: user.uid,
          email: formData.email,
          ign: formData.ign,
          age: parseInt(formData.age),
          role: isAdmin ? 'admin' : 'user',
          stats: { played: 0, won: 0, live: 0 },
          badges: [],
          style: { color: '#ffffff', fontSize: '16px', fontWeight: 'normal' },
        });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12">
      <div className="bg-secondary w-full max-w-md rounded-3xl border border-white/5 p-12 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
              <Gamepad2 size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">{mode === 'login' ? 'Welcome Back' : 'Join the Hub'}</h1>
          <p className="text-white/30 text-sm font-medium uppercase tracking-widest">{mode === 'login' ? 'Login to your account' : 'Create your gaming profile'}</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type="text"
                  placeholder="In-game Name"
                  required
                  value={formData.ign}
                  onChange={e => setFormData({ ...formData, ign: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-primary transition-all outline-none"
                />
              </div>
              <div className="relative">
                <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type="number"
                  placeholder="Age"
                  required
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-primary transition-all outline-none"
                />
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-primary transition-all outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-primary transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Signup'}
            {!loading && <Play size={20} />}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate(mode === 'login' ? '/signup' : '/login')}
            className="text-white/30 hover:text-primary text-xs font-bold uppercase tracking-widest transition-all"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};
