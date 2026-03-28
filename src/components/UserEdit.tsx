import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Palette, Badge as BadgeIcon, ArrowLeft, Save, Shield, Ban, UserCheck, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../lib/utils';
import { motion } from 'motion/react';

export const UserEdit: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { badges, isAdmin } = useFirebase();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const userRef = ref(db, `users/${uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      setUser(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid, isAdmin, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      try {
        const url = await uploadImage(file);
        setUser({ ...user, nameImage: url });
      } catch (err) {
        alert('Upload failed');
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await update(ref(db, `users/${uid}`), user);
      navigate('/admin');
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStyle = (style: any) => {
    if (!user) return;
    setUser({ ...user, style: { ...user.style, ...style } });
  };

  const handleToggleBadge = (badgeId: string) => {
    if (!user) return;
    const currentBadges = user.badges || [];
    const newBadges = currentBadges.includes(badgeId)
      ? currentBadges.filter(id => id !== badgeId)
      : [...currentBadges, badgeId];
    setUser({ ...user, badges: newBadges });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white/20">User not found</h2>
        <button onClick={() => navigate('/admin')} className="mt-4 text-primary font-bold uppercase tracking-widest text-xs">Back to Admin</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 space-y-8"
    >
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={16} /> Back to Admin
        </button>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? 'Saving...' : 'Save Changes'}
          <Save size={18} />
        </button>
      </div>

      <div className="bg-secondary rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/5 flex items-center gap-6">
          <img 
            src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
            className="w-24 h-24 rounded-3xl border-4 border-primary/20 shadow-2xl" 
          />
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic" style={{ color: user.style?.color, fontSize: user.style?.fontSize, fontWeight: user.style?.fontWeight }}>
              {user.ign}
            </h1>
            <p className="text-white/30 font-bold uppercase tracking-widest text-xs mt-1">{user.email}</p>
            <div className="flex gap-2 mt-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {user.role}
              </span>
              {user.isBanned && (
                <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Banned
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Style Customization */}
          <div className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <Palette className="text-primary" /> Name Style
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Display Color</label>
                <input
                  type="color"
                  value={user.style?.color || '#ffffff'}
                  onChange={e => handleUpdateStyle({ color: e.target.value })}
                  className="w-full h-12 bg-background border border-white/10 rounded-2xl cursor-pointer p-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Font Size</label>
                  <select
                    value={user.style?.fontSize || '16px'}
                    onChange={e => handleUpdateStyle({ fontSize: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-primary"
                  >
                    <option value="12px">Small</option>
                    <option value="16px">Normal</option>
                    <option value="20px">Large</option>
                    <option value="24px">Extra Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Font Weight</label>
                  <select
                    value={user.style?.fontWeight || 'normal'}
                    onChange={e => handleUpdateStyle({ fontWeight: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-primary"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="900">Black</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 pt-6 border-t border-white/5">
                <ImageIcon className="text-primary" /> PNG Name (Admin Only)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">PNG Name URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://... (Image Link)"
                      value={user.nameImage || ''}
                      onChange={e => setUser({ ...user, nameImage: e.target.value })}
                      className="flex-1 bg-background border border-white/10 rounded-2xl p-4 outline-none focus:border-primary text-sm"
                    />
                    <input
                      type="file"
                      id="nameImageUpload"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                    <label htmlFor="nameImageUpload" className="p-4 bg-background border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center shrink-0">
                      <ImageIcon size={20} className="text-primary" />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Name Image Width (px)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={user.nameImageWidth || ''}
                    onChange={e => setUser({ ...user, nameImageWidth: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border border-white/10 rounded-2xl p-4 outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                <Shield className="text-primary" /> Permissions
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setUser({ ...user, role: user.role === 'admin' ? 'user' : 'admin' })}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border transition-all ${
                    user.role === 'admin' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  Admin Access
                </button>
                <button
                  onClick={() => setUser({ ...user, isBanned: !user.isBanned })}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border transition-all ${
                    user.isBanned ? 'bg-red-500 text-white border-red-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}
                >
                  {user.isBanned ? 'Unban User' : 'Ban User'}
                </button>
              </div>
            </div>
          </div>

          {/* Badges Selection */}
          <div className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <BadgeIcon className="text-primary" /> Badges Management
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {badges.map(badge => (
                <button
                  key={badge.id}
                  onClick={() => handleToggleBadge(badge.id)}
                  className={`aspect-square p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group ${
                    user.badges?.includes(badge.id) 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                      : 'border-white/10 hover:border-white/30 bg-white/5'
                  }`}
                >
                  <img src={badge.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform" title={badge.name} />
                  <span className="text-[8px] font-black uppercase tracking-tighter text-center line-clamp-1">{badge.name}</span>
                </button>
              ))}
            </div>
            {badges.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-3xl text-white/20 italic text-sm">
                No badges created yet. Create some in the Badge Manager.
              </div>
            )}

            <div className="pt-6 border-t border-white/5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Profile Notice</label>
              <textarea
                value={user.notice || ''}
                onChange={e => setUser({ ...user, notice: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-2xl p-4 h-32 outline-none focus:border-primary text-sm font-medium"
                placeholder="Add a custom notice to this user's profile..."
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
