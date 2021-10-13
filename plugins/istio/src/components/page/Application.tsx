import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  CardTitle,
  Drawer,
  DrawerColorVariant,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { IPluginTimes, Title } from '@kobsio/plugin-core';
import ApplicationToolbar from './ApplicationToolbar';
import { IPluginOptions } from '../../utils/interfaces';
import MetricsTable from '../panel/MetricsTable';
import Topology from '../panel/Topology';
import { getApplicationOptionsFromSearch } from '../../utils/helpers';

interface ITeamParams {
  namespace: string;
  name: string;
}

export interface IApplicationProps {
  name: string;
  pluginOptions: IPluginOptions;
}

const Team: React.FunctionComponent<IApplicationProps> = ({ name, pluginOptions }: IApplicationProps) => {
  const params = useParams<ITeamParams>();
  const location = useLocation();
  const history = useHistory();
  const [details] = useState<React.ReactNode>(undefined);

  const [times, setTimes] = useState<IPluginTimes>(getApplicationOptionsFromSearch(location.search));

  const changeOptions = (tmpTimes: IPluginTimes): void => {
    history.push({
      pathname: location.pathname,
      search: `?time=${tmpTimes.time}&timeEnd=${tmpTimes.timeEnd}&timeStart=${tmpTimes.timeStart}`,
    });
  };

  useEffect(() => {
    setTimes(getApplicationOptionsFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title title={params.name} subtitle={params.namespace} size="xl" />
        <ApplicationToolbar name={name} times={times} setOptions={changeOptions} />
      </PageSection>

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details} colorVariant={DrawerColorVariant.light200}>
          {!pluginOptions.prometheus ? (
            <DrawerContentBody>
              <PageSection variant={PageSectionVariants.default}>
                <Alert
                  variant={AlertVariant.warning}
                  isInline={true}
                  title="Prometheus plugin is not enabled"
                  actionLinks={
                    <React.Fragment>
                      <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
                    </React.Fragment>
                  }
                >
                  <p>You have to enable the Prometheus integration in the Istio plugin configuration.</p>
                </Alert>
              </PageSection>
            </DrawerContentBody>
          ) : (
            <DrawerContentBody>
              <PageSection variant={PageSectionVariants.default}>
                <div style={{ height: '500px' }}>
                  <Topology name={name} namespace={params.namespace} application={params.name} times={times} />
                </div>
              </PageSection>

              <PageSection variant={PageSectionVariants.default}>
                <Card>
                  <CardTitle>Versions</CardTitle>
                  <CardBody>
                    <MetricsTable
                      name={name}
                      namespaces={[params.namespace]}
                      application={params.name}
                      groupBy="destination_workload_namespace, destination_workload, destination_version"
                      label="destination_version"
                      reporter="destination"
                      times={times}
                      additionalColumns={[{ label: 'destination_version', title: 'Version' }]}
                    />
                  </CardBody>
                </Card>
              </PageSection>
              <PageSection variant={PageSectionVariants.default}>
                <Card isCompact={true}>
                  <CardTitle>Pods</CardTitle>
                  <CardBody>
                    <MetricsTable
                      name={name}
                      namespaces={[params.namespace]}
                      application={params.name}
                      groupBy="destination_workload_namespace, destination_workload, pod"
                      label="pod"
                      reporter="destination"
                      additionalColumns={[{ label: 'pod', title: 'Pod' }]}
                      times={times}
                    />
                  </CardBody>
                </Card>
              </PageSection>
            </DrawerContentBody>
          )}
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Team;
