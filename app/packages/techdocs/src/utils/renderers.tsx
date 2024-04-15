import {
  IPluginInstance,
  ITimes,
  pluginBasePath,
  EmbeddedPanel,
  EmbeddedDashboards,
  TEmbeddedDashboards,
} from '@kobsio/core';
import { ContentCopy } from '@mui/icons-material';
import { Box, IconButton, Theme } from '@mui/material';
import yaml from 'js-yaml';
import { Children, ReactElement, createElement } from 'react';
import { Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { normalizePath } from './path';
import { prismTheme } from './prismtheme';
import { flatten, getPathWithoutFile } from './utils';

import { Admonitions } from '../components/Admonitions';

/**
 * `renderLink` renders a link. If the link starts with "http://" or "https://" we assume that it is a link which do not
 * refer to a markdown file within the TechDocs and open it in a new window.
 *
 * For all other link we adjust the link, so a user can navigate within the TechDocs for a service. This means that a
 * user can go to a headline within a markdown document (link starts with `#`) or to another markdown document. When the
 * `setPath` function is defined the navigation will be handled via this function. If the function is not defined we
 * use a normal link.
 */
export const renderLink = (
  instance: IPluginInstance,
  service: string,
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { href, ...props }: any,
  setPath?: (path: string) => void,
): ReactElement => {
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

  if (setPath) {
    return (
      <span className="kobsio-techdocs-path-handler" onClick={() => setPath(normalizedPath)}>
        {props.children}
      </span>
    );
  }

  return (
    <Link to={`${pluginBasePath(instance)}/${service}?path=${encodeURIComponent(normalizedPath)}`}>
      {props.children}
    </Link>
  );
};

/**
 * `renderHeading` renders a header like h1, h2,  h3, h4, h5 and h6 including an id, so we can scroll to the header via
 * the table of content.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderHeading = ({ ...props }: any): ReactElement => {
  const children = Children.toArray(props.children);
  const text = children.reduce(flatten, '');
  const slug = text.toLowerCase().replace(/\W/g, '-');
  return createElement(props.node.tagName, { id: slug }, props.children);
};

/**
 * `renderCode` renders a codeblock via the `react-syntax-highlighter` package or a kobs panel or dashboard when the
 * specified language is `kobs`.
 */
export const renderCode = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { node, className, children, ...props }: any,
  theme: Theme,
  times: ITimes,
  setTimes: (times: ITimes) => void,
): ReactElement => {
  const inline = !String(children).includes('\n');
  const match = /language-(\w+)/.exec(className || '');

  if (!inline && match && match[1] === 'kobs') {
    if (className.includes('kobs:panel')) {
      const panel = yaml.load(String(children).replace(/\n$/, '')) as {
        description?: string;
        plugin?: {
          cluster?: string;
          name?: string;
          options?: unknown;
          type?: string;
        };
        title?: string;
      };

      return (
        <EmbeddedPanel
          cluster={panel?.plugin?.cluster ?? ''}
          description={panel?.description ?? ''}
          name={panel?.plugin?.name ?? ''}
          options={panel?.plugin?.options ?? undefined}
          title={panel?.title ?? ''}
          type={panel?.plugin?.type ?? ''}
          times={times}
          setTimes={setTimes}
        />
      );
    }

    if (className.includes('kobs:dashboard')) {
      const dashboards = yaml.load(String(children).replace(/\n$/, '')) as TEmbeddedDashboards[];
      return (
        <Box sx={{ backgroundColor: theme.palette.background.default, padding: 4 }}>
          <EmbeddedDashboards manifest={{}} references={dashboards} />
        </Box>
      );
    }
  }

  if (!inline) {
    return (
      <Box sx={{ position: 'relative' }}>
        <SyntaxHighlighter
          style={prismTheme(theme)}
          language={match ? match[1] : undefined}
          PreTag="div"
          showLineNumbers={true}
          wrapLongLines={true}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
        {navigator.clipboard && (
          <Box sx={{ position: 'absolute', right: '1em', top: '1em' }}>
            <IconButton
              size="small"
              disableRipple={true}
              onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <code
      style={{ backgroundColor: theme.palette.background.default, paddingLeft: '2px', paddingRight: '2px' }}
      className={className}
      {...props}
    >
      {children}
    </code>
  );
};

/**
 * `renderPre` renders a `pre` tag. If the children in the component is a codeblock with a kobs panel or dashbaord the
 * pre tag is replaced by a div.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderPre = ({ children, ...props }: any): ReactElement => {
  if (
    children.length === 1 &&
    (children[0]?.props?.className === 'language-kobs:panel' ||
      children[0]?.props?.className === 'language-kobs:dashboard')
  ) {
    return <div>{children}</div>;
  }

  return <pre {...props}>{children}</pre>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderAdmonitions = ({ children, node, ...props }: any): ReactElement => {
  return (
    <Box sx={{ py: 2 }}>
      <Admonitions
        title={node.properties.title}
        severity={node.properties.severity}
        collapse={node.properties.collapse}
      >
        {children}
      </Admonitions>
    </Box>
  );
};
