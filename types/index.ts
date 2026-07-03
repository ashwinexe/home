export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  pinned: boolean;
  category: string;
  draft: boolean;
  image?: string;
  content: string;
}

export interface VaultPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  category: string;
  shareTokenHash?: string;
  content: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  image: string;
  highlights: string[];
  url: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  image?: string;
  tech: string[];
  links: {
    live?: string;
    github?: string;
  };
  featured: boolean;
}

export interface ProjectDumpItem {
  name: string;
  description: string;
  url: string;
  emoji: string;
}

export interface Talk {
  slug: string;
  title: string;
  event: string;
  date: string;
  location: string;
  type: "past" | "upcoming";
  video?: string;
  slides?: string;
  image?: string;
  content: string;
}

export interface TalkTopic {
  title: string;
  description: string;
  duration: string;
}
