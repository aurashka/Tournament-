import React, { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { ref, push, set, update, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { ChatMessage, ChatSession } from '../types';
import { Send, User, MessageCircle, Search, CheckCheck } from 'lucide-react';

export const ChatManager: React.FC = () => {
  const { chatMessages, user: currentUser } = useFirebase();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sRef = ref(db, 'chatSessions');
    onValue(sRef, (snapshot) => {
      const data = snapshot.val();
      setSessions(data ? Object.values(data) : []);
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeMessages = chatMessages
    .filter(m => m.sessionId === activeSessionId)
    .sort((a, b) => a.timestamp - b.timestamp);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeSessionId || !currentUser) return;

    const msgRef = push(ref(db, 'chatMessages'));
    const message: ChatMessage = {
      id: msgRef.key!,
      sessionId: activeSessionId,
      senderId: currentUser.uid,
      text: newMessage,
      timestamp: Date.now(),
      read: false,
    };

    await set(msgRef, message);
    await update(ref(db, `chatSessions/${activeSessionId}`), {
      lastMessage: newMessage,
      lastTimestamp: Date.now(),
      unreadCount: 0,
    });

    setNewMessage('');
  };

  const markAsRead = async (sessionId: string) => {
    await update(ref(db, `chatSessions/${sessionId}`), { unreadCount: 0 });
  };

  return (
    <div className="h-[600px] flex bg-secondary rounded-2xl border border-white/10 overflow-hidden">
      {/* Sessions List */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.sort((a, b) => b.lastTimestamp - a.lastTimestamp).map(session => (
            <button
              key={session.id}
              onClick={() => {
                setActiveSessionId(session.id);
                markAsRead(session.id);
              }}
              className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-all border-b border-white/5 ${
                activeSessionId === session.id ? 'bg-white/10' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                {session.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] flex items-center justify-center rounded-full text-white font-bold border-2 border-secondary">
                    {session.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold truncate text-sm">{session.userName}</h4>
                  <span className="text-[10px] text-white/30">{new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-white/50 truncate">{session.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background/30">
        {activeSession ? (
          <>
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{activeSession.userName}</h4>
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</span>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.senderId === currentUser?.uid 
                      ? 'bg-primary text-black rounded-tr-none' 
                      : 'bg-secondary border border-white/10 text-white rounded-tl-none'
                  }`}>
                    <p>{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      msg.senderId === currentUser?.uid ? 'text-black/50' : 'text-white/30'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.senderId === currentUser?.uid && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-secondary/50 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 p-8 text-center">
            <MessageCircle size={64} className="mb-4 opacity-10" />
            <h3 className="text-xl font-bold mb-2">Select a chat to start messaging</h3>
            <p className="max-w-xs text-sm">Choose a user from the left to respond to their help requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};
