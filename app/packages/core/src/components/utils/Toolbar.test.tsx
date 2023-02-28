import { render, screen, waitFor } from '@testing-library/react';

import { Toolbar, ToolbarItem } from './Toolbar';

describe('Toolbar', () => {
  it('should render a toolbar and toolbar item', async () => {
    render(
      <Toolbar>
        <ToolbarItem width="200px">Clusters</ToolbarItem>
        <ToolbarItem width="200px">Namespaces</ToolbarItem>
        <ToolbarItem grow={true}>Search Term</ToolbarItem>
        <ToolbarItem align="right">Search Button</ToolbarItem>
      </Toolbar>,
    );
    expect(await waitFor(() => screen.getByText(/Clusters/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Namespaces/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Search Term/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Search Button/))).toBeInTheDocument();
  });
});
