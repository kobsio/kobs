import { HubOutlined, InsightsOutlined, PeopleOutlined } from '@mui/icons-material';
import { Box, Button, Chip, Divider, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import ApplicationInsights from './ApplicationsInsights';
import { IApplicationOptions } from './utils';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { IApplication } from '../../crds/application';
import Pagination from '../utils/Pagination';
import UseQueryWrapper from '../utils/UseQueryWrapper';

interface IApplicationProps {
  application: IApplication;
}

/**
 * The `Application` component renders a single application in the list of applications. Within the list we show the
 * name, description, tags, teams and dependencies of an application. If the application has insights we also render a
 * button to show the insights in a drawer via the `ApplicationInsights` component.
 */
const Application: FunctionComponent<IApplicationProps> = ({ application }) => {
  const [open, setOpen] = useState(false);

  /**
   * `hideInsights` sets the `open` state to `false`, which will hide the application insights drawer.
   */
  const hideInsights = () => {
    setOpen(false);
  };

  /**
   * `showInsights` sets the `open` state to `true`, which will show the application insights drawer. We have to call
   * `e.preventDefault()` because the button which uses this function is rendered inside a React Router `Link` and
   * without this the link would be triggered.
   */
  const showInsights = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <ListItem
        component={Link}
        to={`/applications${application.id}`}
        sx={{ color: 'inherit', textDecoration: 'inherit' }}
        secondaryAction={
          application.insights && application.insights.length > 0 ? (
            <IconButton edge="end" onClick={showInsights}>
              <InsightsOutlined />
            </IconButton>
          ) : undefined
        }
      >
        <ListItemText
          primary={
            <Typography variant="h6">
              {application.name}

              {application.topology && application.topology.external === true ? (
                ''
              ) : (
                <Typography pl={2} color="text.secondary" variant="caption">
                  ({application.cluster} / {application.namespace})
                </Typography>
              )}
            </Typography>
          }
          secondaryTypographyProps={{ component: 'div' }}
          secondary={
            <>
              {application.description && (
                <Typography color="text.secondary" variant="body1">
                  {application.description}
                </Typography>
              )}

              {(application.tags && application.tags.length > 0) ||
              (application.teams && application.teams.length > 0) ||
              (application.topology &&
                application.topology.dependencies &&
                application.topology.dependencies.length > 0) ||
              (application.topology && application.topology.external && application.topology.external === true) ? (
                <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4, pt: 2 }}>
                  {application.tags && application.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
                      {application.tags.map((tag) => (
                        <Chip key={tag} color="primary" size="small" sx={{ cursor: 'pointer' }} label={tag} />
                      ))}
                    </Box>
                  )}
                  {application.teams && application.teams.length > 0 && (
                    <Chip
                      size="small"
                      icon={<PeopleOutlined />}
                      sx={{ cursor: 'pointer' }}
                      label={application.teams.length === 1 ? '1 Team' : `${application.teams.length} Teams`}
                    />
                  )}
                  {application.topology &&
                    application.topology.dependencies &&
                    application.topology.dependencies.length > 0 && (
                      <Chip
                        size="small"
                        icon={<HubOutlined />}
                        sx={{ cursor: 'pointer' }}
                        label={
                          application.topology.dependencies.length === 1
                            ? '1 Dependency'
                            : `${application.topology.dependencies.length} Dependencies`
                        }
                      />
                    )}
                  {application.topology && application.topology.external && application.topology.external === true && (
                    <Chip size="small" icon={<HubOutlined />} sx={{ cursor: 'pointer' }} label="External Application" />
                  )}
                </Box>
              ) : null}
            </>
          }
        />
      </ListItem>

      <ApplicationInsights application={application} onClose={hideInsights} open={open} />
    </>
  );
};

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
        options.all ? 'You can try to search through all applications.' : ''
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
      <Box my={6}></Box>
      <Pagination
        count={data?.count ?? 0}
        page={options.page ?? 1}
        perPage={options.perPage ?? 10}
        handleChange={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
      />
    </UseQueryWrapper>
  );
};

export default Applications;
