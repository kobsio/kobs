import { Alert, AlertTitle, Button } from '@mui/material';
import { FunctionComponent, useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import { PluginContext } from '../../context/PluginContext';
import Klogs from '@kobsio/klogs';

interface IPluginPageParams extends Record<string, string | undefined> {
  cluster?: string;
  name?: string;
  type?: string;
}

/**
 * `PluginPage` renders a single plugin page depending on the route params the different plugins are defined inside
 * `packages/*` and must be added to the `main.tsx` file inside `packages/app/src/main.tsx`.
 */
const PluginPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const params = useParams<IPluginPageParams>();
  const { getInstance, getPlugin } = useContext(PluginContext);

  const cluster = params['cluster'];
  const type = params['type'];
  const name = params['name'];

  // const instance = name ? getInstance(`/cluster/${cluster}/type/${type}/name/${name}`) : undefined;
  const instance = {
    cluster: "dev-de1-fake",
    id: "id-fake",
    name: "klogs-fake",
    type: "type-klogs-fake"
  }
  // const Page = instance ? getPlugin(instance.type)?.page : undefined;
  const Page = Klogs.page

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <Alert severity="error">
          <AlertTitle>An unexpected error occured while rendering the plugin</AlertTitle>
          {error.message}
        </Alert>
      )}
    >
      {Page && instance ? (
        <Page instance={instance} />
      ) : (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => navigate(-1)}>
              GO BACK
            </Button>
          }
        >
          The plugin{' '}
          <b>
            {name} ({type} / {cluster})
          </b>{' '}
          does not implement the page interface
        </Alert>
      )}
    </ErrorBoundary>
  );
};

export default PluginPage;
