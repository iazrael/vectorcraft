# VectorCraft SVG Editor - Design Document

## 1. Overview
VectorCraft is a React-based SPA for editing SVG files. It provides a bidirectional editing experience where users can modify raw XML code or interact with visual representations of the SVG structure.

## 2. Core Features
- **Split View**: Raw SVG source editor (left) and rendered preview (right).
- **Structure Tree**: Hierarchical view of SVG elements (groups, paths, rects, etc.).
- **Live Preview**: Real-time rendering of code changes.
- **Selection Sync**: Clicking an element in the preview or structure tree selects it across all views.
- **Highlighting**: Selected elements are visually highlighted in the preview. Correctly maps coordinates even when zoomed or panned.
- **Canvas Controls**: Pan and Zoom functionality for the preview area.
- **Path Inspector**: Specialized editor for `<path>` elements. Includes semantic command editing AND standard appearance styling (fill, stroke).
- **Shape Inspector**: Specialized editor for `<rect>` and `<circle>` elements. Includes geometric properties AND standard appearance styling.
- **File Import**: Support for opening local SVG files via button or Drag & Drop.
- **Export**: Ability to download the current SVG code.
- **Theming**: Support for Dark (Default), Light, and Sky Blue themes.

## 3. Architecture

### State Management
The application state is centralized in `App.tsx`:
- `svgCode`: String containing the full SVG source.
- `selectedPath`: An array of numbers representing the hierarchical index of the selected element.
- `theme`: Current visual theme ('dark' | 'light' | 'blue').

### Component Breakdown
- **CodeEditor**: A text area with simple syntax highlighting logic.
- **Preview**: Infinite Canvas UI with Pan/Zoom.
- **StructureTree**: Parses the `svgCode` into a DOM tree.
- **AppearanceControl**: (New) Reusable component for Fill, Stroke, Stroke-Width, Opacity inputs.
- **PathInspector**: Integrates `AppearanceControl` alongside the semantic path command editor.
- **ShapeInspector**: Integrates `AppearanceControl` alongside the geometric field inputs.

### Technical Utils
- **`pathUtils.ts`**: SVG Path `d` attribute parsing/serializing.
- **`domUtils.ts`**: SVG DOM traversal and manipulation.

## 4. UI/UX
- **Tailwind CSS**: Used for all styling.
- **Theme**: Configurable via CSS variables mapped to Tailwind colors.
- **Layout**: Header, Split Main View, Bottom Inspector.
- **Interactions**:
    - Scroll/Pinch to Zoom.
    - Drag space/middle-mouse (or just drag background) to Pan.
    - Click to select.
    - Drag & Drop file onto window to load.

## 5. Data Flow
Standard React unidirectional flow. `App.tsx` holds source of truth.
