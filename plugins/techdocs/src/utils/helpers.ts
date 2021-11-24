import React from 'react';

import { normalizePath } from './path';

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
  return typeof child === 'string' ? text + child : React.Children.toArray(child.props.children).reduce(flatten, text);
};

// imageTransformer is our custom image transformer for react-markdown. If the uri starts with http or https we render
// an external image. For each other case we are trying to get the image from the TechDocs provider.
export const imageTransformer = (uri: string, name: string, service: string, path: string): string => {
  const url = (uri || '').trim();

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const normalizedPath = normalizePath(`${getPathWithoutFile(path)}/${uri}`);
  const host = process.env.NODE_ENV === 'development' ? `http://localhost:15220` : `https://${window.location.host}`;

  return `${host}/api/plugins/techdocs/file/${name}?service=${service}&path=${normalizedPath}`;
};
