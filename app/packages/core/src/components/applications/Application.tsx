import { HubOutlined, InsightsOutlined, PeopleOutlined } from '@mui/icons-material';
import { Box, Chip, IconButton, ListItem, ListItemText, Typography } from '@mui/material';
import { FunctionComponent, MouseEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApplicationInsightsDrawer } from './ApplicationsInsights';

import { IApplication } from '../../crds/application';

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
  const showInsights = (e: MouseEvent<HTMLButtonElement>) => {
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

      <ApplicationInsightsDrawer application={application} onClose={hideInsights} open={open} />
    </>
  );
};

export default Application;
