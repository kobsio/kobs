import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { QueryHistory } from './QueryHistory';

describe('QueryHistory', () => {
  it('should return selected query from history', async () => {
    localStorage.setItem('kobs-klogs-queryhistory', '["namespace = \'kobs\'","namespace = \'default\'"]');

    const setQuery = vi.fn();
    render(<QueryHistory optionsQuery="" setQuery={setQuery} />);

    const historyButton = screen.getByRole('button');
    await userEvent.click(historyButton);

    expect(screen.getByText("namespace = 'kobs'")).toBeInTheDocument();
    expect(screen.getByText("namespace = 'default'")).toBeInTheDocument();

    await userEvent.click(screen.getByText("namespace = 'kobs'"));
    expect(setQuery).toHaveBeenCalledWith("namespace = 'kobs'");
  });

  it('should not render the history button if history is empty', async () => {
    localStorage.setItem('kobs-klogs-queryhistory', '');

    const setQuery = vi.fn();
    render(<QueryHistory optionsQuery="" setQuery={setQuery} />);

    const hisotryButton = screen.queryByTestId('klogs-query-history');
    expect(hisotryButton).not.toBeInTheDocument();
  });
});
