import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import SonarQubePage from './SonarQubePage';

import { description } from '../utils/utils';

describe('SonarQubePage', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/sonarqube/projects')) {
        return {
          components: [
            {
              key: 'project-key-1',
              name: 'Project Name 1',
              organization: 'myorg',
              project: 'myproject1',
              qualifier: 'TRK',
            },
            {
              key: 'project-key-2',
              name: 'Project Name 2',
              organization: 'myorg',
              project: 'myproject2',
              qualifier: 'TRK',
            },
          ],
          paging: {
            pageIndex: 1,
            pageSize: 100,
            total: 2,
          },
        };
      }

      if (path.startsWith('/api/plugins/sonarqube/projectmeasures')) {
        return {
          component: {
            description: '',
            key: 'project-key-1',
            measures: [
              { metric: 'coverage', value: '86.4' },
              { metric: 'bugs', value: '11' },
              { metric: 'reliability_rating', value: '3.0' },
              { metric: 'alert_status', value: 'OK' },
              { metric: 'code_smells', value: '6741' },
              { metric: 'duplicated_lines_density', value: '0.3' },
              { metric: 'security_rating', value: '5.0' },
              { metric: 'vulnerabilities', value: '29' },
              { metric: 'security_hotspots_reviewed', value: '0.0' },
              { metric: 'security_review_rating', value: '5.0' },
              { bestValue: true, metric: 'sqale_rating', value: '1.0' },
            ],
            name: 'Project Name 1',
            qualifier: 'TRK',
          },
          metrics: [
            {
              bestValue: '100.0',
              decimalScale: 1,
              description: 'Coverage by tests',
              domain: 'Coverage',
              hidden: false,
              higherValuesAreBetter: true,
              key: 'coverage',
              name: 'Coverage',
              qualitative: true,
              type: 'PERCENT',
              worstValue: '0.0',
            },
            {
              bestValue: '0',
              description: 'Code Smells',
              domain: 'Maintainability',
              hidden: false,
              higherValuesAreBetter: false,
              key: 'code_smells',
              name: 'Code Smells',
              qualitative: false,
              type: 'INT',
            },
            {
              bestValue: '0',
              description: 'Bugs',
              domain: 'Reliability',
              hidden: false,
              higherValuesAreBetter: false,
              key: 'bugs',
              name: 'Bugs',
              qualitative: false,
              type: 'INT',
            },
            {
              bestValue: '0',
              description: 'Vulnerabilities',
              domain: 'Security',
              hidden: false,
              higherValuesAreBetter: false,
              key: 'vulnerabilities',
              name: 'Vulnerabilities',
              qualitative: false,
              type: 'INT',
            },
            {
              bestValue: '1.0',
              description: 'Security Review Rating',
              domain: 'SecurityReview',
              hidden: false,
              higherValuesAreBetter: false,
              key: 'security_review_rating',
              name: 'Security Review Rating',
              qualitative: true,
              type: 'RATING',
              worstValue: '5.0',
            },
            {
              bestValue: '100.0',
              decimalScale: 1,
              description: 'Percentage of Security Hotspots Reviewed',
              domain: 'SecurityReview',
              hidden: false,
              higherValuesAreBetter: true,
              key: 'security_hotspots_reviewed',
              name: 'Security Hotspots Reviewed',
              qualitative: true,
              type: 'PERCENT',
              worstValue: '0.0',
            },
            {
              bestValue: '0.0',
              decimalScale: 1,
              description: 'Duplicated lines balanced by statements',
              domain: 'Duplications',
              hidden: false,
              higherValuesAreBetter: false,
              key: 'duplicated_lines_density',
              name: 'Duplicated Lines (%)',
              qualitative: true,
              type: 'PERCENT',
              worstValue: '100.0',
            },
            {
              bestValue: '1.0',
              description: 'A-to-E rating based on the technical debt ratio',
              domain: 'Maintainability',
              hidden: false,
              higherValuesAreBetter: false,
              key: 'sqale_rating',
              name: 'Maintainability Rating',
              qualitative: true,
              type: 'RATING',
              worstValue: '5.0',
            },
            {
              bestValue: '1.0',
              description: 'Reliability rating',
              domain: 'Reliability',
              hidden: false,
              higherValuesAreBetter: false,
              key: 'reliability_rating',
              name: 'Reliability Rating',
              qualitative: true,
              type: 'RATING',
              worstValue: '5.0',
            },
            {
              bestValue: '1.0',
              description: 'Security rating',
              domain: 'Security',
              hidden: false,
              higherValuesAreBetter: false,
              key: 'security_rating',
              name: 'Security Rating',
              qualitative: true,
              type: 'RATING',
              worstValue: '5.0',
            },
            {
              description: 'The project status with regard to its quality gate.',
              domain: 'Releasability',
              hidden: false,
              higherValuesAreBetter: true,
              key: 'alert_status',
              name: 'Quality Gate Status',
              qualitative: true,
              type: 'LEVEL',
            },
          ],
        };
      }

      return [];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <SonarQubePage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/sonarqube/name/sonarqube',
                name: 'sonarqube',
                type: 'sonarqube',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render projects', async () => {
    render();

    expect(screen.getByText('sonarqube')).toBeInTheDocument();
    expect(screen.getByText('(hub / sonarqube)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Project Name 1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Project Name 2'))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Project Name 1/));
    expect(await waitFor(() => screen.getAllByText(/Quality Gate Status/).length)).toBe(1);
  });
});
