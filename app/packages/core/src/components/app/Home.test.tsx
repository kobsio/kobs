import Home from './Home';
import { render, screen } from '@testing-library/react';

describe('Home', () => {
  it('x', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
});
