import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, onValue, push, set, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { Tournament, Comment, Application } from '../types';
import { Trophy, Calendar, Users, MessageSquare, Share2, Play, Info, Shield, CheckCircle, XCircle, User, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export const TournamentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, fields } = useFirebase();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationData, setApplicationData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!id) return;

    const tRef = ref(db, `tournaments/${id}`);
    onValue(tRef, (snapshot) => {
      setTournament(snapshot.val());
    });

    const cRef = ref(db, `comments/${id}`);
    onValue(cRef, (snapshot) => {
      const data = snapshot.val();
      setComments(data ? (Object.values(data) as Comment[]).sort((a, b) => b.timestamp - a.timestamp) : []);
    });

    const aRef = ref(db, `applications/${id}`);
    onValue(aRef, (snapshot) => {
      const data = snapshot.val();
      setApplications(data ? Object.values(data) : []);
    });
  }, [id]);

  const handleComment = async () => {
    if (!user || !newComment || !id) return;
    const newRef = push(ref(db, `comments/${id}`));
    await set(newRef, {
      id: newRef.key,
      tournamentId: id,
      userId: user.uid,
      text: newComment,
      timestamp: Date.now(),
      likes: {},
    });
    setNewComment('');
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
      <div className="relative h-[400px] rounded-3xl overflow-hidden">
        <img src={tournament.bgImage || 'https://picsum.photos/seed/game/1920/1080'} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
          <div className="flex items-center gap-6">
            <img src={tournament.logo || 'https://picsum.photos/seed/logo/200/200'} className="w-24 h-24 rounded-2xl border-4 border-white/10 shadow-2xl" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full">{tournament.game}</span>
                <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{tournament.status}</span>
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter italic text-white drop-shadow-lg">{tournament.title}</h1>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Share2 size={24} /></button>
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
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Prize Pool', value: tournament.prize, icon: Trophy },
              { label: 'Entry Fee', value: tournament.entryFee, icon: Shield },
              { label: 'Date', value: new Date(tournament.dateTime).toLocaleDateString(), icon: Calendar },
              { label: 'Players', value: applications.filter(a => a.status === 'approved').length, icon: Users },
            ].map((stat, i) => (
              <div key={i} className="bg-secondary p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <stat.icon className="text-primary mb-2" size={20} />
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{stat.label}</span>
                <span className="text-lg font-black">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div className="bg-secondary p-8 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <Info className="text-primary" /> Rules & Description
            </h2>
            <div className="prose prose-invert max-w-none text-white/70 whitespace-pre-wrap leading-relaxed">
              {tournament.rules}
            </div>
          </div>

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

          {/* Comments */}
          <div className="bg-secondary p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <MessageSquare className="text-primary" /> Discussion
            </h2>
            
            <div className="flex gap-4">
              <img src={profile?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Join the discussion..."
                  className="w-full bg-background border border-white/10 rounded-xl p-4 h-24 focus:border-primary transition-all outline-none"
                />
                <div className="flex justify-end">
                  <button onClick={handleComment} className="btn-primary">Post Comment</button>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Participants & Host */}
        <div className="space-y-8">
          {/* Host Info */}
          {tournament.hostId && <HostCard hostId={tournament.hostId} />}

          <div className="bg-secondary p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Users className="text-primary" /> Participants
            </h2>
            <div className="space-y-4">
              {applications.filter(a => a.status === 'approved').map(app => (
                <ParticipantItem key={app.id} userId={app.userId} />
              ))}
              {applications.filter(a => a.status === 'approved').length === 0 && (
                <p className="text-center text-white/30 py-8 text-sm italic">No participants yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isApplying && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-secondary w-full max-w-lg rounded-3xl border border-white/10 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tight">Join Tournament</h3>
              <button onClick={() => setIsApplying(false)} className="p-2 hover:bg-white/5 rounded-lg"><XCircle size={24} /></button>
            </div>
            
            <div className="space-y-4">
              {tournamentFields.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium mb-1">{field.label} {field.required && '*'}</label>
                  {field.type === 'text' && (
                    <input
                      type="text"
                      required={field.required}
                      onChange={e => setApplicationData({ ...applicationData, [field.id]: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl p-3"
                    />
                  )}
                  {field.type === 'number' && (
                    <input
                      type="number"
                      required={field.required}
                      onChange={e => setApplicationData({ ...applicationData, [field.id]: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl p-3"
                    />
                  )}
                  {field.type === 'dropdown' && (
                    <select
                      required={field.required}
                      onChange={e => setApplicationData({ ...applicationData, [field.id]: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl p-3"
                    >
                      <option value="">Select option</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>

            <button onClick={handleApply} className="w-full btn-primary py-4 text-lg font-black uppercase tracking-widest">
              Submit Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
  const [author, setAuthor] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const { badges, profile } = useFirebase();
  const isAdmin = profile?.role === 'admin';

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

  if (!author) return null;

  const renderText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-primary font-bold">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="flex gap-4 group relative">
      <img src={author.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.uid}`} className="w-10 h-10 rounded-full border-2 border-white/5" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: author.style?.color, fontSize: author.style?.fontSize, fontWeight: author.style?.fontWeight }}>
              {author.ign}
            </span>
            <div className="flex gap-1">
              {author.badges?.map((bId: string) => {
                const badge = badges.find(b => b.id === bId);
                return badge ? <img key={bId} src={badge.imageUrl} className="w-3.5 h-3.5 object-contain" title={badge.name} /> : null;
              })}
            </div>
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{formatDistanceToNow(comment.timestamp)} ago</span>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setIsEditing(!isEditing)} className="p-1 hover:text-primary"><Edit2 size={14} /></button>
              <button onClick={handleDelete} className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2 mt-2">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-lg p-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="text-xs px-2 py-1">Cancel</button>
              <button onClick={handleUpdate} className="text-xs px-2 py-1 bg-primary text-black rounded">Save</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/80 leading-relaxed">{renderText(comment.text)}</p>
        )}
      </div>
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
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-3">
        <img src={author.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.uid}`} className="w-8 h-8 rounded-full" />
        <div>
          <span className="text-sm font-bold block" style={{ color: author.style?.color }}>{author.ign}</span>
          <div className="flex gap-1">
            {author.badges?.map((bId: string) => {
              const badge = badges.find(b => b.id === bId);
              return badge ? <img key={bId} src={badge.imageUrl} className="w-3 h-3 object-contain" title={badge.name} /> : null;
            })}
          </div>
        </div>
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-primary/50">Verified</div>
    </div>
  );
};
