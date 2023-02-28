import { Edit } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FunctionComponent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { IReference } from '../../crds/dashboard';
import Dashboards from '../dashboards/Dashboards';
import Page from '../utils/Page';

interface IPage {
  dashboards: IReference[];
  description?: string;
  title?: string;
}

interface IDashboardsPageParams extends Record<string, string | undefined> {
  page?: string;
}

/**
 * The `DashboardsPage` component is responsible for rendering a page with a list of dashboards within a Rect Router
 * route. The page title, description and the dashboards must be provided as base64 encoded `page` parameter.
 */
const DashboardsPage: FunctionComponent = () => {
  const params = useParams<IDashboardsPageParams>();
  const page: IPage | undefined = params.page ? JSON.parse(atob(params.page)) : undefined;

  return (
    <Page
      title={page?.title ?? 'Unknown'}
      description={page?.description ?? ''}
      hasTabs={true}
      actions={
        <Button variant="contained" color="primary" size="small" startIcon={<Edit />} component={Link} to="/todo">
          Edit
        </Button>
      }
    >
      {page?.dashboards && page.dashboards.length > 0 ? (
        <Dashboards manifest={page} references={page?.dashboards} />
      ) : null}
    </Page>
  );
};

export default DashboardsPage;
