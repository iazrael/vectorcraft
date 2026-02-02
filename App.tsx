import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { Preview } from './components/Preview';
import { StructureTree } from './components/StructureTree';
import { PathInspector } from './components/PathInspector';
import { ShapeInspector } from './components/ShapeInspector';
import { parseSVGStructure, updateAttributeInSVG, getElementByPath } from './utils/domUtils';
import { SVGNode, SelectionPath, Theme } from './types';
import { Download, Share2, Layers, Code, Zap, Upload, Palette, Sun, Moon, Waves } from 'lucide-react';

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
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Apply Theme to Body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

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

  // File Handling Logic
  const handleFileRead = (file: File) => {
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setSvgCode(content);
          setSelectedPath(null); // Reset selection
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid SVG file.");
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDraggingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileRead(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

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

  // Generic handler for any attribute update
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

  const toggleThemeMenu = () => setIsThemeMenuOpen(!isThemeMenuOpen);

  return (
    <div 
        className="flex flex-col h-screen bg-slate-950 text-slate-200 transition-colors duration-300"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => setIsThemeMenuOpen(false)}
    >
      {/* Header */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 z-10 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            VectorCraft
          </h1>
        </div>
        <div className="flex gap-3">
             {/* Theme Toggle */}
             <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleThemeMenu(); }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md transition-all border border-slate-700"
                    title="Change Theme"
                >
                    <Palette size={14} />
                    <span className="capitalize hidden sm:inline">{theme}</span>
                </button>
                
                {isThemeMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-md shadow-xl z-50 overflow-hidden">
                        <button 
                            onClick={() => setTheme('dark')}
                            className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-800 ${theme === 'dark' ? 'text-blue-400' : 'text-slate-400'}`}
                        >
                            <Moon size={12} /> Dark
                        </button>
                        <button 
                            onClick={() => setTheme('light')}
                            className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-800 ${theme === 'light' ? 'text-blue-400' : 'text-slate-400'}`}
                        >
                            <Sun size={12} /> Light
                        </button>
                        <button 
                            onClick={() => setTheme('blue')}
                            className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-800 ${theme === 'blue' ? 'text-blue-400' : 'text-slate-400'}`}
                        >
                            <Waves size={12} /> Blue
                        </button>
                    </div>
                )}
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".svg,image/svg+xml" 
                onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0])}
            />
            <button 
              onClick={triggerFileUpload}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md transition-all border border-slate-700"
            >
              <Upload size={14} />
              Import
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-all shadow-lg shadow-blue-900/20"
            >
              <Download size={14} />
              Export
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel: Code & Structure */}
        <div className="w-[400px] flex flex-col border-r border-slate-800 bg-slate-900 shrink-0 transition-colors duration-300">
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
        <div className="flex-1 flex flex-col relative bg-slate-950 transition-colors duration-300">
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

        {/* Drag & Drop Overlay */}
        {isDraggingFile && (
            <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-xl flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
                <Upload size={64} className="text-blue-500 mb-4 animate-bounce" />
                <div className="text-2xl font-bold text-white drop-shadow-md">Drop SVG to Load</div>
                <p className="text-slate-400 mt-2">Replace current content with dropped file</p>
            </div>
        )}
      </main>
    </div>
  );
}