import { render, screen, waitFor } from '@testing-library/react';

import { PluginPanel, PluginPanelActionButton, PluginPanelError } from './PluginPanel';

describe('PluginPanel', () => {
  it('should render title and children', async () => {
    render(<PluginPanel title="Title">Children</PluginPanel>);
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
  });

  it('should render actions', async () => {
    render(
      <PluginPanel title="Title" actions="Actions">
        Children
      </PluginPanel>,
    );
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Actions/))).toBeInTheDocument();
  });

  it('should render actions buttom', async () => {
    render(
      <PluginPanel title="Title" actions={<PluginPanelActionButton />}>
        Children
      </PluginPanel>,
    );
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Children/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByRole('button'))).toBeInTheDocument();
  });
});

describe('PluginPanelActionButton', () => {
  it('should render button', async () => {
    render(<PluginPanelActionButton />);
    expect(await waitFor(() => screen.getByRole('button'))).toBeInTheDocument();
  });
});

describe('PluginPanelError', () => {
  it('should render error', async () => {
    render(
      <PluginPanelError title="Title" description="Description" message="Message" details="Details" documentation="" />,
    );
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Message/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Details/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/DOCUMENTATION/))).toBeInTheDocument();
  });

  it('should render example', async () => {
    render(
      <PluginPanelError
        title="Title"
        description="Description"
        message="Message"
        details="Details"
        documentation=""
        example="Example"
      />,
    );
    expect(await waitFor(() => screen.getByText(/Title/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Message/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Details/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/DOCUMENTATION/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Example/))).toBeInTheDocument();
  });
});
