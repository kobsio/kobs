import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { Editor } from './Editor';

describe('Editor', () => {
  it('should render editor', async () => {
    const onChange = vi.fn();

    render(<Editor language="json" value={'{"hello": "world"}'} onChange={onChange} />);

    expect(await waitFor(() => screen.getByText(/hello/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/world/))).toBeInTheDocument();

    const editorInput = screen.getByText(/hello/);
    await userEvent.type(editorInput, 'test');

    expect(onChange).toHaveBeenLastCalledWith('test{"hello": "world"}');
  });
});
