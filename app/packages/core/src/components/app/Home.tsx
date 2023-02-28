import { Edit } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FunctionComponent, useContext } from 'react';
import { Link } from 'react-router-dom';

import { APIContext, IAPIContext } from '../../context/APIContext';
import Dashboards from '../dashboards/Dashboards';
import Page from '../utils/Page';

const Home: FunctionComponent = () => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const user = apiContext.getUser();

  return (
    <Page
      title="Home"
      description={`Welcome back, ${user?.name}! We've missed you. 👋`}
      hasTabs={true}
      actions={
        <Button variant="contained" color="primary" size="small" startIcon={<Edit />} component={Link} to="/todo">
          Edit
        </Button>
      }
    >
      {user?.dashboards && user.dashboards.length > 0 ? (
        <Dashboards manifest={user} references={user?.dashboards} />
      ) : null}
    </Page>
  );
};

export default Home;
