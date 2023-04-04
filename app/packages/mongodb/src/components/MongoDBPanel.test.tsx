import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import MongoDBPanel from './MongoDBPanel';

vi.mock('./Collections', () => {
  return {
    Collections: () => {
      return <>Mocked Collections</>;
    },
  };
});

vi.mock('./DBStats', () => {
  return {
    DBStats: () => {
      return <>Mocked DBStats</>;
    },
  };
});

vi.mock('./OperationCount', () => {
  return {
    OperationCount: () => {
      return <>Mocked OperationCount</>;
    },
  };
});

vi.mock('./OperationFind', () => {
  return {
    OperationFind: () => {
      return <>Mocked OperationFind</>;
    },
  };
});

vi.mock('./OperationFindOne', () => {
  return {
    OperationFindOne: () => {
      return <>Mocked OperationFindOne</>;
    },
  };
});

vi.mock('./OperationAggregate', () => {
  return {
    OperationAggregate: () => {
      return <>Mocked OperationAggregate</>;
    },
  };
});

describe('MongoDBPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
    return _render(
      <MemoryRouter>
        <MongoDBPanel
          title="Test"
          instance={{
            cluster: 'hub',
            id: '/cluster/hub/type/mongodb/name/mongodb',
            name: 'mongodb',
            type: 'mongodb',
          }}
          options={options}
          times={{
            time: 'last15Minutes',
            timeEnd: 0,
            timeStart: 0,
          }}
          setTimes={() => {
            // nothing
          }}
        />
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined);
    expect(await waitFor(() => screen.getByText('Invalid options for MongoDB plugin'))).toBeInTheDocument();
  });

  it('should render database stats', async () => {
    render({ operation: 'db' });

    expect(await waitFor(() => screen.getByText(/Mocked DBStats/))).toBeInTheDocument();
  });

  it('should render collection stats', async () => {
    render({ operation: 'collections' });

    expect(await waitFor(() => screen.getByText(/Mocked Collections/))).toBeInTheDocument();
  });

  it('should render count query', async () => {
    render({ operation: 'count', query: { collectionName: 'tags', filter: '{}' } });

    expect(await waitFor(() => screen.getByText(/Mocked OperationCount/))).toBeInTheDocument();
  });

  it('should render find query', async () => {
    render({ operation: 'find', query: { collectionName: 'tags', filter: '{}', limit: 50, sort: '{"name": 1}' } });

    expect(await waitFor(() => screen.getByText(/Mocked OperationFind/))).toBeInTheDocument();
  });

  it('should render findOne query', async () => {
    render({ operation: 'findOne', query: { collectionName: 'tags', filter: '{}' } });

    expect(await waitFor(() => screen.getByText(/Mocked OperationFindOne/))).toBeInTheDocument();
  });

  it('should render aggregate query', async () => {
    render({ operation: 'aggregate', query: { collectionName: 'tags', pipeline: '{}' } });

    expect(await waitFor(() => screen.getByText(/Mocked OperationAggregate/))).toBeInTheDocument();
  });
});
