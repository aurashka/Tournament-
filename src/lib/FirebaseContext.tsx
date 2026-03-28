import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, set, get } from 'firebase/database';
import { auth, db } from './firebase';
import { UserProfile, GlobalConfig, Section, Category, CustomField, Badge } from '../types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  config: GlobalConfig | null;
  sections: Section[];
  categories: Category[];
  fields: CustomField[];
  badges: Badge[];
  loading: boolean;
  isAdmin: boolean;
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
            primary: '#f59e0b',
            secondary: '#1f2937',
            background: '#0f172a',
            text: '#f8fafc',
            accent: '#3b82f6',
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
          styles: {
            cardRadius: '12px',
            buttonStyle: 'rounded',
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
        setSections(Object.values(data).sort((a: any, b: any) => a.order - b.order));
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

    setLoading(false);
    return () => unsubscribeAuth();
  }, []);

  const isAdmin = profile?.role === 'admin';

  return (
    <FirebaseContext.Provider value={{ user, profile, config, sections, categories, fields, badges, loading, isAdmin }}>
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
