export enum Status {
  Draft = 'Draft',
  Published = 'Published',
  Scheduled = 'Scheduled',
}

export enum ContentType {
  Blog = 'Blog',
  News = 'News',
  Page = 'Page',
}

export interface Domain {
  id: string;
  name: string;
  clientId: string;
}

export interface BrandGuide {
  domainId: string;
  clientId: string;
  stylePrompt: string;
  toneOfVoice: string;
  styleImageUrl?: string;
}

export interface ContentBrief {
  id: string;
  domainId: string;
  clientId: string;
  title: string;
  brief: string;
  content: string;
  status: Status;
  contentType: ContentType;
  scheduledAt?: string;
  heroImageUrl?: string;
  createdAt: string;
}

export interface User {
  _id: { $oid: string };
  email: string;
  password?: string; // Password might not always be sent from the backend
  role: string;
  clientId: string;
  created_at: { $date: { $numberLong: string } };
}