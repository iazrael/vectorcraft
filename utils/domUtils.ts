import { SVGNode, SelectionPath } from '../types';

export const parseSVGStructure = (svgString: string): SVGNode | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) return null;

  const root = doc.querySelector('svg');
  if (!root) return null;

  const traverse = (element: Element, path: number[]): SVGNode => {
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

    const children: SVGNode[] = [];
    let childIndex = 0;
    
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      // Only process standard SVG elements
      if (child instanceof SVGElement) {
        children.push(traverse(child, [...path, childIndex]));
        childIndex++;
      }
    }

    return {
      tagName: element.tagName,
      id: element.id,
      attributes,
      children,
      indexPath: path
    };
  };

  return traverse(root, []);
};

export const getElementByPath = (doc: Document, path: SelectionPath): Element | null => {
  const root = doc.querySelector('svg');
  if (!root) return null;
  if (path.length === 0) return root;

  let current: Element = root;
  for (const index of path) {
    // We need to filter only element children to match our index logic
    const elementChildren = Array.from(current.children).filter(c => c instanceof SVGElement);
    if (!elementChildren[index]) return null;
    current = elementChildren[index];
  }
  return current;
};

export const updateAttributeInSVG = (
  originalSvg: string, 
  path: SelectionPath, 
  attrName: string, 
  attrValue: string
): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(originalSvg, 'image/svg+xml');
  const element = getElementByPath(doc, path);
  
  if (element) {
    element.setAttribute(attrName, attrValue);
    // Serialize back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }
  return originalSvg;
};