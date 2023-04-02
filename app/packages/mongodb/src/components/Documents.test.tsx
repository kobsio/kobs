import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EJSON } from 'bson';
import { MemoryRouter } from 'react-router-dom';

import fixtureApplication from './__fixtures__/application.json';
import { Documents } from './Documents';

describe('Documents', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (): RenderResult => {
    return _render(
      <MemoryRouter>
        <Documents
          instance={{
            cluster: 'hub',
            id: '/cluster/hub/type/mongodb/name/mongodb',
            name: 'mongodb',
            type: 'mongodb',
          }}
          collectionName="applications"
          documents={[EJSON.parse(JSON.stringify(fixtureApplication))]}
        />
      </MemoryRouter>,
    );
  };

  it('should render documents', async () => {
    render();
    expect(await waitFor(() => screen.getByText('/cluster/test/namespace/yopass/name/mongodb'))).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'expand' }));

    expect(await waitFor(() => screen.getByText('Tree'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('BSON'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('JSON'))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('topology'))).toBeInTheDocument();
  });
});
