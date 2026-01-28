import { PathCommand, PathCommandType } from '../types';

/**
 * Descriptions for commands for the UI
 */
export const COMMAND_DESCRIPTIONS: Record<string, { name: string; params: string[] }> = {
  M: { name: 'Move To (Abs)', params: ['x', 'y'] },
  m: { name: 'Move To (Rel)', params: ['dx', 'dy'] },
  L: { name: 'Line To (Abs)', params: ['x', 'y'] },
  l: { name: 'Line To (Rel)', params: ['dx', 'dy'] },
  H: { name: 'Horizontal (Abs)', params: ['x'] },
  h: { name: 'Horizontal (Rel)', params: ['dx'] },
  V: { name: 'Vertical (Abs)', params: ['y'] },
  v: { name: 'Vertical (Rel)', params: ['dy'] },
  C: { name: 'Cubic Bezier (Abs)', params: ['x1', 'y1', 'x2', 'y2', 'x', 'y'] },
  c: { name: 'Cubic Bezier (Rel)', params: ['dx1', 'dy1', 'dx2', 'dy2', 'dx', 'dy'] },
  S: { name: 'Smooth Cubic (Abs)', params: ['x2', 'y2', 'x', 'y'] },
  s: { name: 'Smooth Cubic (Rel)', params: ['dx2', 'dy2', 'dx', 'dy'] },
  Q: { name: 'Quadratic (Abs)', params: ['x1', 'y1', 'x', 'y'] },
  q: { name: 'Quadratic (Rel)', params: ['dx1', 'dy1', 'dx', 'dy'] },
  T: { name: 'Smooth Quad (Abs)', params: ['x', 'y'] },
  t: { name: 'Smooth Quad (Rel)', params: ['dx', 'dy'] },
  A: { name: 'Arc (Abs)', params: ['rx', 'ry', 'rot', 'large', 'sweep', 'x', 'y'] },
  a: { name: 'Arc (Rel)', params: ['rx', 'ry', 'rot', 'large', 'sweep', 'dx', 'dy'] },
  Z: { name: 'Close Path', params: [] },
  z: { name: 'Close Path', params: [] },
};

export const parsePath = (d: string): PathCommand[] => {
  const commands: PathCommand[] = [];
  // Regex to match command letter followed by optional numbers
  const commandRegex = /([a-zA-Z])([^a-zA-Z]*)/g;
  
  let match;
  let index = 0;

  while ((match = commandRegex.exec(d)) !== null) {
    const type = match[1] as PathCommandType;
    const argsStr = match[2].trim();
    
    // Split by comma or whitespace, filter empty strings, parse float
    let values: number[] = [];
    if (argsStr.length > 0) {
      values = argsStr.split(/[\s,]+/).filter(v => v !== '').map(parseFloat);
    }

    commands.push({
      id: `cmd-${index++}-${Date.now()}`,
      type,
      values,
    });
  }

  return commands;
};

export const serializePath = (commands: PathCommand[]): string => {
  return commands.map(cmd => {
    const params = cmd.values.join(' ');
    return `${cmd.type}${params}`;
  }).join(' ');
};

export const updateCommandValue = (
  commands: PathCommand[], 
  cmdIndex: number, 
  valIndex: number, 
  newValue: number
): PathCommand[] => {
  const newCommands = [...commands];
  const command = { ...newCommands[cmdIndex] };
  const newValues = [...command.values];
  newValues[valIndex] = newValue;
  command.values = newValues;
  newCommands[cmdIndex] = command;
  return newCommands;
};