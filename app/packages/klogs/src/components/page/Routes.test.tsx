import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import Entrypoint from './Routes';

vi.mock('./LogsPage', () => {
  return {
    default: () => {
      return <>LogsPage</>;
    },
  };
});

vi.mock('./AggregationPage', () => {
  return {
    default: () => {
      return <>AggregationPage</>;
    },
  };
});

describe('Routes', () => {
  it('should render logs page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Entrypoint instance={{ cluster: 'cluster', id: 'id', name: 'name', type: 'type' }} />
      </MemoryRouter>,
    );
    expect(screen.getByText('LogsPage')).toBeInTheDocument();
  });

  it('should render aggregation page', async () => {
    render(
      <MemoryRouter initialEntries={['/aggregation']}>
        <Entrypoint instance={{ cluster: 'cluster', id: 'id', name: 'name', type: 'type' }} />
      </MemoryRouter>,
    );
    expect(screen.getByText('AggregationPage')).toBeInTheDocument();
  });
});
