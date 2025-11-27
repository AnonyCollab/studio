
import React, { useState, useRef, useEffect } from 'react';
import { CircleDot, Calendar, Maximize2, AlertCircle, User, Flag, Target, CheckSquare, Zap, BookOpen, CornerDownRight, Lock, Network } from 'lucide-react';
import { PropertyBadge } from './PropertyBadge';
import { DatePickerModal } from './DatePickerModal';
import { SizePickerModal } from './SizePickerModal';
import { StatusPickerModal } from './StatusPickerModal';
import { PriorityPickerModal } from './PriorityPickerModal';
import { AssigneePickerModal } from './AssigneePickerModal';
import type { TaskType, Assignee } from '../../types';

interface DocumentHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  properties: any;
  updateProperty: (key: string, value: any) => void;
  isLight: boolean;
  allowedTypes?: TaskType[];
  members: Assignee[];
}

export function DocumentHeader({ title, setTitle, properties, updateProperty, isLight, allowedTypes, members }: DocumentHeaderProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  
  const statusRef = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const sizeRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [title]);

  const getModalPosition = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return {
        top: rect.bottom + 8,
        left: rect.left
      };
    }
    return undefined;
  };

  const getPriorityColor = (p: string) => {
      switch(p) {
          case 'Critical': return 'red';
          case 'High': return 'orange';
          case 'Medium': return 'blue';
          default: return 'gray';
      }
  }

  const getStatusColor = (s: string) => {
      switch(s) {
          case 'Done': return 'green';
          case 'In Progress': return 'blue';
          case 'Review': return 'orange';
          default: return 'gray';
      }
  }
  
  const labelClass = isLight ? "text-slate-400" : "text-slate-500";
  const iconClass = isLight ? "text-slate-400" : "text-slate-500";
  const buttonHover = isLight ? "hover:bg-black/5 text-slate-600" : "hover:bg-white/5 text-slate-300";
  const sizeBadge = isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-[#2a2a2a] text-white hover:bg-[#333]";
  const titlePlaceholder = isLight ? "placeholder:text-slate-300" : "placeholder:text-slate-700";
  const titleColor = isLight ? 'text-slate-900' : 'text-white';

  const currentAssignee = members.find(a => a.name === properties.assign);
  const assigneeInitials = currentAssignee ? currentAssignee.initials : '?';
  const assigneeColor = currentAssignee ? currentAssignee.color : 'bg-slate-500';

  const getTypeConfig = (type: string) => {
      switch(type) {
          case 'Milestone': return { icon: <Flag size={16} />, color: 'text-red-500' };
          case 'Goal': return { icon: <Target size={16} />, color: 'text-purple-500' };
          case 'Epic': return { icon: <Zap size={16} />, color: 'text-emerald-500' };
          case 'Story': return { icon: <BookOpen size={16} />, color: 'text-blue-500' };
          case 'Issue': return { icon: <CheckSquare size={16} />, color: 'text-yellow-500' };
          case 'Sub-issue': return { icon: <CornerDownRight size={16} />, color: 'text-slate-500' };
          case 'Gateway': return { icon: <Network size={16} />, color: 'text-indigo-500' };
          default: return { icon: <CheckSquare size={16} />, color: 'text-yellow-500' };
      }
  }

  const isMilestone = properties.type === 'Milestone';
  const isAutoDate = properties.type === 'Goal' || isMilestone;
  const typeConfig = getTypeConfig(properties.type || 'Issue');

  return (
    <>
      <div>
        {/* Type Display (Uneditable) */}
        <div className="relative mb-2 inline-block">
            <div 
                className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider select-none cursor-default ${typeConfig.color} ${isLight ? 'bg-black/5' : 'bg-white/5'}`}
            >
                {typeConfig.icon}
                {properties.type || 'Issue'}
            </div>
        </div>

        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={1}
          className={`bg-transparent border-none outline-none w-full mb-4 lg:mb-6 focus:ring-0 p-0 resize-none overflow-hidden font-bold text-2xl lg:text-5xl leading-tight lg:leading-normal ${titleColor} ${titlePlaceholder}`}
          placeholder="Untitled"
        />
        
        <div className="flex items-center gap-2 lg:gap-6 flex-wrap">
          {/* Status */}
          <div className="flex items-center gap-2">
            <CircleDot className={`w-4 h-4 hidden lg:block ${iconClass}`} />
            <span className={`text-sm hidden lg:block ${labelClass}`}>Status</span>
            <button 
                ref={statusRef} 
                onClick={() => !isMilestone && setShowStatusPicker(true)} 
                className={`ml-0 lg:ml-2 flex items-center gap-2 ${isMilestone ? 'cursor-not-allowed opacity-80' : ''}`}
                disabled={isMilestone}
            >
              <PropertyBadge 
                value={properties.status}
                color={getStatusColor(properties.status)}
              />
              {isMilestone && <Lock size={12} className={isLight ? 'text-slate-400' : 'text-slate-500'} />}
            </button>
          </div>

          {/* Priority - Hidden for Milestone */}
          {!isMilestone && (
            <div className="flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 hidden lg:block ${iconClass}`} />
                <span className={`text-sm hidden lg:block ${labelClass}`}>Priority</span>
                <button ref={priorityRef} onClick={() => setShowPriorityPicker(true)} className="ml-0 lg:ml-2">
                <PropertyBadge 
                    value={properties.priority}
                    color={getPriorityColor(properties.priority)}
                />
                </button>
            </div>
          )}

          {/* Size - Hidden for Milestone */}
          {!isMilestone && (
            <div className="flex items-center gap-2">
                <Maximize2 className={`w-4 h-4 hidden lg:block ${iconClass}`} />
                <span className={`text-sm hidden lg:block ${labelClass}`}>Size</span>
                <button
                ref={sizeRef}
                onClick={() => setShowSizePicker(true)}
                className={`ml-0 lg:ml-2 px-3 py-1 rounded text-sm font-mono transition-colors ${sizeBadge}`}
                >
                {properties.size}
                </button>
            </div>
          )}

          {/* Due Date / Deadline */}
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 hidden lg:block ${iconClass}`} />
            <span className={`text-sm hidden lg:block ${labelClass}`}>
                {isAutoDate ? 'Completion Date' : 'Due Date'}
            </span>
            <button
              onClick={() => !isAutoDate && setShowDatePicker(true)}
              disabled={isAutoDate}
              className={`ml-0 lg:ml-2 text-sm px-2 py-1 rounded transition-colors font-medium flex items-center gap-2 ${isAutoDate ? 'opacity-50 cursor-not-allowed' : buttonHover}`}
              title={isAutoDate ? "Date calculated automatically from children" : "Set Date"}
            >
              {properties.dateEnd}
              {isAutoDate && <Lock size={10} />}
            </button>
          </div>
          
          {/* Assignee - Hidden for Milestone */}
          {!isMilestone && (
            <div className="flex items-center gap-2">
                <User className={`w-4 h-4 hidden lg:block ${iconClass}`} />
                <span className={`text-sm hidden lg:block ${labelClass}`}>Assignee</span>
                <button
                ref={assigneeRef}
                onClick={() => setShowAssigneePicker(true)}
                className={`ml-0 lg:ml-2 flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-full transition-colors ${buttonHover}`}
                >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold ${assigneeColor}`}>
                    {assigneeInitials}
                </div>
                <span className="text-sm font-medium max-w-[80px] truncate lg:max-w-none">{properties.assign || 'Unassigned'}</span>
                </button>
            </div>
          )}
        </div>
      </div>

      {showDatePicker && (
        <DatePickerModal 
          dateStart={properties.dateStart}
          dateEnd={properties.dateEnd}
          onClose={() => setShowDatePicker(false)}
          onSave={(start, end) => {
            updateProperty('dateStart', start);
            updateProperty('dateEnd', end);
            setShowDatePicker(false);
          }}
          isLight={isLight}
          singleDate={isAutoDate} // Though disabled, keep logic safe
        />
      )}

      {showSizePicker && (
        <SizePickerModal 
          currentSize={properties.size}
          onClose={() => setShowSizePicker(false)}
          onSelect={(size) => {
            updateProperty('size', size);
            setShowSizePicker(false);
          }}
          position={getModalPosition(sizeRef)}
          isLight={isLight}
        />
      )}

      {showStatusPicker && (
        <StatusPickerModal 
          currentStatus={properties.status}
          onClose={() => setShowStatusPicker(false)}
          onSelect={(status) => {
            updateProperty('status', status);
            setShowStatusPicker(false);
          }}
          position={getModalPosition(statusRef)}
          isLight={isLight}
        />
      )}

      {showPriorityPicker && (
        <PriorityPickerModal 
          currentPriority={properties.priority}
          onClose={() => setShowPriorityPicker(false)}
          onSelect={(priority) => {
            updateProperty('priority', priority);
            setShowPriorityPicker(false);
          }}
          position={getModalPosition(priorityRef)}
          isLight={isLight}
        />
      )}

      {showAssigneePicker && (
          <AssigneePickerModal 
            currentAssignee={properties.assign}
            onClose={() => setShowAssigneePicker(false)}
            onSelect={(name) => {
                updateProperty('assign', name);
                setShowAssigneePicker(false);
            }}
            position={getModalPosition(assigneeRef)}
            isLight={isLight}
            members={members}
          />
      )}
    </>
  );
}
