import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import LogsDocumentDetails from './LogsDocumentDetails';

describe('LogsDocumentDetails', () => {
  it('should render the table view', async () => {
    const row = {
      foo: 'bar',
      namespace: 'default',
      timestamp: new Date().toISOString(),
    };
    const handlers = {
      onAddFilter: vi.fn(),
      onChangeSort: vi.fn(),
      onSelectField: vi.fn(),
    };

    const options = {
      hideActionColumn: false,
    };
    render(<LogsDocumentDetails row={row} handlers={handlers} options={options} />);
    expect(screen.getByLabelText('detailed log display variant')).toBeInTheDocument();
    expect(screen.getByText('namespace')).toBeInTheDocument();
    expect(screen.getByText('default')).toBeInTheDocument();
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('should be able to use action items in the table', async () => {
    const row = {
      foo: 'bar',
      namespace: 'default',
      timestamp: new Date().toISOString(),
    };
    const handlers = {
      onAddFilter: vi.fn(),
      onChangeSort: vi.fn(),
      onSelectField: vi.fn(),
    };

    const options = {
      hideActionColumn: false,
    };
    render(<LogsDocumentDetails row={row} handlers={handlers} options={options} />);
    const addEQFilter = screen.getAllByLabelText('add EQ field filter')[1];
    const addNEQFilter = screen.getAllByLabelText('add NEQ field filter')[1];
    const addEXISTSFilter = screen.getAllByLabelText('add EXISTS field filter')[1];
    const toggleFieldColumn = screen.getAllByLabelText('toggle field column')[1];

    await userEvent.click(addEQFilter);
    await userEvent.click(addNEQFilter);
    await userEvent.click(addEXISTSFilter);
    await userEvent.click(toggleFieldColumn);

    expect(handlers.onAddFilter).toHaveBeenCalledWith("namespace = 'default'");
    expect(handlers.onAddFilter).toHaveBeenCalledWith("namespace != 'default'");
    expect(handlers.onAddFilter).toHaveBeenCalledWith('_exists_ namespace');
    expect(handlers.onSelectField).toHaveBeenCalledWith('namespace');
  });
});
