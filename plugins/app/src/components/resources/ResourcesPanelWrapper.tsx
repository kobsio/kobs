import { Alert, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import { ITimes } from '@kobsio/shared';
import ResourcesPanel from './ResourcesPanel';

interface IResourcesPanelWrapperProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  times?: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const ResourcesPanelWrapper: React.FunctionComponent<IResourcesPanelWrapperProps> = ({
  options,
  times,
  setDetails,
}: IResourcesPanelWrapperProps) => {
  if (options.satellites && options.clusters && options.resources && times) {
    const clusterIDs: string[] = options.satellites.map((satellite: string) =>
      options.clusters.map((cluster: string) => `/satellite/${satellite}/cluster/${cluster}`),
    );

    return (
      <ResourcesPanel
        isInline={true}
        options={{
          clusterIDs: clusterIDs,
          columns: options.columns,
          filter: options.filter,
          namespaces: options.namespaces || [],
          param: options.selector || '',
          paramName: options.selectorType === 'fieldSelector' ? 'fieldSelector' : 'labelSelector',
          resourceIDs: options.resources || [],
          times: times,
        }}
        setDetails={setDetails}
      />
    );
  }

  return (
    <Alert isInline={true} variant={AlertVariant.danger} title="Invalid plugin configuration">
      The provided options for the <b>resources</b> plugin are invalid.
    </Alert>
  );
};

export default ResourcesPanelWrapper;
