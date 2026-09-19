export type EventType = 'open' | 'invitation';
export type EventStatus = 'draft' | 'active' | 'completed';
export type UserRole = 'admin' | 'committee' | 'public_participant';
export type InvitationStatus = 'sent' | 'pending' | 'failed' | 'not_sent';
export type CheckInStatus = 'valid' | 'duplicate' | 'invalid_event' | 'invalid_code';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: EventType;
  status: EventStatus;
  committeeIds: string[];
  maxParticipants?: number;
  themeColor?: string;
  secondaryColor?: string;
  driveFolderUrl?: string;
  bannerUrl?: string;
  allowPublicRegistration: boolean;
  category: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  qrCode: string;
  invitationStatus: InvitationStatus;
  invitationSentAt?: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  notes?: string;
  category?: string;
}

export interface AttendanceLog {
  id: string;
  participantId: string;
  eventId: string;
  participantName: string;
  participantEmail: string;
  participantInstitution: string;
  scannedAt: string;
  scannedBy: string;
  status: CheckInStatus;
  device?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'committee';
  assignedEventIds: string[];
  avatar?: string;
  phone?: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  signOff: string;
}

export interface AppSettings {
  primaryColor: string;
  secondaryColor: string;
  orgName: string;
  orgTagline: string;
  orgLogo?: string;
  emailTemplate: EmailTemplate;
  soundEffects: boolean;
}

export interface DocumentationItem {
  id: string;
  eventId: string;
  title: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size?: string;
  type: 'photo' | 'document';
}
