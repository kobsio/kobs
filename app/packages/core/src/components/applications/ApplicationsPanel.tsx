import { Divider, List } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext } from 'react';

import Application from './Application';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { IApplication } from '../../crds/application';
import { useQueryState } from '../../utils/hooks/useQueryState';
import { Pagination } from '../utils/Pagination';
import { PluginPanel } from '../utils/PluginPanel';
import { UseQueryWrapper } from '../utils/UseQueryWrapper';

interface IApplicationsPanelProps {
  description?: string;
  options?: {
    team?: string;
  };
  title: string;
}

/**
 * The `ApplicationsPanel` is used to display a list of applications within a dashboard panel. It will display the
 * applications for the provided `team` or when no team is provided for the currently authenticated user.
 */
const ApplicationsPanel: FunctionComponent<IApplicationsPanelProps> = ({ title, description, options }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [internalOptions, setInternalOptions] = useQueryState<{ page: number; perPage: number }>({
    page: 1,
    perPage: 10,
  });

  const { isError, isLoading, error, data, refetch } = useQuery<
    { applications?: IApplication[]; count?: number },
    APIError
  >(['core/applications/team', options, internalOptions], async () => {
    return apiContext.client.get<{ applications?: IApplication[]; count?: number }>(
      `/api/applications/team?limit=${internalOptions.perPage}&offset=${
        internalOptions.page && internalOptions.perPage ? (internalOptions.page - 1) * internalOptions.perPage : 0
      }${options?.team ? `&team=${options?.team}` : ''}`,
    );
  });

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to load applications"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || !data.applications || data.applications.length === 0}
        noDataTitle="No applications were found"
        noDataMessage="No applications were found for the provided team."
        refetch={refetch}
      >
        <List sx={{ bgcolor: 'background.paper' }} disablePadding={true}>
          {data?.applications?.map((application) => (
            <Fragment key={application.id}>
              <Application application={application} />
              <Divider component="li" />
            </Fragment>
          ))}
        </List>

        <Pagination
          count={data?.count ?? 0}
          page={internalOptions.page ?? 1}
          perPage={internalOptions.perPage ?? 10}
          handleChange={(page, perPage) => setInternalOptions({ page: page, perPage: perPage })}
        />
      </UseQueryWrapper>
    </PluginPanel>
  );
};

export default ApplicationsPanel;
