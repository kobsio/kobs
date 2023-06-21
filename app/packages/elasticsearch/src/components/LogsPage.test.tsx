import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { LogsFields } from './LogsPage';

describe('LogsFields', () => {
  it('renders the fields', () => {
    render(
      <LogsFields
        selectedFields={['a_selected_field']}
        fields={['kubernetes.namespace', 'kubernetes.pod.name', 'message']}
        selectField={vi.fn()}
        changeFieldOrder={vi.fn()}
      />,
    );

    expect(screen.getByText('kubernetes.namespace')).toBeInTheDocument();
  });

  it('renders the selectedFields', () => {
    render(
      <LogsFields
        selectedFields={['a_selected_field']}
        fields={['kubernetes.namespace', 'kubernetes.pod.name', 'message']}
        selectField={vi.fn()}
        changeFieldOrder={vi.fn()}
      />,
    );

    expect(screen.getByText(/a_selected_field/)).toBeInTheDocument();
  });

  it('can toggle field', async () => {
    const selectField = vi.fn();
    render(
      <LogsFields
        selectedFields={[]}
        fields={['kubernetes.namespace', 'kubernetes.pod.name', 'message']}
        selectField={selectField}
        changeFieldOrder={vi.fn()}
      />,
    );

    const fieldButton = screen.getByLabelText('kubernetes.namespace');
    await userEvent.click(fieldButton);
    expect(selectField).toHaveBeenCalledWith('kubernetes.namespace');
  });

  it('can toggle selectedField', async () => {
    const selectField = vi.fn();
    render(
      <LogsFields
        selectedFields={['a_selected_field']}
        fields={['kubernetes.namespace', 'kubernetes.pod.name', 'message']}
        selectField={selectField}
        changeFieldOrder={vi.fn()}
      />,
    );

    const selectedFieldItem = screen.getByLabelText('a_selected_field');
    const deleteButton = within(selectedFieldItem).getByRole('button', { name: 'delete' });
    await userEvent.click(deleteButton);
    expect(selectField).toHaveBeenCalledWith('a_selected_field');
  });

  it('can move field up', async () => {
    const changeFieldOrder = vi.fn();
    render(
      <LogsFields
        selectedFields={['first_field', 'second_field']}
        fields={['kubernetes.namespace', 'kubernetes.pod.name', 'message']}
        selectField={vi.fn()}
        changeFieldOrder={changeFieldOrder}
      />,
    );

    const selectedFieldItem = screen.getByLabelText('second_field');
    const moveUpButton = within(selectedFieldItem).getByRole('button', { name: 'move up' });
    await userEvent.click(moveUpButton);
    expect(changeFieldOrder).toHaveBeenCalledWith(0, 1);
  });

  it('can move field down', async () => {
    const changeFieldOrder = vi.fn();
    render(
      <LogsFields
        selectedFields={['first_field', 'second_field']}
        fields={['kubernetes.namespace', 'kubernetes.pod.name', 'message']}
        selectField={vi.fn()}
        changeFieldOrder={changeFieldOrder}
      />,
    );

    const selectedFieldItem = screen.getByLabelText('first_field');
    const moveDownButton = within(selectedFieldItem).getByRole('button', { name: 'move down' });
    await userEvent.click(moveDownButton);
    expect(changeFieldOrder).toHaveBeenCalledWith(0, 1);
  });

  it('can filter fields', async () => {
    render(
      <LogsFields
        fields={['kubernetes.namespace', 'kubernetes.pod.name', 'message']}
        selectField={vi.fn()}
        changeFieldOrder={vi.fn()}
        selectedFields={[]}
      />,
    );

    const searchField = screen.getByPlaceholderText('Filter Fields');
    await userEvent.type(searchField, 'kubernetes.namespace');
    expect(screen.getByText(/kubernetes.namespace/)).toBeInTheDocument();
    expect(screen.queryByText(/kubernetes.pod.name/)).not.toBeInTheDocument();
  });
});
