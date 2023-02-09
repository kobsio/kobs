import { render, screen } from '@testing-library/react';

describe('placeholder', () => {
  it('x', () => {
    render(<>Placeholder</>);
    expect(screen.getByText('Placeholder')).toBeInTheDocument();
  });
});
