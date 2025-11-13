
export interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  doctor: string;
  clinic: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export enum Language {
  EN = 'en-US',
  UR = 'ur-PK',
}