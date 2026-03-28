import React, { useState, useEffect } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, update, onValue } from 'firebase/database';
import { db, auth as firebaseAuth } from '../lib/firebase';
import { UserProfile, Badge, Tournament, Application } from '../types';
import { Trophy, Shield, Play, Settings, Edit2, LogOut, Badge as BadgeIcon, Info, Mars, Venus, Check, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../lib/utils';
import { signOut } from 'firebase/auth';
import { useParams, useNavigate, Link } from 'react-router-dom';

const PRESET_AVATARS = {
  male: ['Felix', 'Max', 'Oliver', 'James', 'Leo'],
  female: ['Aneka', 'Sasha', 'Mia', 'Luna', 'Zoe']
};

export const Profile: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const { user, profile: myProfile, badges } = useFirebase();
  const navigate = useNavigate();
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !uid || uid === user?.uid;
  const effectiveProfile = isOwnProfile ? myProfile : targetProfile;

  useEffect(() => {
    if (uid && uid !== user?.uid) {
      setLoading(true);
      const uRef = ref(db, `users/${uid}`);
      onValue(uRef, (snapshot) => {
        setTargetProfile(snapshot.val());
        setLoading(false);
      });
    } else {
      setTargetProfile(null);
      setLoading(false);
    }
  }, [uid, user]);

  useEffect(() => {
    const profileToUse = isOwnProfile ? myProfile : targetProfile;
    if (!profileToUse) return;
    setFormData(profileToUse || {});

    // Load user applications
    const aRef = ref(db, 'applications');
    onValue(aRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const apps: Application[] = Object.values(data) as Application[];
        setUserApplications(apps.filter(app => app.userId === profileToUse.uid));
      }
    });

    // Load tournaments for reference
    const tRef = ref(db, 'tournaments');
    onValue(tRef, (snapshot) => {
      const data = snapshot.val();
      setTournaments(data ? Object.values(data) as Tournament[] : []);
    });
  }, [isOwnProfile, myProfile, targetProfile]);

  const handleUpdate = async () => {
    if (!user) return;
    await update(ref(db, `users/${user.uid}`), formData);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setFormData({ ...formData, profileImage: url });
      } catch (err) {
        alert('Upload failed');
      }
    }
  };

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    navigate('/');
  };

  if (loading) return <div className="p-12 text-center text-primary font-black uppercase tracking-widest animate-pulse">Loading Profile...</div>;
  if (!effectiveProfile) return <div className="p-12 text-center text-white/30 italic">User not found</div>;

  return (
    <div className="space-y-8 pb-16">
      {/* Profile Header */}
      <div className="bg-secondary rounded-3xl border border-white/5 p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <img 
              src={effectiveProfile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${effectiveProfile.uid}`} 
              className="w-40 h-40 rounded-3xl border-4 border-white/10 shadow-2xl object-cover" 
            />
            {isEditing && isOwnProfile && (
              <label className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <input type="file" className="hidden" onChange={handleImageUpload} />
                <Edit2 size={24} />
              </label>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {effectiveProfile.nameImage ? (
                <img 
                  src={effectiveProfile.nameImage} 
                  alt={effectiveProfile.ign} 
                  className="h-10 object-contain" 
                  style={{ width: effectiveProfile.nameImageWidth ? `${effectiveProfile.nameImageWidth}px` : 'auto' }}
                />
              ) : (
                <h1 className="text-4xl font-black uppercase tracking-tighter italic" style={{ color: effectiveProfile.style?.color, fontSize: effectiveProfile.style?.fontSize, fontWeight: effectiveProfile.style?.fontWeight }}>
                  {effectiveProfile.ign}
                </h1>
              )}
              {effectiveProfile.gender && (
                <div className={`p-2 rounded-full ${effectiveProfile.gender === 'male' ? 'bg-blue-500/20 text-blue-500' : 'bg-pink-500/20 text-pink-500'}`}>
                  {effectiveProfile.gender === 'male' ? <Mars size={20} /> : <Venus size={20} />}
                </div>
              )}
              <div className="flex gap-2">
                {effectiveProfile.badges?.map(bId => {
                  const badge = badges.find(b => b.id === bId);
                  return badge ? (
                    <div key={bId} className="relative group/badge">
                      <img src={badge.imageUrl} className="w-6 h-6 object-contain cursor-help" />
                      {badge.detail && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black/95 text-[10px] text-white rounded-xl opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10 shadow-2xl">
                          <div className="font-black text-primary uppercase tracking-widest mb-1">{badge.name}</div>
                          <div className="text-white/70 leading-relaxed">{badge.detail}</div>
                        </div>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
              <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                {effectiveProfile.role}
              </span>
            </div>
            
            <p className="text-white/50 font-medium">{effectiveProfile.email}</p>
            
            {effectiveProfile.notice && (
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-start gap-3">
                <Info className="text-primary shrink-0" size={20} />
                <p className="text-sm text-primary/80 italic">{effectiveProfile.notice}</p>
              </div>
            )}

            {isOwnProfile && (
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button onClick={() => setIsEditing(!isEditing)} className="btn-secondary flex items-center gap-2">
                  <Settings size={18} /> {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button onClick={handleLogout} className="px-6 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold transition-all flex items-center gap-2">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
            {[
              { label: 'Played', value: effectiveProfile.stats?.played || 0, icon: Play },
              { label: 'Won', value: effectiveProfile.stats?.won || 0, icon: Trophy },
              { label: 'Active', value: effectiveProfile.stats?.live || 0, icon: Shield },
            ].map((stat, i) => (
              <div key={i} className="bg-background/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center min-w-[100px]">
                <stat.icon className="text-primary mb-2" size={20} />
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{stat.label}</span>
                <span className="text-xl font-black">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="bg-secondary p-8 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">Edit Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">In-game Name</label>
              <input
                type="text"
                value={formData.ign}
                onChange={e => setFormData({ ...formData, ign: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-xl p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full bg-background border border-white/10 rounded-xl p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`py-3 rounded-xl border font-bold uppercase tracking-widest text-[10px] transition-all ${formData.gender === 'male' ? 'bg-primary text-black border-primary' : 'bg-background border-white/10 text-white/30'}`}
                >
                  Male
                </button>
                <button
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`py-3 rounded-xl border font-bold uppercase tracking-widest text-[10px] transition-all ${formData.gender === 'female' ? 'bg-primary text-black border-primary' : 'bg-background border-white/10 text-white/30'}`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Select Avatar</label>
            <div className="grid grid-cols-5 gap-4">
              {PRESET_AVATARS[formData.gender || 'male'].map(seed => {
                const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                const isSelected = formData.profileImage === url;
                return (
                  <button
                    key={seed}
                    onClick={() => setFormData({ ...formData, profileImage: url })}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? 'border-primary scale-105' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <img src={url} className="w-full aspect-square object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="text-primary" size={24} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleUpdate} className="btn-primary px-8 py-3">Save Changes</button>
          </div>
        </div>
      )}

      {/* Applications / Tournaments History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-secondary p-8 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <Trophy className="text-primary" /> My Tournaments
          </h2>
          <div className="space-y-4">
            {userApplications.map(app => {
              const tournament = tournaments.find(t => t.id === app.tournamentId);
              if (!tournament) return null;
              return (
                <div key={app.id} className="bg-background/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={tournament.logo} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h3 className="font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{tournament.title}</h3>
                      <p className="text-xs text-white/30 uppercase font-bold tracking-widest">{tournament.game}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    app.status === 'approved' ? 'bg-green-500 text-white' :
                    app.status === 'rejected' ? 'bg-red-500 text-white' :
                    'bg-white/10 text-white'
                  }`}>
                    {app.status}
                  </div>
                </div>
              );
            })}
            {userApplications.length === 0 && (
              <p className="text-center text-white/30 py-12 italic text-sm">No tournaments joined yet</p>
            )}
          </div>
        </div>

        <div className="bg-secondary p-8 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <BadgeIcon className="text-primary" /> My Badges
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {effectiveProfile.badges?.map(bId => {
              const badge = badges.find(b => b.id === bId);
              if (!badge) return null;
              return (
                <div key={bId} className="bg-background/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-2 group hover:border-primary/20 transition-all relative">
                  <img src={badge.imageUrl} className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{badge.name}</span>
                  {badge.detail && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black/95 text-[10px] text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10 shadow-2xl">
                      <div className="font-black text-primary uppercase tracking-widest mb-1">{badge.name}</div>
                      <div className="text-white/70 leading-relaxed">{badge.detail}</div>
                    </div>
                  )}
                </div>
              );
            })}
            {(!effectiveProfile.badges || effectiveProfile.badges.length === 0) && (
              <div className="col-span-4 text-center text-white/30 py-12 italic text-sm">No badges earned yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
