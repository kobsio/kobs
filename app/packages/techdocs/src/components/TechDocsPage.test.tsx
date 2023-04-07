import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import TechDocsPage from './TechDocsPage';

import { description } from '../utils/utils';

describe('TechDocsPage', () => {
  const render = (path: string): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    const postSpy = vi.spyOn(client, 'post');
    getSpy.mockImplementation(async (path: string, _): Promise<unknown> => {
      if (path.startsWith('/api/plugins/techdocs/indexes')) {
        return [
          {
            description: 'Kubernetes Observability Platform',
            home: 'test.md',
            key: 'kobs',
            name: 'kobs',
            toc: [
              {
                Test: 'test.md',
              },
              {
                Installation: [
                  {
                    Helm: 'installation/helm.md',
                  },
                  {
                    Kustomize: 'installation/kustomize.md',
                  },
                  {
                    Demo: 'installation/demo.md',
                  },
                ],
              },
            ],
          },
        ];
      }

      if (path.startsWith('/api/plugins/techdocs/index')) {
        return {
          description: 'Kubernetes Observability Platform',
          home: 'test.md',
          key: 'kobs',
          name: 'kobs',
          toc: [
            {
              Test: 'test.md',
            },
            {
              Installation: [
                {
                  Helm: 'installation/helm.md',
                },
                {
                  Kustomize: 'installation/kustomize.md',
                },
                {
                  Demo: 'installation/demo.md',
                },
              ],
            },
          ],
        };
      }

      if (path.startsWith('/api/plugins/techdocs/markdown')) {
        return {
          markdown:
            '# Test\n\n## Text\n\n[Lorem ipsum](./lorem-ipsum.md) dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.\n\n![Screenshot](assets/images/screenshot.png)\n\n## Admonitions\n\n:::info{title="My info title"}\nMy info text\n:::\n\n:::success{title="My success title"}\nMy success text\n:::\n\n:::warning{title="My warning title"}\nMy warning text\n:::\n\n:::error{title="My error title"}\nMy error text\n:::\n\n## Collapse\n\n:::info{title="Show / Hide" collapse="true"}\nThis text can be hidden\n:::\n\n## Embed Panel\n\n```kobs:panel\ntitle: My embedded panel\nplugin:\n  name: techdocs\n  type: techdocs\n  cluster: hub\n  options:\n    type: markdown\n    markdown: |\n      **My embedded panel text**\n```\n\n## Embed Dashboard\n\n```kobs:dashboard\n- title: \'My embedded dashboard\'\n  inline:\n    rows:\n      - panels:\n          - title: "My embedded dashboard panel"\n            w: 12\n            plugin:\n              name: techdocs\n              type: techdocs\n              cluster: hub\n              options:\n                type: markdown\n                markdown: |\n                  **My embedded dashboard panel text**\n```\n\n## Some Code\n\n```tsx\nconst TechDocsPage: FunctionComponent\u003cIPluginPageProps\u003e = ({ instance }) =\u003e {\n  return (\n    \u003cRoutes\u003e\n      \u003cRoute path="/" element={\u003cServicesPage instance={instance} /\u003e} /\u003e\n      \u003cRoute path="/:service" element={\u003cServicePage instance={instance} /\u003e} /\u003e\n    \u003c/Routes\u003e\n  );\n};\n\nexport default TechDocsPage;\n```\n',
          toc: '- [Text](#text)\n- [Admonitions](#admonitions)\n- [Collapse](#collapse)\n- [Embed Panel](#embed-panel)\n- [Embed Dashboard](#embed-dashboard)\n- [Some Code](#some-code)\n',
        };
      }

      return '';
    });

    postSpy.mockImplementation(async (path: string, _): Promise<unknown> => {
      if (path.startsWith('/api/dashboards')) {
        return [
          {
            rows: [
              {
                panels: [
                  {
                    plugin: {
                      cluster: 'hub',
                      name: 'techdocs',
                      options: { markdown: '**My embedded dashboard panel text**\n', type: 'markdown' },
                      type: 'techdocs',
                    },
                    title: 'My embedded dashboard panel',
                    w: 12,
                  },
                ],
              },
            ],
            title: 'My embedded dashboard',
          },
        ];
      }
    });

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <TechDocsPage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/techdocs/name/techdocs',
                name: 'techdocs',
                type: 'techdocs',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render services', async () => {
    render('/');

    expect(screen.getByText('techdocs')).toBeInTheDocument();
    expect(screen.getByText('(hub / techdocs)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('kobs'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Kubernetes Observability Platform'))).toBeInTheDocument();
  });

  it('should render service', async () => {
    render('/kobs');

    expect(await waitFor(() => screen.getByText('kobs'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Kubernetes Observability Platform'))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('My info title'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('My info text'))).toBeInTheDocument();

    expect(await waitFor(() => screen.queryAllByText('Embed Panel').length)).toBe(2);
    expect(await waitFor(() => screen.getByText('My embedded panel'))).toBeInTheDocument();

    expect(await waitFor(() => screen.queryAllByText('Embed Dashboard').length)).toBe(2);
    expect(await waitFor(() => screen.getByText('My embedded dashboard panel'))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Show / Hide'))).toBeInTheDocument();
    await userEvent.click(screen.getByText('Show / Hide'));
    expect(await waitFor(() => screen.getByText('This text can be hidden'))).toBeInTheDocument();
  });
});
