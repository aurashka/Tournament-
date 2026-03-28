import React, { useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { LayoutGrid, Settings, Users, Trophy, Palette, FileText, Badge as BadgeIcon, MessageSquare, Bell } from 'lucide-react';
import { SectionManager } from './SectionManager';
import { FieldManager } from './FieldManager';
import { DesignManager } from './DesignManager';
import { TournamentManager } from './TournamentManager';
import { UserManager } from './UserManager';
import { BadgeManager } from './BadgeManager';
import { CategoryManager } from './CategoryManager';
import { ChatManager } from './ChatManager';
import { NotificationManager } from './NotificationManager';

export const AdminPanel: React.FC = () => {
  const { isAdmin } = useFirebase();
  const [activeTab, setActiveTab] = useState('sections');

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Shield size={48} className="text-red-500/20" />
        <h2 className="text-2xl font-black uppercase tracking-tight">Access Denied</h2>
        <p className="text-white/30 text-sm">You do not have administrative privileges.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'sections', label: 'Sections', icon: LayoutGrid },
    { id: 'categories', label: 'Categories', icon: Settings },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'fields', label: 'Fields', icon: FileText },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'badges', label: 'Badges', icon: BadgeIcon },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 py-8">
      {/* Sidebar - Mobile Horizontal / Desktop Vertical */}
      <div className="w-full md:w-64 shrink-0">
        <div className="sticky top-32 space-y-4">
          <div className="px-4 mb-6">
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Admin<span className="text-primary">Panel</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Management Console</p>
          </div>
          
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all whitespace-nowrap md:w-full ${
                  activeTab === tab.id 
                    ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="bg-secondary/30 rounded-[2rem] border border-white/5 p-6 md:p-10 backdrop-blur-sm">
          {activeTab === 'sections' && <SectionManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'design' && <DesignManager />}
          {activeTab === 'fields' && <FieldManager />}
          {activeTab === 'tournaments' && <TournamentManager />}
          {activeTab === 'users' && <UserManager />}
          {activeTab === 'badges' && <BadgeManager />}
          {activeTab === 'chats' && <ChatManager />}
          {activeTab === 'notifications' && <NotificationManager />}
        </div>
      </div>
    </div>
  );
};
