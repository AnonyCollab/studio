
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Layers, Network, ChevronRight, ChevronDown, Sprout, Rocket, TrendingUp, Building2, Store, Zap, Briefcase, Building, User, LayoutTemplate, CheckCircle2 } from 'lucide-react';
import { BusinessStage, BusinessModel, UserProfile } from '../types';
import { SECTORS_DATA } from '../types';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
  initialData: UserProfile;
}

const STAGE_CONFIG: Record<BusinessStage, { title: string; desc: string; icon: React.ReactNode }> = {
  [BusinessStage.Idea]: { 
      title: "Idea Phase", 
      desc: "Pre-launch & Concept", 
      icon: <Sprout className="w-8 h-8 opacity-80" /> 
  },
  [BusinessStage.Early]: { 
      title: "Early Stage", 
      desc: "0-2 years, Finding PMF", 
      icon: <Rocket className="w-8 h-8 opacity-80" /> 
  },
  [BusinessStage.Growth]: { 
      title: "Growth", 
      desc: "2-5 years, Scaling Up", 
      icon: <TrendingUp className="w-8 h-8 opacity-80" /> 
  },
  [BusinessStage.Established]: { 
      title: "Established", 
      desc: "5+ years, Stable", 
      icon: <Building2 className="w-8 h-8 opacity-80" /> 
  },
};

const MODEL_CONFIG: Record<BusinessModel, { title: string; desc: string; icon: React.ReactNode }> = {
  [BusinessModel.Startup]: {
    title: "Startup",
    desc: "High growth, VC/Angel",
    icon: <Zap className="w-6 h-6 opacity-80" />
  },
  [BusinessModel.Agency]: {
    title: "Agency",
    desc: "Service provider, B2B",
    icon: <Briefcase className="w-6 h-6 opacity-80" />
  },
  [BusinessModel.SmallBusiness]: {
    title: "Small Business",
    desc: "Local, Retail, SMB",
    icon: <Store className="w-6 h-6 opacity-80" />
  },
  [BusinessModel.Enterprise]: {
    title: "Enterprise",
    desc: "Large corp, 500+ employees",
    icon: <Building className="w-6 h-6 opacity-80" />
  },
  [BusinessModel.Creator]: {
    title: "Creator",
    desc: "Solo, Freelance, Indie",
    icon: <User className="w-6 h-6 opacity-80" />
  }
};

// --- Modern Custom Select Component ---

interface ModernSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}

const ModernSelect: React.FC<ModernSelectProps> = ({ value, onChange, options, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        type="button"
        onClick={handleToggle}
        className={`
          w-full text-left rounded-xl px-4 py-3.5 flex items-center justify-between border transition-all duration-200
          ${isOpen 
            ? 'bg-white dark:bg-slate-800 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg' 
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
          }
        `}
      >
        <span className={`text-sm font-medium ${value ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 p-1">
          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors mb-0.5
                  ${value === option 
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 font-medium' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }
                `}
              >
                {option}
                {value === option && <CheckCircle2 className="w-4 h-4 text-cyan-500" />}
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-sm text-slate-400">
               No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, initialData }) => {
  const [profile, setProfile] = useState<UserProfile>(initialData);

  const selectedSectorData = SECTORS_DATA.find(s => s.name === profile.sector);
  const selectedSubSectorData = selectedSectorData?.subSectors.find(s => s.name === profile.subSector);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => {
      const newState = { ...prev, [field]: value };
      if (field === 'sector') {
        newState.subSector = '';
        newState.industry = '';
      }
      if (field === 'subSector') {
        newState.industry = '';
      }
      return newState;
    });
  };

  const isComplete = profile.stage && profile.businessModel && profile.sector && profile.subSector && profile.industry;

  return (
    <div className="w-full max-w-2xl mx-auto h-full text-slate-900 dark:text-slate-100 animate-in fade-in duration-500 flex flex-col">
      
      <div className="p-6 sm:p-10 space-y-8 flex-1 overflow-y-auto">
        <div className="text-center space-y-2 mt-4 sm:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Complete Your Profile</h1>
          <p className="text-slate-500 dark:text-slate-400">Tell us a bit about you so we can tailor the community experience.</p>
        </div>

        {/* Business Stage */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
             <Layers className="w-4 h-4" />
             Business Stage
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {Object.values(BusinessStage).map((stage) => {
                const config = STAGE_CONFIG[stage];
                const isSelected = profile.stage === stage;
                return (
                <button
                  key={stage}
                  onClick={() => handleInputChange('stage', stage)}
                  className={`
                    w-full px-5 py-4 rounded-xl text-left transition-all border flex items-center justify-between group relative overflow-hidden
                    ${isSelected 
                      ? 'bg-cyan-600 dark:bg-[#22d3ee] border-cyan-600 dark:border-[#22d3ee] text-white dark:text-slate-900 shadow-[0_8px_20px_-4px_rgba(34,211,238,0.4)] transform scale-[1.02] z-10' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                  `}
                >
                  <div className="flex-1">
                    <div className={`text-lg font-bold ${isSelected ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                        {config.title}
                    </div>
                    <div className={`text-sm mt-1 font-medium ${isSelected ? 'text-cyan-50 dark:text-slate-800' : 'text-slate-500 dark:text-slate-400'}`}>
                         {config.desc}
                    </div>
                  </div>
                  
                  {/* Large Icon on Right */}
                  <div className={`
                    ml-4 p-2 rounded-full transition-colors duration-300
                    ${isSelected ? 'bg-white/20 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500'}
                  `}>
                      {config.icon}
                  </div>
                </button>
             )})}
           </div>
        </div>

        {/* Business Model */}
        <div className="space-y-4">
           <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
             <LayoutTemplate className="w-4 h-4" />
             Business Model
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.values(BusinessModel).map((model) => {
              const config = MODEL_CONFIG[model];
              const isSelected = profile.businessModel === model;
              return (
                <button
                  key={model}
                  onClick={() => handleInputChange('businessModel', model)}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-xl text-center border transition-all duration-200
                    ${isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <div className={`mb-2 ${isSelected ? 'text-white dark:text-slate-900' : 'text-cyan-600 dark:text-cyan-400'}`}>
                    {config.icon}
                  </div>
                  <div className="text-sm font-bold leading-tight">{config.title}</div>
                  <div className={`text-[10px] mt-1 ${isSelected ? 'text-slate-300 dark:text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    {config.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sector Hierarchy */}
        <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                <Network className="w-4 h-4" />
                Your Sector Context
            </label>
            <div className="space-y-3">
                <ModernSelect
                    placeholder="Select Primary Sector"
                    value={profile.sector}
                    options={SECTORS_DATA.map(s => s.name)}
                    onChange={(val) => handleInputChange('sector', val)}
                />
                
                <ModernSelect
                    placeholder="Select Sub-sector"
                    value={profile.subSector}
                    options={selectedSectorData?.subSectors.map(s => s.name) || []}
                    onChange={(val) => handleInputChange('subSector', val)}
                    disabled={!profile.sector}
                />

                <ModernSelect
                    placeholder="Select Industry"
                    value={profile.industry}
                    options={selectedSubSectorData?.industries || []}
                    onChange={(val) => handleInputChange('industry', val)}
                    disabled={!profile.subSector}
                />
            </div>
        </div>

      </div>

      {/* Footer */}
      <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/80 dark:bg-slate-900/50 sticky bottom-0 z-20 backdrop-blur-md">
        <button 
            disabled={!isComplete}
            onClick={() => onComplete(profile)}
            className="flex items-center gap-2 bg-cyan-600 dark:bg-[#22d3ee] hover:bg-cyan-700 dark:hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-slate-900 px-8 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
        >
            Continue to Post
            <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileSetup;
