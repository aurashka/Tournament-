import React, { useEffect } from 'react';
import { useFirebase } from './FirebaseContext';

export const StyleInjector: React.FC = () => {
  const { config } = useFirebase();

  useEffect(() => {
    if (config) {
      const root = document.documentElement;
      root.style.setProperty('--primary', config.colors.primary);
      root.style.setProperty('--secondary', config.colors.secondary);
      root.style.setProperty('--background', config.colors.background);
      root.style.setProperty('--text', config.colors.text);
      root.style.setProperty('--accent', config.colors.accent);
      root.style.setProperty('--card-radius', config.styles.cardRadius);
      root.style.setProperty('--font-heading', config.fonts.heading);
      root.style.setProperty('--font-body', config.fonts.body);
    }
  }, [config]);

  return null;
};
