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

  const handleAdd = async () => {
    if (!newName || !newImageUrl) return;
    const newRef = push(ref(db, 'badges'));
    await set(newRef, { id: newRef.key, name: newName, imageUrl: newImageUrl });
    setNewName('');
    setNewImageUrl('');
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
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Badge Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="bg-secondary border border-white/10 rounded-lg p-2"
          />
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="badgeImage"
              className="hidden"
              onChange={handleImageUpload}
            />
            <label htmlFor="badgeImage" className="bg-secondary border border-white/10 rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-white/5">
              <ImageIcon size={16} />
              <span className="text-xs truncate">{newImageUrl ? 'Image Uploaded' : 'Upload Badge'}</span>
            </label>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {badges.map(badge => (
          <div key={badge.id} className="bg-secondary p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={badge.imageUrl} className="w-10 h-10 object-contain" />
              <span className="font-medium">{badge.name}</span>
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
