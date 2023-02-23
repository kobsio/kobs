import { act } from '@testing-library/react';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import type { MemoryRouterProps } from 'react-router-dom';

import useQueryState from './useQueryState';

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
    expect(res.state).toMatchObject({ count: '1' });
  });

  it('shoule change url when setState is used', () => {
    const res = setup(['/index']);
    expect(res.state).toMatchObject({});
    act(() => {
      res.setState({ count: 1 });
    });
    expect(res.state).toMatchObject({ count: '1' });
  });

  it('should be work with multiple states', () => {
    const res = setup(['/index']);
    act(() => {
      res.setState({ page: 1 });
    });
    act(() => {
      res.setState({ pageSize: 10 });
    });
    expect(res.state).toMatchObject({ page: '1', pageSize: '10' });
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
    expect(res.state).toMatchObject({ count: '1' });
    expect(res.location.state).toBe('state');
  });
});
