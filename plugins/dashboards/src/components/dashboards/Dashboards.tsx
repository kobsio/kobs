import {
  Alert,
  AlertActionLink,
  AlertVariant,
  PageSection,
  PageSectionVariants,
  Spinner,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { IDashboard, IDashboardReference } from '@kobsio/plugin-core';
import Dashboard from './Dashboard';
import { IDashboardsOptions } from '../../utils/interfaces';
import { getInitialOptions } from '../../utils/dashboard';

interface IDashboardsProps {
  cluster: string;
  namespace: string;
  references: IDashboardReference[];
  setDetails?: (details: React.ReactNode) => void;
  forceDefaultSpan: boolean;
}

// The Dashboards component is used to fetch all the referenced dashboards in a team/application and show them as tabs.
// The useDrawer property is used to decide if the dashboard should be used inside a drawer or not. For example if an
// application is already displayed in a drawer we shouldn't use another drawer for the dashboards.
const Dashboards: React.FunctionComponent<IDashboardsProps> = ({
  cluster,
  namespace,
  references,
  setDetails,
  forceDefaultSpan,
}: IDashboardsProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IDashboardsOptions>();

  // changeOptions adjusts the search location (query paramters). We do not set the options directly (except when the
  // Dashboards component is rendered inside a drawer), so that a user can share the url and a other users gets the same
  // view.
  const changeOptions = (opts: IDashboardsOptions): void => {
    history.push({
      pathname: location.pathname,
      search: `?dashboard=${opts.dashboard}`,
    });
  };

  // useEffect is used to set the options for the dashboards, everytime the query paramters for the current page are
  // changed. This is only used, when the dashboards are not rendered in a drawer. When the dashboards are rendered in
  // a drawer it can happen that we already show some dashboards in the main view and so we can not rely on the query
  // parameters.
  useEffect(() => {
    setOptions(getInitialOptions(location.search, references, setDetails !== undefined));
  }, [location.search, references, setDetails]);

  // Fetch all dashboards. The dashboards are available via the data variable. To fetch the dashboards we have to pass
  // the defaults and the references to the API. The defaults are required so that a user can omit the cluster and
  // namespace in the references.
  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard[], Error>(
    ['dashboards/dashboards', references, cluster, namespace],
    async () => {
      try {
        const response = await fetch(`/api/plugins/dashboards/dashboards`, {
          body: JSON.stringify({
            cluster: cluster,
            namespace: namespace,
            references: references,
          }),
          method: 'post',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (!options) {
    return null;
  }

  // When the isLoading parameter is true we show a Spinner, so the user sees that the dashboards are currently fetched.
  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  // When an error happens during the API call, we show the user this error. He then has the option to retry the API
  // call.
  if (isError) {
    return (
      <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
        <Alert
          variant={AlertVariant.danger}
          title="Could not get dashboards"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IDashboard[], Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      </PageSection>
    );
  }

  if (!data) {
    return <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}></PageSection>;
  }

  return (
    <Tabs
      activeKey={options.dashboard}
      onSelect={(event, tabIndex): void =>
        setDetails
          ? changeOptions({ ...options, dashboard: tabIndex.toString() })
          : setOptions({ ...options, dashboard: tabIndex.toString() })
      }
      className="pf-u-mt-md kobsio-dashboards-tabs-without-margin-top"
      isFilled={true}
    >
      {data.map((dashboard) => (
        <Tab key={dashboard.title} eventKey={dashboard.title} title={<TabTitleText>{dashboard.title}</TabTitleText>}>
          <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
            <Dashboard
              activeKey={options.dashboard}
              eventKey={dashboard.title}
              dashboard={dashboard}
              forceDefaultSpan={forceDefaultSpan}
              setDetails={setDetails}
            />
          </PageSection>
        </Tab>
      ))}
    </Tabs>
  );
};

export default Dashboards;
