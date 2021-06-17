import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { IRow } from '@patternfly/react-table';
import React from 'react';
import { V1OwnerReference } from '@kubernetes/client-node';

import Conditions from './overview/Conditions';
import CronJob from './overview/CronJob';
import DaemonSet from './overview/DaemonSet';
import Deployment from './overview/Deployment';
import Job from './overview/Job';
import Pod from './overview/Pod';
import StatefulSet from './overview/StatefulSet';
import { timeDifference } from '@kobsio/plugin-core';

interface IOverviewProps {
  resource: IRow;
}

// Overview is the overview tab for a resource. It shows the metadata of a resource in a clear way. We can also
// add some additional fields on a per resource basis.
const Overview: React.FunctionComponent<IOverviewProps> = ({ resource }: IOverviewProps) => {
  // additions contains a React component with additional details for a resource. The default component just renders the
  // conditions of a resource.
  let additions =
    resource.props && resource.props.status && resource.props.status.conditions ? (
      <Conditions conditions={resource.props.status.conditions} />
    ) : null;

  // Overwrite the additions for several resources.
  if (resource.props && resource.props.apiVersion && resource.props.kind) {
    if (resource.props.apiVersion === 'v1' && resource.props.kind === 'Pod') {
      additions = <Pod pod={resource.props} />;
    } else if (resource.props.apiVersion === 'apps/v1' && resource.props.kind === 'Deployment') {
      additions = (
        <Deployment
          cluster={resource.cluster?.title}
          namespace={resource.namespace?.title}
          deployment={resource.props}
        />
      );
    } else if (resource.props.apiVersion === 'apps/v1' && resource.props.kind === 'DaemonSet') {
      additions = (
        <DaemonSet cluster={resource.cluster?.title} namespace={resource.namespace?.title} daemonSet={resource.props} />
      );
    } else if (resource.props.apiVersion === 'apps/v1' && resource.props.kind === 'StatefulSet') {
      additions = (
        <StatefulSet
          cluster={resource.cluster?.title}
          namespace={resource.namespace?.title}
          statefulSet={resource.props}
        />
      );
    } else if (resource.props.apiVersion === 'batch/v1beta1' && resource.props.kind === 'CronJob') {
      additions = <CronJob cronJob={resource.props} />;
    } else if (resource.props.apiVersion === 'batch/v1' && resource.props.kind === 'Job') {
      additions = <Job cluster={resource.cluster?.title} namespace={resource.namespace?.title} job={resource.props} />;
    }
  }

  return (
    <Card isCompact={true}>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          {resource.name?.title && (
            <DescriptionListGroup>
              <DescriptionListTerm>Name</DescriptionListTerm>
              <DescriptionListDescription>{resource.name?.title}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resource.namespace?.title && (
            <DescriptionListGroup>
              <DescriptionListTerm>Namespace</DescriptionListTerm>
              <DescriptionListDescription>{resource.namespace?.title}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resource.cluster?.title && (
            <DescriptionListGroup>
              <DescriptionListTerm>Cluster</DescriptionListTerm>
              <DescriptionListDescription>{resource.cluster?.title}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resource.props?.metadata?.labels && (
            <DescriptionListGroup>
              <DescriptionListTerm>Labels</DescriptionListTerm>
              <DescriptionListDescription>
                {Object.keys(resource.props?.metadata?.labels).map((key) => (
                  <div key={key} className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
                    <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
                      {key}: {resource.props?.metadata?.labels[key]}
                    </span>
                  </div>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resource.props?.metadata?.annotations && (
            <DescriptionListGroup>
              <DescriptionListTerm>Annotations</DescriptionListTerm>
              <DescriptionListDescription>
                {Object.keys(resource.props?.metadata?.annotations).map((key) => (
                  <div key={key} className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
                    <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
                      {key}: {resource.props?.metadata?.annotations[key]}
                    </span>
                  </div>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resource.props?.metadata?.creationTimestamp && (
            <DescriptionListGroup>
              <DescriptionListTerm>Age</DescriptionListTerm>
              <DescriptionListDescription>
                {timeDifference(
                  new Date().getTime(),
                  new Date(resource.props.metadata.creationTimestamp.toString()).getTime(),
                )}
                <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
                  ({resource.props.metadata.creationTimestamp})
                </span>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {resource.props?.metadata?.ownerReferences && (
            <DescriptionListGroup>
              <DescriptionListTerm>Crontrolled By</DescriptionListTerm>
              <DescriptionListDescription>
                {resource.props?.metadata?.ownerReferences.map((owner: V1OwnerReference, index: number) => (
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
