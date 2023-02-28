import { render as _render, RenderResult, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ApplicationsPage from './ApplicationsPage';

import { APIContextProvider } from '../../context/APIContext';
import QueryClientProvider from '../../utils/QueryClientProvider';

describe('ApplicationsPage', () => {
  const render = (): RenderResult => {
    return _render(
      <QueryClientProvider>
        <APIContextProvider>
          <MemoryRouter>
            <Routes>
              <Route path="/" element={<ApplicationsPage />} />
            </Routes>
          </MemoryRouter>
          ,
        </APIContextProvider>
        ,
      </QueryClientProvider>,
    );
  };

  it('should render page', async () => {
    render();

    expect(screen.getByText(/Applications/)).toBeInTheDocument();
    expect(
      screen.getByText(
        'A list of your / all applications. You can search for applications or filter them by clusters, namespaces or tags.',
      ),
    ).toBeInTheDocument();
  });
});
