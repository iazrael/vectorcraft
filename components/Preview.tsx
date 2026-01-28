import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SelectionPath } from '../types';
import { Minus, Plus, Maximize, RefreshCcw, MousePointer2, Move } from 'lucide-react';

interface PreviewProps {
  svgCode: string;
  selectedPath: SelectionPath | null;
  onSelect: (path: SelectionPath) => void;
}

export const Preview: React.FC<PreviewProps> = ({ svgCode, selectedPath, onSelect }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [highlightBox, setHighlightBox] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null); // The div wrapping SVG and Highlight
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);

  // --- Zoom & Pan Logic ---

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(transform.scale + delta, 0.1), 10);
      
      // Zoom towards mouse could be added here, simplified to center zoom for now/robustness
      setTransform(prev => ({ ...prev, scale: newScale }));
    } else {
      // Pan
      setTransform(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking background or holding space (simple version: drag anywhere not handled)
    // We differentiate click vs drag in MouseUp
    if (e.button === 0 || e.button === 1) {
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStartRef.current) {
        e.preventDefault();
        setTransform(prev => ({
            ...prev,
            x: e.clientX - dragStartRef.current!.x,
            y: e.clientY - dragStartRef.current!.y
        }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // --- Click Selection Logic ---
  // We use a ref to track if a drag occurred to prevent selecting when panning
  const initialClickPos = useRef<{x:number, y:number} | null>(null);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!initialClickPos.current) return;
    
    // Calculate distance moved
    const dx = e.clientX - initialClickPos.current.x;
    const dy = e.clientY - initialClickPos.current.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    // If moved significantly, it was a pan, not a click
    if (dist > 5) return;

    // It was a click, perform selection logic
    const target = e.target as Element;
    const rootWrapper = contentRef.current;
    
    if (!rootWrapper) return;
    
    // Check if target is inside the rendered SVG
    // The rendered SVG is inside dangerouslySetInnerHTML div, which is inside contentRef
    const svgRoot = rootWrapper.querySelector('svg');
    
    if (target instanceof SVGElement && svgRoot && svgRoot.contains(target)) {
        if (target === svgRoot) {
            onSelect([]);
            return;
        }

        // Build path
        const path: number[] = [];
        let curr = target;
        
        while (curr.parentElement && curr !== svgRoot) {
            const parent = curr.parentElement;
            const index = Array.from(parent.children)
                .filter(c => c instanceof SVGElement)
                .indexOf(curr);
            
            if (index !== -1) path.unshift(index);
            else return; // Should not happen
            
            curr = parent as unknown as SVGElement;
        }
        
        const index = Array.from(svgRoot.children)
            .filter(c => c instanceof SVGElement)
            .indexOf(curr);
        if (index !== -1) path.unshift(index);
        
        onSelect(path);
    } else {
        // Clicked empty space
        onSelect([]);
    }
  };

  // --- Highlight Calculation ---
  useEffect(() => {
    if (!contentRef.current || !selectedPath) {
      setHighlightBox(null);
      return;
    }

    const rootSvg = contentRef.current.querySelector('svg');
    if (!rootSvg) {
        setHighlightBox(null);
        return;
    }

    if (selectedPath.length === 0) {
        // Select Root
        // We use the root SVG's own dimensions relative to itself (0,0, w, h)
        // But getBoundingClientRect is easiest way to get width/height reliably including transforms
        const rect = rootSvg.getBoundingClientRect();
        // The overlay is inside contentRef. contentRef contains svg.
        // We want x,y relative to rootSvg top-left.
        // Since highlight is absolute child of contentRef, and svg is static child of contentRef:
        // x = 0, y = 0 relative to svg?
        // Wait, contentRef wraps the wrapper div of svg.
        // Let's get coords relative to svgRoot.
        
        // Actually, easiest math: 
        // 1. Get Target Screen Rect
        // 2. Get SVG Root Screen Rect
        // 3. Offset = Target - SVG Root
        
        // This puts the highlight box relative to the top-left of the SVG element.
        // We just need to position the HighlightContainer at the top-left of the SVG element?
        // Or simpler: Position HighlightContainer absolute 0,0 in ContentRef.
        // Ensure SVG is at 0,0 in ContentRef.
        
        // With current layout:
        // contentRef (flex center or block?) -> div(innerHTML) -> svg
        
        // Let's assume SVG starts at top-left of contentRef?
        // We'll use getBoundingClientRect delta to be safe.
        
        // Wait, if we select root, we just want the box around the SVG.
        // const rect = rootSvg.getBoundingClientRect();
        // x=0, y=0, w=rect.width, h=rect.height ??
        // Only if scale is 1.
        // With scale, rect.width is scaled.
        // We need unscaled coords for the Highlight Box because it lives INSIDE the scaled container.
        
        // Formula: UnscaledDimension = ScaledDimension / scale
        // But simpler: use getBBox() if available?
        // getBoundingClientRect is safer for screen space.
        
        // Let's compute offsets in screen space, then divide by scale.
        const svgRect = rootSvg.getBoundingClientRect();
        // highlight is relative to svgRoot (we will position it overlaying svgRoot)
        
        setHighlightBox({
            x: 0,
            y: 0,
            w: svgRect.width / transform.scale,
            h: svgRect.height / transform.scale
        });
        return;
    }

    // Find Target
    let target: Element = rootSvg;
    let found = true;
    for (const idx of selectedPath) {
        const children = Array.from(target.children).filter(c => c instanceof SVGElement);
        if (children[idx]) {
            target = children[idx];
        } else {
            found = false;
            break;
        }
    }

    if (found && target instanceof SVGElement) {
        const targetRect = target.getBoundingClientRect();
        const rootRect = rootSvg.getBoundingClientRect();
        
        setHighlightBox({
            x: (targetRect.left - rootRect.left) / transform.scale,
            y: (targetRect.top - rootRect.top) / transform.scale,
            w: targetRect.width / transform.scale,
            h: targetRect.height / transform.scale
        });
    } else {
        setHighlightBox(null);
    }

  }, [selectedPath, svgCode, transform.scale]); // Re-calc on scale change to ensure precision

  // Reset View
  const centerView = () => setTransform({ x: 0, y: 0, scale: 1 });

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col">
       {/* Toolbar */}
       <div className="absolute bottom-4 right-4 z-50 flex gap-2">
            <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-1 rounded-lg flex items-center shadow-xl">
                <button onClick={() => setTransform(p => ({...p, scale: p.scale * 0.9}))} className="p-2 hover:bg-slate-700 rounded text-slate-300">
                    <Minus size={16} />
                </button>
                <span className="w-12 text-center text-xs font-mono text-slate-400">
                    {Math.round(transform.scale * 100)}%
                </span>
                <button onClick={() => setTransform(p => ({...p, scale: p.scale * 1.1}))} className="p-2 hover:bg-slate-700 rounded text-slate-300">
                    <Plus size={16} />
                </button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button onClick={centerView} className="p-2 hover:bg-slate-700 rounded text-slate-300" title="Reset View">
                    <RefreshCcw size={14} />
                </button>
            </div>
       </div>

       {/* Hints */}
       <div className="absolute top-4 left-4 z-40 pointer-events-none opacity-50 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
             <MousePointer2 size={10} /> Select
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
             <Move size={10} /> Drag to Pan
          </div>
       </div>

      {/* Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 w-full h-full cursor-move bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] relative overflow-hidden flex items-center justify-center"
        onWheel={handleWheel}
        onMouseDown={(e) => {
            initialClickPos.current = { x: e.clientX, y: e.clientY };
            handleMouseDown(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={(e) => {
            handleMouseUp();
            handleContainerClick(e);
        }}
        onMouseLeave={handleMouseUp}
      >
        {/* Transform Container */}
        <div 
            style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            className="origin-center" // Scale from center of the content div
        >
            {/* Content Wrapper - creates a stacking context for SVG + Highlight */}
            <div ref={contentRef} className="relative inline-block shadow-2xl bg-transparent">
                 {/* The SVG */}
                <div dangerouslySetInnerHTML={{ __html: svgCode }} className="block" />
                
                {/* The Highlight Overlay - Placed INSIDE the transform context, overlaid on SVG */}
                {highlightBox && (
                    <div 
                        className="absolute border border-blue-500 pointer-events-none z-10 box-content"
                        style={{
                            left: highlightBox.x,
                            top: highlightBox.y,
                            width: highlightBox.w,
                            height: highlightBox.h,
                            boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2)' 
                        }}
                    >
                        {/* Corner handles for visual flair */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-blue-500"></div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-blue-500"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-blue-500"></div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-blue-500"></div>
                        
                        <div className="absolute -top-5 left-0 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow leading-none whitespace-nowrap">
                             {Math.round(highlightBox.w)} × {Math.round(highlightBox.h)}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};