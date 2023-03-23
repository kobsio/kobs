import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import Panel from './Panel';

vi.mock('./AggregationPanel', () => {
  return {
    default: () => {
      return <>AggregationPanel</>;
    },
  };
});

vi.mock('./LogsPanel', () => {
  return {
    default: () => {
      return <>LogsPanel</>;
    },
  };
});

describe('Panel', () => {
  it('should render the logs panel', () => {
    render(
      <Panel
        options={{ queries: [], type: 'logs' }}
        instance={{ cluster: 'cluster', id: 'id', name: 'name', type: 'type' }}
        setTimes={vi.fn()}
        times={{ time: 'last15Minutes', timeEnd: 1, timeStart: 0 }}
        title="my panel"
      />,
    );

    expect(screen.getByText('LogsPanel')).toBeInTheDocument();
  });

  it('should render the aggregation panel', () => {
    render(
      <Panel
        options={{
          chart: 'pie',
          query: "foo='bar'",
          sizeByField: '',
          sizeByOperation: 'count',
          sliceBy: 'app',
          type: 'aggregation',
        }}
        instance={{ cluster: 'cluster', id: 'id', name: 'name', type: 'type' }}
        setTimes={vi.fn()}
        times={{ time: 'last15Minutes', timeEnd: 1, timeStart: 0 }}
        title="my panel"
      />,
    );

    expect(screen.getByText('AggregationPanel')).toBeInTheDocument();
  });
});
