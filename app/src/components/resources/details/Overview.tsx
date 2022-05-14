import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import React from 'react';
import { V1OwnerReference } from '@kubernetes/client-node';

import Conditions from './overview/Conditions';
import CronJob from './overview/CronJob';
import DaemonSet from './overview/DaemonSet';
import Deployment from './overview/Deployment';
import { IResource } from '../../../resources/clusters';
import { IResourceRow } from '../utils/tabledata';
import Job from './overview/Job';
import Node from './overview/Node';
import Pod from './overview/Pod';
import StatefulSet from './overview/StatefulSet';
import { timeDifference } from '@kobsio/shared';

interface IOverviewProps {
  resource: IResource;
  resourceData: IResourceRow;
}

// Overview is the overview tab for a resourceData. It shows the metadata of a resource in a clear way. We can also
// add some additional fields on a per resource basis.
const Overview: React.FunctionComponent<IOverviewProps> = ({ resource, resourceData }: IOverviewProps) => {
  // additions contains a React component with additional details for a resourceData. The default component just renders the
  // conditions of a resourceData.
  let additions =
    resourceData.props &&
    resourceData.props.status &&
    resourceData.props.status.conditions &&
    Array.isArray(resourceData.props.status.conditions) ? (
      <Conditions conditions={resourceData.props.status.conditions} />
    ) : null;

  // Overwrite the additions for several resources.
  if (resource.id === 'pods') {
    additions = (
      <Pod
        satellite={resourceData.satellite}
        cluster={resourceData.cluster}
        namespace={resourceData.namespace}
        name={resourceData.name}
        pod={resourceData.props}
      />
    );
  } else if (resource.id === 'deployments') {
    additions = (
      <Deployment
        satellite={resourceData.satellite}
        cluster={resourceData.cluster}
        namespace={resourceData.namespace}
        deployment={resourceData.props}
      />
    );
  } else if (resource.id === 'daemonsets') {
    additions = (
      <DaemonSet
        satellite={resourceData.satellite}
        cluster={resourceData.cluster}
        namespace={resourceData.namespace}
        daemonSet={resourceData.props}
      />
    );
  } else if (resource.id === 'statefulsets') {
    additions = (
      <StatefulSet
        satellite={resourceData.satellite}
        cluster={resourceData.cluster}
        namespace={resourceData.namespace}
        statefulSet={resourceData.props}
      />
    );
  } else if (resource.id === 'cronjobs') {
    additions = <CronJob cronJob={resourceData.props} />;
  } else if (resource.id === 'jobs') {
    additions = (
      <Job
        satellite={resourceData.satellite}
        cluster={resourceData.cluster}
        namespace={resourceData.namespace}
        job={resourceData.props}
      />
    );
  } else if (resource.id === 'nodes') {
    additions = (
      <Node
        satellite={resourceData.satellite}
        cluster={resourceData.cluster}
        namespace={resourceData.namespace}
        name={resourceData.name}
        node={resourceData.props}
      />
    );
  }

  return (
    <Card isCompact={true}>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          {resourceData.name && (
            <DescriptionListGroup>
              <DescriptionListTerm>Name</DescriptionListTerm>
              <DescriptionListDescription>{resourceData.name}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resourceData.namespace && (
            <DescriptionListGroup>
              <DescriptionListTerm>Namespace</DescriptionListTerm>
              <DescriptionListDescription>{resourceData.namespace}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resourceData.cluster && (
            <DescriptionListGroup>
              <DescriptionListTerm>Cluster</DescriptionListTerm>
              <DescriptionListDescription>{resourceData.cluster}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resourceData.props?.metadata?.labels && (
            <DescriptionListGroup>
              <DescriptionListTerm>Labels</DescriptionListTerm>
              <DescriptionListDescription>
                {Object.keys(resourceData.props?.metadata?.labels).map((key) => (
                  <div key={key} className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
                    <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
                      {key}: {resourceData.props?.metadata?.labels[key]}
                    </span>
                  </div>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resourceData.props?.metadata?.annotations && (
            <DescriptionListGroup>
              <DescriptionListTerm>Annotations</DescriptionListTerm>
              <DescriptionListDescription>
                {Object.keys(resourceData.props?.metadata?.annotations).map((key) => (
                  <div key={key} className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
                    <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
                      {key}: {resourceData.props?.metadata?.annotations[key]}
                    </span>
                  </div>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resourceData.props?.metadata?.creationTimestamp && (
            <DescriptionListGroup>
              <DescriptionListTerm>Age</DescriptionListTerm>
              <DescriptionListDescription>
                {timeDifference(
                  new Date().getTime(),
                  new Date(resourceData.props.metadata.creationTimestamp.toString()).getTime(),
                )}
                <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
                  ({resourceData.props.metadata.creationTimestamp})
                </span>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resourceData.props?.metadata?.ownerReferences && (
            <DescriptionListGroup>
              <DescriptionListTerm>Crontrolled By</DescriptionListTerm>
              <DescriptionListDescription>
                {resourceData.props?.metadata?.ownerReferences.map((owner: V1OwnerReference, index: number) => (
                  <div key={index}>
                    {owner.kind}
                    <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">({owner.name})</span>
                  </div>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {additions}
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default Overview;
