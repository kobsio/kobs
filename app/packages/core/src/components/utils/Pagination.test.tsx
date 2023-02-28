import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import Pagination from './Pagination';

describe('Pagination', () => {
  it('should render pagination', async () => {
    const handleChange = vi.fn();

    render(<Pagination count={100} page={1} perPage={10} handleChange={handleChange} />);
    expect(await waitFor(() => screen.getByText(/1 - 10 of 100/))).toBeInTheDocument();
  });
});
