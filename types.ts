
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
}

export interface BrandGuide {
  domainId: string;
  stylePrompt: string;
  toneOfVoice: string;
  styleImageUrl?: string;
}

export interface ContentBrief {
  id: string;
  domainId: string;
  title: string;
  brief: string;
  content: string;
  status: Status;
  contentType: ContentType;
  scheduledAt?: string;
  heroImageUrl?: string;
  createdAt: string;
}
