import { INodeData, IPanelOptions } from './interfaces';

// getOptionsFromSearch is used to get the Kiali options from a given search location.
export const getOptionsFromSearch = (search: string): IPanelOptions => {
  const params = new URLSearchParams(search);
  const duration = params.get('duration');
  const namespaces = params.getAll('namespace');

  return {
    duration: duration ? parseInt(duration) : 900,
    namespaces: namespaces.length > 0 ? namespaces : undefined,
  };
};

export interface ITitle {
  badge: string;
  title: string;
}

// getTitle returns the title of a node for the details view. The title contains a name (title) and a badge, which is
// used to display the node type. The node type can be SE (ServiceEntry), S (Service) or A (Application).
export const getTitle = (node: INodeData): ITitle => {
  if (node.nodeType === 'serviceentry') {
    return { badge: 'SE', title: node.nodeLabel };
  } else if (node.nodeType === 'service') {
    return { badge: 'S', title: node.service || '' };
  }

  return { badge: 'A', title: node.app || '' };
};
