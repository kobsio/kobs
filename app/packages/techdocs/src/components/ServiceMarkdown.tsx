import { APIContext, APIError, IAPIContext, IPluginInstance, ITimes, UseQueryWrapper } from '@kobsio/core';
import { Box, Card, CardContent, Grid, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';

import { renderAdmonitions, renderCode, renderHeading, renderLink, renderPre } from '../utils/renderers';
import { IMarkdown, admonitionsPlugin, imageTransformer } from '../utils/utils';

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

const ServiceMarkdownTableOfContents: FunctionComponent<{
  instance: IPluginInstance;
  path: string;
  service: string;
  setPath?: (path: string) => void;
  toc: string;
}> = ({ instance, service, path, setPath, toc }) => {
  return (
    <Box
      sx={{
        '.kobsio-techdocs-path-handler': {
          color: 'inherit',
          cursor: 'pointer',
          textDecoration: 'inherit',
        },
        a: {
          color: 'inherit',
          textDecoration: 'inherit',
        },
        li: {
          paddingBottom: 2,
          paddingLeft: 4,
          paddingRight: 4,
          paddingTop: 2,
          wordBreak: 'break-all',
        },
        'li:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
        ul: {
          listStyle: 'none',
          margin: 0,
          paddingBottom: 2,
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 2,
        },
      }}
    >
      <ReactMarkdown
        components={{
          a: ({ href, ...props }) => renderLink(instance, service, path, { href, ...props }, setPath),
        }}
      >
        {toc}
      </ReactMarkdown>
    </Box>
  );
};

export const ServiceMarkdown: FunctionComponent<{
  instance: IPluginInstance;
  path: string;
  service: string;
  setPath?: (path: string) => void;
  setTimes: (times: ITimes) => void;
  times: ITimes;
}> = ({ instance, service, path, times, setPath, setTimes }) => {
  const theme = useTheme();
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IMarkdown, APIError>(
    ['techdocs/markdown', instance, service, path],
    async () => {
      return apiContext.client.get<IMarkdown>(
        `/api/plugins/techdocs/markdown?service=${service}&path=${encodeURIComponent(path)}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load markdown"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data}
      noDataTitle="No markdown file was found"
      refetch={refetch}
    >
      <Grid container={true} spacing={6}>
        <Grid item={true} xs={12} lg={data?.toc ? 9 : 12} xl={data?.toc ? 10 : 12}>
          {data?.markdown && (
            <Card>
              <CardContent
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
                  urlTransform={(uri): string => imageTransformer(uri, instance, service, path)}
                  components={{
                    a: ({ href, ...props }) => renderLink(instance, service, path, { href, ...props }, setPath),
                    code: ({ node, className, children, ...props }) =>
                      renderCode({ children, className, node, ...props }, theme, times, setTimes),
                    'custom-admonitions': ({ node, children, ...props }) =>
                      renderAdmonitions({ children, node, ...props }),
                    h1: renderHeading,
                    h2: renderHeading,
                    h3: renderHeading,
                    h4: renderHeading,
                    h5: renderHeading,
                    h6: renderHeading,
                    pre: ({ children, ...props }) => renderPre({ children, ...props }),
                  }}
                >
                  {data.markdown}
                </ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </Grid>

        {data?.toc && (
          <Grid item={true} xs={12} lg={3} xl={2}>
            <Card>
              <ServiceMarkdownTableOfContents instance={instance} service={service} path={path} toc={data.toc} />
            </Card>
          </Grid>
        )}
      </Grid>
    </UseQueryWrapper>
  );
};
