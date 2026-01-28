import React, { useEffect, useState } from 'react';
import { PathCommand } from '../types';
import { parsePath, serializePath, updateCommandValue, COMMAND_DESCRIPTIONS } from '../utils/pathUtils';
import { X, CornerDownLeft, Info } from 'lucide-react';
import { AppearanceControl } from './AppearanceControl';

interface PathInspectorProps {
  attributes: Record<string, string>;
  onUpdate: (key: string, value: string) => void;
  onClose: () => void;
}

export const PathInspector: React.FC<PathInspectorProps> = ({ attributes, onUpdate, onClose }) => {
  const [commands, setCommands] = useState<PathCommand[]>([]);
  const d = attributes['d'] || '';

  useEffect(() => {
    setCommands(parsePath(d));
  }, [d]);

  const handleCommandUpdate = (cmdIndex: number, valIndex: number, newValue: string) => {
    const num = parseFloat(newValue);
    if (isNaN(num)) return; 
    
    const newCommands = updateCommandValue(commands, cmdIndex, valIndex, num);
    setCommands(newCommands);
    onUpdate('d', serializePath(newCommands));
  };

  return (
    <div className="h-72 flex flex-col bg-slate-900 border-t border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
            <CornerDownLeft size={16} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200">Path Inspector</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded text-slate-400">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Commands List (Left) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar border-r border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-1 mb-2">
                Path Data (d)
            </div>
            <div className="space-y-2">
                {commands.map((cmd, i) => {
                const desc = COMMAND_DESCRIPTIONS[cmd.type] || { name: 'Unknown', params: [] };
                
                return (
                    <div key={cmd.id} className="flex flex-wrap items-center gap-2 p-2 rounded bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-700 font-bold text-slate-300 text-xs shrink-0 font-mono">
                        {cmd.type}
                    </div>
                    
                    <div className="mr-2 w-24 shrink-0 truncate">
                        <span className="text-[10px] text-slate-400 font-medium">{desc.name}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 flex-1">
                        {cmd.values.map((val, j) => (
                        <div key={j} className="flex flex-col relative group">
                            <label className="text-[9px] text-slate-500 absolute -top-1.5 left-1 bg-slate-800 px-1 leading-none">
                                {desc.params[j] || `p${j}`}
                            </label>
                            <input
                            type="number"
                            value={val}
                            onChange={(e) => handleCommandUpdate(i, j, e.target.value)}
                            className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs text-blue-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                        </div>
                        ))}
                    </div>
                    </div>
                );
                })}
                {commands.length === 0 && (
                    <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                        <Info size={24} className="mb-2 opacity-50"/>
                        <p className="text-xs">No path data.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Appearance (Right) */}
        <div className="w-[300px] bg-slate-900/50 overflow-y-auto p-4 shrink-0">
            <AppearanceControl attributes={attributes} onUpdate={onUpdate} />
        </div>
      </div>

      <div className="px-4 py-1.5 bg-slate-950 text-[10px] text-slate-500 font-mono truncate border-t border-slate-800">
        RAW: {d}
      </div>
    </div>
  );
};