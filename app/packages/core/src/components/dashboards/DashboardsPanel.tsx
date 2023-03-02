import { Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { Fragment, FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { IReference } from '../../crds/dashboard';
import { PluginPanel, PluginPanelError } from '../utils/PluginPanel';

interface IDashboardsPanelProps {
  description?: string;
  options?: {
    dashboards: IReference[];
    description?: string;
    title?: string;
  }[];
  title: string;
}

/**
 * The `DashboardsPanel` component is used to display a list of dashboards in a panel of a dashboard. This allows users
 * to link to a dashboard with more details on the current dashboard. We are using the same structure as for the pages
 * in the navigation here, so that the linked dashboard page can contain multiple dashboards.
 */
const DashboardsPanel: FunctionComponent<IDashboardsPanelProps> = ({ title, description, options }) => {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return (
      <PluginPanelError
        title={title}
        description={description}
        message="Invalid options for dashboards plugin"
        details="One of the required options is missing"
        example={`plugin:
name: dashboards
type: core
options:
  - title: My Dashboards Page
    description: My Dashboards Page Description
    dashboards:
      - title: Dashboard 1
        cluster: cluster1
        namespace: namespace1
        name: name1
      - title: Dashboard 2
        cluster: cluster2
        namespace: namespace2
        name: name2`}
        documentation="https://kobs.io/main/plugins/#topology"
      />
    );
  }

  return (
    <PluginPanel title={title} description={description}>
      <List sx={{ bgcolor: 'background.paper' }} disablePadding={true}>
        {options.map((page) => (
          <Fragment key={page.title}>
            <ListItem
              component={Link}
              to={`/dashboards/${btoa(JSON.stringify(page))}`}
              sx={{ color: 'inherit', textDecoration: 'inherit' }}
            >
              <ListItemText
                primary={<Typography variant="h6">{page.title}</Typography>}
                secondaryTypographyProps={{ component: 'div' }}
                secondary={page.description}
              />
            </ListItem>
            <Divider component="li" />
          </Fragment>
        ))}
      </List>
    </PluginPanel>
  );
};

export default DashboardsPanel;
