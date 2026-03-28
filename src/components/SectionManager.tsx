import React, { useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, set, push, remove, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { Section } from '../types';
import { Plus, Trash2, Edit2, MoveUp, MoveDown, Eye, EyeOff } from 'lucide-react';

export const SectionManager: React.FC = () => {
  const { sections, categories } = useFirebase();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Section>>({
    title: '',
    type: 'tournament',
    layout: 'grid',
    visible: true,
    cardStyle: 'gaming',
    categories: [],
  });

  const handleSave = async () => {
    if (!formData.title) return;

    if (editingId) {
      await update(ref(db, `sections/${editingId}`), formData);
    } else {
      const newRef = push(ref(db, 'sections'));
      await set(newRef, {
        ...formData,
        id: newRef.key,
        order: sections.length,
      });
    }
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', type: 'tournament', layout: 'grid', visible: true, cardStyle: 'gaming', categories: [] });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      await remove(ref(db, `sections/${id}`));
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (direction === 'up' && index > 0) {
      const other = sections[index - 1];
      await update(ref(db, `sections/${id}`), { order: other.order });
      await update(ref(db, `sections/${other.id}`), { order: sections[index].order });
    } else if (direction === 'down' && index < sections.length - 1) {
      const other = sections[index + 1];
      await update(ref(db, `sections/${id}`), { order: other.order });
      await update(ref(db, `sections/${other.id}`), { order: sections[index].order });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Home Page Sections</h2>
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Section
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-secondary p-6 rounded-xl border border-white/10 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
              >
                <option value="tournament">Tournaments</option>
                <option value="posts">Posts</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Layout</label>
              <select
                value={formData.layout}
                onChange={e => setFormData({ ...formData, layout: e.target.value as any })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
              >
                <option value="grid">Grid</option>
                <option value="slider">Slider</option>
                <option value="list">List</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Card Style</label>
              <select
                value={formData.cardStyle}
                onChange={e => setFormData({ ...formData, cardStyle: e.target.value as any })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
              >
                <option value="gaming">Gaming</option>
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categories (Filter)</label>
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
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 hover:bg-white/5 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Save Section</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={section.id} className="bg-secondary p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button onClick={() => handleMove(section.id, 'up')} disabled={idx === 0} className="disabled:opacity-20 hover:text-primary"><MoveUp size={16} /></button>
                <button onClick={() => handleMove(section.id, 'down')} disabled={idx === sections.length - 1} className="disabled:opacity-20 hover:text-primary"><MoveDown size={16} /></button>
              </div>
              <div>
                <h3 className="font-bold">{section.title}</h3>
                <p className="text-xs text-white/50 uppercase tracking-wider">{section.type} • {section.layout} • {section.cardStyle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => update(ref(db, `sections/${section.id}`), { visible: !section.visible })}
                className={`p-2 rounded-lg transition-all ${section.visible ? 'text-primary' : 'text-white/20'}`}
              >
                {section.visible ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              <button
                onClick={() => { setEditingId(section.id); setFormData(section); }}
                className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white"
              >
                <Edit2 size={20} />
              </button>
              <button onClick={() => handleDelete(section.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
