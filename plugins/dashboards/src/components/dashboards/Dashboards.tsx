import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Drawer,
  DrawerColorVariant,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Spinner,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import { IDashboard, IReference } from '../../utils/interfaces';
import DashboardWrapper from './DashboardWrapper';
import { IPluginDefaults } from '@kobsio/plugin-core';

interface IDashboardsProps {
  defaults: IPluginDefaults;
  references: IReference[];
  useDrawer: boolean;
}

// The Dashboards component is used to fetch all the referenced dashboards in a team/application and show them as tabs.
// The useDrawer property is used to decide if the dashboard should be used inside a drawer or not. For example if an
// application is already displayed in a drawer we shouldn't use another drawer for the dashboards.
export const Dashboards: React.FunctionComponent<IDashboardsProps> = ({
  defaults,
  references,
  useDrawer,
}: IDashboardsProps) => {
  const [activeDashboard, setActiveDashboard] = useState<string>(references.length > 0 ? references[0].title : '');
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  // Fetch all dashboards. The dashboards are available via the data variable. To fetch the dashboards we have to pass
  // the defaults and the references to the API. The defaults are required so that a user can omit the cluster and
  // namespace in the references.
  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard[], Error>(
    ['dashboards/dashboards', defaults, references],
    async () => {
      try {
        const response = await fetch(`/api/plugins/dashboards/dashboards`, {
          body: JSON.stringify({
            defaults: defaults,
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
      <PageSection variant={PageSectionVariants.default}>
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
    return <PageSection variant={PageSectionVariants.default}></PageSection>;
  }

  // Create the tabs component. If the useDrawer value is false, we only render the tabs. If the value of the useDrawer
  // variable is true we render the tabs as content inside the drawer component.
  const tabs = (
    <Tabs
      activeKey={activeDashboard}
      onSelect={(event, tabIndex): void => setActiveDashboard(tabIndex.toString())}
      className="pf-u-mt-md kobsio-dashboards-tabs-without-margin-top"
      isFilled={true}
      mountOnEnter={true}
    >
      {data.map((dashboard) => (
        <Tab key={dashboard.title} eventKey={dashboard.title} title={<TabTitleText>{dashboard.title}</TabTitleText>}>
          <PageSection variant={PageSectionVariants.default} isFilled={true}>
            <DashboardWrapper
              defaults={defaults}
              dashboard={dashboard}
              showDetails={useDrawer ? setDetails : undefined}
            />
          </PageSection>
        </Tab>
      ))}
    </Tabs>
  );

  if (!useDrawer) {
    return tabs;
  }

  return (
    <Drawer isExpanded={details !== undefined}>
      <DrawerContent panelContent={details} colorVariant={DrawerColorVariant.light200}>
        <DrawerContentBody>{tabs}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
