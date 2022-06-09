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
import { useNavigate } from 'react-router-dom';

import { IApplicationOptions } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import MetricsTable from '../panel/MetricsTable';
import Topology from '../panel/Topology';

export interface IApplicationMetricsProps extends IApplicationOptions {
  instance: IPluginInstance;
  namespace: string;
  application: string;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationMetrics: React.FunctionComponent<IApplicationMetricsProps> = ({
  instance,
  namespace,
  application,
  times,
  setDetails,
}: IApplicationMetricsProps) => {
  const navigate = useNavigate();

  if (!instance.options?.prometheus) {
    return (
      <DrawerContentBody>
        <PageSection variant={PageSectionVariants.default}>
          <Alert
            variant={AlertVariant.warning}
            title="Prometheus plugin is not enabled"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
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
          <Topology
            instance={instance}
            namespace={namespace}
            application={application}
            times={times}
            setDetails={setDetails}
          />
        </div>
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        <Card>
          <CardTitle>Versions</CardTitle>
          <CardBody>
            <MetricsTable
              instance={instance}
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
              instance={instance}
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
