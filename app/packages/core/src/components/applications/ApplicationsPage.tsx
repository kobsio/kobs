import { Add } from '@mui/icons-material';
import { Button, Divider, List } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Application from './Application';
import ApplicationsToolbar from './ApplicationsToolbar';
import { IApplicationOptions } from './utils';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { IApplication } from '../../crds/application';
import { useLocalStorageState } from '../../utils/hooks/useLocalStorageState';
import { useQueryState } from '../../utils/hooks/useQueryState';
import { Page } from '../utils/Page';
import { Pagination } from '../utils/Pagination';
import { UseQueryWrapper } from '../utils/UseQueryWrapper';

interface IApplicationsProps {
  options: IApplicationOptions;
  setOptions: (options: IApplicationOptions) => void;
}

/**
 * The `Applications` component load the applications for the provided `options` and renders them as a list where each
 * list item is seperated by a `Divider` component. Each list item is rendered via the `Applications` component. If the
 * number of possible applications for the filter options is larger then the returned applications a pagination
 * component will be shown, which can be used to get the other applications which are not shown.
 *
 * The returned applications are cached with the provided options as key, so that we do not have to reload the
 * applications when a user wants to view the applications for the same filter twice or more.
 */
const Applications: FunctionComponent<IApplicationsProps> = ({ options, setOptions }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<
    { applications?: IApplication[]; count?: number },
    APIError
  >(['core/applications/applications', options], async () => {
    const join = (v: string[] | undefined): string => (v && v.length > 0 ? v.join('') : '');

    const c = join(options.clusters?.map((cluster) => `&cluster=${encodeURIComponent(cluster)}`));
    const n = join(options.namespaces?.map((namespace) => `&namespace=${encodeURIComponent(namespace)}`));
    const t = join(options.tags?.map((tag) => `&tag=${encodeURIComponent(tag)}`));

    return apiContext.client.get<{ applications?: IApplication[]; count?: number }>(
      `/api/applications?all=${options.all}&searchTerm=${options.searchTerm}&limit=${options.perPage}&offset=${
        options.page && options.perPage ? (options.page - 1) * options.perPage : 0
      }${c}${n}${t}`,
    );
  });

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load applications"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || !data.applications || data.applications.length === 0}
      noDataActions={
        options.all ? undefined : (
          <Button color="inherit" size="small" onClick={() => setOptions({ ...options, all: true })}>
            RETRY WITH ALL
          </Button>
        )
      }
      noDataTitle="No applications were found"
      noDataMessage={`No applications were found for your selected filters.${
        options.all ? ' You can try to search through all applications.' : ''
      }`}
      refetch={refetch}
    >
      <List sx={{ bgcolor: 'background.paper' }} disablePadding={true}>
        {data?.applications?.map((application, index) => (
          <Fragment key={application.id}>
            <Application application={application} />
            {index + 1 !== data?.applications?.length && <Divider component="li" />}
          </Fragment>
        ))}
      </List>

      <Pagination
        count={data?.count ?? 0}
        page={options.page ?? 1}
        perPage={options.perPage ?? 10}
        handleChange={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
      />
    </UseQueryWrapper>
  );
};

/**
 * The `ApplicationsPage` component renders a component which can be used within a React Router route to get a list of
 * applications. The list of applications can be filtered by a user via the `ApplicationsToolbar` component. The
 * applications are then loaded and shown via the `Applications` component.
 */
const ApplicationsPage: FunctionComponent = () => {
  const [persistedOptions, setPersistedOptions] = useLocalStorageState<IApplicationOptions>(
    'kobs-core-applicationspage-options',
    {
      all: false,
      clusters: [],
      namespaces: [],
      page: 1,
      perPage: 10,
      searchTerm: '',
      tags: [],
    },
  );
  const [options, setOptions] = useQueryState<IApplicationOptions>(persistedOptions);

  /**
   * `useEffect` is used to persist the options, when they are changed by a user.
   */
  useEffect(() => {
    setPersistedOptions(options);
  }, [options, setPersistedOptions]);

  return (
    <Page
      title="Applications"
      description="A list of your / all applications. You can search for applications or filter them by clusters, namespaces or tags."
      toolbar={<ApplicationsToolbar options={options} setOptions={setOptions} />}
      actions={
        <Button variant="contained" color="primary" size="small" startIcon={<Add />} component={Link} to="/todo">
          Add Application
        </Button>
      }
    >
      <Applications options={options} setOptions={setOptions} />
    </Page>
  );
};

export default ApplicationsPage;
