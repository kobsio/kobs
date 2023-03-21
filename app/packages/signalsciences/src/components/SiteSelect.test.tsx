import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render as _render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { SiteSelect } from './SiteSelect';

describe('ResourcesSelectClusters', () => {
  const render = async (
    sites: { Name: string }[],
    selectedSite: string,
    selectSite: (site: string) => void,
  ): Promise<RenderResult> => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValueOnce(sites);

    const result = _render(
      <QueryClientProvider>
        <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
          <SiteSelect
            instance={{
              cluster: 'hub',
              id: '/cluster/hub/type/signalsciences/name/signalsciences',
              name: 'signalsciences',
              type: 'signalsciences',
            }}
            selectSite={selectSite}
            selectedSite={selectedSite}
          />
        </APIContext.Provider>
      </QueryClientProvider>,
    );

    expect(getSpy).toHaveBeenCalled();
    return result;
  };

  it('should render no options', async () => {
    await render([], '', () => {
      // noop
    });

    const sitesSelect = screen.getByLabelText('Site');
    await userEvent.click(sitesSelect);
    expect(screen.getByText(/No options/)).toBeInTheDocument();
  });

  it('should render sites', async () => {
    await render([{ Name: 'site1' }, { Name: 'site2' }], '', () => {
      // noop
    });

    const sitesSelect = screen.getByLabelText('Site');
    await userEvent.click(sitesSelect);
    expect(screen.getByText(/site1/)).toBeInTheDocument();
    expect(screen.getByText(/site2/)).toBeInTheDocument();
  });

  it('should call selectCluster', async () => {
    const selectSite = vi.fn();

    await render([{ Name: 'site1' }, { Name: 'site2' }], '', selectSite);

    const sitesSelect = screen.getByLabelText('Site');
    await userEvent.click(sitesSelect);

    const site1Option = screen.getByRole('option', { name: 'site1' });
    await userEvent.click(site1Option);

    expect(selectSite).toHaveBeenCalledTimes(1);
    expect(selectSite).toHaveBeenCalledWith('site1');
  });
});
