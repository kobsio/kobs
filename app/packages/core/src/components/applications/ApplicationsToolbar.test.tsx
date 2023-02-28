import { render as _render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import ApplicationsToolbar from './ApplicationsToolbar';
import { IApplicationOptions } from './utils';

import { APIClient, APIContext } from '../../context/APIContext';
import QueryClientProvider from '../../utils/QueryClientProvider';

describe('ApplicationsToolbar', () => {
  const render = async (
    options: IApplicationOptions,
    setOptions: (options: IApplicationOptions) => void,
  ): Promise<RenderResult> => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path === '/api/applications/tags') {
        return ['tag1', 'tag2'];
      }

      return [];
    });

    const result = _render(
      <QueryClientProvider>
        <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
          <ApplicationsToolbar options={options} setOptions={setOptions} />
        </APIContext.Provider>
      </QueryClientProvider>,
    );

    expect(getSpy).toHaveBeenCalledTimes(3);
    return result;
  };

  it('should render toolbar', async () => {
    await render({}, () => {
      // noop
    });

    expect(screen.getByText(/Owned/)).toBeInTheDocument();
    expect(screen.getByText(/All/)).toBeInTheDocument();
    expect(screen.getByText(/Search/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Clusters/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Namespaces/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/)).toBeInTheDocument();
  });

  it('should return user selected options', async () => {
    const setOptions = vi.fn();

    await render({}, setOptions);

    const tagsInput = screen.getByLabelText('Tags');
    await userEvent.type(tagsInput, 'tag');

    const tagOption = screen.getByRole('option', { name: 'tag1' });
    await userEvent.click(tagOption);

    await userEvent.click(screen.getByText(/Search/));

    expect(setOptions).toHaveBeenCalledTimes(1);
    expect(setOptions).toHaveBeenCalledWith({ page: 1, perPage: 10, tags: ['tag1'] });
  });

  it('should preserve default options', async () => {
    const setOptions = vi.fn();

    await render({ all: false, clusters: ['cluster1'], namespaces: ['namespace1'], tags: ['tag2'] }, setOptions);

    const tagsInput = screen.getByLabelText('Tags');
    await userEvent.type(tagsInput, 'tag');

    const tag1Option = screen.getByRole('option', { name: 'tag1' });
    await userEvent.click(tag1Option);

    const tag2Option = screen.getByRole('option', { name: 'tag2' });
    await userEvent.click(tag2Option);

    await userEvent.click(screen.getByText(/Search/));

    expect(setOptions).toHaveBeenCalledTimes(1);
    expect(setOptions).toHaveBeenCalledWith({
      all: false,
      clusters: ['cluster1'],
      namespaces: ['namespace1'],
      page: 1,
      perPage: 10,
      tags: ['tag1'],
    });
  });
});
