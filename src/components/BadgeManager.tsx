import React, { useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, set, push, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../lib/utils';

export const BadgeManager: React.FC = () => {
  const { badges } = useFirebase();
  const [newName, setNewName] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDetail, setNewDetail] = useState('');

  const handleAdd = async () => {
    if (!newName || !newImageUrl) return;
    const newRef = push(ref(db, 'badges'));
    await set(newRef, { 
      id: newRef.key, 
      name: newName, 
      imageUrl: newImageUrl,
      detail: newDetail 
    });
    setNewName('');
    setNewImageUrl('');
    setNewDetail('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setNewImageUrl(url);
      } catch (err) {
        alert('Upload failed');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this badge?')) {
      await remove(ref(db, `badges/${id}`));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Badge System</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Badge Name</label>
            <input
              type="text"
              placeholder="e.g. Pro Player"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full bg-secondary border border-white/10 rounded-2xl p-4 focus:border-primary transition-all outline-none"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Badge Image URL or Upload</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://... (Image Link)"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                className="flex-1 bg-secondary border border-white/10 rounded-2xl p-4 focus:border-primary transition-all outline-none text-sm"
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="badgeImage"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label htmlFor="badgeImage" className="p-4 bg-secondary border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center shrink-0">
                  <ImageIcon size={20} className="text-primary" />
                </label>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Badge Detail (Tooltip)</label>
            <input
              type="text"
              placeholder="e.g. Top 10 in Season 1"
              value={newDetail}
              onChange={e => setNewDetail(e.target.value)}
              className="w-full bg-secondary border border-white/10 rounded-2xl p-4 focus:border-primary transition-all outline-none"
            />
          </div>
          <button onClick={handleAdd} className="btn-primary h-[58px] px-8 flex items-center gap-2 shadow-xl shadow-primary/20">
            <Plus size={20} /> Add Badge
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {badges.map(badge => (
          <div key={badge.id} className="bg-secondary p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={badge.imageUrl} className="w-10 h-10 object-contain" />
              <div className="flex flex-col">
                <span className="font-medium">{badge.name}</span>
                {badge.detail && <span className="text-[10px] text-white/40">{badge.detail}</span>}
              </div>
            </div>
            <button onClick={() => handleDelete(badge.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
