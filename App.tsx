import React, { useState, useEffect, useMemo } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { Preview } from './components/Preview';
import { StructureTree } from './components/StructureTree';
import { PathInspector } from './components/PathInspector';
import { ShapeInspector } from './components/ShapeInspector';
import { parseSVGStructure, updateAttributeInSVG, getElementByPath } from './utils/domUtils';
import { SVGNode, SelectionPath } from './types';
import { Download, Share2, Layers, Code, Zap } from 'lucide-react';

// Initial SVG Example
const INITIAL_SVG = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(59,130,246);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(147,51,234);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="400" height="400" fill="#0f172a" />
  
  <g id="main-group">
    <circle cx="200" cy="200" r="100" fill="url(#grad1)" opacity="0.5" />
    <path 
      id="wave-path"
      d="M 50 200 C 50 200 120 100 200 200 S 350 200 350 200" 
      stroke="white" 
      stroke-width="4" 
      fill="transparent" 
      stroke-linecap="round"
    />
    <rect x="150" y="150" width="100" height="100" fill="transparent" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5,5" />
  </g>
  
  <text x="20" y="380" font-family="sans-serif" font-size="14" fill="#94a3b8">
    VectorCraft v1.0
  </text>
</svg>`;

export default function App() {
  const [svgCode, setSvgCode] = useState(INITIAL_SVG);
  const [selectedPath, setSelectedPath] = useState<SelectionPath | null>(null);
  const [treeStructure, setTreeStructure] = useState<SVGNode | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'structure'>('code');

  // Parse SVG Structure when code changes
  useEffect(() => {
    const structure = parseSVGStructure(svgCode);
    setTreeStructure(structure);
  }, [svgCode]);

  // Determine details of selected element (Tag name and all attributes)
  const selectedElementDetails = useMemo(() => {
    if (!selectedPath) return null;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, 'image/svg+xml');
    const el = getElementByPath(doc, selectedPath);
    if (!el) return null;
    
    // Extract all attributes into a simple Record object
    const attributes: Record<string, string> = {};
    for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        attributes[attr.name] = attr.value;
    }

    return {
      tagName: el.tagName,
      attributes,
      id: el.getAttribute('id'),
      d: el.getAttribute('d')
    };
  }, [svgCode, selectedPath]);

  const handleExport = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vectorcraft-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generic handler for any attribute update (d, x, y, width, etc.)
  const handleAttributeUpdate = (attrName: string, value: string) => {
    if (selectedPath) {
      const newSvg = updateAttributeInSVG(svgCode, selectedPath, attrName, value);
      setSvgCode(newSvg);
    }
  };

  // Helper to determine which inspector to show
  const renderInspector = () => {
      if (!selectedElementDetails) return null;

      const { tagName, d, attributes } = selectedElementDetails;

      // Note: We pass the whole attributes object to PathInspector now too
      // so it can handle appearance edits
      if (tagName === 'path' && d) {
          return (
            <PathInspector 
                attributes={attributes}
                onUpdate={handleAttributeUpdate}
                onClose={() => setSelectedPath(null)}
            />
          );
      }

      if (tagName === 'rect' || tagName === 'circle') {
          return (
            <ShapeInspector 
                tagName={tagName}
                attributes={attributes}
                onUpdate={handleAttributeUpdate}
                onClose={() => setSelectedPath(null)}
            />
          );
      }

      return null;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            VectorCraft
          </h1>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-all shadow-lg shadow-blue-900/20"
            >
              <Download size={14} />
              Export SVG
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Code & Structure */}
        <div className="w-[400px] flex flex-col border-r border-slate-800 bg-slate-900 shrink-0">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'code' ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Code size={14} /> Code
            </button>
            <button 
              onClick={() => setActiveTab('structure')}
              className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'structure' ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Layers size={14} /> Structure
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'code' ? (
              <CodeEditor code={svgCode} onChange={setSvgCode} />
            ) : (
              <StructureTree 
                node={treeStructure} 
                selectedPath={selectedPath} 
                onSelect={(path) => {
                  setSelectedPath(path);
                }} 
              />
            )}
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="flex-1 flex flex-col relative bg-slate-950">
          <div className="flex-1 relative overflow-hidden">
            <Preview 
                svgCode={svgCode} 
                selectedPath={selectedPath} 
                onSelect={setSelectedPath} 
            />
          </div>

          {/* Bottom Panel: Conditional Inspector */}
          {selectedElementDetails && (
             <div className="absolute bottom-0 left-0 right-0 z-20">
                {renderInspector()}
             </div>
          )}
        </div>
      </main>
    </div>
  );
}