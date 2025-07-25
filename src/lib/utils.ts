import { type TreeItem } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertFilesToTreeItems(files: {
  [path: string]: string;
}): TreeItem[] {
  interface TreeNode {
    [key: string]: TreeNode | null;
  }
  const tree: TreeNode = {};

  const storedPaths = Object.keys(files).sort();
  for (const path of storedPaths) {
    const parts = path.split('/');
    let currentNode = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!currentNode[part]) {
        currentNode[part] = {};
      }
      currentNode = currentNode[part];
    }
    const fileName = parts[parts.length - 1];
    currentNode[fileName] = null; // Leaf node for the file
  }
  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node);
    if (entries.length === 0) {
      return name || '';
    }
    const children: TreeItem[] = [];
    for (const [key, value] of entries) {
      if (value === null) {
        // This is a file
        children.push(key);
      } else {
        // This is a directory or folder
        const subTree = convertNode(value, key);
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree]);
        } else {
          children.push(subTree);
        }
      }
    }
    return children;
  }
  const result = convertNode(tree);
  return Array.isArray(result) ? result : [result];
}
