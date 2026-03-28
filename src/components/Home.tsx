import React, { useEffect, useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Tournament, Section } from '../types';
import { Trophy, Calendar, Users, ArrowRight, Play, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player';

export const Home: React.FC = () => {
  const { sections, categories } = useFirebase();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const tRef = ref(db, 'tournaments');
    onValue(tRef, (snapshot) => {
      const data = snapshot.val();
      setTournaments(data ? Object.values(data) : []);
    });
  }, []);

  const renderSection = (section: Section) => {
    if (!section.visible) return null;

    if (section.type === 'video') {
      return (
        <section key={section.id} className="space-y-6">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-primary italic">{section.title}</h2>
          </div>
          <div className="flex overflow-x-auto pb-4 scrollbar-hide snap-x gap-6">
            {section.videoLinks?.map((video) => (
              <div key={video.id} className="min-w-[320px] md:min-w-[400px] snap-start gaming-card p-0 overflow-hidden group">
                <div className="aspect-video relative">
                  {React.createElement(ReactPlayer as any, {
                    url: video.url,
                    width: "100%",
                    height: "100%",
                    light: video.thumbnail || true,
                    playIcon: (
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/40 group-hover:scale-110 transition-transform">
                        <Play className="text-white fill-white" />
                      </div>
                    )
                  })}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-black uppercase tracking-tight line-clamp-1">{video.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    <ExternalLink size={12} />
                    <span>Watch on Platform</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    let filteredTournaments = tournaments;
    if (section.categories && section.categories.length > 0) {
      filteredTournaments = tournaments.filter(t => 
        t.categories?.some(c => section.categories.includes(c))
      );
    }

    return (
      <section key={section.id} className="space-y-6">
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-primary italic">{section.title}</h2>
            <div className="flex gap-2 mt-2">
              {section.categories?.map((cId: string) => {
                const cat = categories.find(c => c.id === cId);
                return cat ? <span key={cId} className="px-2 py-0.5 bg-white/5 text-[10px] rounded uppercase tracking-widest text-white/50">{cat.name}</span> : null;
              })}
            </div>
          </div>
          <Link to="/tournaments" className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-primary transition-all flex items-center gap-2">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className={`grid gap-6 ${
          section.layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 
          section.layout === 'list' ? 'grid-cols-1' : 
          'flex overflow-x-auto pb-4 scrollbar-hide snap-x'
        }`}>
          {filteredTournaments.map(t => (
            <TournamentCard key={t.id} tournament={t} style={section.cardStyle} layout={section.layout} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-16 py-8">
      {sections.map(renderSection)}
    </div>
  );
};

const TournamentCard: React.FC<{ tournament: Tournament; style: string; layout: string }> = ({ tournament, style, layout }) => {
  const isList = layout === 'list';
  const isSlider = layout === 'slider';

  return (
    <Link 
      to={`/tournament/${tournament.id}`}
      className={`gaming-card group relative overflow-hidden flex ${isList ? 'flex-row h-48' : 'flex-col'} ${isSlider ? 'min-w-[320px] snap-start' : 'w-full'} border-white/5 hover:border-primary/50`}
    >
      {/* Background Image */}
      <div className={`${isList ? 'w-1/3' : 'h-52'} relative overflow-hidden`}>
        <img 
          src={tournament.bgImage || 'https://picsum.photos/seed/pubg/800/400'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg ${
          tournament.status === 'active' ? 'bg-green-500 text-white' :
          tournament.status === 'ongoing' ? 'bg-primary text-white' :
          'bg-white/20 text-white'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${tournament.status === 'active' || tournament.status === 'ongoing' ? 'animate-pulse bg-current' : 'bg-current'}`} />
          {tournament.status}
        </div>
      </div>

      {/* Content */}
      <div className={`p-6 flex flex-col justify-between ${isList ? 'w-2/3' : 'flex-1'}`}>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5 p-1">
              <img src={tournament.logo || 'https://picsum.photos/seed/logo/100/100'} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">{tournament.game}</p>
              <h3 className="text-xl font-black uppercase tracking-tight leading-none line-clamp-1 group-hover:text-primary transition-colors">{tournament.title}</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Prize Pool</p>
              <p className="text-sm font-black text-accent">₹{tournament.prize}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Entry Fee</p>
              <p className="text-sm font-black">{tournament.entryFee}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 opacity-60">
            <Calendar size={14} />
            <span className="text-[10px] font-bold">{new Date(tournament.dateTime).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 opacity-60">
            <Users size={14} />
            <span className="text-[10px] font-bold">Slots: {tournament.status === 'finished' ? 'Closed' : 'Open'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
