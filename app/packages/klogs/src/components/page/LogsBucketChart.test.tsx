import { render } from '@testing-library/react';

import AggregationChartTooltip from './AggregationChartTooltip';

describe('LogsBucketChart', () => {
  it('renders the pie chart', async () => {
    const colorMap = new Map();
    colorMap.set('foo', '#FF0000');
    const result = render(<AggregationChartTooltip colorMap={colorMap} />);

    expect(result.queryAllByRole('presentation')).toBeDefined();
  });
});
