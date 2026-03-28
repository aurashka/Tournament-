import React, { useState, useEffect } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { X, Play } from 'lucide-react';

export const ProfileCompletionModal: React.FC = () => {
  const { user, profile, loading } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    ign: '',
    age: '',
  });

  useEffect(() => {
    if (!loading && user && profile) {
      const isMissingData = !profile.ign || !profile.age || !profile.role;
      
      // If role is missing, we can auto-recreate it
      if (user && !profile.role) {
        const isAdmin = user.email === 'smartharshitmaan@gmail.com';
        update(ref(db, `users/${user.uid}`), { 
          role: isAdmin ? 'admin' : 'user',
          uid: user.uid,
          email: user.email
        });
      }

      if (!profile.ign || !profile.age) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [user, profile, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await update(ref(db, `users/${user.uid}`), {
      ign: formData.ign,
      age: parseInt(formData.age),
      stats: profile?.stats || { played: 0, won: 0, live: 0 },
      badges: profile?.badges || [],
      style: profile?.style || { color: '#ffffff', fontSize: '16px', fontWeight: 'normal' },
    });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
      <div className="bg-secondary w-full max-w-md rounded-3xl border border-white/10 p-12 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-primary">Complete Profile</h2>
          <p className="text-white/30 text-sm font-medium uppercase tracking-widest">Some information is missing from your profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-2">In-game Name</label>
            <input
              type="text"
              placeholder="Enter your IGN"
              required
              value={formData.ign}
              onChange={e => setFormData({ ...formData, ign: e.target.value })}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-4 focus:border-primary transition-all outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-2">Age</label>
            <input
              type="number"
              placeholder="Your Age"
              required
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-4 focus:border-primary transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-4 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
          >
            Save & Continue <Play size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
