import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Globe, 
  MessageSquare,
  ExternalLink,
  Verified,
  Eye,
  AlertCircle,
  Share2,
  Mail,
  Video,
  Music
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileData } from '../types';
import { cn } from '../utils/cn';

const Profile = () => {
  const { username } = useParams();
  const { getProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (username) {
        setLoading(true);
        const data = await getProfile(username);
        setProfile(data);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, getProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-zinc-700 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">User not found</h1>
        <p className="text-zinc-500 mb-8">The profile you're looking for doesn't exist or was removed.</p>
        <Link to="/" className="px-6 py-3 bg-zinc-900 border border-white/10 rounded-2xl font-bold hover:bg-zinc-800 transition-colors">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen transition-colors duration-500 flex flex-col items-center px-4 py-20 relative overflow-hidden"
      style={{ backgroundColor: profile.theme.backgroundColor }}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
         {profile.theme.animatedBackground === 'dots' && (
           <div className="absolute inset-0" style={{ 
             backgroundImage: `radial-gradient(${profile.theme.primaryColor}33 1px, transparent 1px)`, 
             backgroundSize: '30px 30px' 
           }} />
         )}
         
         {profile.theme.animatedBackground === 'stars' && (
           <div className="absolute inset-0">
             {[...Array(20)].map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute w-1 h-1 bg-white rounded-full"
                 animate={{
                   opacity: [0.2, 1, 0.2],
                   scale: [1, 1.5, 1],
                 }}
                 transition={{
                   duration: Math.random() * 3 + 2,
                   repeat: Infinity,
                   delay: Math.random() * 5,
                 }}
                 style={{
                   top: `${Math.random() * 100}%`,
                   left: `${Math.random() * 100}%`,
                 }}
               />
             ))}
           </div>
         )}

         <div className="absolute top-0 left-0 w-full h-[70vh] opacity-20">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-transparent blur-[120px]" 
                 style={{ backgroundColor: profile.theme.primaryColor }} />
         </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full relative z-10"
      >
        {/* Banner */}
        <div className="relative h-48 rounded-3xl overflow-hidden mb-[-60px] border border-white/10 shadow-2xl">
          <img 
            src={profile.bannerUrl} 
            className="w-full h-full object-cover" 
            alt="banner" 
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Info */}
        <div 
          className={cn(
            "rounded-[40px] p-8 border border-white/10 text-center relative pt-20 shadow-2xl overflow-hidden",
            profile.theme.blurEffect ? "backdrop-blur-xl" : ""
          )}
          style={{ 
            backgroundColor: profile.theme.cardColor,
            fontFamily: profile.theme.fontFamily 
          }}
        >
          {/* Avatar */}
          <div className="absolute top-[-60px] left-1/2 -translate-x-1/2">
            <div className="w-32 h-32 rounded-full border-4 border-[#0a0a0a] overflow-hidden shadow-2xl">
              <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-4xl font-black tracking-tight" style={{ color: profile.theme.textColor }}>
                  {profile.displayName || profile.username}
                </h1>
                {profile.badges.includes('Early Adopter') && (
                  <Verified className="w-6 h-6 text-blue-500 fill-blue-500/20" />
                )}
              </div>
              <p className="text-zinc-400 font-medium">@{profile.username}</p>
            </div>

            <p className="text-lg leading-relaxed max-w-sm mx-auto opacity-80" style={{ color: profile.theme.textColor }}>
              {profile.bio}
            </p>

            <div className="flex items-center justify-center gap-6 py-4">
               <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  <span>{profile.views} views</span>
               </div>
               <div className="flex gap-1">
                 {profile.badges.map(badge => (
                   <span key={badge} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-500/20">
                     {badge}
                   </span>
                 ))}
               </div>
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
              }}
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold hover:bg-white/10 transition-colors mx-auto flex items-center gap-2"
              style={{ color: profile.theme.textColor }}
            >
              <Share2 className="w-4 h-4" />
              Share Profile
            </button>

            {/* Music Player Placeholder / Link */}
            {profile.musicUrl && (
              <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <Music className="w-6 h-6" />
                 </div>
                 <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Now Playing</p>
                    <a href={profile.musicUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:underline line-clamp-1" style={{ color: profile.theme.textColor }}>
                       {profile.musicUrl.split('/').pop()?.split('?')[0] || 'My Favorite Track'}
                    </a>
                 </div>
              </div>
            )}

            {/* Links */}
            <div className="grid grid-cols-1 gap-3 mt-8">
              {profile.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between p-4 rounded-2xl border border-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      {getIcon(link.platform)}
                    </div>
                    <span className="font-bold text-lg" style={{ color: profile.theme.textColor }}>
                      {link.platform}
                    </span>
                  </div>
                  <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: profile.theme.textColor }} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
           <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium opacity-50 hover:opacity-100">
             <div className="w-5 h-5 bg-zinc-800 rounded flex items-center justify-center font-bold text-[10px]">D</div>
             Created with dilsher.bio
           </Link>
        </div>
      </motion.div>
    </div>
  );
};

const getIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('twitter') || p.includes('x.com')) return <Share2 className="w-5 h-5" />;
  if (p.includes('github')) return <Share2 className="w-5 h-5" />;
  if (p.includes('instagram')) return <Share2 className="w-5 h-5" />;
  if (p.includes('youtube')) return <Video className="w-5 h-5" />;
  if (p.includes('email') || p.includes('mail')) return <Mail className="w-5 h-5" />;
  if (p.includes('discord')) return <MessageSquare className="w-5 h-5" />;
  return <Globe className="w-5 h-5" />;
};

export default Profile;
