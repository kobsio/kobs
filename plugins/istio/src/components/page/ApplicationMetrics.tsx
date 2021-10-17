import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  CardTitle,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';
import React from 'react';
import { useHistory } from 'react-router';

import { IApplicationOptions, IPluginOptions } from '../../utils/interfaces';
import MetricsTable from '../panel/MetricsTable';
import Topology from '../panel/Topology';

export interface IApplicationMetricsProps extends IApplicationOptions {
  name: string;
  namespace: string;
  application: string;
  pluginOptions: IPluginOptions;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationMetrics: React.FunctionComponent<IApplicationMetricsProps> = ({
  name,
  namespace,
  application,
  times,
  pluginOptions,
  setDetails,
}: IApplicationMetricsProps) => {
  const history = useHistory();

  if (!pluginOptions.prometheus) {
    return (
      <DrawerContentBody>
        <PageSection variant={PageSectionVariants.default}>
          <Alert
            variant={AlertVariant.warning}
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
    );
  }

  return (
    <DrawerContentBody>
      <PageSection variant={PageSectionVariants.default}>
        <div style={{ height: '500px' }}>
          <Topology name={name} namespace={namespace} application={application} times={times} setDetails={setDetails} />
        </div>
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        <Card>
          <CardTitle>Versions</CardTitle>
          <CardBody>
            <MetricsTable
              name={name}
              namespaces={[namespace]}
              application={application}
              groupBy="destination_workload_namespace, destination_app, destination_version"
              label="destination_version"
              reporter="destination"
              times={times}
              additionalColumns={[{ label: 'destination_version', title: 'Version' }]}
              setDetails={setDetails}
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
              namespaces={[namespace]}
              application={application}
              groupBy="destination_workload_namespace, destination_app, pod"
              label="pod"
              reporter="destination"
              additionalColumns={[{ label: 'pod', title: 'Pod' }]}
              times={times}
              setDetails={setDetails}
            />
          </CardBody>
        </Card>
      </PageSection>
    </DrawerContentBody>
  );
};

export default ApplicationMetrics;
