/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { FirebaseProvider, useFirebase } from './lib/FirebaseContext';
import { StyleInjector } from './lib/StyleInjector';
import { Home } from './components/Home';
import { TournamentList } from './components/TournamentList';
import { TournamentDetail } from './components/TournamentDetail';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { Auth } from './components/Auth';
import { ProfileCompletionModal } from './components/ProfileCompletionModal';
import { Trophy, User, LayoutGrid, Shield, Search, Menu, X, Gamepad2, LogIn, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'firebase/auth';
import { auth as firebaseAuth } from './lib/firebase';

const Navigation: React.FC = () => {
  const { user, isAdmin, profile } = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: LayoutGrid },
    { to: '/tournaments', label: 'Tournaments', icon: Trophy },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Gamepad2 size={24} />
          </div>
          <span className="text-xl font-black uppercase tracking-tighter italic text-white group-hover:text-primary transition-colors">Elite Hub</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                location.pathname === link.to ? 'text-primary' : 'text-white/40 hover:text-white'
              }`}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/tournaments" className="p-2 text-white/40 hover:text-white transition-all"><Search size={20} /></Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-1.5 pr-4 rounded-full border border-white/5 transition-all group">
                <img src={profile?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-8 h-8 rounded-full border border-white/10 group-hover:border-primary transition-all" />
                <span className="text-xs font-black uppercase tracking-widest text-white/70 group-hover:text-white">{profile?.ign || 'Profile'}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="hidden md:flex p-2 text-white/40 hover:text-red-500 transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary flex items-center gap-2 px-6 py-2.5 text-xs">
              <LogIn size={16} /> Login
            </Link>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-white/40 hover:text-white"><Menu size={24} /></button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-secondary border-b border-white/5 p-8 md:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-black uppercase tracking-widest text-white/70 hover:text-primary transition-all flex items-center gap-4"
                >
                  <link.icon size={24} />
                  {link.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-lg font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-all flex items-center gap-4 border-t border-white/5 pt-6"
                >
                  <LogOut size={24} />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  return (
    <FirebaseProvider>
      <StyleInjector />
      <ProfileCompletionModal />
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1 max-w-7xl mx-auto px-4 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tournaments" element={<TournamentList />} />
              <Route path="/tournament/:id" element={<TournamentDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
            </Routes>
          </main>
          
          <footer className="bg-secondary/50 border-t border-white/5 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20">
                  <Gamepad2 size={24} />
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Elite Tournament Hub © 2026</p>
              <div className="flex justify-center gap-8">
                {['Terms', 'Privacy', 'Support', 'Discord'].map(link => (
                  <button key={link} className="text-[10px] font-bold uppercase tracking-widest text-white/10 hover:text-primary transition-all">{link}</button>
                ))}
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </FirebaseProvider>
  );
}
