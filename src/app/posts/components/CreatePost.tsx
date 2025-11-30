
import React, { useState, useEffect } from 'react';
import CreatePostForm from './CreatePostForm';
import ProfileSetup from './ProfileSetup';
import { UserProfile } from '../types';

const CreatePost: React.FC = () => {
  const [step, setStep] = useState<'profile' | 'create-post'>('profile');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    stage: null,
    businessModel: null,
    sector: '',
    subSector: '',
    industry: ''
  });

  // Effect to toggle the 'dark' class on the html element
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setStep('create-post');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start sm:p-6 relative overflow-x-hidden transition-colors duration-300 selection:bg-cyan-500 selection:text-slate-900 ${isDarkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      
      {/* Background decoration - Dynamic */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Blob */}
        <div className={`absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] transition-colors duration-1000 opacity-50 ${isDarkMode ? 'bg-cyan-500/10 mix-blend-screen' : 'bg-cyan-400/5 mix-blend-multiply'}`}></div>
        
        {/* Bottom Left Blob */}
        <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] transition-colors duration-1000 opacity-40 ${isDarkMode ? 'bg-indigo-500/10 mix-blend-screen' : 'bg-indigo-400/10 mix-blend-multiply'}`}></div>
        
        {/* Bottom Right Blob */}
        <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] transition-colors duration-1000 opacity-40 ${isDarkMode ? 'bg-teal-500/10 mix-blend-screen' : 'bg-teal-400/10 mix-blend-multiply'}`}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full flex justify-center">
         {step === 'profile' ? (
           <ProfileSetup 
             onComplete={handleProfileComplete} 
             initialData={userProfile}
           />
         ) : (
           <CreatePostForm 
             userProfile={userProfile}
             onBack={() => setStep('profile')}
             toggleTheme={toggleTheme}
             isDarkMode={isDarkMode}
           />
         )}
      </div>
    </div>
  );
};

export default CreatePost;
