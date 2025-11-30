
'use client';
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  Briefcase, TrendingUp, Users, Settings, Wrench, Scale, DollarSign, 
  Target, Share2, HelpCircle, MessageSquare, AlertCircle, Trophy, 
  BookOpen, Bell, FileText, Sparkles, X, Upload, Check, ChevronDown, 
  LayoutGrid, Image as ImageIcon, Globe, User, ArrowLeft, Trash2,
  Plus, CheckCircle2, ChevronRight
} from 'lucide-react';
import { PostCategory, PostType, PostFormState, UserProfile } from '../types';
import { suggestTags, suggestCategoryAndType } from '../services/geminiService';
import { detailedSectorsData } from '@/app/data/naics';

// --- Configuration Data ---

const CATEGORY_META: Record<PostCategory, { icon: React.ReactNode; desc: string; color: string; hoverColor: string }> = {
  [PostCategory.Finance]: { 
    icon: <DollarSign className="w-5 h-5" />, 
    desc: "Fundraising, cash flow, accounting, taxes", 
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    hoverColor: "group-hover:bg-emerald-500 group-hover:text-white"
  },
  [PostCategory.Marketing]: { 
    icon: <TrendingUp className="w-5 h-5" />, 
    desc: "Advertising, SEO, social media, branding", 
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    hoverColor: "group-hover:bg-pink-500 group-hover:text-white"
  },
  [PostCategory.HR]: { 
    icon: <Users className="w-5 h-5" />, 
    desc: "Hiring, management, culture, payroll", 
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    hoverColor: "group-hover:bg-orange-500 group-hover:text-white"
  },
  [PostCategory.Operations]: { 
    icon: <Settings className="w-5 h-5" />, 
    desc: "Processes, productivity, automation", 
    color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    hoverColor: "group-hover:bg-slate-500 group-hover:text-white"
  },
  [PostCategory.Tools]: { 
    icon: <Wrench className="w-5 h-5" />, 
    desc: "Software recommendations, tech stack", 
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    hoverColor: "group-hover:bg-blue-500 group-hover:text-white"
  },
  [PostCategory.Legal]: { 
    icon: <Scale className="w-5 h-5" />, 
    desc: "Contracts, regulations, business structure", 
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    hoverColor: "group-hover:bg-red-500 group-hover:text-white"
  },
  [PostCategory.Sales]: { 
    icon: <Briefcase className="w-5 h-5" />, 
    desc: "Pricing, deals, customer acquisition", 
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    hoverColor: "group-hover:bg-indigo-500 group-hover:text-white"
  },
  [PostCategory.Product]: { 
    icon: <Target className="w-5 h-5" />, 
    desc: "Product development, positioning", 
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    hoverColor: "group-hover:bg-violet-500 group-hover:text-white"
  },
  [PostCategory.Networking]: { 
    icon: <Share2 className="w-5 h-5" />, 
    desc: "Collaborations, connections, partnerships", 
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    hoverColor: "group-hover:bg-cyan-500 group-hover:text-white"
  },
};

const TYPE_META: Record<PostType, { icon: React.ReactNode; color: string; desc: string }> = {
  [PostType.Question]: { icon: <HelpCircle className="w-4 h-4" />, color: "text-amber-500 dark:text-amber-400", desc: "Advice" },
  [PostType.Discussion]: { icon: <MessageSquare className="w-4 h-4" />, color: "text-blue-500 dark:text-blue-400", desc: "Discuss" },
  [PostType.Help]: { icon: <AlertCircle className="w-4 h-4" />, color: "text-red-500 dark:text-red-400", desc: "Urgent" },
  [PostType.Win]: { icon: <Trophy className="w-4 h-4" />, color: "text-yellow-500 dark:text-yellow-400", desc: "Success" },
  [PostType.Resource]: { icon: <BookOpen className="w-4 h-4" />, color: "text-emerald-500 dark:text-emerald-400", desc: "Share" },
  [PostType.Announcement]: { icon: <Bell className="w-4 h-4" />, color: "text-purple-500 dark:text-purple-400", desc: "News" },
  [PostType.CaseStudy]: { icon: <FileText className="w-4 h-4" />, color: "text-indigo-500 dark:text-indigo-400", desc: "Deep Dive" },
};

// --- Helper Components ---

interface SectionLabelProps {
  icon?: React.ElementType;
  children: React.ReactNode;
  required?: boolean;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ icon: Icon, children, required }) => (
  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {children}
    {required && <span className="text-red-500 dark:text-red-400 ml-0.5">*</span>}
  </label>
);

const MinimalInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`
        w-full rounded-lg px-4 py-3 
        text-slate-900 dark:text-slate-200 
        placeholder-slate-400 dark:placeholder-slate-500 
        bg-slate-100 dark:bg-slate-800 
        border-none
        focus:bg-white dark:focus:bg-slate-700 
        focus:ring-2 focus:ring-cyan-500/40 
        transition-all duration-200 shadow-sm 
        ${props.className || ''}
    `}
  />
);

// --- Custom Selects ---

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  isActive: boolean;
  onToggle: () => void;
  onClickOutside: () => void;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value, onChange, options, placeholder, disabled, isActive, onToggle, onClickOutside, className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };
    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive, onClickOutside]);

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-300 ease-in-out w-full sm:w-0 sm:flex-1`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`
          w-full h-full rounded-xl px-4 py-3.5 text-sm font-medium text-left flex items-center justify-between
          bg-slate-100 dark:bg-slate-800 
          border border-transparent
          ${isActive 
            ? 'bg-white dark:bg-slate-700 ring-2 ring-cyan-500/40 shadow-lg' 
            : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }
          text-slate-900 dark:text-slate-200 
          transition-all duration-300
          ${className}
        `}
      >
        <span className="truncate block pr-2">
          {value || <span className="text-slate-400 dark:text-slate-500 font-normal">{placeholder}</span>}
        </span>
        <ChevronDown className={`flex-shrink-0 w-4 h-4 text-slate-400 transition-transform duration-300 ${isActive ? 'rotate-180 text-cyan-500' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isActive && !disabled && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 w-full max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 p-1">
          <div className="p-1">
             <div 
                className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
             >
                Select {placeholder}
             </div>
             {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onChange(option);
                      onClickOutside(); // Close on select
                    }}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between
                      ${value === option 
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                      transition-colors
                    `}
                  >
                    <span className="truncate">{option}</span>
                    {value === option && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />}
                  </button>
                ))
             ) : (
               <div className="px-3 py-4 text-center text-sm text-slate-400">
                  No options available
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};


// --- Rich Select for Category/Type ---

interface RichSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  options: any[]; // Array of keys
  metaMap: Record<string, any>; // Meta data map
  placeholder: string;
  icon?: React.ElementType;
}

const RichSelect: React.FC<RichSelectProps> = ({ value, onChange, options, metaMap, placeholder, icon: Icon }) => {
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

  const selectedMeta = value ? metaMap[value] : null;

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full text-left rounded-xl p-3 border transition-all duration-200 flex items-center justify-between group
          ${isOpen 
            ? 'bg-white dark:bg-slate-800 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg' 
            : 'bg-slate-100 dark:bg-slate-800/60 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
          }
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
           {selectedMeta ? (
             <>
               <div className={`p-2 rounded-lg ${selectedMeta.color}`}>
                  {React.cloneElement(selectedMeta.icon, { className: "w-5 h-5" })}
               </div>
               <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{value}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{selectedMeta.desc}</div>
               </div>
             </>
           ) : (
             <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 px-1 py-1">
                {Icon && <Icon className="w-5 h-5" />}
                <span className="font-medium text-sm">{placeholder}</span>
             </div>
           )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 w-full max-h-[400px] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 p-1.5">
           {options.map((opt) => {
             const meta = metaMap[opt];
             const isSelected = value === opt;
             return (
               <button
                 key={opt}
                 onClick={() => { onChange(opt); setIsOpen(false); }}
                 className={`
                   w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors mb-0.5 last:mb-0
                   ${isSelected 
                     ? 'bg-slate-100 dark:bg-slate-800' 
                     : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                   }
                 `}
               >
                 <div className={`p-2 rounded-lg flex-shrink-0 ${meta.color}`}>
                    {React.cloneElement(meta.icon, { className: "w-5 h-5" })}
                 </div>
                 <div className="min-w-0">
                    <div className={`text-sm font-bold ${isSelected ? 'text-cyan-500' : 'text-slate-900 dark:text-white'}`}>
                      {opt}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {meta.desc}
                    </div>
                 </div>
                 {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-500 ml-auto mt-1" />}
               </button>
             );
           })}
        </div>
      )}
    </div>
  );
};

// --- Mention Textarea ---

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  images: File[];
  className?: string;
  minHeight?: string;
}

const MentionTextarea: React.FC<MentionTextareaProps> = ({ value, onChange, placeholder, images, className, minHeight = "150px" }) => {
  const [showMention, setShowMention] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useLayoutEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get correct scrollHeight
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Set height to scrollHeight (content height)
      // We ensure it is at least minHeight, but allows growing infinitely
      // Note: parseInt("50vh") is 50. scrollHeight usually > 50, so this works fine for small viewports too.
      // Inline minHeight handles the visual minimum.
      const newHeight = Math.max(parseInt(minHeight), scrollHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value, minHeight]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const selectionStart = e.target.selectionStart;
    
    // Check if the user just typed '@' or if the cursor is right after '@'
    const charBeforeCursor = newValue[selectionStart - 1];
    
    if (charBeforeCursor === '@' && images.length > 0) {
      setShowMention(true);
    } else if (showMention && charBeforeCursor === ' ') {
      // Hide if space is typed
      setShowMention(false);
    } else if (showMention && !newValue.includes('@')) {
       setShowMention(false);
    }

    onChange(newValue);
  };

  const insertMention = (filename: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursor = textarea.selectionStart;
    const text = textarea.value;
    
    // Find the last '@' before cursor
    const lastAtPos = text.lastIndexOf('@', cursor);
    
    if (lastAtPos !== -1) {
      const before = text.substring(0, lastAtPos);
      const after = text.substring(cursor);
      const insertion = `[Image: ${filename}] `;
      const newText = before + insertion + after;
      
      onChange(newText);
      setShowMention(false);
      
      // Restore focus (needs timeout for React render cycle)
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(before.length + insertion.length, before.length + insertion.length);
      }, 0);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
       if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
         setShowMention(false);
       }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col">
      <textarea
        ref={textareaRef}
        className={`${className} overflow-hidden`}
        placeholder={placeholder}
        value={value}
        onChange={handleInput}
        style={{ minHeight: minHeight }}
      />
      {showMention && images.length > 0 && (
        <div className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
           <div className="bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 dark:border-slate-700">
              Mention Image
           </div>
           <div className="max-h-48 overflow-y-auto p-1">
             {images.map((img, idx) => (
               <button
                 key={idx}
                 onClick={() => insertMention(img.name)}
                 className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors group"
               >
                 <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" />
                 <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{img.name}</span>
               </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};


// --- Main Component ---

interface CreatePostFormProps {
  userProfile: UserProfile;
  onBack: () => void;
  isDarkMode: boolean;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ userProfile, onBack, isDarkMode }) => {
  // State
  const [form, setForm] = useState<PostFormState>({
    title: '',
    category: null,
    type: null,
    audienceSector: '',
    audienceSubSector: '',
    audienceIndustry: '',
    summaryProblem: '',
    detailsProblem: '',
    summaryTried: '',
    detailsTried: '',
    summaryOutcome: '',
    detailsOutcome: '',
    tags: [],
    images: [], // Multiple images
  });

  const [activeTab, setActiveTab] = useState<'problem' | 'tried' | 'outcome' | 'media'>('problem');
  const [mobileEditorSection, setMobileEditorSection] = useState<'problem' | 'tried' | 'outcome' | 'media' | null>(null);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiMetaLoading, setIsAiMetaLoading] = useState(false);
  const [isAiAudienceLoading, setIsAiAudienceLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  // Custom Select State
  const [openAudienceDropdown, setOpenAudienceDropdown] = useState<'sector' | 'subSector' | 'industry' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived Data for Audience
  const selectedSectorData = detailedSectorsData.find(s => s.name === form.audienceSector);
  const selectedSubSectorData = selectedSectorData?.subSectors.find(s => s.name === form.audienceSubSector);

  // --- Handlers ---

  // Lock body scroll when mobile editor is open
  useEffect(() => {
    if (mobileEditorSection) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileEditorSection]);

  const handleInputChange = (field: keyof PostFormState, value: any) => {
    setForm(prev => {
      const newState = { ...prev, [field]: value };
      
      // Reset hierarchical fields if parent changes
      if (field === 'audienceSector') {
        newState.audienceSubSector = '';
        newState.audienceIndustry = '';
      }
      if (field === 'audienceSubSector') {
        newState.industry = '';
      }
      return newState;
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) {
        handleInputChange('tags', [...form.tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', form.tags.filter(t => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Append new files to existing ones
      handleInputChange('images', [...form.images, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    handleInputChange('images', newImages);
  };

  // --- AI Actions ---

  const handleAiSuggestTags = async () => {
    const content = `
      Problem Summary: ${form.summaryProblem}
      Problem Details: ${form.detailsProblem}
      Tried Summary: ${form.summaryTried}
      Tried Details: ${form.detailsTried}
      Outcome Summary: ${form.summaryOutcome}
      Outcome Details: ${form.detailsOutcome}
      Target Audience: ${form.audienceSector} > ${form.audienceSubSector} > ${form.audienceIndustry}
    `;

    if ((!form.title && !content.trim()) || !form.category) {
      alert("Please fill in a title, some details, and select a category first.");
      return;
    }
    
    setIsAiLoading(true);
    try {
      const suggestedTags = await suggestTags(
        form.title,
        content,
        form.category
      );
      
      const newTags = Array.from(new Set([...form.tags, ...suggestedTags]));
      handleInputChange('tags', newTags);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiAutoCategorize = async () => {
    const content = `
       Problem: ${form.summaryProblem} ${form.detailsProblem}
       Tried: ${form.summaryTried} ${form.detailsTried}
    `;

    if (!form.title && content.length < 20) {
      alert("Please provide a title or some details for the AI to analyze.");
      return;
    }

    setIsAiMetaLoading(true);
    try {
      const { category, type } = await suggestCategoryAndType(form.title, content);
      if (category) handleInputChange('category', category);
      if (type) handleInputChange('type', type);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiMetaLoading(false);
    }
  };

  const handleAiSuggestAudience = async () => {
     if (!form.title && !form.summaryProblem) {
         alert("Please provide a title or describe the problem for the AI to analyze.");
         return;
     }

     setIsAiAudienceLoading(true);
     try {
         // Mocking AI response based on keywords for now
         const text = (form.title + ' ' + form.summaryProblem).toLowerCase();
         if (text.includes('software')) {
             handleInputChange('audienceSector', 'Information');
             setTimeout(() => handleInputChange('audienceSubSector', 'Software Publishers'), 100);
             setTimeout(() => handleInputChange('audienceIndustry', 'Software Publishers'), 200);
         } else if (text.includes('medical') || text.includes('health')) {
            handleInputChange('audienceSector', 'Health Care and Social Assistance');
         } else {
            handleInputChange('audienceSector', 'Professional, Scientific, and Technical Services');
         }
         
         // Highlight the change
         setOpenAudienceDropdown('sector');
         setTimeout(() => setOpenAudienceDropdown(null), 1000);
     } catch(e) {
         console.error(e);
     } finally {
        setIsAiAudienceLoading(false);
     }
  };

  // --- Render Mobile Full Page Editor ---
  const renderMobileEditor = () => {
    if (!mobileEditorSection) return null;

    const config = {
      problem: { title: "The Problem", summaryKey: "summaryProblem", detailsKey: "detailsProblem", placeholder: "TL;DR: My churn increased..." },
      tried: { title: "What I've Tried", summaryKey: "summaryTried", detailsKey: "detailsTried", placeholder: "Action: Sent survey..." },
      outcome: { title: "Expected Outcome", summaryKey: "summaryOutcome", detailsKey: "detailsOutcome", placeholder: "Goal: Bring churn below 2%..." },
      media: { title: "Media Attachments", summaryKey: "", detailsKey: "" }
    };
    
    const section = config[mobileEditorSection];
    const isMedia = mobileEditorSection === 'media';

    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-[#020617] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
           <button onClick={() => setMobileEditorSection(null)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{section.title}</h3>
           <div className="flex items-center gap-1">
              <button 
                onClick={() => setMobileEditorSection(null)}
                className="px-4 py-1.5 rounded-full bg-cyan-600 dark:bg-[#22d3ee] hover:bg-cyan-700 dark:hover:bg-cyan-300 text-white dark:text-slate-900 text-xs font-bold ml-1 shadow-md shadow-cyan-500/20"
              >
                 Done
              </button>
           </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
           {isMedia ? (
               <div className="p-6">
                 {/* Re-using Upload Logic for Mobile View */}
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                      multiple 
                  />
                  <div className="grid grid-cols-2 gap-4">
                     {form.images.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                           <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                           </div>
                           <button 
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-cyan-500 hover:border-cyan-500"
                     >
                        <Plus className="w-8 h-8 mb-1" />
                        <span className="text-xs font-bold">Add</span>
                     </button>
                  </div>
               </div>
           ) : (
               <>
                 <div className="p-5 pb-0">
                    <input 
                       className="w-full text-2xl font-bold bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:ring-0 leading-tight outline-none shadow-none"
                       placeholder={section.placeholder}
                       value={(form as any)[section.summaryKey as string]}
                       onChange={(e) => handleInputChange(section.summaryKey as any, e.target.value)}
                    />
                 </div>
                 {/* Textarea Container - Removed flex-1 to allow auto growth inside scrollable parent */}
                 <div className="px-5 pt-4 pb-20 min-h-0">
                    <MentionTextarea
                        // Passed minHeight explicitly and removed flex-1 so it grows with content
                        className="w-full bg-transparent border-none p-0 text-base leading-relaxed text-slate-700 dark:text-slate-300 resize-none focus:ring-0 focus:outline-none outline-none shadow-none placeholder-slate-400 dark:placeholder-slate-600"
                        minHeight="50vh"
                        placeholder="Type detailed description here..."
                        value={(form as any)[section.detailsKey as string]}
                        onChange={(val) => handleInputChange(section.detailsKey as any, val)}
                        images={form.images}
                    />
                 </div>
               </>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full text-slate-900 dark:text-slate-100 flex flex-col">
      
      {/* Mobile Editor Overlay */}
      {renderMobileEditor()}

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-cyan-500/20">
             {userProfile.businessModel ? userProfile.businessModel.charAt(0) : '?'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">Create Post</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
               Posting as {userProfile.businessModel} • {userProfile.stage}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden sm:inline">Back to Profile</span>
            </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8 flex-1 overflow-y-auto">
        
        {/* 1. Title Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <SectionLabel required>Title / Question</SectionLabel>
            <button 
              onClick={handleAiAutoCategorize}
              disabled={isAiMetaLoading}
              className="text-xs flex items-center gap-1.5 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium disabled:opacity-50 transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-full border border-cyan-500/20"
            >
              {isAiMetaLoading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              AI Suggest
            </button>
          </div>
          <input
            type="text"
            placeholder="e.g., Strategies for reducing churn in B2B SaaS?"
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-5 py-4 text-xl font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-cyan-500/40 focus:shadow-[0_0_30px_-5px_rgba(34,211,238,0.2)] transition-all duration-300"
            value={form.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
        </div>

        {/* 2. Category & Post Type (Rich Selects Side-by-Side) */}
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
                <SectionLabel icon={LayoutGrid} required>Category</SectionLabel>
                <RichSelect 
                   value={form.category}
                   onChange={(val) => handleInputChange('category', val as PostCategory)}
                   options={Object.values(PostCategory)}
                   metaMap={CATEGORY_META}
                   placeholder="Select Category"
                   icon={LayoutGrid}
                />
            </div>
            <div className="flex-1 space-y-2">
                <SectionLabel icon={Check} required>Post Type</SectionLabel>
                <RichSelect 
                   value={form.type}
                   onChange={(val) => handleInputChange('type', val as PostType)}
                   options={Object.values(PostType)}
                   metaMap={TYPE_META}
                   placeholder="Select Type"
                   icon={Check}
                />
            </div>
        </div>

        {/* 4. Details Section - Responsive Split */}
        
        {/* Mobile View: Vertical Stack of Summary Cards */}
        <div className="block sm:hidden space-y-3">
           <SectionLabel>Post Details</SectionLabel>
           {[
             { id: 'problem', label: '1. The Problem', val: form.summaryProblem, ph: "Describe the issue..." },
             { id: 'tried', label: '2. What I\'ve Tried', val: form.summaryTried, ph: "What steps taken?" },
             { id: 'outcome', label: '3. Outcome', val: form.summaryOutcome, ph: "Expected result?" },
             { id: 'media', label: '4. Media', val: `${form.images.length} images attached`, ph: "Add images..." }
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setMobileEditorSection(item.id as any)}
               className="w-full text-left bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
             >
                <div className="min-w-0 flex-1">
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{item.label}</div>
                   {item.id === 'media' && form.images.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto py-1">
                         {form.images.map((_, idx) => (
                            <div key={idx} className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center">
                               <ImageIcon className="w-4 h-4 text-slate-400" />
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className={`text-sm font-medium truncate ${item.val ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic'}`}>
                        {item.val || item.ph}
                      </div>
                   )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 ml-3" />
             </button>
           ))}
        </div>

        {/* Desktop View: Tabs */}
        <div className="hidden sm:block space-y-4 pt-2">
            <div className="flex items-center gap-2">
              {/* Text Content Tabs */}
              <div className="flex-1 flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/50">
                {[
                    { id: 'problem', label: '1. Problem' },
                    { id: 'tried', label: "2. Tried" },
                    { id: 'outcome', label: '3. Outcome' },
                ].map((tab) => (
                    <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        flex-1 py-2 px-2 text-xs font-bold rounded-md transition-all duration-200 truncate
                        ${activeTab === tab.id
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                        }
                    `}
                    >
                    {tab.label}
                    </button>
                ))}
              </div>

              {/* Media Tab Button */}
              <button
                onClick={() => setActiveTab('media')}
                className={`
                    p-2 rounded-lg transition-all duration-200 flex items-center justify-center aspect-square h-10 w-10 relative
                    ${activeTab === 'media'
                    ? 'bg-cyan-600 dark:bg-[#22d3ee] text-white dark:text-slate-900 shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50'
                    }
                `}
                title="Media & Attachments"
              >
                <ImageIcon className="w-6 h-6" />
                {form.images.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                        {form.images.length}
                    </span>
                )}
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-inner">
                {/* Problem Tab */}
                <div className={activeTab === 'problem' ? 'block space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300' : 'hidden'}>
                    <div>
                    <SectionLabel>Summary</SectionLabel>
                    <MinimalInput 
                        placeholder="TL;DR: My churn increased by 5%..."
                        value={form.summaryProblem}
                        onChange={(e) => handleInputChange('summaryProblem', e.target.value)}
                        maxLength={140}
                    />
                    </div>
                    <div>
                    <SectionLabel>Details <span className="text-[10px] font-normal text-slate-400 normal-case ml-1">(Type '@' to link images)</span></SectionLabel>
                    <MentionTextarea
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-3 text-slate-900 dark:text-slate-300 resize-none focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-cyan-500/40 shadow-inner text-sm leading-relaxed placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="Describe the context clearly..."
                        value={form.detailsProblem}
                        onChange={(val) => handleInputChange('detailsProblem', val)}
                        images={form.images}
                        minHeight="300px"
                    />
                    </div>
                </div>

                {/* Tried Tab */}
                <div className={activeTab === 'tried' ? 'block space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300' : 'hidden'}>
                    <div>
                    <SectionLabel>Summary</SectionLabel>
                    <MinimalInput 
                        placeholder="Action: Sent survey to users..."
                        value={form.summaryTried}
                        onChange={(e) => handleInputChange('summaryTried', e.target.value)}
                        maxLength={140}
                    />
                    </div>
                    <div>
                    <SectionLabel>Details <span className="text-[10px] font-normal text-slate-400 normal-case ml-1">(Type '@' to link images)</span></SectionLabel>
                    <MentionTextarea
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-3 text-slate-900 dark:text-slate-300 resize-none focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-cyan-500/40 shadow-inner text-sm leading-relaxed placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="What steps have you taken?"
                        value={form.detailsTried}
                        onChange={(val) => handleInputChange('detailsTried', val)}
                        images={form.images}
                        minHeight="300px"
                    />
                    </div>
                </div>

                {/* Outcome Tab */}
                <div className={activeTab === 'outcome' ? 'block space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300' : 'hidden'}>
                    <div>
                    <SectionLabel>Summary</SectionLabel>
                    <MinimalInput 
                        placeholder="Goal: Bring churn below 2%..."
                        value={form.summaryOutcome}
                        onChange={(e) => handleInputChange('summaryOutcome', e.target.value)}
                        maxLength={140}
                    />
                    </div>
                    <div>
                    <SectionLabel>Details <span className="text-[10px] font-normal text-slate-400 normal-case ml-1">(Type '@' to link images)</span></SectionLabel>
                    <MentionTextarea
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-3 text-slate-900 dark:text-slate-300 resize-none focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-cyan-500/40 shadow-inner text-sm leading-relaxed placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="What does success look like?"
                        value={form.detailsOutcome}
                        onChange={(val) => handleInputChange('detailsOutcome', val)}
                        images={form.images}
                        minHeight="300px"
                    />
                    </div>
                </div>

                {/* Media Tab */}
                <div className={activeTab === 'media' ? 'block space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-300' : 'hidden'}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                        multiple // Multiple files
                    />
                    
                    {/* Empty State: Huge Drop Zone */}
                    {form.images.length === 0 && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 rounded-xl min-h-[250px] flex flex-col items-center justify-center p-8 text-slate-400 dark:text-slate-500 cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group relative overflow-hidden"
                        >
                            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                <ImageIcon className="w-10 h-10 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Click to upload images</h3>
                            <p className="text-sm text-slate-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                        </div>
                    )}

                    {/* Image Preview Grid (Only shown when images exist) */}
                    {form.images.length > 0 && (
                        <div className="space-y-4">
                            <SectionLabel>Attached Images ({form.images.length})</SectionLabel>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {form.images.map((file, index) => (
                                    <div key={index} className="relative group aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                                            {/* In a real app we'd use URL.createObjectURL(file) here */}
                                            <ImageIcon className="w-10 h-10 opacity-20" />
                                            <span className="absolute bottom-3 text-[10px] font-mono px-3 truncate max-w-full text-center opacity-60">
                                                {file.name}
                                            </span>
                                        </div>
                                         {/* Mock Preview for text - in production use <img src={URL.createObjectURL(file)} /> */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                className="p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-red-500 transition-all shadow-md"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-500 hover:bg-cyan-500/5 transition-all"
                                >
                                    <Plus className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Add More</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* 5. Footer Audience - Custom Selects */}
        <div className="space-y-2">
           <div className="flex justify-between items-center">
             <SectionLabel icon={Globe}>Target Audience (Who)</SectionLabel>
             <button 
                onClick={() => {}}
                disabled={isAiAudienceLoading}
                className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 disabled:opacity-50 transition-colors bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded"
            >
                {isAiAudienceLoading ? <Sparkles className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI Suggest
            </button>
           </div>
           
           {/* Full Width Audience Selection with Custom Expanding Dropdowns */}
           <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-4">
               <CustomSelect 
                  placeholder="Sector"
                  value={form.audienceSector}
                  options={detailedSectorsData.map(s => s.name)}
                  onChange={(val) => handleInputChange('audienceSector', val)}
                  isActive={openAudienceDropdown === 'sector'}
                  onToggle={() => setOpenAudienceDropdown(openAudienceDropdown === 'sector' ? null : 'sector')}
                  onClickOutside={() => setOpenAudienceDropdown(null)}
               />
               
               <CustomSelect 
                  placeholder="Sub-sector"
                  value={form.audienceSubSector}
                  options={selectedSectorData?.subSectors.map(s => s.name) || []}
                  onChange={(val) => handleInputChange('audienceSubSector', val)}
                  disabled={!form.audienceSector}
                  isActive={openAudienceDropdown === 'subSector'}
                  onToggle={() => setOpenAudienceDropdown(openAudienceDropdown === 'subSector' ? null : 'subSector')}
                  onClickOutside={() => setOpenAudienceDropdown(null)}
               />

               <CustomSelect 
                  placeholder="Industry"
                  value={form.audienceIndustry}
                  options={selectedSubSectorData?.industries.map(i => i.name) || []}
                  onChange={(val) => handleInputChange('audienceIndustry', val)}
                  disabled={!form.audienceSubSector}
                  isActive={openAudienceDropdown === 'industry'}
                  onToggle={() => setOpenAudienceDropdown(openAudienceDropdown === 'industry' ? null : 'industry')}
                  onClickOutside={() => setOpenAudienceDropdown(null)}
               />
           </div>
        </div>

        {/* 6. Tags (Full Row Below, Wrapped) */}
        <div className="space-y-2 pb-6 sm:pb-0">
            <div className="flex justify-between items-center">
            <SectionLabel required>Tags</SectionLabel>
            <button
                onClick={handleAiSuggestTags}
                disabled={isAiLoading}
                className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-500 disabled:opacity-50 transition-colors bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded"
            >
                {isAiLoading ? <Sparkles className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Auto-Tag
            </button>
            </div>
            
            {/* Wrap Tags with Large Chips */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Input pill */}
                <input 
                    type="text" 
                    placeholder={form.tags.length === 0 ? "Add tags..." : "+ Tag"}
                    className="
                        flex-shrink-0 min-w-[100px] max-w-[150px]
                        bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 
                        text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 
                        focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-cyan-500/40 focus:min-w-[140px]
                        transition-all shadow-sm
                    "
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                />

                {form.tags.map(tag => (
                    <span key={tag} className="
                        flex-shrink-0 inline-flex items-center gap-2 
                        bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold px-4 py-2.5 
                        rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:border-cyan-500/30 hover:shadow-md transition-all
                    ">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-500 dark:hover:text-red-400 rounded-full p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </span>
                ))}
            </div>
        </div>

      </div>

      {/* Footer Action Bar */}
      <div className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex justify-between items-center sticky bottom-0 z-20">
        <div className="text-[10px] text-slate-500 font-medium hidden sm:block">
           <span className="text-red-500 dark:text-red-400">*</span> Required
        </div>
        <div className="flex gap-3 ml-auto w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-xs border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            Save Draft
          </button>
          <button 
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-cyan-600 dark:bg-[#22d3ee] hover:bg-cyan-700 dark:hover:bg-cyan-300 text-white dark:text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 text-xs"
            onClick={() => console.log('Submitting', form, userProfile)}
          >
            <Share2 className="w-3.5 h-3.5" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
