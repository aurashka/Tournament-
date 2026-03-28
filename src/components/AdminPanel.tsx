import React, { useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { LayoutGrid, Settings, Users, Trophy, Palette, FileText, Badge as BadgeIcon, MessageSquare } from 'lucide-react';
import { SectionManager } from './SectionManager';
import { FieldManager } from './FieldManager';
import { DesignManager } from './DesignManager';
import { TournamentManager } from './TournamentManager';
import { UserManager } from './UserManager';
import { BadgeManager } from './BadgeManager';
import { CategoryManager } from './CategoryManager';

export const AdminPanel: React.FC = () => {
  const { isAdmin } = useFirebase();
  const [activeTab, setActiveTab] = useState('sections');

  if (!isAdmin) {
    return <div className="p-8 text-center">Access Denied</div>;
  }

  const tabs = [
    { id: 'sections', label: 'Sections', icon: LayoutGrid },
    { id: 'categories', label: 'Categories', icon: Settings },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'fields', label: 'Fields', icon: FileText },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'badges', label: 'Badges', icon: BadgeIcon },
  ];

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-secondary border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-primary">Admin Console</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id ? 'bg-primary text-black' : 'hover:bg-white/5'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-background">
        {activeTab === 'sections' && <SectionManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'design' && <DesignManager />}
        {activeTab === 'fields' && <FieldManager />}
        {activeTab === 'tournaments' && <TournamentManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'badges' && <BadgeManager />}
      </div>
    </div>
  );
};
