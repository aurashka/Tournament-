import React from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { GlobalConfig } from '../types';

export const DesignManager: React.FC = () => {
  const { config } = useFirebase();

  if (!config) return null;

  const handleUpdate = async (path: string, value: string) => {
    await update(ref(db, `config/${path}`), { [path.split('/').pop()!]: value });
  };

  const handleColorChange = async (key: keyof GlobalConfig['colors'], value: string) => {
    await update(ref(db, 'config/colors'), { [key]: value });
  };

  const handleStyleChange = async (key: keyof GlobalConfig['styles'], value: string) => {
    await update(ref(db, 'config/styles'), { [key]: value });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Global Design Control</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Colors */}
        <div className="bg-secondary p-6 rounded-xl border border-white/10 space-y-6">
          <h3 className="text-lg font-bold border-b border-white/10 pb-2">Colors</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(config.colors).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize">{key}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={e => handleColorChange(key as any, e.target.value)}
                    className="w-10 h-10 rounded-lg bg-background border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={e => handleColorChange(key as any, e.target.value)}
                    className="flex-1 bg-background border border-white/10 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Styles & Fonts */}
        <div className="bg-secondary p-6 rounded-xl border border-white/10 space-y-6">
          <h3 className="text-lg font-bold border-b border-white/10 pb-2">Styles & Fonts</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Card Border Radius</label>
              <input
                type="text"
                value={config.styles.cardRadius}
                onChange={e => handleStyleChange('cardRadius', e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
                placeholder="e.g. 12px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Style</label>
              <select
                value={config.styles.buttonStyle}
                onChange={e => handleStyleChange('buttonStyle', e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
              >
                <option value="rounded">Rounded</option>
                <option value="sharp">Sharp</option>
                <option value="pill">Pill</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Heading Font</label>
              <input
                type="text"
                value={config.fonts.heading}
                onChange={e => update(ref(db, 'config/fonts'), { heading: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
                placeholder="e.g. Inter, Orbitron"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Body Font</label>
              <input
                type="text"
                value={config.fonts.body}
                onChange={e => update(ref(db, 'config/fonts'), { body: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-lg p-2"
                placeholder="e.g. Inter, Roboto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
