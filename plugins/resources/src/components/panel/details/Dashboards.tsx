import { Alert, AlertVariant } from '@patternfly/react-core';
import { JSONPath } from 'jsonpath-plus';
import React from 'react';

import { IDashboardReference, IResourceRow } from '@kobsio/plugin-core';
import { DashboardsWrapper } from '@kobsio/plugin-dashboards';

// getDashboards parses the kobs.io/dashboards annotation of a Kubernetes resources and returns all provided dashboards.
// Before we are returning the dashboards we are checking all the provided placeholder and if one of the placeholders
// uses an JSONPath we are replacing it with the correct value.
const getDashboards = (resource: IResourceRow): IDashboardReference[] | undefined => {
  try {
    if (
      resource.props &&
      resource.props.metadata &&
      resource.props.metadata.annotations &&
      resource.props.metadata.annotations['kobs.io/dashboards']
    ) {
      const dashboards: IDashboardReference[] = JSON.parse(
        resource.props.metadata.annotations['kobs.io/dashboards'],
        resource.props,
      );

      for (let i = 0; i < dashboards.length; i++) {
        if (dashboards[i].placeholders) {
          for (const key of Object.keys(dashboards[i].placeholders || {})) {
            if (
              dashboards[i].placeholders?.hasOwnProperty(key) &&
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              dashboards[i].placeholders![key].trim().startsWith('$.')
            ) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              dashboards[i].placeholders![key] = JSONPath({
                json: resource.props,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                path: dashboards[i].placeholders![key].trim(),
                wrap: false,
              });
            }
          }
        }
      }

      return dashboards;
    }
  } catch (err) {
    return undefined;
  }
};

interface IDashboardsProps {
  resource: IResourceRow;
}

const Dashboards: React.FunctionComponent<IDashboardsProps> = ({ resource }: IDashboardsProps) => {
  const dashboards = getDashboards(resource);

  if (!dashboards) {
    return (
      <Alert variant={AlertVariant.info} title="Dashboards">
        <p>
          You can add dashboards to your Kubernetes resources by adding a <code>kobs.io/dashboards</code> annotation.
        </p>
      </Alert>
    );
  }

  return <DashboardsWrapper cluster={resource.cluster} namespace={resource.namespace} references={dashboards} />;
};

export default Dashboards;
