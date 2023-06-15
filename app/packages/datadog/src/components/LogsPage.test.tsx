import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { LogsFields } from './LogsPage';

describe('LogsFields', () => {
  it('renders the fields', () => {
    render(
      <LogsFields
        selectedFields={['a_selected_field']}
        fields={['attributes.attributes.host', 'attributes.attributes.service', 'attributes.message']}
        selectField={vi.fn()}
        changeFieldOrder={vi.fn()}
      />,
    );

    expect(screen.getByText('attributes.attributes.host')).toBeInTheDocument();
  });

  it('renders the selectedFields', () => {
    render(
      <LogsFields
        selectedFields={['a_selected_field']}
        fields={['attributes.attributes.host', 'attributes.attributes.service', 'attributes.message']}
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
        fields={['attributes.attributes.host', 'attributes.attributes.service', 'attributes.message']}
        selectField={selectField}
        changeFieldOrder={vi.fn()}
      />,
    );

    const fieldButton = screen.getByLabelText('attributes.attributes.host');
    await userEvent.click(fieldButton);
    expect(selectField).toHaveBeenCalledWith('attributes.attributes.host');
  });

  it('can toggle selectedField', async () => {
    const selectField = vi.fn();
    render(
      <LogsFields
        selectedFields={['a_selected_field']}
        fields={['attributes.attributes.host', 'attributes.attributes.service', 'attributes.message']}
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
        fields={['attributes.attributes.host', 'attributes.attributes.service', 'attributes.message']}
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
        fields={['attributes.attributes.host', 'attributes.attributes.service', 'attributes.message']}
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
        fields={['attributes.attributes.host', 'attributes.attributes.service', 'attributes.message']}
        selectField={vi.fn()}
        changeFieldOrder={vi.fn()}
        selectedFields={[]}
      />,
    );

    const searchField = screen.getByPlaceholderText('Filter Fields');
    await userEvent.type(searchField, 'attributes.attributes.host');
    expect(screen.getByText(/attributes.attributes.host/)).toBeInTheDocument();
    expect(screen.queryByText(/attributes.attributes.service/)).not.toBeInTheDocument();
  });
});
