import { act } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { vi } from 'vitest';

import type { MemoryRouterProps } from 'react-router-dom';

import { encodeQueryState, useQueryState } from './useQueryState';

describe('encodeQueryState', () => {
  it('should encode state', () => {
    const res = encodeQueryState({ array: [1, 2], boolean: true, number: 1, string: 'test' });
    expect(res).toMatchObject('array[]=1&array[]=2&boolean=true&number=1&string=test');
  });
});

describe('useQueryState', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setup = (initialEntries: MemoryRouterProps['initialEntries'], initialState: any = {}) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = {} as any;

    const Component = () => {
      const [state, setState] = useQueryState(initialState);
      const location = useLocation();
      Object.assign(res, { location, setState, state });
      return null;
    };

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Component />
      </MemoryRouter>,
    );

    return res;
  };

  it('should add state to url search params', () => {
    const res = setup([
      {
        pathname: '/index',
        search: '?count=1',
      },
    ]);
    expect(res.state).toMatchObject({ count: 1 });
  });

  it('shoule change url when setState is used', () => {
    const res = setup(['/index']);
    expect(res.state).toMatchObject({});
    act(() => {
      res.setState({ count: 1 });
    });
    expect(res.state).toMatchObject({ count: 1 });
  });

  it('should be work with multiple states', () => {
    const res = setup(['/index']);
    act(() => {
      res.setState({ page: 1 });
    });
    act(() => {
      res.setState({ pageSize: 10 });
    });
    expect(res.state).toMatchObject({ page: 1, pageSize: 10 });
  });

  it('should keep location.state', () => {
    const res = setup([
      {
        pathname: '/index',
        state: 'state',
      },
    ]);
    expect(res.location.state).toBe('state');
    act(() => {
      res.setState({ count: 1 });
    });
    expect(res.state).toMatchObject({ count: 1 });
    expect(res.location.state).toBe('state');
  });

  it('should work with strings, numbers, booleans and arrays', () => {
    const res = setup([
      {
        pathname: '/index',
        search: '?string=test&number=1&boolean=true&array[]=1&array[]=2',
      },
    ]);
    expect(res.state).toMatchObject({ array: [1, 2], boolean: true, number: 1, string: 'test' });
  });

  it('should overwrite default array value', () => {
    const res = setup([{ pathname: '/index' }], { array: [1] });
    expect(res.state).toMatchObject({ array: [1] });
    act(() => {
      res.setState({ array: [] });
    });
    expect(res.state).toMatchObject({});
    expect(res.location.search).toBe('');
  });

  it('should parse initial time parameter', () => {
    vi.useFakeTimers().setSystemTime(new Date('2023-01-01'));

    const res = setup([{ pathname: '/index', search: '?time=last15Minutes&timeEnd=1646647980&timeStart=1646647080' }]);
    expect(res.state).toMatchObject({ time: 'last15Minutes', timeEnd: 1672531200, timeStart: 1672530300 });
  });
});
