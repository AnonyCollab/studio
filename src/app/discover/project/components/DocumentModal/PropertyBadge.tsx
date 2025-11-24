
import React from 'react';

interface PropertyBadgeProps {
  value: string;
  color: string | 'blue' | 'purple' | 'gray' | 'green' | 'orange' | 'red';
}

export function PropertyBadge({ value, color }: PropertyBadgeProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-600/80 text-white',
    purple: 'bg-purple-700/80 text-white',
    gray: 'bg-slate-600/80 text-white',
    green: 'bg-emerald-700/80 text-white',
    orange: 'bg-amber-700/80 text-white',
    red: 'bg-rose-700/80 text-white'
  };

  const className = colorClasses[color] || colorClasses.gray;

  return (
    <span className={`px-3 py-1 rounded text-sm ${className} cursor-pointer hover:opacity-90 transition-opacity`}>
      {value}
    </span>
  );
}
