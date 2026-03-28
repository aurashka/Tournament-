import React, { useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, set, push, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { Plus, Trash2 } from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const { categories } = useFirebase();
  const [newName, setNewName] = useState('');

  const handleAdd = async () => {
    if (!newName) return;
    const newRef = push(ref(db, 'categories'));
    await set(newRef, { id: newRef.key, name: newName });
    setNewName('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await remove(ref(db, `categories/${id}`));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="bg-secondary border border-white/10 rounded-lg p-2"
          />
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-secondary p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="font-medium">{cat.name}</span>
            <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
