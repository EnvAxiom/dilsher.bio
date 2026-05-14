import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProfileData } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  getProfile: (username: string) => Promise<ProfileData | null>;
  userProfile: ProfileData | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      // Map snake_case from DB to camelCase for app
      const profile: ProfileData = {
        userId: data.id,
        username: data.username,
        displayName: data.display_name || data.username,
        bio: data.bio || '',
        avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
        bannerUrl: data.banner_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop',
        theme: data.theme,
        links: data.links || [],
        views: data.views || 0,
        badges: data.badges || [],
        musicUrl: data.music_url || ''
      };
      setUserProfile(profile);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { username }
      }
    });

    if (data.user && !error) {
      // Create profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: username,
          display_name: username,
          theme: {
            primaryColor: '#3b82f6',
            accentColor: '#60a5fa',
            backgroundColor: '#0a0a0a',
            textColor: '#ffffff',
            cardColor: 'rgba(255, 255, 255, 0.05)',
            fontFamily: 'Inter',
            blurEffect: true,
            animatedBackground: 'none'
          },
          links: []
        });
      if (profileError) console.error(profileError);
    }

    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) return;

    // Map camelCase to snake_case for DB
    const dbUpdates: any = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl;
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
    if (updates.links !== undefined) dbUpdates.links = updates.links;
    if (updates.musicUrl !== undefined) dbUpdates.music_url = updates.musicUrl;
    if (updates.badges !== undefined) dbUpdates.badges = updates.badges;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (!error) {
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const getProfile = async (username: string): Promise<ProfileData | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) return null;

    // Increment views using RPC
    await supabase.rpc('increment_views', { target_username: username });

    return {
      userId: data.id,
      username: data.username,
      displayName: data.display_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      bannerUrl: data.banner_url,
      theme: data.theme,
      links: data.links,
      views: data.views + 1,
      badges: data.badges,
      musicUrl: data.music_url
    };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, updateProfile, getProfile, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
