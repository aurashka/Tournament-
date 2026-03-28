import React, { useEffect, useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Tournament } from '../types';
import { Trophy, Calendar, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const renderSection = (section: any) => {
    if (!section.visible) return null;

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
          <button className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-primary transition-all flex items-center gap-2">
            View All <ArrowRight size={14} />
          </button>
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
      className={`gaming-card group relative overflow-hidden flex ${isList ? 'flex-row h-40' : 'flex-col'} ${isSlider ? 'min-w-[300px] snap-start' : 'w-full'}`}
    >
      {/* Background Image */}
      <div className={`${isList ? 'w-1/3' : 'h-48'} relative overflow-hidden`}>
        <img 
          src={tournament.bgImage || 'https://picsum.photos/seed/pubg/800/400'} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
          tournament.status === 'active' ? 'bg-green-500 text-white' :
          tournament.status === 'ongoing' ? 'bg-primary text-black' :
          'bg-white/20 text-white'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${tournament.status === 'active' || tournament.status === 'ongoing' ? 'animate-pulse bg-current' : 'bg-current'}`} />
          {tournament.status}
        </div>
      </div>

      {/* Content */}
      <div className={`p-6 flex flex-col justify-between ${isList ? 'w-2/3' : 'flex-1'}`}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img src={tournament.logo || 'https://picsum.photos/seed/logo/100/100'} className="w-8 h-8 rounded border border-white/10" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">{tournament.game}</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{tournament.title}</h3>
        </div>

        <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Prize</span>
              <span className="text-sm font-black text-primary">{tournament.prize}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Entry</span>
              <span className="text-sm font-black">{tournament.entryFee}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Time</span>
             <span className="text-sm font-bold text-white/70">{new Date(tournament.dateTime).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
