import { render, screen } from '@testing-library/react';
import Home from './Home';

describe('Home', () => {
  it('x', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
});
