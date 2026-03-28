import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Search, Shield, Ban, UserCheck, Settings2 } from 'lucide-react';

export const UserManager: React.FC = () => {
  const navigate = useNavigate();
  const { badges } = useFirebase();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-black uppercase tracking-tight">User Management</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-secondary border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map(user => (
          <div key={user.uid} className="bg-secondary p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-white/5 transition-all">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img 
                  src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  className="w-16 h-16 rounded-2xl border-2 border-primary/20 shadow-xl" 
                />
                {user.isBanned && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-lg shadow-lg">
                    <Ban size={12} />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black uppercase tracking-tight" style={{ color: user.style?.color, fontSize: user.style?.fontSize, fontWeight: user.style?.fontWeight }}>
                    {user.ign}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-1">{user.email}</p>
                <div className="flex gap-1.5 mt-3">
                  {user.badges?.map(bId => {
                    const badge = badges.find(b => b.id === bId);
                    return badge ? (
                      <div key={bId} className="w-6 h-6 p-1 bg-white/5 rounded-lg border border-white/5">
                        <img src={badge.imageUrl} className="w-full h-full object-contain" title={badge.name} />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/admin/user/${user.uid}`)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl transition-all font-bold text-xs uppercase tracking-widest border border-primary/20"
                title="Edit User Details"
              >
                <Settings2 size={18} />
                <span className="sm:hidden">Edit Details</span>
              </button>
              <button
                onClick={() => handleUpdateRole(user.uid, user.role === 'admin' ? 'user' : 'admin')}
                className="p-3 hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-colors border border-white/10"
                title="Toggle Admin Role"
              >
                <Shield size={20} />
              </button>
              <button
                onClick={() => handleToggleBan(user.uid, !!user.isBanned)}
                className={`p-3 rounded-2xl transition-all border ${user.isBanned ? 'bg-red-500 border-red-500 text-white' : 'border-red-500/20 text-red-500 hover:bg-red-500/10'}`}
                title={user.isBanned ? 'Unban Player' : 'Ban Player'}
              >
                {user.isBanned ? <UserCheck size={20} /> : <Ban size={20} />}
              </button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-white/20 font-bold uppercase tracking-widest text-sm italic">No players found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
