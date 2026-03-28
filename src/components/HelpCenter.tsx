import React, { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, push, set, update, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { ChatMessage, ChatSession } from '../types';
import { Send, MessageCircle, X, CheckCheck, HelpCircle } from 'lucide-react';

export const HelpCenter: React.FC = () => {
  const { user, profile, chatMessages } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState<ChatSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const sRef = ref(db, `chatSessions/${user.uid}`);
    onValue(sRef, (snapshot) => {
      setSession(snapshot.val());
    });
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isOpen]);

  const activeMessages = chatMessages
    .filter(m => m.sessionId === user?.uid)
    .sort((a, b) => a.timestamp - b.timestamp);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !profile) return;

    const msgRef = push(ref(db, 'chatMessages'));
    const message: ChatMessage = {
      id: msgRef.key!,
      sessionId: user.uid,
      senderId: user.uid,
      text: newMessage,
      timestamp: Date.now(),
      read: false,
    };

    await set(msgRef, message);

    const sessionData: ChatSession = {
      id: user.uid,
      userId: user.uid,
      userName: profile.ign || 'Unknown User',
      lastMessage: newMessage,
      lastTimestamp: Date.now(),
      unreadCount: (session?.unreadCount || 0) + 1,
    };

    await set(ref(db, `chatSessions/${user.uid}`), sessionData);
    setNewMessage('');
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {session && session.unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-bold border-2 border-background">
            {session.unreadCount}
          </span>
        )}
        <span className="absolute right-full mr-4 bg-secondary border border-white/10 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Help & Support
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 w-96 h-[500px] bg-secondary border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-primary text-black flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <div>
                <h4 className="font-black uppercase tracking-tight text-sm">Help Center</h4>
                <p className="text-[10px] font-bold opacity-60">We're here to help!</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/30">
            {activeMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                  <MessageCircle size={32} />
                </div>
                <div>
                  <h5 className="font-bold text-sm mb-1">Start a Conversation</h5>
                  <p className="text-xs text-white/40 leading-relaxed">Send a message to our support team and we'll get back to you as soon as possible.</p>
                </div>
              </div>
            ) : (
              activeMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.senderId === user.uid 
                      ? 'bg-primary text-black rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                  }`}>
                    <p>{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      msg.senderId === user.uid ? 'text-black/50' : 'text-white/30'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.senderId === user.uid && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-secondary border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="How can we help?"
                className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
              />
              <button 
                onClick={handleSendMessage}
                className="p-3 bg-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
