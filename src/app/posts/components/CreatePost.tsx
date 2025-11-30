
'use client';
import React, { useState, useEffect } from 'react';
import CreatePostForm from './CreatePostForm';
import ProfileSetup from './ProfileSetup';
import { UserProfile } from '../types';
import { useTheme } from '@/context/ThemeContext';
import { usePosts } from '@/context/PostContext';

const CreatePost: React.FC = () => {
  const [step, setStep] = useState<'profile' | 'create-post'>('profile');
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    stage: null,
    businessModel: null,
    sector: '',
    subSector: '',
    industry: ''
  });

  const isDarkMode = theme === 'dark';
  const { isCreateOpen } = usePosts();

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setStep('create-post');
  };

  return (
    <div className={`h-full w-full flex flex-col items-center justify-start relative overflow-x-hidden transition-colors duration-300 selection:bg-cyan-500 selection:text-slate-900 ${isDarkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      
      {/* Background decoration - Dynamic */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] transition-colors duration-1000 opacity-50 ${isDarkMode ? 'bg-cyan-500/10 mix-blend-screen' : 'bg-cyan-400/5 mix-blend-multiply'}`}></div>
        <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] transition-colors duration-1000 opacity-40 ${isDarkMode ? 'bg-indigo-500/10 mix-blend-screen' : 'bg-indigo-400/10 mix-blend-multiply'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] transition-colors duration-1000 opacity-40 ${isDarkMode ? 'bg-teal-500/10 mix-blend-screen' : 'bg-teal-400/10 mix-blend-multiply'}`}></div>
      </div>
      
      <div className="relative z-10 w-full flex justify-center h-full">
         {step === 'profile' ? (
           <ProfileSetup 
             onComplete={handleProfileComplete} 
             initialData={userProfile}
           />
         ) : (
           <CreatePostForm 
             userProfile={userProfile}
             onBack={() => setStep('profile')}
             isDarkMode={isDarkMode}
           />
         )}
      </div>
    </div>
  );
};

export default CreatePost;
