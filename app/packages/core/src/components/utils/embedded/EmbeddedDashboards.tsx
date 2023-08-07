import { Box, Tab, Tabs } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';

import { APIContext, APIError, IAPIContext } from '../../../context/APIContext';
import { IDashboard, IReference } from '../../../crds/dashboard';
import { Dashboard } from '../../dashboards/Dashboards';
import { interpolateJSONPath } from '../../dashboards/utils';
import { UseQueryWrapper } from '../UseQueryWrapper';

export type TEmbeddedDashboards = IReference;

export const EmbeddedDashboards: FunctionComponent<{ manifest: unknown; references: TEmbeddedDashboards[] }> = ({
  manifest,
  references,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [selectedDashboard, setSelectedDashboard] = useState<string>();

  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard[], APIError>(
    ['core/dashboards/dashboards', references, manifest],
    async () => {
      const dashboards = await apiContext.client.post<IDashboard[]>('/api/dashboards', {
        body: references,
      });
      if (dashboards && dashboards.length > 0) {
        return JSON.parse(interpolateJSONPath(JSON.stringify(dashboards), manifest));
      }
      return dashboards;
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load dashboards"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No dashboards were found"
      refetch={refetch}
    >
      {data && data.length === 1 ? (
        <Dashboard dashboard={data[0]} />
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              variant="scrollable"
              scrollButtons={false}
              value={selectedDashboard ?? data?.[0].title}
              onChange={(_, value) => setSelectedDashboard(value)}
            >
              {data?.map((dashboard) => <Tab key={dashboard.title} label={dashboard.title} value={dashboard.title} />)}
            </Tabs>
          </Box>
          {data?.map((dashboard) => (
            <Box
              key={dashboard.title}
              hidden={selectedDashboard ? dashboard.title !== selectedDashboard : dashboard.title !== data[0].title}
              sx={{ pt: 6 }}
            >
              {(selectedDashboard ? dashboard.title === selectedDashboard : dashboard.title === data[0].title) && (
                <Dashboard key={dashboard.title} dashboard={dashboard} />
              )}
            </Box>
          ))}
        </>
      )}
    </UseQueryWrapper>
  );
};
