import { render as _render, RenderResult, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ApplicationLabels from './ApplicationLabels';

import { IApplication } from '../../crds/application';

describe('ApplicationLabels', () => {
  const render = (application: IApplication): RenderResult => {
    return _render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ApplicationLabels application={application} />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it('should render null when applications does not contain a labels', async () => {
    const { container } = render({
      cluster: '',
      id: '',
      name: '',
      namespace: '',
      updatedAt: 0,
    });

    expect(container.firstChild).toBeNull();
  });

  it('should render tags', async () => {
    render({
      cluster: '',
      id: '',
      name: '',
      namespace: '',
      tags: ['tag1'],
      updatedAt: 0,
    });

    expect(screen.getByText(/tag1/)).toBeInTheDocument();
  });

  it('should render teams', async () => {
    render({
      cluster: '',
      id: '',
      name: '',
      namespace: '',
      teams: ['team1'],
      updatedAt: 0,
    });

    expect(screen.getByText(/team1/)).toBeInTheDocument();
  });

  it('should render dependencies', async () => {
    render({
      cluster: '',
      id: '',
      name: '',
      namespace: '',
      topology: {
        dependencies: [{ cluster: 'cluster1', name: 'name1', namespace: 'namespace1' }],
      },
      updatedAt: 0,
    });

    expect(screen.getByText(/name1/)).toBeInTheDocument();
  });

  it('should render links', async () => {
    render({
      cluster: '',
      id: '',
      links: [{ link: 'kobs.io', title: 'link1' }],
      name: '',
      namespace: '',
      updatedAt: 0,
    });

    expect(screen.getByText(/link1/)).toBeInTheDocument();
  });
});
