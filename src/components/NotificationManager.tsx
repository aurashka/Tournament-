import React, { useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, push, set, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { Notification } from '../types';
import { Bell, Send, Trash2, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const NotificationManager: React.FC = () => {
  const { notifications } = useFirebase();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Notification>>({
    title: '',
    message: '',
    type: 'info',
    link: '',
    icon: 'bell',
  });

  const handleSend = async () => {
    if (!formData.title || !formData.message) return;

    const newRef = push(ref(db, 'notifications'));
    const notification: Notification = {
      id: newRef.key!,
      title: formData.title,
      message: formData.message,
      type: formData.type as any,
      link: formData.link,
      icon: formData.icon,
      timestamp: Date.now(),
      read: false,
    };

    await set(newRef, notification);
    setIsAdding(false);
    setFormData({ title: '', message: '', type: 'info', link: '', icon: 'bell' });
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
          <div>
            <label className="block text-sm font-medium mb-1">Link (Optional)</label>
            <input
              type="text"
              value={formData.link}
              onChange={e => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-background border border-white/10 rounded-lg p-2"
              placeholder="https://..."
            />
          </div>
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
