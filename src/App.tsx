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
import { UserEdit } from './components/UserEdit';
import { Auth } from './components/Auth';
import { ProfileCompletionModal } from './components/ProfileCompletionModal';
import { HelpCenter } from './components/HelpCenter';
import { Trophy, User, LayoutGrid, Shield, Search, Menu, X, Gamepad2, LogIn, LogOut, Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth as firebaseAuth, db } from './lib/firebase';

const Navigation: React.FC = () => {
  const { user, isAdmin, profile, notifications, markNotificationAsRead } = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    if (isNotifOpen && unreadNotifs > 0) {
      notifications.forEach(notif => {
        if (!notif.read) {
          markNotificationAsRead(notif.id);
        }
      });
    }
  }, [isNotifOpen, unreadNotifs, notifications, markNotificationAsRead]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<{ tournaments: any[], players: any[] }>({ tournaments: [], players: [] });

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ tournaments: [], players: [] });
      return;
    }

    const tRef = ref(db, 'tournaments');
    const uRef = ref(db, 'users');

    onValue(tRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data).filter((t: any) => 
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.game.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(prev => ({ ...prev, tournaments: list.slice(0, 5) }));
      }
    });

    onValue(uRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data).filter((u: any) => 
          u.ign?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(prev => ({ ...prev, players: list.slice(0, 5) }));
      }
    });
  }, [searchQuery]);

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
    }
    
    if (notif.link) {
      if (notif.actionType === 'external') {
        window.open(notif.link, '_blank');
      } else {
        navigate(notif.link);
      }
    }
    setIsNotifOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: LayoutGrid },
    { to: '/tournaments', label: 'Tournaments', icon: Trophy },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Gamepad2 className="text-white w-7 h-7" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase hidden sm:block">
              Elite<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors ${location.pathname === link.to ? 'text-primary' : 'text-white/40'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-primary transition-all">
                <Search size={18} className="text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search tournaments or players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-64"
                />
              </div>

              <AnimatePresence>
                {searchQuery.trim() && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="max-h-[70vh] overflow-y-auto p-2 space-y-4">
                      {searchResults.tournaments.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/20">Tournaments</div>
                          <div className="space-y-1 mt-1">
                            {searchResults.tournaments.map(t => (
                              <Link 
                                key={t.id} 
                                to={`/tournament/${t.id}`}
                                onClick={() => setSearchQuery('')}
                                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all"
                              >
                                <img src={t.logo} className="w-8 h-8 rounded-lg object-cover" />
                                <div>
                                  <div className="text-xs font-bold">{t.title}</div>
                                  <div className="text-[9px] text-white/30 uppercase font-bold tracking-widest">{t.game}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.players.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/20">Players</div>
                          <div className="space-y-1 mt-1">
                            {searchResults.players.map(p => (
                              <Link 
                                key={p.uid} 
                                to={`/profile/${p.uid}`}
                                onClick={() => setSearchQuery('')}
                                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all"
                              >
                                <img src={p.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.uid}`} className="w-8 h-8 rounded-lg object-cover" />
                                <div>
                                  {p.nameImage ? (
                                    <img src={p.nameImage} className="h-3 object-contain" style={{ width: p.nameImageWidth ? `${p.nameImageWidth/2}px` : 'auto' }} />
                                  ) : (
                                    <div className="text-xs font-bold" style={{ color: p.style?.color }}>{p.ign}</div>
                                  )}
                                  <div className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Level {p.stats?.played || 0}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.tournaments.length === 0 && searchResults.players.length === 0 && (
                        <div className="p-8 text-center text-white/20 italic text-sm">No results found</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-3 hover:bg-white/5 rounded-2xl transition-colors md:hidden"
            >
              <Search className="w-6 h-6" />
            </button>

            {user && (
              <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-colors relative"
                >
                  <Bell className="w-6 h-6" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-[10px] flex items-center justify-center rounded-full text-white font-bold border-2 border-background">
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="fixed md:absolute right-0 top-0 md:top-auto md:mt-4 w-full h-full md:h-auto md:w-96 bg-background md:bg-secondary border-none md:border md:border-white/10 md:rounded-3xl shadow-2xl overflow-hidden z-[60] md:z-50 origin-top-right"
                    >
                      <div className="p-6 md:p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setIsNotifOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-xl">
                            <X size={24} />
                          </button>
                          <h4 className="font-black uppercase tracking-tight text-lg md:text-sm">Notifications</h4>
                        </div>
                        <span className="text-[10px] bg-primary text-black px-2 py-0.5 rounded-full font-bold">{unreadNotifs} New</span>
                      </div>
                      <div className="h-[calc(100vh-80px)] md:max-h-[70vh] overflow-y-auto pb-20 md:pb-0">
                        {notifications.length === 0 ? (
                          <div className="p-12 text-center text-white/20 italic text-sm">No notifications</div>
                        ) : (
                          notifications.sort((a, b) => b.timestamp - a.timestamp).map(notif => (
                            <div 
                              key={notif.id} 
                              className={`p-6 md:p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer ${!notif.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                              onClick={() => handleNotifClick(notif)}
                            >
                              <div className="flex gap-4">
                                <div className={`w-12 h-12 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  notif.type === 'success' ? 'bg-green-500/20 text-green-500' :
                                  notif.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                                  notif.type === 'alert' ? 'bg-red-500/20 text-red-500' :
                                  'bg-primary/20 text-primary'
                                }`}>
                                  {notif.imageUrl ? (
                                    <img src={notif.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                                  ) : (
                                    notif.type === 'success' ? <CheckCircle size={20} /> :
                                    notif.type === 'warning' ? <AlertTriangle size={20} /> :
                                    notif.type === 'alert' ? <AlertTriangle size={20} /> :
                                    <Info size={20} />
                                  )}
                                </div>
                                <div className="space-y-1 flex-1">
                                  <h5 className={`font-bold ${notif.read ? 'text-white/70' : 'text-white'} text-sm md:text-xs`}>{notif.title}</h5>
                                  <p className="text-xs md:text-[10px] text-white/50 leading-relaxed line-clamp-3 md:line-clamp-2">{notif.message}</p>
                                  <span className="text-[10px] md:text-[8px] text-white/20 font-bold uppercase tracking-widest block mt-1">
                                    {new Date(notif.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary">
                    {profile?.profileImage ? (
                      <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-bold hidden sm:block">{profile?.ign || 'Player'}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-3 hover:bg-red-500/10 text-red-500 rounded-2xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-3 hover:bg-white/5 rounded-2xl transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 p-4 md:p-6 shadow-2xl z-40"
          >
            <div className="max-w-3xl mx-auto relative space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-6 h-6" />
                <input 
                  type="text"
                  placeholder="Search tournaments or players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-primary text-lg"
                  autoFocus
                />
              </div>

              {searchQuery.trim() && (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {searchResults.tournaments.length > 0 && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Tournaments</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchResults.tournaments.map(t => (
                          <Link 
                            key={t.id} 
                            to={`/tournament/${t.id}`}
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                            className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                          >
                            <img src={t.logo} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <div className="font-bold text-sm">{t.title}</div>
                              <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{t.game}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.players.length > 0 && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Players</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchResults.players.map(p => (
                          <Link 
                            key={p.uid} 
                            to={`/profile/${p.uid}`}
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                            className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                          >
                            <img src={p.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.uid}`} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              {p.nameImage ? (
                                <img src={p.nameImage} className="h-4 object-contain" style={{ width: p.nameImageWidth ? `${p.nameImageWidth/2}px` : 'auto' }} />
                              ) : (
                                <div className="font-bold text-sm" style={{ color: p.style?.color }}>{p.ign}</div>
                              )}
                              <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Level {p.stats?.played || 0}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.tournaments.length === 0 && searchResults.players.length === 0 && (
                    <div className="p-12 text-center text-white/20 italic text-sm">No results found</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-background z-50 md:hidden"
          >
            <div className="flex flex-col h-full p-8">
              <div className="flex items-center justify-between mb-12">
                <span className="text-2xl font-black tracking-tighter uppercase">
                  Elite<span className="text-primary">Hub</span>
                </span>
                <button onClick={() => setIsMenuOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="flex flex-col gap-6">
                {navLinks.map(link => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="text-3xl font-bold hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold hover:text-primary">My Profile</Link>
              </div>

              <div className="mt-auto">
                {user ? (
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold text-xl"
                  >
                    Logout
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-4 bg-primary text-white text-center rounded-2xl font-bold text-xl"
                  >
                    Login Now
                  </Link>
                )}
              </div>
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
          <HelpCenter />
          <main className="flex-1 max-w-7xl mx-auto px-4 w-full pt-24 sm:pt-32">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tournaments" element={<TournamentList />} />
              <Route path="/tournament/:id" element={<TournamentDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:uid" element={<Profile />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/user/:uid" element={<UserEdit />} />
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
