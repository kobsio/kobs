import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { QueryHistory } from './QueryHistory';

describe('QueryHistory', () => {
  it('should return selected query from history', async () => {
    localStorage.setItem('kobs-elasticsearch-queryhistory-logs', '["*","kubernetes.namespace:kube-system"]');

    const setQuery = vi.fn();
    render(<QueryHistory historyKey="kobs-elasticsearch-queryhistory-logs" optionsQuery="" setQuery={setQuery} />);

    const historyButton = screen.getByRole('button');
    await userEvent.click(historyButton);

    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('kubernetes.namespace:kube-system')).toBeInTheDocument();

    await userEvent.click(screen.getByText('*'));
    expect(setQuery).toHaveBeenCalledWith('*');
  });

  it('should not render the history button if history is empty', async () => {
    localStorage.setItem('kobs-elasticsearch-queryhistory-logs', '');

    const setQuery = vi.fn();
    render(<QueryHistory historyKey="kobs-elasticsearch-queryhistory-logs" optionsQuery="" setQuery={setQuery} />);

    const hisotryButton = screen.queryByTestId('kobs-elasticsearch-queryhistory-logs');
    expect(hisotryButton).not.toBeInTheDocument();
  });
});
