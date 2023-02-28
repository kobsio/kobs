import { render, screen, waitFor } from '@testing-library/react';

import DetailsDrawer from './DetailsDrawer';

describe('Page', () => {
  it('should render title and children', async () => {
    render(
      <DetailsDrawer
        open={true}
        onClose={() => {
          // noop
        }}
        title="Title"
      >
        Children
      </DetailsDrawer>,
    );

    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
  });

  it('should render subtitle', async () => {
    render(
      <DetailsDrawer
        open={true}
        onClose={() => {
          // noop
        }}
        title="Title"
        subtitle="Subtitle"
      >
        Children
      </DetailsDrawer>,
    );

    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Subtitle/))).toBeInTheDocument();
  });

  it('should render actions', async () => {
    render(
      <DetailsDrawer
        open={true}
        onClose={() => {
          // noop
        }}
        title="Title"
        actions="Actions"
      >
        Children
      </DetailsDrawer>,
    );

    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Actions/))).toBeInTheDocument();
  });
});
