export type InterviewType = 'video' | 'onsite' | 'phone';

export type Region = 'Shanghai' | 'Taipei' | 'Japan';

export interface TimeSlot {
  date: string;
  start: string;
  end: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  region: Region;
  position: string;
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  title: string;
}

export interface InterviewInvitation {
  id: string;
  candidate: Candidate;
  interviewers: Interviewer[];
  type: InterviewType;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  createdAt: string;
  expiresAt: string;
  videoLink?: string;
}