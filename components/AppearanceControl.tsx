import React from 'react';
import { Palette, Droplet } from 'lucide-react';

interface AppearanceControlProps {
  attributes: Record<string, string>;
  onUpdate: (name: string, value: string) => void;
}

export const AppearanceControl: React.FC<AppearanceControlProps> = ({ attributes, onUpdate }) => {
  
  // Helper to safely get hex for color picker, fallback to black if complex value
  const getColorValue = (val: string) => {
    if (!val) return '#000000';
    if (val.startsWith('#') && (val.length === 4 || val.length === 7)) return val;
    // For url(), rgba(), etc., we can't show it in type="color", so just return a default
    return '#000000';
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-1 mb-2">
        Appearance
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Fill */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Palette size={10} /> Fill
          </label>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-700 shrink-0">
               <input 
                 type="color" 
                 value={getColorValue(attributes['fill'])}
                 onChange={(e) => onUpdate('fill', e.target.value)}
                 className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
               />
            </div>
            <input 
               type="text" 
               value={attributes['fill'] || 'none'}
               onChange={(e) => onUpdate('fill', e.target.value)}
               className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Stroke Color */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Droplet size={10} /> Stroke
          </label>
          <div className="flex items-center gap-2">
             <div className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-700 shrink-0">
               <input 
                 type="color" 
                 value={getColorValue(attributes['stroke'])}
                 onChange={(e) => onUpdate('stroke', e.target.value)}
                 className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
               />
            </div>
            <input 
               type="text" 
               value={attributes['stroke'] || 'none'}
               onChange={(e) => onUpdate('stroke', e.target.value)}
               className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Stroke Width */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            Stroke Width
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={parseFloat(attributes['stroke-width']) || 0}
              onChange={(e) => onUpdate('stroke-width', e.target.value)}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <input 
              type="number"
              min="0"
              value={attributes['stroke-width'] || 0}
              onChange={(e) => onUpdate('stroke-width', e.target.value)}
              className="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-1.5 text-xs text-right text-slate-300 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Opacity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            Opacity
          </label>
           <div className="flex items-center gap-2">
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={attributes['opacity'] || 1}
              onChange={(e) => onUpdate('opacity', e.target.value)}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <input 
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={attributes['opacity'] || 1}
              onChange={(e) => onUpdate('opacity', e.target.value)}
              className="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-1.5 text-xs text-right text-slate-300 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
};