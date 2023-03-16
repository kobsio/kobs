import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import RSSPage from './RSSPage';

import { description } from '../utils/utils';

describe('RSSPage', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (path: string): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValue([
      {
        description:
          "\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e15:27\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eResolved\u003c/strong\u003e - This incident has been resolved.\u003c/p\u003e\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e15:21\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eUpdate\u003c/strong\u003e - Packages is continuing to recover well. Error rates are back to normal and request latency continues to drop. Next update in 10 minutes.\u003c/p\u003e\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e15:17\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eUpdate\u003c/strong\u003e - Packages is now experiencing degraded performance. We are continuing to investigate.\u003c/p\u003e\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e15:10\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eUpdate\u003c/strong\u003e - Our mitigation for Packages is progressing well. We are adding capacity back and beginning to see 5xx error rates reduce. Next update in 10 minutes.\u003c/p\u003e\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e14:52\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eUpdate\u003c/strong\u003e - Actions is experiencing degraded performance. We are continuing to investigate.\u003c/p\u003e\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e14:51\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eUpdate\u003c/strong\u003e - Users of GitHub Package Registry (except Docker and Maven registries) will be experiencing timeout failures. This includes GitHub Actions, Packages API and Packages UI on GitHub.com.\u003c/p\u003e\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e14:39\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eUpdate\u003c/strong\u003e - We have identified the source of the issue with GitHub Packages and are working to mitigate the problem.\u003c/p\u003e\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e14:22\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eUpdate\u003c/strong\u003e - Pages is operating normally.\u003c/p\u003e\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e14:20\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eUpdate\u003c/strong\u003e - Packages is now experiencing degraded availability. We are continuing to investigate.\u003c/p\u003e\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e14:09\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eUpdate\u003c/strong\u003e - Packages is experiencing degraded performance. We are continuing to investigate.\u003c/p\u003e\u003cp\u003e\u003csmall\u003eMar \u003cvar data-var='date'\u003e15\u003c/var\u003e, \u003cvar data-var='time'\u003e14:07\u003c/var\u003e UTC\u003c/small\u003e\u003cbr\u003e\u003cstrong\u003eInvestigating\u003c/strong\u003e - We are investigating reports of degraded performance for Pages.\u003c/p\u003e",
        feedLink: 'https://www.githubstatus.com/history.rss',
        feedTitle: 'GitHub Status - Incident History',
        link: 'https://www.githubstatus.com/incidents/ybnn77s3lyf8',
        links: ['https://www.githubstatus.com/incidents/ybnn77s3lyf8'],
        published: 1678894041,
        title: 'Incident with Actions, Packages and Pages',
        updated: 1678894041,
      },
    ]);

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <RSSPage instance={{ cluster: 'hub', id: '/cluster/hub/type/rss/name/rss', name: 'rss', type: 'rss' }} />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render info that url is required', async () => {
    render('/');

    expect(screen.getByText('rss')).toBeInTheDocument();
    expect(screen.getByText('(hub / rss)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Provide a URL'))).toBeInTheDocument();
  });

  it('should render feed', async () => {
    render(`/?url=${encodeURIComponent('https://www.githubstatus.com/history.rss')}`);
    expect(await waitFor(() => screen.getByText('Incident with Actions, Packages and Pages'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/GitHub Status - Incident History - 2023-03-15/))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Incident with Actions, Packages and Pages/));
    expect(await waitFor(() => screen.getByText('Resolved'))).toBeInTheDocument();
  });
});
