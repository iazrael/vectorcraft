import React from 'react';
import { SVGNode, SelectionPath } from '../types';
import { Folder, FileCode, Square, Circle, Box, Move, Type, Image, Hexagon } from 'lucide-react';

interface StructureTreeProps {
  node: SVGNode | null;
  selectedPath: SelectionPath | null;
  onSelect: (path: SelectionPath) => void;
}

const getIcon = (tagName: string) => {
  switch (tagName.toLowerCase()) {
    case 'svg': return <Box size={14} className="text-blue-400" />;
    case 'g': return <Folder size={14} className="text-yellow-400" />;
    case 'path': return <Move size={14} className="text-purple-400" />;
    case 'rect': return <Square size={14} className="text-green-400" />;
    case 'circle': return <Circle size={14} className="text-red-400" />;
    case 'text': return <Type size={14} className="text-slate-200" />;
    case 'image': return <Image size={14} className="text-pink-400" />;
    default: return <FileCode size={14} className="text-slate-400" />;
  }
};

const TreeNode: React.FC<{
  node: SVGNode;
  selectedPath: SelectionPath | null;
  onSelect: (path: SelectionPath) => void;
  depth?: number;
}> = ({ node, selectedPath, onSelect, depth = 0 }) => {
  
  const isSelected = selectedPath && 
    selectedPath.length === node.indexPath.length &&
    selectedPath.every((val, index) => val === node.indexPath[index]);

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1 px-2 cursor-pointer transition-colors border-l-2 ${
          isSelected 
            ? 'bg-blue-500/20 border-blue-500 text-blue-100' 
            : 'hover:bg-slate-800 border-transparent text-slate-400'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.indexPath);
        }}
      >
        <span className="opacity-80">{getIcon(node.tagName)}</span>
        <span className="text-xs font-medium truncate">
          {node.tagName} 
          {node.id && <span className="ml-2 text-slate-500 font-normal">#{node.id}</span>}
        </span>
      </div>
      <div>
        {node.children.map((child, i) => (
          <TreeNode 
            key={i} 
            node={child} 
            selectedPath={selectedPath} 
            onSelect={onSelect} 
            depth={depth + 1} 
          />
        ))}
      </div>
    </div>
  );
};

export const StructureTree: React.FC<StructureTreeProps> = ({ node, selectedPath, onSelect }) => {
  if (!node) return <div className="p-4 text-xs text-slate-500">Invalid SVG Structure</div>;

  return (
    <div className="h-full overflow-y-auto bg-slate-900 border-r border-slate-800">
      <div className="p-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 mb-1">
        Structure
      </div>
      <TreeNode node={node} selectedPath={selectedPath} onSelect={onSelect} />
    </div>
  );
};