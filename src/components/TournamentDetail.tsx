import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, onValue, push, set, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { Tournament, Comment, Application } from '../types';
import { Trophy, Calendar, Users, MessageSquare, Share2, Play, Info, Shield, CheckCircle, XCircle, User, Edit2, Trash2, Heart, Reply, ChevronDown, ChevronUp, Search, ThumbsUp, Pin, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export const TournamentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, fields, badges } = useFirebase();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationData, setApplicationData] = useState<Record<string, any>>({});
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [commentSort, setCommentSort] = useState<'newest' | 'oldest' | 'likes'>('newest');
  const [commentLimit, setCommentLimit] = useState(5);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const tRef = ref(db, `tournaments/${id}`);
    onValue(tRef, (snapshot) => {
      setTournament(snapshot.val());
    });

    const cRef = ref(db, `comments/${id}`);
    onValue(cRef, (snapshot) => {
      const data = snapshot.val();
      setComments(data ? (Object.values(data) as Comment[]) : []);
    });

    const aRef = ref(db, `applications`);
    onValue(aRef, (snapshot) => {
      const data = snapshot.val();
      const tournamentApps = data ? Object.values(data).filter((a: any) => a.tournamentId === id) : [];
      setApplications(tournamentApps as Application[]);
    });

    const uRef = ref(db, 'users');
    onValue(uRef, (snapshot) => {
      const data = snapshot.val();
      setAllUsers(data ? Object.values(data) : []);
    });
  }, [id]);

  const handleComment = async (parentId?: string) => {
    if (!user || !newComment || !id) return;
    const newRef = push(ref(db, `comments/${id}`));
    
    // Simple mention extraction
    const mentions = newComment.match(/@\w+/g)?.map(m => m.slice(1)) || [];
    const mentionIds = allUsers.filter(u => mentions.includes(u.ign)).map(u => u.uid);

    await set(newRef, {
      id: newRef.key,
      tournamentId: id,
      userId: user.uid,
      text: newComment,
      timestamp: Date.now(),
      likes: {},
      parentId: parentId || null,
      mentions: mentionIds
    });
    setNewComment('');
    setReplyTo(null);
  };

  const handleLike = async (commentId: string, currentLikes: Record<string, boolean> = {}) => {
    if (!user || !id) return;
    const likes = { ...currentLikes };
    if (likes[user.uid]) {
      delete likes[user.uid];
    } else {
      likes[user.uid] = true;
    }
    await update(ref(db, `comments/${id}/${commentId}`), { likes });
  };

  const handleApply = async () => {
    if (!user || !id) return;
    const newRef = push(ref(db, 'applications'));
    await set(newRef, {
      id: newRef.key,
      tournamentId: id,
      userId: user.uid,
      userIgn: profile?.ign || 'Unknown',
      status: 'pending',
      details: applicationData,
      submittedAt: new Date().toISOString(),
    });
    setIsApplying(false);
    setApplicationData({});
  };

  if (!tournament) return <div className="p-8 text-center">Loading...</div>;

  const userApplication = applications.find(a => a.userId === user?.uid && a.tournamentId === id);
  const tournamentFields = fields.filter(f => f.target === 'tournament_form');

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <div className="relative h-[250px] md:h-[400px] rounded-3xl overflow-hidden">
        <img src={tournament.bgImage || 'https://picsum.photos/seed/game/1920/1080'} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <img src={tournament.logo || 'https://picsum.photos/seed/logo/200/200'} className="w-16 h-16 md:w-24 md:h-24 rounded-2xl border-4 border-white/10 shadow-2xl" />
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary text-black text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full">{tournament.game}</span>
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/10 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full">{tournament.status}</span>
              </div>
              <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter italic text-white drop-shadow-lg">{tournament.title}</h1>
            </div>
          </div>
          <div className="flex gap-2 md:gap-4">
            <button className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Share2 size={20} /></button>
            {tournament.joinSystem === 'external' ? (
              <a href={tournament.externalLink} target="_blank" className="btn-primary flex items-center gap-2 px-8 py-4 text-lg">
                Join Now <Play size={20} />
              </a>
            ) : (
              userApplication ? (
                <div className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 ${
                  userApplication.status === 'approved' ? 'bg-green-500 text-white' :
                  userApplication.status === 'rejected' ? 'bg-red-500 text-white' :
                  'bg-white/10 text-white'
                }`}>
                  {userApplication.status === 'approved' ? <CheckCircle size={20} /> : 
                   userApplication.status === 'rejected' ? <XCircle size={20} /> : 
                   <Info size={20} />}
                  {userApplication.status}
                </div>
              ) : (
                <button onClick={() => setIsApplying(true)} className="btn-primary flex items-center gap-2 px-8 py-4 text-lg">
                  Join Now <Play size={20} />
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Rules */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Prize Pool', value: tournament.prize, icon: Trophy },
              { label: 'Entry Fee', value: tournament.entryFee, icon: Shield },
              { label: 'Date', value: new Date(tournament.dateTime).toLocaleDateString(), icon: Calendar },
              { label: 'Players', value: applications.filter(a => a.status === 'approved').length, icon: Users },
            ].map((stat, i) => (
              <div key={i} className="bg-secondary p-3 md:p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <stat.icon className="text-primary mb-1 md:mb-2" size={typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 20} />
                <span className="text-[8px] md:text-[10px] text-white/30 uppercase font-bold tracking-widest">{stat.label}</span>
                <span className="text-sm md:text-lg font-black">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div className="bg-secondary p-4 md:p-8 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <Info className="text-primary" size={20} /> Rules & Description
            </h2>
            <div className="prose prose-invert max-w-none text-white/70 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
              {tournament.rules}
            </div>
          </div>

          {/* Slot Progress Bar */}
          {tournament.totalSlots && (
            <div className="bg-secondary p-4 md:p-8 rounded-3xl border border-white/5 space-y-4">
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Users className="text-primary" size={20} /> Slots Availability
                </h2>
                <div className="text-right">
                  <span className="text-xl md:text-2xl font-black text-primary">{tournament.filledSlots || 0}</span>
                  <span className="text-white/30 font-bold text-sm md:text-base"> / {tournament.totalSlots}</span>
                </div>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((tournament.filledSlots || 0) / tournament.totalSlots) * 100)}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-center">
                {tournament.totalSlots - (tournament.filledSlots || 0)} Slots remaining - Join before it's full!
              </p>
            </div>
          )}

          {/* Custom Details */}
          {tournament.customFields && Object.keys(tournament.customFields).length > 0 && (
            <div className="bg-secondary p-8 rounded-3xl border border-white/5 space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Shield className="text-primary" /> Tournament Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(tournament.customFields).map(([key, value]) => (
                  <div key={key} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">{key}</span>
                    <span className="text-lg font-bold text-white/90">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Stream */}
          {tournament.liveUrl && (
            <div className="bg-secondary p-8 rounded-3xl border border-white/5 space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Play className="text-primary" /> Live Stream
              </h2>
              <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${tournament.liveUrl.split('v=')[1] || tournament.liveUrl.split('/').pop()}?autoplay=${tournament.autoplayLive ? 1 : 0}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Participants & Host */}
        <div className="space-y-8">
          {/* Host Info */}
          {tournament.hostId && <HostCard hostId={tournament.hostId} />}

          <div className="bg-secondary p-6 md:p-8 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Users className="text-primary" /> Participants
            </h2>
            <div className="space-y-4">
              <div className="flex items-center -space-x-3 overflow-hidden">
                {applications.filter(a => a.status === 'approved').slice(0, 6).map((app, i) => (
                  <img 
                    key={app.id}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.userId}`} 
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-secondary object-cover"
                    title={app.userIgn}
                  />
                ))}
                {applications.filter(a => a.status === 'approved').length > 6 && (
                  <button 
                    onClick={() => setShowAllParticipants(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-2 ring-secondary text-[10px] font-bold text-primary hover:bg-white/10 transition-all"
                  >
                    +{applications.filter(a => a.status === 'approved').length - 6}
                  </button>
                )}
              </div>
              
              {applications.filter(a => a.status === 'approved').length > 0 ? (
                <button 
                  onClick={() => setShowAllParticipants(true)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-all"
                >
                  <Users size={12} /> View Full Member List
                </button>
              ) : (
                <p className="text-center text-white/30 py-4 text-xs italic">No participants yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Discussion Section at Bottom */}
      <div className="bg-secondary p-4 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 space-y-6 md:space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3 md:gap-4">
            <MessageSquare className="text-primary w-6 h-6 md:w-10 md:h-10" /> Community <span className="text-primary">Chat</span>
          </h2>
          
          <div className="flex items-center gap-2 bg-background/50 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => {
                const sorts: ('newest' | 'oldest' | 'likes')[] = ['newest', 'oldest', 'likes'];
                const next = sorts[(sorts.indexOf(commentSort) + 1) % sorts.length];
                setCommentSort(next);
              }}
              className="p-2 md:p-3 hover:bg-white/5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-primary"
              title={`Sort by: ${commentSort}`}
            >
              <Filter size={16} />
              <span className="hidden md:inline">{commentSort}</span>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Comment Input */}
          <div className="flex gap-3 md:gap-6 bg-white/5 p-4 md:p-6 rounded-2xl border border-white/5 relative group/input">
            <img src={profile?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} className="w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-primary/20" />
            <div className="flex-1 space-y-3">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={e => {
                    const val = e.target.value;
                    setNewComment(val);
                    const lastWord = val.split(/\s/).pop();
                    if (lastWord?.startsWith('@')) {
                      setMentionSearch(lastWord.slice(1));
                      setShowMentionList(true);
                    } else {
                      setShowMentionList(false);
                    }
                  }}
                  placeholder={replyTo ? "Write a reply..." : "Join the discussion..."}
                  className="w-full bg-background/30 border-b-2 border-white/10 focus:border-primary p-2 md:p-3 h-12 md:h-16 focus:h-24 md:focus:h-32 transition-all outline-none text-xs md:text-sm resize-none scrollbar-hide"
                />
                
                {/* Mention List Dropdown */}
                <AnimatePresence>
                  {showMentionList && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 w-64 bg-secondary border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
                        <Search size={12} className="text-white/30" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Mention Player</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {allUsers.filter(u => u.ign?.toLowerCase().includes(mentionSearch.toLowerCase())).map(u => (
                          <button
                            key={u.uid}
                            onClick={() => {
                              const words = newComment.split(/\s/);
                              words.pop();
                              setNewComment([...words, `@${u.ign} `].join(' '));
                              setShowMentionList(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-primary hover:text-black transition-all text-left"
                          >
                            <img src={u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} className="w-6 h-6 rounded-lg" />
                            <span className="text-xs font-bold">{u.ign}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-end items-center gap-3">
                {replyTo && (
                  <button onClick={() => setReplyTo(null)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
                )}
                <button 
                  onClick={() => handleComment(replyTo || undefined)} 
                  disabled={!newComment.trim()}
                  className="btn-primary px-6 py-2 text-[10px] shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replyTo ? 'Reply' : 'Comment'}
                </button>
              </div>
            </div>
          </div>

          {/* Comment List */}
          <div className="space-y-6 pt-10">
            {comments
              .filter(c => !c.parentId)
              .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                if (commentSort === 'newest') return b.timestamp - a.timestamp;
                if (commentSort === 'oldest') return a.timestamp - b.timestamp;
                return (Object.keys(b.likes || {}).length) - (Object.keys(a.likes || {}).length);
              })
              .slice(0, commentLimit)
              .map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  replies={comments.filter(r => r.parentId === comment.id)}
                  onReply={() => {
                    setReplyTo(comment.id);
                    const el = document.querySelector('.bg-secondary.p-4.md\\:p-12');
                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
                  }}
                  onLike={() => handleLike(comment.id, comment.likes)}
                  handleLike={handleLike}
                  allUsers={allUsers}
                />
              ))}
            
            {comments.filter(c => !c.parentId).length > commentLimit && (
              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setCommentLimit(prev => prev + 5)}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary transition-all border border-white/5"
                >
                  Load More Comments
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participants Modal */}
      <AnimatePresence>
        {showAllParticipants && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-[100]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-secondary w-full max-w-2xl rounded-[2.5rem] border border-white/10 p-10 space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic">Joined <span className="text-primary">Members</span></h3>
                <button onClick={() => setShowAllParticipants(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-all"><XCircle size={28} /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
                {applications.filter(a => a.status === 'approved').map(app => (
                  <ParticipantItem key={app.id} userId={app.userId} />
                ))}
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Total Participants: {applications.filter(a => a.status === 'approved').length}</span>
                <button onClick={() => setShowAllParticipants(false)} className="btn-primary px-8">Close List</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Application Modal */}
      <AnimatePresence>
        {isApplying && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-[100]">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-secondary w-full max-w-xl rounded-[3rem] border border-white/10 p-12 space-y-10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
              
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic">Join <span className="text-primary">Tournament</span></h3>
                  <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em]">Please fill in the required details to register</p>
                </div>
                <button onClick={() => setIsApplying(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-all"><XCircle size={28} /></button>
              </div>
              
              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4 no-scrollbar">
                {tournamentFields.map(field => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">
                      {field.label} {field.required && <span className="text-primary">*</span>}
                    </label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        required={field.required}
                        placeholder={`Enter ${field.label}`}
                        onChange={e => setApplicationData({ ...applicationData, [field.id]: e.target.value })}
                        className="w-full bg-background/50 border border-white/10 rounded-2xl p-4 focus:border-primary transition-all outline-none"
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        required={field.required}
                        placeholder="0"
                        onChange={e => setApplicationData({ ...applicationData, [field.id]: e.target.value })}
                        className="w-full bg-background/50 border border-white/10 rounded-2xl p-4 focus:border-primary transition-all outline-none"
                      />
                    )}
                    {field.type === 'dropdown' && (
                      <select
                        required={field.required}
                        onChange={e => setApplicationData({ ...applicationData, [field.id]: e.target.value })}
                        className="w-full bg-background/50 border border-white/10 rounded-2xl p-4 focus:border-primary transition-all outline-none appearance-none"
                      >
                        <option value="">Select option</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Info size={16} className="text-primary shrink-0" />
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold tracking-wider">
                    By submitting, you agree to follow the tournament rules and maintain fair play.
                  </p>
                </div>
                <button 
                  onClick={handleApply} 
                  className="w-full btn-primary py-5 text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Confirm Registration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CommentItem: React.FC<{ 
  comment: Comment; 
  replies?: Comment[]; 
  onReply: () => void;
  onLike: () => void;
  handleLike: (commentId: string, currentLikes?: Record<string, boolean>) => Promise<void>;
  allUsers: any[];
}> = ({ comment, replies = [], onReply, onLike, handleLike, allUsers }) => {
  const [author, setAuthor] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [showReplies, setShowReplies] = useState(false);
  const { badges, profile, user } = useFirebase();
  const isAdmin = profile?.role === 'admin';
  const isLiked = user && comment.likes?.[user.uid];

  useEffect(() => {
    const uRef = ref(db, `users/${comment.userId}`);
    onValue(uRef, (snapshot) => {
      setAuthor(snapshot.val());
    });
  }, [comment.userId]);

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    await update(ref(db, `comments/${comment.tournamentId}/${comment.id}`), { text: editText });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Delete this comment?')) {
      await set(ref(db, `comments/${comment.tournamentId}/${comment.id}`), null);
    }
  };

  const handlePin = async () => {
    await update(ref(db, `comments/${comment.tournamentId}/${comment.id}`), { isPinned: !comment.isPinned });
  };

  if (!author) return null;

  const renderText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const ign = part.slice(1);
        const mentionedUser = allUsers.find(u => u.ign === ign);
        return (
          <Link 
            key={i} 
            to={`/profile/${mentionedUser?.uid || ign}`}
            className="inline-flex items-center gap-1 text-primary font-bold hover:underline transition-all align-middle"
          >
            {mentionedUser?.nameImage ? (
              <img 
                src={mentionedUser.nameImage} 
                alt={ign} 
                className="h-3 object-contain" 
                style={{ width: mentionedUser.nameImageWidth ? `${mentionedUser.nameImageWidth/2}px` : 'auto' }}
              />
            ) : (
              <span style={{ color: mentionedUser?.style?.color }}>{part}</span>
            )}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2">
      {comment.isPinned && (
        <div className="flex items-center gap-2 ml-10 mb-1">
          <Pin size={10} className="text-primary fill-primary" />
          <span className="text-[8px] font-black uppercase tracking-widest text-primary">Pinned by Host</span>
        </div>
      )}
      <div className="flex gap-2 group relative">
        <Link to={`/profile/${author.uid}`} className="shrink-0">
          <img src={author.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.uid}`} className="w-8 h-8 rounded-full border border-white/5 shadow-md" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Link to={`/profile/${author.uid}`} className="flex items-center gap-2">
              {author.nameImage ? (
                <img 
                  src={author.nameImage} 
                  alt={author.ign} 
                  className="h-4 object-contain" 
                  style={{ width: author.nameImageWidth ? `${author.nameImageWidth}px` : 'auto' }}
                />
              ) : (
                <span className="font-bold text-[11px] uppercase tracking-tight" style={{ color: author.style?.color, fontSize: author.style?.fontSize, fontWeight: author.style?.fontWeight }}>
                  {author.ign}
                </span>
              )}
            </Link>
            <div className="flex gap-0.5">
              {author.badges?.map((bId: string) => {
                const badge = badges.find(b => b.id === bId);
                return badge ? (
                  <div key={bId} className="relative group/badge">
                    <img src={badge.imageUrl} className="w-2.5 h-2.5 object-contain cursor-help" />
                    {badge.detail && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-black/90 text-[8px] text-white rounded-lg opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10">
                        {badge.detail}
                      </div>
                    )}
                  </div>
                ) : null;
              })}
            </div>
            <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{formatDistanceToNow(comment.timestamp)} ago</span>
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-1">
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-xl p-2 text-[11px] outline-none focus:border-primary transition-all resize-none h-16"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/30">Cancel</button>
                <button onClick={handleUpdate} className="px-2 py-1 bg-primary text-black rounded-lg text-[9px] font-black uppercase tracking-widest">Save</button>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-white/80 leading-snug break-words">
              {renderText(comment.text)}
            </div>
          )}

          <div className="flex items-center gap-3 mt-1">
            <button 
              onClick={onLike}
              className={`flex items-center gap-1 transition-all ${isLiked ? 'text-primary' : 'text-white/30 hover:text-white'}`}
            >
              <ThumbsUp size={10} className={isLiked ? 'fill-primary' : ''} />
              <span className="text-[9px] font-bold">{Object.keys(comment.likes || {}).length || ''}</span>
            </button>
            <button 
              onClick={onReply}
              className="text-[9px] font-bold text-white/30 hover:text-white uppercase tracking-widest"
            >
              Reply
            </button>
            
            {(isAdmin || user?.uid === comment.userId) && !isEditing && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                {isAdmin && !comment.parentId && (
                  <button onClick={handlePin} className={`p-1 rounded transition-all ${comment.isPinned ? 'text-primary bg-primary/10' : 'text-white/20 hover:text-primary'}`}>
                    <Pin size={8} className={comment.isPinned ? 'fill-primary' : ''} />
                  </button>
                )}
                <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-white/5 rounded text-white/20 hover:text-white"><Edit2 size={8} /></button>
                <button onClick={handleDelete} className="p-1 hover:bg-red-500/10 rounded text-white/20 hover:text-red-500"><Trash2 size={8} /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-8 space-y-2 border-l border-white/5 pl-3">
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-widest"
          >
            {showReplies ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
            {showReplies ? 'Hide' : `Show ${replies.length}`} Replies
          </button>
          
          <AnimatePresence>
            {showReplies && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {replies.map(reply => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    onReply={onReply}
                    onLike={() => handleLike(reply.id, reply.likes)}
                    handleLike={handleLike}
                    allUsers={allUsers}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const HostCard: React.FC<{ hostId: string }> = ({ hostId }) => {
  const [host, setHost] = useState<any>(null);
  const { badges } = useFirebase();

  useEffect(() => {
    const hRef = ref(db, `users/${hostId}`);
    onValue(hRef, (snapshot) => {
      setHost(snapshot.val());
    });
  }, [hostId]);

  if (!host) return null;

  return (
    <div className="bg-secondary p-8 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
        <User className="text-primary" /> Tournament Host
      </h2>
      <Link to={`/profile/${host.uid}`} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
        <img src={host.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.uid}`} className="w-16 h-16 rounded-2xl border-2 border-white/10 group-hover:scale-105 transition-transform" />
        <div>
          <span className="text-lg font-black block" style={{ color: host.style?.color }}>{host.ign}</span>
          <div className="flex gap-1 mb-1">
            {host.badges?.map((bId: string) => {
              const badge = badges.find(b => b.id === bId);
              return badge ? <img key={bId} src={badge.imageUrl} className="w-4 h-4 object-contain" title={badge.name} /> : null;
            })}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">View Profile</span>
        </div>
      </Link>
    </div>
  );
};

const ParticipantItem: React.FC<{ userId: string }> = ({ userId }) => {
  const [author, setAuthor] = useState<any>(null);
  const { badges } = useFirebase();

  useEffect(() => {
    const uRef = ref(db, `users/${userId}`);
    onValue(uRef, (snapshot) => {
      setAuthor(snapshot.val());
    });
  }, [userId]);

  if (!author) return null;

  return (
    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-2">
        <img src={author.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.uid}`} className="w-6 h-6 rounded-full" />
        <div>
          <span className="text-xs font-bold block leading-none" style={{ color: author.style?.color }}>{author.ign}</span>
          <div className="flex gap-0.5 mt-0.5">
            {author.badges?.map((bId: string) => {
              const badge = badges.find(b => b.id === bId);
              return badge ? <img key={bId} src={badge.imageUrl} className="w-2.5 h-2.5 object-contain" title={badge.name} /> : null;
            })}
          </div>
        </div>
      </div>
      <div className="text-[8px] font-black uppercase tracking-widest text-primary/50">Verified</div>
    </div>
  );
};
