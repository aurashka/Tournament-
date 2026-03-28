import React, { useState, useEffect } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, set, push, remove, update, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Tournament } from '../types';
import { Plus, Trash2, Edit2, Image as ImageIcon, Link as LinkIcon, Users } from 'lucide-react';
import { uploadImage } from '../lib/utils';

export const TournamentManager: React.FC = () => {
  const { categories, fields } = useFirebase();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
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
  });

  useEffect(() => {
    const tRef = ref(db, 'tournaments');
    onValue(tRef, (snapshot) => {
      const data = snapshot.val();
      setTournaments(data ? Object.values(data) : []);
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
                <label className="block text-sm font-medium mb-1">Tournament Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Background Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="bgImage"
                      className="hidden"
                      onChange={e => handleImageUpload(e, 'bgImage')}
                    />
                    <label htmlFor="bgImage" className="flex-1 bg-background border border-white/10 rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-white/5">
                      <ImageIcon size={16} />
                      <span className="text-xs truncate">{formData.bgImage ? 'Image Uploaded' : 'Upload BG'}</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Logo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="logo"
                      className="hidden"
                      onChange={e => handleImageUpload(e, 'logo')}
                    />
                    <label htmlFor="logo" className="flex-1 bg-background border border-white/10 rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-white/5">
                      <ImageIcon size={16} />
                      <span className="text-xs truncate">{formData.logo ? 'Image Uploaded' : 'Upload Logo'}</span>
                    </label>
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
    </div>
  );
};
