import { render, screen, waitFor } from '@testing-library/react';

import Page from './Page';

describe('Page', () => {
  it('should render title and children', async () => {
    render(<Page title="Title">Children</Page>);
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
  });

  it('should render subtitle', async () => {
    render(
      <Page title="Title" subtitle="Subtitle">
        Children
      </Page>,
    );
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Subtitle/))).toBeInTheDocument();
  });

  it('should render description', async () => {
    render(
      <Page title="Title" description="Description">
        Children
      </Page>,
    );
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Description/))).toBeInTheDocument();
  });

  it('should render actions', async () => {
    render(
      <Page title="Title" actions={<>Actions</>}>
        Children
      </Page>,
    );
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Actions/))).toBeInTheDocument();
  });

  it('should render toolbar', async () => {
    render(
      <Page title="Title" toolbar={<>Toolbar</>}>
        Children
      </Page>,
    );
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Toolbar/))).toBeInTheDocument();
  });

  it('should render divider', async () => {
    render(<Page title="Title">Children</Page>);
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByRole('divider'))).toBeInTheDocument();
  });

  it('should not render divider', async () => {
    render(
      <Page title="Title" hasTabs={true}>
        Children
      </Page>,
    );
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
    expect(await waitFor(() => screen.queryByRole('divider'))).not.toBeInTheDocument();
  });
});
