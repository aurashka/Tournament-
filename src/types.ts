export type UserRole = 'admin' | 'user' | 'host';

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'image' | 'date';
  options?: string[]; // For dropdown
  required: boolean;
  target: 'tournament_form' | 'user_profile' | 'comment';
}

export interface Badge {
  id: string;
  name: string;
  imageUrl: string;
}

export interface UserStyle {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  ign: string;
  age: number;
  role: UserRole;
  profileImage?: string;
  badges?: string[]; // Array of badge IDs
  style?: UserStyle;
  stats?: {
    played: number;
    won: number;
    live: number;
  };
  customFields?: Record<string, any>;
  notice?: string;
  isBanned?: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Tournament {
  id: string;
  title: string;
  bgImage: string;
  logo: string;
  hostId: string;
  game: string;
  categories: string[]; // Category IDs
  entryFee: string;
  prize: string;
  rules: string;
  dateTime: string;
  status: 'upcoming' | 'ongoing' | 'finished' | 'active';
  joinSystem: 'external' | 'internal';
  externalLink?: string;
  customFields?: Record<string, any>;
  liveUrl?: string;
  autoplayLive?: boolean;
}

export interface Section {
  id: string;
  title: string;
  type: 'tournament' | 'posts' | 'custom' | 'video';
  categories?: string[];
  layout: 'grid' | 'slider' | 'list' | 'video-slider';
  visible: boolean;
  cardStyle: 'modern' | 'classic' | 'gaming';
  order: number;
  videoLinks?: { id: string; title: string; url: string; thumbnail?: string }[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName?: string;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'alert';
  timestamp: number;
  targetUserId?: string; // If empty, send to all
  isRead?: Record<string, boolean>;
  read?: boolean; // For client-side UI
  link?: string;
  icon?: string;
}

export interface GlobalConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    surface: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  styles: {
    cardRadius: string;
    buttonStyle: 'rounded' | 'sharp' | 'pill';
    blurIntensity: string;
    spacingScale: string;
  };
}

export interface Comment {
  id: string;
  tournamentId: string;
  userId: string;
  text: string;
  timestamp: number;
  likes: Record<string, boolean>;
  replies?: Record<string, Comment>;
}

export interface Application {
  id: string;
  tournamentId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  data: Record<string, any>;
  timestamp: number;
}
