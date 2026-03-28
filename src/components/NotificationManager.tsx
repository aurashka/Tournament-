import React, { useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, push, set, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { Notification } from '../types';
import { Bell, Send, Trash2, Info, AlertTriangle, CheckCircle, Clock, Image as ImageIcon, Upload } from 'lucide-react';

export const NotificationManager: React.FC = () => {
  const { notifications, tournaments } = useFirebase();
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Notification>>({
    title: '',
    message: '',
    type: 'info',
    link: '',
    icon: 'bell',
    imageUrl: '',
    actionType: 'none',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!formData.title || !formData.message) return;

    const newRef = push(ref(db, 'notifications'));
    const notification: Notification = {
      id: newRef.key!,
      title: formData.title,
      message: formData.message || '',
      type: formData.type as any,
      link: formData.link,
      icon: formData.icon,
      imageUrl: formData.imageUrl,
      actionType: formData.actionType as any,
      timestamp: Date.now(),
      read: false,
    };

    await set(newRef, notification);
    setIsAdding(false);
    setFormData({ title: '', message: '', type: 'info', link: '', icon: 'bell', imageUrl: '', actionType: 'none' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this notification?')) {
      await remove(ref(db, `notifications/${id}`));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">In-App Notifications</h2>
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Bell size={20} /> Send Notification
        </button>
      </div>

      {isAdding && (
        <div className="bg-secondary p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
                placeholder="Notification Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="alert">Alert</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-background border border-white/10 rounded-lg p-2 h-24"
              placeholder="Enter message content..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Image URL or Upload</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="flex-1 bg-background border border-white/10 rounded-2xl p-4 focus:border-primary transition-all outline-none text-sm"
                  placeholder="https://... (Image Link)"
                />
                <input
                  type="file"
                  id="notif-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <label 
                  htmlFor="notif-image" 
                  className={`p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center shrink-0 ${uploading ? 'animate-pulse' : ''}`}
                >
                  <Upload size={20} className="text-primary" />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Action Type</label>
              <select
                value={formData.actionType}
                onChange={e => setFormData({ ...formData, actionType: e.target.value as any })}
                className="w-full bg-background border border-white/10 rounded-2xl p-4 focus:border-primary transition-all outline-none appearance-none"
              >
                <option value="none">None</option>
                <option value="tournament">Open Tournament</option>
                <option value="external">External Link</option>
              </select>
            </div>
          </div>
          {formData.actionType === 'tournament' && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Tournament</label>
              <select
                value={formData.link}
                onChange={e => setFormData({ ...formData, link: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
              >
                <option value="">Select a tournament</option>
                {tournaments.map(t => (
                  <option key={t.id} value={`/tournament/${t.id}`}>{t.title}</option>
                ))}
              </select>
            </div>
          )}
          {formData.actionType === 'external' && (
            <div>
              <label className="block text-sm font-medium mb-1">External Link</label>
              <input
                type="text"
                value={formData.link}
                onChange={e => setFormData({ ...formData, link: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
                placeholder="https://..."
              />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 hover:bg-white/5 rounded-lg">Cancel</button>
            <button onClick={handleSend} className="btn-primary flex items-center gap-2">
              <Send size={18} /> Send to All
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {notifications.sort((a, b) => b.timestamp - a.timestamp).map(notif => (
          <div key={notif.id} className="bg-secondary p-4 rounded-xl border border-white/10 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                notif.type === 'success' ? 'bg-green-500/20 text-green-500' :
                notif.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                notif.type === 'alert' ? 'bg-red-500/20 text-red-500' :
                'bg-primary/20 text-primary'
              }`}>
                {notif.type === 'success' ? <CheckCircle size={20} /> :
                 notif.type === 'warning' ? <AlertTriangle size={20} /> :
                 notif.type === 'alert' ? <AlertTriangle size={20} /> :
                 <Info size={20} />}
              </div>
              <div>
                <h4 className="font-bold text-sm">{notif.title}</h4>
                <p className="text-xs text-white/50">{notif.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={10} className="text-white/20" />
                  <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">
                    {new Date(notif.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(notif.id)}
              className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
