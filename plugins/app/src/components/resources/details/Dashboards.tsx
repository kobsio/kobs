import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import { DashboardsWrapper } from '../../dashboards/DashboardsWrapper';
import { IReference } from '../../../crds/dashboard';
import { IResource } from '../../../resources/clusters';
import { IResourceRow } from '../utils/tabledata';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getReferences = (resourceData: IResourceRow): IReference[] | undefined => {
  const referencesAnnotation =
    resourceData.props &&
    resourceData.props.metadata &&
    resourceData.props.metadata.annotations &&
    'kobs.io/dashboards' in resourceData.props.metadata.annotations
      ? resourceData.props.metadata.annotations['kobs.io/dashboards']
      : undefined;

  if (!referencesAnnotation) {
    return undefined;
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

    return references;
  } catch (err) {
    return undefined;
  }
};

interface IDashboardsProps {
  resource: IResource;
  resourceData: IResourceRow;
}

const Dashboards: React.FunctionComponent<IDashboardsProps> = ({ resource, resourceData }: IDashboardsProps) => {
  const references = getReferences(resourceData);

  const openDocs = (): void => {
    window.open('https://kobs.io/main/resources/resources', '_blank');
  };

  if (!references) {
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
