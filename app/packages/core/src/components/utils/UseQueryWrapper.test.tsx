import { Button } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { UseQueryWrapper } from './UseQueryWrapper';

import { APIError } from '../../context/APIContext';

describe('UseQueryWrapper', () => {
  it('should render loading spinner', async () => {
    render(
      <UseQueryWrapper errorTitle="" isError={false} isLoading={true} isNoData={false}>
        Children
      </UseQueryWrapper>,
    );
    expect(await waitFor(() => screen.getByRole('loading-indicator'))).toBeInTheDocument();
  });

  it('should render error', async () => {
    render(
      <UseQueryWrapper
        errorTitle="Error"
        error={new APIError(['Message'])}
        isError={true}
        isLoading={false}
        isNoData={false}
      >
        Children
      </UseQueryWrapper>,
    );
    expect(await waitFor(() => screen.getByText(/Error/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Message/))).toBeInTheDocument();
  });

  it('should render no data', async () => {
    render(
      <UseQueryWrapper
        errorTitle=""
        isError={false}
        isLoading={false}
        isNoData={true}
        noDataActions={
          <Button color="inherit" size="small">
            RETRY
          </Button>
        }
        noDataTitle="No Data"
        noDataMessage="Not Found"
      >
        Children
      </UseQueryWrapper>,
    );
    expect(await waitFor(() => screen.getByText(/No Data/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Not Found/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/RETRY/))).toBeInTheDocument();
  });

  it('should render children', async () => {
    render(
      <UseQueryWrapper errorTitle="" isError={false} isLoading={false} isNoData={false}>
        Children
      </UseQueryWrapper>,
    );
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
  });

  it('should be able to retry the request', async () => {
    const refetch = vi.fn();

    render(
      <UseQueryWrapper errorTitle="Error Title" isError={true} isLoading={false} isNoData={false} refetch={refetch}>
        Children
      </UseQueryWrapper>,
    );
    await waitFor(() => expect(screen.getByText(/Error Title/)).toBeInTheDocument());
    const retryButton = screen.getByRole('button', { name: 'RETRY' });

    await userEvent.click(retryButton);
    expect(refetch).toBeCalledTimes(1);
  });
});
