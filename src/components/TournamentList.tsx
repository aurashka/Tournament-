import React, { useEffect, useState } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Tournament } from '../types';
import { Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TournamentList: React.FC = () => {
  const { categories } = useFirebase();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const tRef = ref(db, 'tournaments');
    onValue(tRef, (snapshot) => {
      const data = snapshot.val();
      setTournaments(data ? Object.values(data) : []);
    });
  }, []);

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.game.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.categories?.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">All Tournaments</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-secondary border border-white/10 rounded-xl pl-10 pr-4 py-2 w-full md:w-64"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedCategory === 'all' ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat.id ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map(t => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>
      
      {filteredTournaments.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
            <Filter size={40} />
          </div>
          <p className="text-white/30 font-bold uppercase tracking-widest">No tournaments found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
  return (
    <Link 
      to={`/tournament/${tournament.id}`}
      className="gaming-card group relative overflow-hidden flex flex-col w-full"
    >
      <div className="h-48 relative overflow-hidden">
        <img 
          src={tournament.bgImage || 'https://picsum.photos/seed/pubg/800/400'} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
          tournament.status === 'active' ? 'bg-green-500 text-white' :
          tournament.status === 'ongoing' ? 'bg-primary text-black' :
          'bg-white/20 text-white'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${tournament.status === 'active' || tournament.status === 'ongoing' ? 'animate-pulse bg-current' : 'bg-current'}`} />
          {tournament.status}
        </div>
      </div>

      <div className="p-6 flex flex-col justify-between flex-1">
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
