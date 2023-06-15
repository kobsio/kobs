import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { QueryHistory } from './QueryHistory';

describe('QueryHistory', () => {
  it('should return selected query from history', async () => {
    localStorage.setItem('kobs-datadog-queryhistory', '["@service:cloudwatch","@service:myservice @host:myhost"]');

    const setQuery = vi.fn();
    render(<QueryHistory optionsQuery="" setQuery={setQuery} />);

    const historyButton = screen.getByRole('button');
    await userEvent.click(historyButton);

    expect(screen.getByText('@service:cloudwatch')).toBeInTheDocument();
    expect(screen.getByText('@service:myservice @host:myhost')).toBeInTheDocument();

    await userEvent.click(screen.getByText('@service:cloudwatch'));
    expect(setQuery).toHaveBeenCalledWith('@service:cloudwatch');
  });

  it('should not render the history button if history is empty', async () => {
    localStorage.setItem('kobs-datadog-queryhistory', '');

    const setQuery = vi.fn();
    render(<QueryHistory optionsQuery="" setQuery={setQuery} />);

    const hisotryButton = screen.queryByTestId('datadog-query-history');
    expect(hisotryButton).not.toBeInTheDocument();
  });
});
