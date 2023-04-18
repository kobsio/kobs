import { IPluginInstance } from '@kobsio/core';
import { Children } from 'react';
import { Node } from 'unist';
import { visit, Visitor } from 'unist-util-visit';

import { normalizePath } from './path';

export const description =
  'TechDocs allows your engineers to write their documentation in markdown files which live together with their code.';

export const example = `plugin:
  name: techdocs
  type: techdocs
  options:
    # The type must be
    #   - 'services' to show a list of all services for the TechDocs instance
    #   - 'services-toc' to show the table of contents for a given service
    #   - 'service-markdown': to show the TechDocs for the given service
    #   - 'markdown': to render the provided markdown
    type: service-markdown
    service: kobs`;

export interface IIndex {
  description: string;
  home: string;
  key: string;
  name: string;
  toc: ITOCItem[];
}

export interface ITOCItem {
  [key: string]: ITOCItem[] | string;
}

export interface IMarkdown {
  markdown: string;
  toc: string;
}

// getPathWithoutFile return the path without the last argument, which is always a file.
export const getPathWithoutFile = (path: string): string => {
  const pathParts = path.split('/');

  if (pathParts.length === 1) {
    return '';
  }

  pathParts.pop();
  return pathParts.join('/');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flatten = (text: string, child: any): string => {
  return typeof child === 'string' ? text + child : Children.toArray(child.props.children).reduce(flatten, text);
};

// imageTransformer is our custom image transformer for react-markdown. If the uri starts with http or https we render
// an external image. For each other case we are trying to get the image from the TechDocs provider.
export const imageTransformer = (uri: string, instance: IPluginInstance, service: string, path: string): string => {
  const url = (uri || '').trim();

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const normalizedPath = normalizePath(`${getPathWithoutFile(path)}/${uri}`);
  const host = process.env.NODE_ENV === 'development' ? `http://localhost:15220` : `https://${window.location.host}`;

  return `${host}/api/plugins/techdocs/file?x-kobs-plugin=${instance.name}&service=${service}&path=${normalizedPath}`;
};

export const admonitionsPlugin = () => {
  return function transformer(tree: Node) {
    const visitor: Visitor<Node & { attributes: Record<string, string>; name: string; type: string }> = (node) => {
      if (!['success', 'info', 'warning', 'error'].includes(node.name)) return;
      const data = node.data || (node.data = {});
      data.hName = 'custom-admonitions';
      data.hProperties = {
        collapse: node.attributes.collapse === 'true' ? true : false,
        severity: node.name,
        title: node.attributes.title ?? node.name,
      };
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    visit(tree, ['containerDirective'], visitor);
  };
};
