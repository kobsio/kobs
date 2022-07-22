import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import { DashboardsWrapper } from '../../dashboards/DashboardsWrapper';
import { IIntegrations } from '../utils/interfaces';
import { IReference } from '../../../crds/dashboard';
import { IResource } from '../../../resources/clusters';
import { IResourceRow } from '../utils/tabledata';

// getReferences returns all dashboard references for a resources. This includes all references from the configured
// integration and the references from the "kobs.io/dashboards" annotation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getReferences = (resourceData: IResourceRow, integrations: IIntegrations): IReference[] => {
  // Get dashboard references from the integrations. For that we loop through all configured dashboards from the
  // integrations. If a dashboard is defined we check if the user also defined some labels. If this is the case we check
  // that the resource matches the configured labels to only add the these dashboards. If the user did not defined any
  // labels we add all dashboards.
  const integrationReferences: IReference[] = [];
  if (integrations.dashboards) {
    for (const dashboard of integrations.dashboards) {
      if (dashboard.dashboard) {
        if (dashboard.labels) {
          if (resourceData.props.metadata.labels) {
            for (const [key, value] of Object.entries(dashboard.labels)) {
              if (key in resourceData.props.metadata.labels && resourceData.props.metadata.labels[key] === value) {
                integrationReferences.push(dashboard.dashboard);
              }
            }
          }
        } else {
          integrationReferences.push(dashboard.dashboard);
        }
      }
    }

    for (let i = 0; i < integrationReferences.length; i++) {
      if (!integrationReferences[i].satellite || integrationReferences[i].satellite === '') {
        integrationReferences[i].satellite = resourceData.satellite;
      }
      if (!integrationReferences[i].cluster || integrationReferences[i].cluster === '') {
        integrationReferences[i].cluster = resourceData.cluster;
      }
      if (!integrationReferences[i].namespace || integrationReferences[i].namespace === '') {
        integrationReferences[i].namespace = resourceData.namespace;
      }
    }
  }

  // Get dashboard references from the "kobs.io/dashboards" annotation.
  const referencesAnnotation =
    resourceData.props &&
    resourceData.props.metadata &&
    resourceData.props.metadata.annotations &&
    'kobs.io/dashboards' in resourceData.props.metadata.annotations
      ? resourceData.props.metadata.annotations['kobs.io/dashboards']
      : undefined;

  if (!referencesAnnotation) {
    return integrationReferences;
  }

  try {
    const references: IReference[] = JSON.parse(referencesAnnotation);

    for (let i = 0; i < references.length; i++) {
      if (!references[i].satellite || references[i].satellite === '') {
        references[i].satellite = resourceData.satellite;
      }
      if (!references[i].cluster || references[i].cluster === '') {
        references[i].cluster = resourceData.cluster;
      }
      if (!references[i].namespace || references[i].namespace === '') {
        references[i].namespace = resourceData.namespace;
      }
    }

    return [...integrationReferences, ...references];
  } catch (err) {
    return integrationReferences;
  }
};

interface IDashboardsProps {
  resource: IResource;
  resourceData: IResourceRow;
  integrations: IIntegrations;
}

const Dashboards: React.FunctionComponent<IDashboardsProps> = ({
  resource,
  resourceData,
  integrations,
}: IDashboardsProps) => {
  const references = getReferences(resourceData, integrations);

  const openDocs = (): void => {
    window.open('https://kobs.io/main/resources/kubernetes-resources/#dashboards', '_blank');
  };

  if (references.length === 0) {
    return (
      <Alert
        variant={AlertVariant.info}
        title="No dashboards found"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => openDocs()}>Documentation</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>
          You can use dashboards within you Kubernetes resources via the <code>kobs.io/dashboards</code> annotation.
        </p>
      </Alert>
    );
  }

  return <DashboardsWrapper manifest={resourceData.props} references={references} useDrawer={false} />;
};

export default Dashboards;
