import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  return (
    <div className="h-full w-full bg-slate-900 font-mono text-sm relative">
      <textarea
        className="w-full h-full bg-transparent text-slate-300 p-4 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 leading-relaxed"
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      <div className="absolute top-0 right-0 p-2 text-xs text-slate-500 pointer-events-none bg-slate-900/80 rounded-bl">
        SVG Source
      </div>
    </div>
  );
};