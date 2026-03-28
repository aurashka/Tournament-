import React, { useState, useEffect } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, set, push, remove, update, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Tournament } from '../types';
import { Plus, Trash2, Edit2, Image as ImageIcon, Link as LinkIcon, Users, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { uploadImage } from '../lib/utils';

interface Application {
  id: string;
  tournamentId: string;
  userId: string;
  userIgn: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  details: Record<string, string>;
}

export const TournamentManager: React.FC = () => {
  const { categories, fields } = useFirebase();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewingApps, setViewingApps] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Tournament>>({
    title: '',
    bgImage: '',
    logo: '',
    hostId: '',
    game: '',
    categories: [],
    entryFee: 'Free',
    prize: '',
    rules: '',
    dateTime: '',
    status: 'upcoming',
    joinSystem: 'internal',
    customFields: {},
    totalSlots: 100,
    filledSlots: 0,
  });

  useEffect(() => {
    const tRef = ref(db, 'tournaments');
    onValue(tRef, (snapshot) => {
      const data = snapshot.val();
      setTournaments(data ? Object.values(data) : []);
    });

    const uRef = ref(db, 'users');
    onValue(uRef, (snapshot) => {
      const data = snapshot.val();
      setUsers(data ? Object.values(data) : []);
    });

    const aRef = ref(db, 'applications');
    onValue(aRef, (snapshot) => {
      const data = snapshot.val();
      setApplications(data ? Object.values(data) : []);
    });
  }, []);

  const handleSave = async () => {
    if (!formData.title) return;

    if (editingId) {
      await update(ref(db, `tournaments/${editingId}`), formData);
    } else {
      const newRef = push(ref(db, 'tournaments'));
      await set(newRef, { ...formData, id: newRef.key });
    }
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', bgImage: '', logo: '', hostId: '', game: '', categories: [], entryFee: 'Free', prize: '', rules: '', dateTime: '', status: 'upcoming', joinSystem: 'internal', customFields: {} });
  };

  const handleUpdateAppStatus = async (appId: string, status: 'approved' | 'rejected') => {
    await update(ref(db, `applications/${appId}`), { status });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tournament?')) {
      await remove(ref(db, `tournaments/${id}`));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'bgImage' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setFormData({ ...formData, [field]: url });
      } catch (err) {
        alert('Upload failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tournament Management</h2>
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Create Tournament
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-secondary p-6 rounded-xl border border-white/10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Host (Select Player)</label>
                <select
                  value={formData.hostId}
                  onChange={e => setFormData({ ...formData, hostId: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-lg p-2"
                >
                  <option value="">Select Host</option>
                  {users.map(u => (
                    <option key={u.uid} value={u.uid}>{u.ign} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Background Image</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={formData.bgImage}
                      onChange={e => setFormData({ ...formData, bgImage: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-lg p-2 text-xs"
                      placeholder="Image URL"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="bgImage"
                        className="hidden"
                        onChange={e => handleImageUpload(e, 'bgImage')}
                      />
                      <label htmlFor="bgImage" className="flex-1 bg-background border border-white/10 rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-white/5">
                        <ImageIcon size={16} />
                        <span className="text-xs truncate">{formData.bgImage ? 'Image Selected' : 'Upload BG'}</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Logo</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={e => setFormData({ ...formData, logo: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-lg p-2 text-xs"
                      placeholder="Logo URL"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="logo"
                        className="hidden"
                        onChange={e => handleImageUpload(e, 'logo')}
                      />
                      <label htmlFor="logo" className="flex-1 bg-background border border-white/10 rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-white/5">
                        <ImageIcon size={16} />
                        <span className="text-xs truncate">{formData.logo ? 'Logo Selected' : 'Upload Logo'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Game</label>
                <input
                  type="text"
                  value={formData.game}
                  onChange={e => setFormData({ ...formData, game: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-lg p-2"
                  placeholder="e.g. PUBG Mobile"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Entry Fee</label>
                  <input
                    type="text"
                    value={formData.entryFee}
                    onChange={e => setFormData({ ...formData, entryFee: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prize Pool</label>
                  <input
                    type="text"
                    value={formData.prize}
                    onChange={e => setFormData({ ...formData, prize: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-background border border-white/10 rounded-lg p-2"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="finished">Finished</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Join System</label>
                <select
                  value={formData.joinSystem}
                  onChange={e => setFormData({ ...formData, joinSystem: e.target.value as any })}
                  className="w-full bg-background border border-white/10 rounded-lg p-2"
                >
                  <option value="internal">Internal Form Builder</option>
                  <option value="external">External Link</option>
                </select>
              </div>
              {formData.joinSystem === 'external' && (
                <div>
                  <label className="block text-sm font-medium mb-1">External Link</label>
                  <input
                    type="text"
                    value={formData.externalLink}
                    onChange={e => setFormData({ ...formData, externalLink: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-lg p-2"
                    placeholder="https://..."
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={e => setFormData({ ...formData, dateTime: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total Slots</label>
                  <input
                    type="number"
                    value={formData.totalSlots}
                    onChange={e => setFormData({ ...formData, totalSlots: parseInt(e.target.value) })}
                    className="w-full bg-background border border-white/10 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Filled Slots</label>
                  <input
                    type="number"
                    value={formData.filledSlots}
                    onChange={e => setFormData({ ...formData, filledSlots: parseInt(e.target.value) })}
                    className="w-full bg-background border border-white/10 rounded-lg p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const cats = formData.categories || [];
                        if (cats.includes(cat.id)) {
                          setFormData({ ...formData, categories: cats.filter(c => c !== cat.id) });
                        } else {
                          setFormData({ ...formData, categories: [...cats, cat.id] });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        formData.categories?.includes(cat.id) ? 'bg-primary text-black' : 'bg-white/5'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rules & Description</label>
            <textarea
              value={formData.rules}
              onChange={e => setFormData({ ...formData, rules: e.target.value })}
              className="w-full bg-background border border-white/10 rounded-lg p-2 h-32"
            />
          </div>

          <div className="space-y-4 border-t border-white/5 pt-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Custom Details (Key: Value)</h4>
              <button 
                onClick={() => {
                  const custom = { ...(formData.customFields || {}) };
                  const key = `Field ${Object.keys(custom).length + 1}`;
                  custom[key] = '';
                  setFormData({ ...formData, customFields: custom });
                }}
                className="text-xs bg-white/5 px-3 py-1 rounded-lg hover:bg-white/10"
              >
                + Add Detail
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(formData.customFields || {}).map(([key, value], idx) => (
                <div key={idx} className="flex gap-2 items-center bg-white/5 p-2 rounded-lg">
                  <input 
                    type="text" 
                    value={key}
                    onChange={e => {
                      const newKey = e.target.value;
                      const custom = { ...formData.customFields };
                      delete custom[key];
                      custom[newKey] = value;
                      setFormData({ ...formData, customFields: custom });
                    }}
                    className="w-1/3 bg-background border border-white/10 rounded p-1 text-xs"
                    placeholder="Label"
                  />
                  <input 
                    type="text" 
                    value={value}
                    onChange={e => {
                      const custom = { ...formData.customFields };
                      custom[key] = e.target.value;
                      setFormData({ ...formData, customFields: custom });
                    }}
                    className="flex-1 bg-background border border-white/10 rounded p-1 text-xs"
                    placeholder="Value"
                  />
                  <button 
                    onClick={() => {
                      const custom = { ...formData.customFields };
                      delete custom[key];
                      setFormData({ ...formData, customFields: custom });
                    }}
                    className="text-red-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 hover:bg-white/5 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Save Tournament</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournaments.map(t => (
          <div key={t.id} className="bg-secondary p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={t.logo || 'https://picsum.photos/seed/game/100/100'} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <h3 className="font-bold">{t.title}</h3>
                <p className="text-xs text-white/50 uppercase tracking-wider">{t.game} • {t.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewingApps(viewingApps === t.id ? null : t.id)}
                className={`p-2 rounded-lg transition-all ${viewingApps === t.id ? 'bg-primary text-black' : 'hover:bg-white/5 text-white/50'}`}
                title="View Applications"
              >
                <Users size={18} />
                {applications.filter(a => a.tournamentId === t.id).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] flex items-center justify-center rounded-full text-white">
                    {applications.filter(a => a.tournamentId === t.id && a.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setEditingId(t.id); setFormData(t); }}
                className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white"
              >
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {viewingApps && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-secondary w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 p-8 space-y-6">
            <div className="flex justify-between items-center sticky top-0 bg-secondary pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold">Applications for {tournaments.find(t => t.id === viewingApps)?.title}</h3>
              <button onClick={() => setViewingApps(null)} className="p-2 hover:bg-white/5 rounded-lg"><XCircle size={20} /></button>
            </div>

            <div className="space-y-4">
              {applications.filter(a => a.tournamentId === viewingApps).length === 0 ? (
                <p className="text-center text-white/30 py-8">No applications yet.</p>
              ) : (
                applications.filter(a => a.tournamentId === viewingApps).map(app => (
                  <div key={app.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{app.userIgn}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.status === 'approved' ? 'bg-green-500' : 
                          app.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">{new Date(app.submittedAt).toLocaleString()}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {Object.entries(app.details || {}).map(([k, v]) => (
                          <div key={k} className="text-xs">
                            <span className="text-white/40">{k}:</span> <span className="text-white/80">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateAppStatus(app.id, 'approved')}
                        className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
