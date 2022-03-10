import { CodeBlock, CodeBlockCode } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import React from 'react';
import yaml from 'js-yaml';

import { flatten, getPathWithoutFile } from './helpers';
import { IDashboardPanel } from '@kobsio/plugin-core';
import KobsCode from '../components/KobsCode';
import { normalizePath } from './path';

// renderLink renders a link. If the link starts with "http://" or "https://" we assume that it is a link which do not
// refer to a markdown file within the TechDocs and open it in a new window.
// For all other link we adjust the link, so a user can navigate within the TechDocs for a service.
export const renderLink = (
  name: string,
  service: string,
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { href, ...props }: any,
): React.ReactElement => {
  const url = (href || '').trim();
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  }

  if (url.startsWith('#')) {
    return <a href={url}>{props.children}</a>;
  }

  const normalizedPath = normalizePath(`${getPathWithoutFile(path)}/${href}`);

  return <Link to={`/${name}/${service}/${normalizedPath}`}>{props.children}</Link>;
};

// renderTable renders a table component with the styling of Patternfly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderTable = ({ ...props }: any): React.ReactElement => {
  return <table className="pf-c-table pf-m-compact pf-m-grid-md">{props.children}</table>;
};

// renderCode renders a codeblock via the CodeBlock component from Patternfly.
export const renderCode = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { inline, ...props }: any,
  setDetails?: (details: React.ReactNode) => void,
): React.ReactElement => {
  if (inline) {
    return <code>{props.children}</code>;
  }

  const match = /language-(\w+)/.exec(props.className || '');

  if (match && match.length === 2 && match[1] === 'kobs') {
    const panel = yaml.load(props.children) as IDashboardPanel;
    return <KobsCode panel={panel} setDetails={setDetails} />;
  }

  return (
    <CodeBlock style={{ maxWidth: '100%' }}>
      <CodeBlockCode className="kobsio-techdocs-code" style={{ maxWidth: '100%', overflow: 'auto' }}>
        {props.children}
      </CodeBlockCode>
    </CodeBlock>
  );
};

// renderHeading renders a header like h1, h2,  h3, h4, h5 and h6 including an id, so we can scroll to the header via
// the table of content.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderHeading = ({ ...props }: any): React.ReactElement => {
  const children = React.Children.toArray(props.children);
  const text = children.reduce(flatten, '');
  const slug = text.toLowerCase().replace(/\W/g, '-');
  return React.createElement('h' + props.level, { id: slug }, props.children);
};

// renderPre handles the rendering of pre tags. If the children is a code block which embedds a kobs panel, we do not
// want to render the pre tag to not destroy the layout of the plugin.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderPre = ({ ...props }: any): React.ReactElement => {
  if (
    props.children &&
    Array.isArray(props.children) &&
    props.children.length === 1 &&
    props.children[0].props.className === 'language-kobs'
  ) {
    return props.children;
  }

  return <pre>{props.children}</pre>;
};
