import { render, screen } from '@testing-library/react';

import Status from './Status';

describe('Status', () => {
  it('should show closed', () => {
    render(<Status status="closed" snoozed={false} acknowledged={false} />);
    expect(screen.getByText('closed')).toBeInTheDocument();
  });

  it('should show resolved', () => {
    render(<Status status="resolved" snoozed={false} acknowledged={false} />);
    expect(screen.getByText('resolved')).toBeInTheDocument();
  });

  it('should show snoozed', () => {
    render(<Status status="wasd" snoozed={true} acknowledged={false} />);
    expect(screen.getByText('snoozed')).toBeInTheDocument();
  });

  it('should show acknowledged', () => {
    render(<Status status="wasd" snoozed={false} acknowledged={true} />);
    expect(screen.getByText('acknowledged')).toBeInTheDocument();
  });

  it('should show status', () => {
    render(<Status status="wasd" snoozed={false} acknowledged={false} />);
    expect(screen.getByText('wasd')).toBeInTheDocument();
  });
});
