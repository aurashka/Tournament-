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
  type: 'tournament' | 'posts' | 'custom';
  categories?: string[];
  layout: 'grid' | 'slider' | 'list';
  visible: boolean;
  cardStyle: 'modern' | 'classic' | 'gaming';
  order: number;
}

export interface GlobalConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  styles: {
    cardRadius: string;
    buttonStyle: 'rounded' | 'sharp' | 'pill';
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
