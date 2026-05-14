import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Palette, Zap, ArrowRight } from 'lucide-react';

const Landing = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      navigate(`/register?username=${username}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">D</div>
            <span className="font-bold text-xl tracking-tight">dilsher.bio</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Elevate your online <br /> presence with style.
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Create a stunning, highly customizable profile page to showcase your socials, 
              work, and personality. Built for the modern web.
            </p>

            <form onSubmit={handleClaim} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-12">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-lg">dilsher.bio/</span>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-[110px] pr-4 outline-none focus:border-blue-500/50 transition-colors text-lg"
                />
              </div>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
              >
                Claim Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <FeatureCard 
              icon={<Palette className="w-6 h-6 text-pink-500" />}
              title="Full Customization"
              description="Change colors, fonts, backgrounds, and more to match your unique vibe."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              title="Lightning Fast"
              description="Built with speed in mind, ensuring your profile loads instantly for everyone."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-green-500" />}
              title="Verified Badges"
              description="Build trust and stand out with exclusive badges for creators."
            />
          </div>
        </div>
      </main>

      {/* Profile Preview Section */}
      <section className="py-20 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4">
           <div className="rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-1">
              <div className="rounded-[22px] overflow-hidden bg-black/80 aspect-video md:aspect-[21/9] flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-blue-500/5 blur-[100px]" />
                 <div className="relative z-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-zinc-800 mx-auto mb-4 border border-white/10" />
                    <div className="h-6 w-32 bg-zinc-800 rounded mx-auto mb-2" />
                    <div className="h-4 w-48 bg-zinc-900 rounded mx-auto" />
                    <div className="flex gap-2 justify-center mt-6">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10" />
                      ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">D</div>
            <span className="font-bold text-xl tracking-tight text-zinc-400">dilsher.bio</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
          <div className="text-zinc-600 text-sm">
            © 2024 dilsher.bio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 text-left hover:border-white/10 transition-colors">
    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-zinc-400 leading-relaxed">{description}</p>
  </div>
);

export default Landing;
