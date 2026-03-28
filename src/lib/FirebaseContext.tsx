import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, set, get, update } from 'firebase/database';
import { auth, db } from './firebase';
import { UserProfile, GlobalConfig, Section, Category, CustomField, Badge, Notification, ChatMessage } from '../types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  config: GlobalConfig | null;
  sections: Section[];
  categories: Category[];
  fields: CustomField[];
  badges: Badge[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  tournaments: any[];
  loading: boolean;
  isAdmin: boolean;
  markNotificationAsRead: (id: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const profileRef = ref(db, `users/${u.uid}`);
        onValue(profileRef, (snapshot) => {
          setProfile(snapshot.val());
        });
      } else {
        setProfile(null);
      }
    });

    // Load Config
    const configRef = ref(db, 'config');
    onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.val());
      } else {
        // Default config
        const defaultConfig: GlobalConfig = {
          colors: {
            primary: '#2196F3', // Material 3 Blue
            secondary: '#1e293b',
            background: '#0f172a',
            text: '#f8fafc',
            accent: '#f59e0b',
            surface: 'rgba(30, 41, 59, 0.7)', // Semi-transparent surface
          },
          fonts: {
            heading: 'Outfit',
            body: 'Inter',
          },
          styles: {
            cardRadius: '24px', // Material 3 corners
            buttonStyle: 'pill',
            blurIntensity: '16px',
            spacingScale: '0.9', // Reduced from 1.2 to fix "zoomed" feel
          },
        };
        set(configRef, defaultConfig);
        setConfig(defaultConfig);
      }
    });

    // Load Sections
    const sectionsRef = ref(db, 'sections');
    onValue(sectionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSections((Object.values(data) as Section[]).sort((a, b) => a.order - b.order));
      } else {
        setSections([]);
      }
    });

    // Load Categories
    const categoriesRef = ref(db, 'categories');
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      setCategories(data ? Object.values(data) : []);
    });

    // Load Fields
    const fieldsRef = ref(db, 'fields');
    onValue(fieldsRef, (snapshot) => {
      const data = snapshot.val();
      setFields(data ? Object.values(data) : []);
    });

    // Load Badges
    const badgesRef = ref(db, 'badges');
    onValue(badgesRef, (snapshot) => {
      const data = snapshot.val();
      setBadges(data ? Object.values(data) : []);
    });

    // Load Notifications
    const notificationsRef = ref(db, 'notifications');
    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      setNotifications(data ? Object.values(data) : []);
    });

    // Load Chat Messages
    const chatRef = ref(db, 'chatMessages');
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      setChatMessages(data ? Object.values(data) : []);
    });

    // Load Tournaments
    const tournamentsRef = ref(db, 'tournaments');
    onValue(tournamentsRef, (snapshot) => {
      const data = snapshot.val();
      setTournaments(data ? Object.values(data) : []);
    });

    setLoading(false);
    return () => unsubscribeAuth();
  }, []);

  const isAdmin = profile?.role === 'admin';

  const markNotificationAsRead = async (id: string) => {
    await update(ref(db, `notifications/${id}`), { read: true });
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      profile, 
      config, 
      sections, 
      categories, 
      fields, 
      badges, 
      notifications, 
      chatMessages, 
      tournaments,
      loading, 
      isAdmin,
      markNotificationAsRead
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
