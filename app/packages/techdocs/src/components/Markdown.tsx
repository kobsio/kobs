import { ITimes } from '@kobsio/core';
import { Box, useTheme } from '@mui/material';
import { FunctionComponent, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';

import { renderAdmonitions, renderCode, renderHeading, renderPre } from '../utils/renderers';
import { admonitionsPlugin } from '../utils/utils';

/**
 * This declaration is required so we can use a custom renderer for the `custom-admonitions` tag, within the
 * `react-markdown` package.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // this merges with the existing intrinsic elements, adding 'my-custom-tag' and its props
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface IntrinsicElements {
      'custom-admonitions': { children: ReactNode; severity: string; title: string };
    }
  }
}

export const Markdown: FunctionComponent<{
  markdown: string;
  setTimes: (times: ITimes) => void;
  times: ITimes;
}> = ({ markdown, times, setTimes }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        '.kobsio-techdocs-path-handler': {
          color: theme.palette.primary.main,
          cursor: 'pointer',
          textDecoration: 'underline',
        },
        a: {
          color: theme.palette.primary.main,
          textDecoration: 'underline',
        },
        img: {
          width: '100%',
        },
        table: {
          borderCollapse: 'collapse',
        },
        'tbody > tr:last-child': {
          border: 0,
        },
        td: {
          padding: '6px 16px',
          textAlign: 'left',
        },
        th: {
          padding: '6px 16px',
          textAlign: 'left',
        },
        tr: {
          borderBottom: '1px solid rgba(81, 81, 81, 1)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, admonitionsPlugin]}
        components={{
          a: ({ href, ...props }) => {
            const url = (href || '').trim();
            if (url.startsWith('http://') || url.startsWith('https://')) {
              return (
                <a href={href} target="_blank" rel="noreferrer">
                  {props.children}
                </a>
              );
            }

            return <Link to={href ?? ''}>{props.children}</Link>;
          },
          code: ({ node, className, children, ...props }) =>
            renderCode({ children, className, node, ...props }, theme, times, setTimes),
          'custom-admonitions': ({ node, children, ...props }) => renderAdmonitions({ children, node, ...props }),
          h1: renderHeading,
          h2: renderHeading,
          h3: renderHeading,
          h4: renderHeading,
          h5: renderHeading,
          h6: renderHeading,
          pre: ({ children, ...props }) => renderPre({ children, ...props }),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </Box>
  );
};
