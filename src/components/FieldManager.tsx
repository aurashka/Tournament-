import React, { useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, set, push, remove, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { CustomField } from '../types';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

export const FieldManager: React.FC = () => {
  const { fields } = useFirebase();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CustomField>>({
    label: '',
    type: 'text',
    options: [],
    required: false,
    target: 'tournament_form',
  });
  const [newOption, setNewOption] = useState('');

  const handleSave = async () => {
    if (!formData.label) return;

    if (editingId) {
      await update(ref(db, `fields/${editingId}`), formData);
    } else {
      const newRef = push(ref(db, 'fields'));
      await set(newRef, { ...formData, id: newRef.key });
    }
    setIsAdding(false);
    setEditingId(null);
    setFormData({ label: '', type: 'text', options: [], required: false, target: 'tournament_form' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      await remove(ref(db, `fields/${id}`));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Custom Field Builder</h2>
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Field
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-secondary p-6 rounded-xl border border-white/10 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Field Label</label>
              <input
                type="text"
                value={formData.label}
                onChange={e => setFormData({ ...formData, label: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
                placeholder="e.g. In-game ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target</label>
              <select
                value={formData.target}
                onChange={e => setFormData({ ...formData, target: e.target.value as any })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
              >
                <option value="tournament_form">Tournament Join Form</option>
                <option value="user_profile">User Profile</option>
                <option value="comment">Comments</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="dropdown">Dropdown</option>
                <option value="image">Image Upload</option>
                <option value="date">Date/Time</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={e => setFormData({ ...formData, required: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="required" className="text-sm font-medium">Required Field</label>
            </div>
          </div>

          {formData.type === 'dropdown' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Dropdown Options</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={e => setNewOption(e.target.value)}
                  className="flex-1 bg-background border border-white/10 rounded-lg p-2"
                  placeholder="Add option..."
                />
                <button
                  onClick={() => {
                    if (newOption) {
                      setFormData({ ...formData, options: [...(formData.options || []), newOption] });
                      setNewOption('');
                    }
                  }}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.options?.map((opt, idx) => (
                  <span key={idx} className="bg-white/5 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    {opt}
                    <button onClick={() => setFormData({ ...formData, options: formData.options?.filter((_, i) => i !== idx) })}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 hover:bg-white/5 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Save Field</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field.id} className="bg-secondary p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-bold">{field.label}</h3>
              <p className="text-xs text-white/50 uppercase tracking-wider">{field.target} • {field.type} {field.required && '• Required'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditingId(field.id); setFormData(field); }}
                className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white"
              >
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(field.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
