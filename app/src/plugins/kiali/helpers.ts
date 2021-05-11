import { Node } from 'proto/kiali_grpc_web_pb';

// IKialiOptions is the interface for all available options to get the graph from Kiali.
export interface IKialiOptions {
  duration: number;
  namespaces: string[];
}

// getOptionsFromSearch is used to get the Elasticsearch options from a given search location.
export const getOptionsFromSearch = (search: string): IKialiOptions => {
  const params = new URLSearchParams(search);
  const namespaces = params.getAll('namespace');
  const duration = params.get('duration');

  return {
    duration: duration ? parseInt(duration as string) : 60,
    namespaces: namespaces,
  };
};

export interface ITitle {
  badge: string;
  title: string;
}

// getTitle returns the title of a node for the details view. The title contains a name (title) and a badge, which is
// used to display the node type. The node type can be SE (ServiceEntry), S (Service) or A (Application).
export const getTitle = (node: Node.AsObject): ITitle => {
  if (node.nodetype === 'serviceentry') {
    return { badge: 'SE', title: node.nodelabel };
  } else if (node.nodetype === 'service') {
    return { badge: 'S', title: node.service };
  }

  return { badge: 'A', title: node.app };
};
