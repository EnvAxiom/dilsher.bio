export interface User {
  id: string;
  username: string;
  email: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
}

export interface ProfileData {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    cardColor: string;
    fontFamily: string;
    blurEffect: boolean;
    animatedBackground?: 'none' | 'dots' | 'mesh' | 'stars';
  };
  links: SocialLink[];
  views: number;
  badges: string[];
  musicUrl?: string;
}
