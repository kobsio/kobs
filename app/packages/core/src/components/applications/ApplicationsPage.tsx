import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import Applications from './Applications';
import ApplicationsToolbar from './ApplicationsToolbar';
import { IApplicationOptions } from './utils';

import useQueryState from '../../utils/hooks/useQueryState';
import Page from '../utils/Page';

/**
 * The `ApplicationsPage` component renders a component which can be used within a React Router route to get a list of
 * applications. The list of applications can be filtered by a user via the `ApplicationsToolbar` component. The
 * applications are then loaded and shown via the `Applications` component.
 */
const ApplicationsPage: FunctionComponent = () => {
  const [options, setOptions] = useQueryState<IApplicationOptions>({
    all: false,
    clusters: [],
    namespaces: [],
    page: 1,
    perPage: 10,
    searchTerm: '',
    tags: [],
  });

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
