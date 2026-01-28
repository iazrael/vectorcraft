// Path Command Types
export type PathCommandType = 
  | 'M' | 'm' // Move To
  | 'L' | 'l' // Line To
  | 'H' | 'h' // Horizontal Line
  | 'V' | 'v' // Vertical Line
  | 'C' | 'c' // Cubic Bezier
  | 'S' | 's' // Smooth Cubic
  | 'Q' | 'q' // Quadratic Bezier
  | 'T' | 't' // Smooth Quadratic
  | 'A' | 'a' // Arc
  | 'Z' | 'z'; // Close

export interface PathCommand {
  id: string; // Internal ID for React keys
  type: PathCommandType;
  values: number[];
}

// Tree Structure Types
export interface SVGNode {
  tagName: string;
  id?: string;
  attributes: Record<string, string>;
  children: SVGNode[];
  indexPath: number[]; // e.g. [0, 1] = root -> child 0 -> child 1
}

export type SelectionPath = number[];