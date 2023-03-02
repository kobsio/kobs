import { HubOutlined, PeopleOutlined } from '@mui/icons-material';
import { Box, Divider, List, Chip, ListItem, ListItemText, Typography, Button, Menu, MenuItem } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { ITopology } from '../../crds/application';
import { PluginPanel, PluginPanelError } from '../utils/PluginPanel';
import { UseQueryWrapper } from '../utils/UseQueryWrapper';

/**
 * `generateLinks` generates the links to all applications in the provided `application` based on the provided `groups`,
 * so that a user can go to all the applications in the corresponding environments.
 */
const generateLinks = (groups: string[], application: IApplicationGroup): { link: string; title: string }[] => {
  if (groups.length === 1) {
    if (groups.includes('cluster')) {
      return (
        application.namespaces
          ?.map(
            (namespace) =>
              application.names?.map((name) => ({
                link: `/applications/cluster/${application.id?.cluster}/namespace/${namespace}/name/${name}`,
                title: `${name} (${application.id?.cluster} / ${namespace})`,
              })) ?? [],
          )
          .flat() ?? []
      );
    }

    if (groups.includes('namespace')) {
      return (
        application.clusters
          ?.map(
            (cluster) =>
              application.names?.map((name) => ({
                link: `/applications/cluster/${cluster}/namespace/${application.id?.namespace}/name/${name}`,
                title: `${name} (${cluster} / ${application.id?.namespace})`,
              })) ?? [],
          )
          .flat() ?? []
      );
    }

    if (groups.includes('name')) {
      return (
        application.clusters
          ?.map(
            (cluster) =>
              application.namespaces?.map((namespace) => ({
                link: `/applications/cluster/${cluster}/namespace/${namespace}/name/${application.id?.name}`,
                title: `${application.id?.name} (${cluster} / ${namespace})`,
              })) ?? [],
          )
          .flat() ?? []
      );
    }
  }

  if (groups.length === 2) {
    if (groups.includes('cluster') && groups.includes('namespace')) {
      return (
        application.names?.map((name) => ({
          link: `/applications/cluster/${application.id?.cluster}/namespace/${application.id?.namespace}/name/${name}`,
          title: `${name} (${application.id?.cluster} / ${application.id?.namespace})`,
        })) ?? []
      );
    }

    if (groups.includes('cluster') && groups.includes('name')) {
      return (
        application.namespaces?.map((namespace) => ({
          link: `/applications/cluster/${application.id?.cluster}/namespace/${namespace}/name/${application.id?.name}`,
          title: `${application.id?.name} (${application.id?.cluster} / ${namespace})`,
        })) ?? []
      );
    }

    if (groups.includes('namespace') && groups.includes('name')) {
      return (
        application.clusters?.map((cluster) => ({
          link: `/applications/cluster/${cluster}/namespace/${application.id?.namespace}/name/${application.id?.name}`,
          title: `${application.id?.name} (${cluster} / ${application.id?.namespace})`,
        })) ?? []
      );
    }
  }

  if (groups.length === 3) {
    return [
      {
        link: `/applications/cluster/${application.id?.cluster}/namespace/${application.id?.namespace}/name/${application.id?.name}`,
        title: `${application.id?.name} (${application.id?.cluster} / ${application.id?.namespace})`,
      },
    ];
  }

  return [];
};

interface IApplicationGroup {
  clusters?: string[];
  description?: string;
  id?: {
    cluster?: string;
    name?: string;
    namespace?: string;
  };
  names?: string[];
  namespaces?: string[];
  tags?: string[];
  teams?: string[];
  topology?: ITopology;
}

interface IApplicationGroupProps {
  application: IApplicationGroup;
  groups: string[];
}

/**
 * The `ApplicationGroup` component is used to display a single application group, with the option to go to the
 * application page in the different environments for the application group.
 *
 * We are using a similar layout for the application group as we also use for applications, with the different that we
 * do not show a button for the insights, instead we render a menu which can be used to go to an application in a
 * specific environment.
 */
const ApplicationGroup: FunctionComponent<IApplicationGroupProps> = ({ groups, application }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `handleOpen` opens the menu, which is used to display the links to the application in the different environments.
   * The menu can then be closed via the `handleClose` function.
   */
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * `handleClose` closes the menu, wich displays the links to the different environments. To open the menu the
   * `handleOpen` function is used.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  const links = generateLinks(groups, application);

  return (
    <ListItem
      secondaryAction={
        links && links.length > 0 ? (
          <>
            <Button variant="contained" color="primary" size="small" onClick={handleOpen}>
              Environments
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              {links.map((link) => (
                <MenuItem key={link.link} component={Link} to={link.link}>
                  {link.title}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : undefined
      }
    >
      <ListItemText
        primary={
          <Typography variant="h6">
            {groups.includes('name') ? application.id?.name : application.names?.join(', ')}

            {application.topology && application.topology.external === true ? (
              ''
            ) : (
              <Typography pl={2} color="text.secondary" variant="caption">
                ({groups.includes('cluster') ? application.id?.cluster : application.clusters?.join(', ')} /{' '}
                {groups.includes('namespace') ? application.id?.namespace : application.namespaces?.join(', ')})
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
  );
};

interface IApplicationGroupsPanelInternalProps {
  groups: string[];
  team?: string;
}

/**
 * The `ApplicationGroupsPanelInternal` is responsible for loading all application groups for the provided groups and
 * team (or the current users team if no team was provided) and to display the list of application groups. Each group is
 * then shown via the `ApplicationGroup` component.
 */
const ApplicationGroupsPanelInternal: FunctionComponent<IApplicationGroupsPanelInternalProps> = ({ groups, team }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IApplicationGroup[], APIError>(
    ['core/applications/groups', groups, team],
    async () => {
      const join = (v: string[] | undefined): string => (v && v.length > 0 ? v.join('') : '');
      const g = join(groups.map((group) => `&group=${encodeURIComponent(group)}`));

      return apiContext.client.get<IApplicationGroup[]>(`/api/applications/groups?${team ? `&team=${team}` : ''}${g}`);
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load applications"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No applications were found"
      noDataMessage="No applications were found for the provided team."
      refetch={refetch}
    >
      <List sx={{ bgcolor: 'background.paper' }} disablePadding={true}>
        {data?.map((application) => (
          <Fragment key={`${application?.id?.cluster}-${application?.id?.namespace}-${application?.id?.name}`}>
            <ApplicationGroup groups={groups} application={application} />
            <Divider component="li" />
          </Fragment>
        ))}
      </List>
    </UseQueryWrapper>
  );
};

interface IApplicationGroupsPanelProps {
  description?: string;
  options?: {
    groups?: string[];
    team?: string;
  };
  title: string;
}

/**
 * The `ApplicationGroupsPanel` component can be used to render a list of application groups in a dashboard component.
 * This component only validates the user provided options. The `ApplicationGroupsPanelInternal` component implements
 * the actual logic for fetching and displaying the application groups.
 */
const ApplicationGroupsPanel: FunctionComponent<IApplicationGroupsPanelProps> = ({ title, description, options }) => {
  if (!options || !options.groups || !Array.isArray(options.groups) || options.groups.length === 0) {
    return (
      <PluginPanelError
        title={title}
        description={description}
        message="Invalid options for application groups plugin"
        details="The groups option is invalid"
        example={`plugin:
name: applicationgroups
type: core
options:
  group: ["namespace", "name"]`}
        documentation="https://kobs.io/main/plugins/#topology"
      />
    );
  }

  return (
    <PluginPanel title={title} description={description}>
      <ApplicationGroupsPanelInternal groups={options.groups} team={options.team} />
    </PluginPanel>
  );
};

export default ApplicationGroupsPanel;
