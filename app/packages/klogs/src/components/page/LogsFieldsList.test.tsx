import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import LogsFieldsList from './LogsFieldsList';

describe('LogsFieldsList', () => {
  it('renders the fields', () => {
    render(
      <LogsFieldsList
        selectedFields={['a_selected_field']}
        fields={['namespace', 'app', 'content_foo']}
        onToggleField={vi.fn()}
        onSwapItem={vi.fn()}
      />,
    );

    expect(screen.getByText(/namespace/)).toBeInTheDocument();
  });

  it('renders the selectedFields', () => {
    render(
      <LogsFieldsList
        selectedFields={['a_selected_field']}
        fields={['namespace', 'app', 'content_foo']}
        onToggleField={vi.fn()}
        onSwapItem={vi.fn()}
      />,
    );

    expect(screen.getByText(/a_selected_field/)).toBeInTheDocument();
  });

  it('can toggle field', async () => {
    const onToggleField = vi.fn();
    render(
      <LogsFieldsList
        selectedFields={[]}
        fields={['namespace', 'app', 'content_foo']}
        onToggleField={onToggleField}
        onSwapItem={vi.fn()}
      />,
    );

    const fieldButton = screen.getByLabelText('namespace');
    await userEvent.click(fieldButton);
    expect(onToggleField).toHaveBeenCalledWith('namespace');
  });

  it('can toggle selectedField', async () => {
    const onToggleField = vi.fn();
    render(
      <LogsFieldsList
        selectedFields={['a_selected_field']}
        fields={['namespace', 'app', 'content_foo']}
        onToggleField={onToggleField}
        onSwapItem={vi.fn()}
      />,
    );

    const selectedFieldItem = screen.getByLabelText('a_selected_field');
    const deleteButton = within(selectedFieldItem).getByRole('button', { name: 'delete' });
    await userEvent.click(deleteButton);
    expect(onToggleField).toHaveBeenCalledWith('a_selected_field');
  });

  it('can move field up', async () => {
    const onSwapItem = vi.fn();
    render(
      <LogsFieldsList
        selectedFields={['first_field', 'second_field']}
        fields={['namespace', 'app', 'content_foo']}
        onToggleField={vi.fn()}
        onSwapItem={onSwapItem}
      />,
    );

    const selectedFieldItem = screen.getByLabelText('second_field');
    const moveUpButton = within(selectedFieldItem).getByRole('button', { name: 'move up' });
    await userEvent.click(moveUpButton);
    expect(onSwapItem).toHaveBeenCalledWith(0, 1);
  });

  it('can move field down', async () => {
    const onSwapItem = vi.fn();
    render(
      <LogsFieldsList
        selectedFields={['first_field', 'second_field']}
        fields={['namespace', 'app', 'content_foo']}
        onToggleField={vi.fn()}
        onSwapItem={onSwapItem}
      />,
    );

    const selectedFieldItem = screen.getByLabelText('first_field');
    const moveDownButton = within(selectedFieldItem).getByRole('button', { name: 'move down' });
    await userEvent.click(moveDownButton);
    expect(onSwapItem).toHaveBeenCalledWith(0, 1);
  });
});
