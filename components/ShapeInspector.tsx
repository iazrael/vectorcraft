import React from 'react';
import { X, Box, Circle, Sliders } from 'lucide-react';
import { AppearanceControl } from './AppearanceControl';

interface ShapeInspectorProps {
  tagName: string;
  attributes: Record<string, string>;
  onUpdate: (name: string, value: string) => void;
  onClose: () => void;
}

const SHAPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; fields: Array<{ key: string; label: string }> }> = {
  rect: {
    label: 'Rectangle',
    icon: <Box size={16} className="text-green-400" />,
    fields: [
      { key: 'x', label: 'X' },
      { key: 'y', label: 'Y' },
      { key: 'width', label: 'Width' },
      { key: 'height', label: 'Height' },
      { key: 'rx', label: 'Radius X' },
      { key: 'ry', label: 'Radius Y' },
    ]
  },
  circle: {
    label: 'Circle',
    icon: <Circle size={16} className="text-red-400" />,
    fields: [
      { key: 'cx', label: 'Center X' },
      { key: 'cy', label: 'Center Y' },
      { key: 'r', label: 'Radius' },
    ]
  }
};

export const ShapeInspector: React.FC<ShapeInspectorProps> = ({ tagName, attributes, onUpdate, onClose }) => {
  const config = SHAPE_CONFIG[tagName] || {
    label: tagName,
    icon: <Sliders size={16} className="text-slate-400" />,
    fields: [] 
  };

  return (
    <div className="h-72 flex flex-col bg-slate-900 border-t border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
            {config.icon}
            <h3 className="text-sm font-semibold text-slate-200">{config.label} Properties</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded text-slate-400">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Col: Geometry */}
        <div className="flex-1 overflow-y-auto p-4 border-r border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-1 mb-3">
                Geometry
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {config.fields.map((field) => (
                <div key={field.key} className="flex flex-col">
                <label className="text-[10px] text-slate-400 mb-1 font-medium">
                    {field.label}
                </label>
                <div className="relative">
                    <input
                        type="number"
                        value={attributes[field.key] || 0}
                        onChange={(e) => onUpdate(field.key, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-blue-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 text-[9px] pointer-events-none">px</span>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* Right Col: Appearance */}
        <div className="w-[300px] bg-slate-900/50 overflow-y-auto p-4 shrink-0">
             <AppearanceControl attributes={attributes} onUpdate={onUpdate} />
        </div>
      </div>
      
      <div className="px-4 py-1.5 bg-slate-950 text-[10px] text-slate-500 font-mono truncate border-t border-slate-800 flex gap-4">
        <span>ID: {attributes.id || '—'}</span>
      </div>
    </div>
  );
};