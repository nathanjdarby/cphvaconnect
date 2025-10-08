
export interface User {
  id: string; // This will be the Firebase Auth UID and the Firestore document ID
  name: string;
  email: string;
  password?: string; // Password hash (only used for database authentication)
  role: 'attendee' | 'admin' | 'organiser' | 'staff';
  nameIsPublic?: boolean;
  emailIsPublic?: boolean;
  bio?: string;
  avatarUrl?: string | null; // Firebase Storage download URL
  avatarStoragePath?: string | null; // Path in Firebase Storage
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  conferenceName: string;
  ticketType: string;
  ticketPrice?: number;
  purchaseDate: string; // ISO Date String
  qrCodeValue: string;
  isCheckedIn: boolean;
  checkInTimestamp?: string | null; // ISO Date String
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string | null; // Firebase Storage download URL
  imageStoragePath?: string | null; // Path in Firebase Storage
  dataAiHint?: string;
}

export interface EventFile {
  id: string;
  name: string;
  type: string; // MIME type
  size: number;
  storageUrl?: string | null; // Firebase Storage download URL
  storagePath?: string | null; // Path in Firebase Storage
  category?: string;
}

export interface LocationType {
  id: string;
  name: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO Date String
  endTime: string; // ISO Date String
  speakerIds?: string[];
  locationId?: string | null; // Can be explicitly null if no location
  offerDownloads?: boolean;
  eventFiles?: EventFile[];
  createdAt?: string; // ISO Date String
}

export interface ExhibitorType {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null; // Firebase Storage download URL
  logoStoragePath?: string | null; // Path in Firebase Storage
  websiteUrl?: string;
  boothNumber?: string;
  dataAiHint?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isOpen: boolean;
  createdAt: string; // ISO Date String
}

export interface UserVote {
  id?: string; // Firestore document ID
  userId: string;
  pollId: string;
  optionId: string;
  votedAt?: any; // Firestore Timestamp or string
}

export interface AppSettings {
  title: string;
  ticketSalesEnabled: boolean;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    accent: string;
  };
}
