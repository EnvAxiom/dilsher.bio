import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Palette, 
  Link as LinkIcon, 
  Eye, 
  LogOut, 
  BarChart2, 
  Plus, 
  Trash2,
  ExternalLink,
  Upload,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const { user, userProfile, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Profile not found</h1>
          <p className="text-zinc-400 mb-8">We couldn't find your profile data. Try refreshing or logging in again.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Refresh Page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/50 p-6 flex flex-col fixed h-full">
        <Link to="/" className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">D</div>
          <span className="font-bold text-xl tracking-tight">dilsher.bio</span>
        </Link>

        <nav className="flex-1 space-y-1">
          <SidebarLink 
            icon={<User className="w-5 h-5" />} 
            label="Profile" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
          <SidebarLink 
            icon={<LinkIcon className="w-5 h-5" />} 
            label="Links" 
            active={activeTab === 'links'} 
            onClick={() => setActiveTab('links')} 
          />
          <SidebarLink 
            icon={<Palette className="w-5 h-5" />} 
            label="Appearance" 
            active={activeTab === 'appearance'} 
            onClick={() => setActiveTab('appearance')} 
          />
          <SidebarLink 
            icon={<BarChart2 className="w-5 h-5" />} 
            label="Analytics" 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
          />
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-1">
          <a 
            href={`/${user.username}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <Eye className="w-5 h-5" />
            <span className="font-medium">View Profile</span>
          </a>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10 max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 capitalize">{activeTab}</h1>
            <p className="text-zinc-500">Manage your profile information and appearance.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-500">
              dilsher.bio/<span className="text-zinc-300">{user.username}</span>
            </span>
            <a 
               href={`/${user.username}`}
               target="_blank"
               className="p-2 bg-zinc-900 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </header>

        <div className="space-y-8">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'links' && <LinkSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'analytics' && <AnalyticsPlaceholder />}
        </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium",
      active 
        ? "bg-blue-600 text-white" 
        : "text-zinc-400 hover:text-white hover:bg-white/5"
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ProfileSettings = () => {
  const { userProfile, updateProfile } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  if (!userProfile) return null;

  const uploadImage = async (file: File, type: 'avatar' | 'banner') => {
    try {
      if (type === 'avatar') setUploadingAvatar(true);
      else setUploadingBanner(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userProfile.userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      if (type === 'avatar') {
        await updateProfile({ avatarUrl: publicUrl });
      } else {
        await updateProfile({ bannerUrl: publicUrl });
      }
    } catch (error: any) {
      alert(error.message || 'Error uploading image');
    } finally {
      setUploadingAvatar(false);
      setUploadingBanner(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-6">General Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Display Name</label>
            <input
              type="text"
              value={userProfile.displayName}
              onChange={(e) => updateProfile({ displayName: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Bio</label>
            <textarea
              rows={4}
              value={userProfile.bio}
              onChange={(e) => updateProfile({ bio: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
          <h3 className="text-lg font-bold mb-6">Avatar</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <img src={userProfile.avatarUrl} className="w-24 h-24 rounded-full object-cover border-2 border-white/10 group-hover:opacity-50 transition-opacity" alt="" />
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all font-bold text-sm">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'avatar')} 
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
            </div>
            <input
              type="text"
              value={userProfile.avatarUrl}
              onChange={(e) => updateProfile({ avatarUrl: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-colors text-xs text-zinc-500"
              placeholder="Or enter URL"
            />
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
          <h3 className="text-lg font-bold mb-6">Banner</h3>
          <div className="space-y-4">
             <div className="relative h-24 w-full bg-zinc-800 rounded-xl overflow-hidden group">
                <img src={userProfile.bannerUrl} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="" />
                {uploadingBanner && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
             </div>
             <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all font-bold text-sm">
                <Upload className="w-4 h-4" />
                Change Banner
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'banner')} 
                  disabled={uploadingBanner}
                />
             </label>
             <input
                type="text"
                value={userProfile.bannerUrl}
                onChange={(e) => updateProfile({ bannerUrl: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-colors text-xs text-zinc-500"
                placeholder="Or enter URL"
              />
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 md:col-span-2">
          <h3 className="text-lg font-bold mb-6">Music (Spotify/Soundcloud)</h3>
          <div className="space-y-4">
             <input
                type="text"
                value={userProfile.musicUrl || ''}
                onChange={(e) => updateProfile({ musicUrl: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-colors"
                placeholder="https://open.spotify.com/track/..."
              />
              <p className="text-xs text-zinc-500">Paste a link to your favorite track to showcase it on your profile.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LinkSettings = () => {
  const { userProfile, updateProfile } = useAuth();
  if (!userProfile) return null;

  const addLink = () => {
    const newLink = { id: Math.random().toString(36).substr(2, 9), platform: 'New Link', url: '' };
    updateProfile({ links: [...userProfile.links, newLink] });
  };

  const removeLink = (id: string) => {
    updateProfile({ links: userProfile.links.filter(l => l.id !== id) });
  };

  const updateLink = (id: string, data: any) => {
    updateProfile({
      links: userProfile.links.map(l => l.id === id ? { ...l, ...data } : l)
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Your Social Links</h3>
        <button 
          onClick={addLink}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </div>

      <div className="space-y-4">
        {userProfile.links.map((link) => (
          <div key={link.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-zinc-500">
               <LinkIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={link.platform}
                onChange={(e) => updateLink(link.id, { platform: e.target.value })}
                className="bg-black border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-colors"
                placeholder="Platform Name"
              />
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                className="bg-black border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-colors"
                placeholder="URL (https://...)"
              />
            </div>
            <button 
              onClick={() => removeLink(link.id)}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {userProfile.links.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 border border-dashed border-white/10 rounded-2xl">
            <p className="text-zinc-500">No links added yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const THEME_PRESETS = [
  { name: 'Midnight', bg: '#0a0a0a', primary: '#3b82f6', card: 'rgba(255, 255, 255, 0.05)' },
  { name: 'Sunset', bg: '#0f0a0a', primary: '#f43f5e', card: 'rgba(244, 63, 94, 0.05)' },
  { name: 'Emerald', bg: '#0a0f0a', primary: '#10b981', card: 'rgba(16, 185, 129, 0.05)' },
  { name: 'Royal', bg: '#0a0a10', primary: '#8b5cf6', card: 'rgba(139, 92, 246, 0.05)' },
];

const AppearanceSettings = () => {
  const { userProfile, updateProfile } = useAuth();
  if (!userProfile) return null;

  const updateTheme = (themeData: any) => {
    updateProfile({ theme: { ...userProfile.theme, ...themeData } });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-6">Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {THEME_PRESETS.map((t) => (
            <button
              key={t.name}
              onClick={() => updateTheme({ 
                backgroundColor: t.bg, 
                primaryColor: t.primary,
                cardColor: t.card 
              })}
              className="p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all text-left group"
              style={{ backgroundColor: t.bg }}
            >
              <div className="w-8 h-8 rounded-full mb-3" style={{ backgroundColor: t.primary }} />
              <p className="text-sm font-bold">{t.name}</p>
            </button>
          ))}
        </div>
      </div>

       <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-6">Colors & Styling</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Accent Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={userProfile.theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="w-12 h-12 bg-black border border-white/10 rounded-xl overflow-hidden"
              />
              <input
                type="text"
                value={userProfile.theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="flex-1 bg-black border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Background Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={userProfile.theme.backgroundColor}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className="w-12 h-12 bg-black border border-white/10 rounded-xl overflow-hidden"
              />
              <input
                type="text"
                value={userProfile.theme.backgroundColor}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className="flex-1 bg-black border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-6">Effects</h3>
        <div className="flex items-center justify-between">
           <div>
              <p className="font-medium">Glassmorphism Blur</p>
              <p className="text-sm text-zinc-500">Adds a blur effect to your profile cards.</p>
           </div>
           <button 
             onClick={() => updateTheme({ blurEffect: !userProfile.theme.blurEffect })}
             className={cn(
               "w-12 h-6 rounded-full transition-colors relative",
               userProfile.theme.blurEffect ? "bg-blue-600" : "bg-zinc-700"
             )}
           >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                userProfile.theme.blurEffect ? "left-7" : "left-1"
              )} />
           </button>
        </div>

        <div className="mt-8 border-t border-white/5 pt-8">
          <label className="block text-sm font-medium text-zinc-400 mb-4">Font Family</label>
          <div className="flex gap-2 flex-wrap">
            {['Inter', 'Orbitron', 'Space Grotesk', 'Playfair Display'].map((font) => (
              <button
                key={font}
                onClick={() => updateTheme({ fontFamily: font })}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                  userProfile.theme.fontFamily === font 
                    ? "bg-white text-black border-white" 
                    : "bg-black text-zinc-400 border-white/10 hover:border-white/20"
                )}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-medium text-zinc-400 mb-4">Background Animation</label>
          <div className="flex gap-2">
            {['none', 'dots', 'stars'].map((bg) => (
              <button
                key={bg}
                onClick={() => updateTheme({ animatedBackground: bg })}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold border transition-all capitalize",
                  userProfile.theme.animatedBackground === bg 
                    ? "bg-white text-black border-white" 
                    : "bg-black text-zinc-400 border-white/10 hover:border-white/20"
                )}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AnalyticsPlaceholder = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
      <p className="text-zinc-500 text-sm font-medium mb-1">Total Views</p>
      <p className="text-4xl font-bold">1,284</p>
    </div>
    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
      <p className="text-zinc-500 text-sm font-medium mb-1">Click Through Rate</p>
      <p className="text-4xl font-bold">24%</p>
    </div>
    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
      <p className="text-zinc-500 text-sm font-medium mb-1">Top Link</p>
      <p className="text-4xl font-bold italic">Twitter</p>
    </div>
  </div>
);

export default Dashboard;
