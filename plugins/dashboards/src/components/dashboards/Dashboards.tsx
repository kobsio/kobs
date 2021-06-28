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

import { IPluginDefaults } from '@kobsio/plugin-core';

import { IDashboard, IReference } from '../../utils/interfaces';
import Dashboard from './Dashboard';

interface IDashboardsProps {
  defaults: IPluginDefaults;
  references: IReference[];
  useDrawer: boolean;
}

export const Dashboards: React.FunctionComponent<IDashboardsProps> = ({
  defaults,
  references,
  useDrawer,
}: IDashboardsProps) => {
  const [activeDashboard, setActiveDashboard] = useState<string>(references.length > 0 ? references[0].title : '');
  const [details, setDetails] = useState<React.ReactNode>(undefined);

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

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

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
            <Dashboard defaults={defaults} dashboard={dashboard} showDetails={useDrawer ? setDetails : undefined} />
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
