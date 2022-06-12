import {
  Alert,
  AlertActionLink,
  AlertVariant,
  PageSection,
  PageSectionVariants,
  Spinner,
  Tab,
  TabContentBody,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IDashboard, IReference } from '../../crds/dashboard';
import Dashboard from './Dashboard';
import { IOptions } from './utils/interfaces';
import { getInitialOptions } from './utils/dashboards';
import { interpolateJSONPath } from './utils/interpolate';

interface IDashboardsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  references: IReference[];
  setDetails?: (details: React.ReactNode) => void;
  forceDefaultSpan: boolean;
}

const Dashboards: React.FunctionComponent<IDashboardsProps> = ({
  manifest,
  references,
  forceDefaultSpan,
  setDetails,
}: IDashboardsProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IOptions>();

  const changeOptions = (opts: IOptions): void => {
    navigate(`${location.pathname}?dashboard=${opts.dashboard}`);
  };

  useEffect(() => {
    setOptions(getInitialOptions(location.search, references, setDetails !== undefined));
  }, [location.search, references, setDetails]);

  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard[], Error>(
    ['app/dashboards/dashboards', references],
    async () => {
      try {
        const response = await fetch(`/api/dashboards`, {
          body: JSON.stringify(references),
          method: 'post',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          const dashboards: IDashboard[] | undefined = json;

          if (dashboards && dashboards.length > 0) {
            return JSON.parse(interpolateJSONPath(JSON.stringify(dashboards), manifest));
          }

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

  if (isLoading) {
    return (
      <PageSection isFilled={true} padding={{ default: 'padding' }} variant={PageSectionVariants.default}>
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      </PageSection>
    );
  }

  if (isError) {
    return (
      <PageSection isFilled={true} padding={{ default: 'padding' }} variant={PageSectionVariants.default}>
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
    return null;
  }

  return (
    <Tabs
      style={{ backgroundColor: '#ffffff' }}
      activeKey={options.dashboard}
      isFilled={false}
      usePageInsets={true}
      mountOnEnter={true}
      unmountOnExit={false}
      onSelect={(event, tabIndex): void =>
        setDetails
          ? changeOptions({ ...options, dashboard: tabIndex.toString() })
          : setOptions({ ...options, dashboard: tabIndex.toString() })
      }
    >
      {data.map((dashboard) => (
        <Tab key={dashboard.title} eventKey={dashboard.title} title={<TabTitleText>{dashboard.title}</TabTitleText>}>
          <TabContentBody hasPadding={true}>
            <Dashboard dashboard={dashboard} forceDefaultSpan={forceDefaultSpan} setDetails={setDetails} />
          </TabContentBody>
        </Tab>
      ))}
    </Tabs>
  );
};

export default Dashboards;
