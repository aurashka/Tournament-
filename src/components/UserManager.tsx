import React, { useState, useEffect } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { UserProfile, Badge } from '../types';
import { Search, Shield, Ban, UserCheck, Palette, Badge as BadgeIcon } from 'lucide-react';

export const UserManager: React.FC = () => {
  const { badges } = useFirebase();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const uRef = ref(db, 'users');
    onValue(uRef, (snapshot) => {
      const data = snapshot.val();
      setUsers(data ? Object.values(data) : []);
    });
  }, []);

  const filteredUsers = users.filter(u =>
    u.ign?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateRole = async (uid: string, role: string) => {
    await update(ref(db, `users/${uid}`), { role });
  };

  const handleToggleBan = async (uid: string, isBanned: boolean) => {
    await update(ref(db, `users/${uid}`), { isBanned: !isBanned });
  };

  const handleUpdateStyle = async (uid: string, style: any) => {
    await update(ref(db, `users/${uid}/style`), style);
  };

  const handleToggleBadge = async (uid: string, badgeId: string) => {
    const user = users.find(u => u.uid === uid);
    const currentBadges = user?.badges || [];
    const newBadges = currentBadges.includes(badgeId)
      ? currentBadges.filter(id => id !== badgeId)
      : [...currentBadges, badgeId];
    await update(ref(db, `users/${uid}`), { badges: newBadges });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-secondary border border-white/10 rounded-lg pl-10 pr-4 py-2 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map(user => (
          <div key={user.uid} className="bg-secondary p-6 rounded-xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-12 h-12 rounded-full border-2 border-primary/20" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold" style={{ color: user.style?.color, fontSize: user.style?.fontSize, fontWeight: user.style?.fontWeight }}>
                    {user.ign}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {user.role}
                  </span>
                  {user.isBanned && <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Banned</span>}
                </div>
                <p className="text-xs text-white/50">{user.email}</p>
                <div className="flex gap-1 mt-1">
                  {user.badges?.map(bId => {
                    const badge = badges.find(b => b.id === bId);
                    return badge ? <img key={bId} src={badge.imageUrl} className="w-4 h-4 object-contain" title={badge.name} /> : null;
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingUser(editingUser?.uid === user.uid ? null : user)}
                className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white"
                title="Edit Style & Badges"
              >
                <Palette size={20} />
              </button>
              <button
                onClick={() => handleUpdateRole(user.uid, user.role === 'admin' ? 'user' : 'admin')}
                className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white"
                title="Toggle Admin"
              >
                <Shield size={20} />
              </button>
              <button
                onClick={() => handleToggleBan(user.uid, !!user.isBanned)}
                className={`p-2 rounded-lg transition-all ${user.isBanned ? 'bg-red-500 text-white' : 'hover:bg-red-500/20 text-red-500'}`}
                title={user.isBanned ? 'Unban' : 'Ban'}
              >
                {user.isBanned ? <UserCheck size={20} /> : <Ban size={20} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-secondary w-full max-w-2xl rounded-2xl border border-white/10 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Customize User: {editingUser.ign}</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-white/5 rounded-lg"><Ban size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-primary flex items-center gap-2"><Palette size={18} /> Name Style</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Color</label>
                    <input
                      type="color"
                      value={editingUser.style?.color || '#ffffff'}
                      onChange={e => handleUpdateStyle(editingUser.uid, { ...editingUser.style, color: e.target.value })}
                      className="w-full h-10 bg-background border border-white/10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Font Size</label>
                    <select
                      value={editingUser.style?.fontSize || '16px'}
                      onChange={e => handleUpdateStyle(editingUser.uid, { ...editingUser.style, fontSize: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-lg p-2"
                    >
                      <option value="12px">Small</option>
                      <option value="16px">Normal</option>
                      <option value="20px">Large</option>
                      <option value="24px">Extra Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Weight</label>
                    <select
                      value={editingUser.style?.fontWeight || 'normal'}
                      onChange={e => handleUpdateStyle(editingUser.uid, { ...editingUser.style, fontWeight: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-lg p-2"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="900">Black</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-primary flex items-center gap-2"><BadgeIcon size={18} /> Badges</h4>
                <div className="grid grid-cols-4 gap-2">
                  {badges.map(badge => (
                    <button
                      key={badge.id}
                      onClick={() => handleToggleBadge(editingUser.uid, badge.id)}
                      className={`p-2 rounded-lg border transition-all ${
                        editingUser.badges?.includes(badge.id) ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={badge.imageUrl} className="w-full h-8 object-contain" title={badge.name} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Profile Notice</label>
              <textarea
                value={editingUser.notice || ''}
                onChange={e => update(ref(db, `users/${editingUser.uid}`), { notice: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-lg p-2 h-20"
                placeholder="Add a custom notice to this user's profile..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
