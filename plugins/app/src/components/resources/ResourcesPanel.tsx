import {
  Alert,
  AlertActionLink,
  AlertVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Spinner,
  Tab,
  TabTitleText,
  Tabs,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

import { IIntegrations, IOptions, IResourceResponse } from './utils/interfaces';
import Details from './details/Details';
import { IResource } from '../../resources/clusters';
import { IResourceRow } from './utils/tabledata';
import ResourcesPanelTable from './ResourcesPanelTable';

interface IResourcesPanelProps {
  isInline: boolean;
  options: IOptions;
  setDetails?: (details: React.ReactNode) => void;
}

const ResourcesPanel: React.FunctionComponent<IResourcesPanelProps> = ({
  isInline,
  options,
  setDetails,
}: IResourcesPanelProps) => {
  const [state, setState] = useState<{ activeKey: string; selectedRow: number }>({ activeKey: '', selectedRow: -1 });

  const { isError, isLoading, error, data, refetch } = useQuery<IResourceResponse[], Error>(
    ['app/resources/resources/_', options],
    async () => {
      const c = options.clusterIDs.map((clusterID) => `&clusterID=${encodeURIComponent(clusterID)}`);
      const n = options.clusterIDs
        .map((clusterID) =>
          options.namespaces.map(
            (namespace) => `&namespaceID=${encodeURIComponent(`${clusterID}/namespace/${namespace}`)}`,
          ),
        )
        .flat();
      const r = options.resourceIDs.map((resourceID) => `&resourceID=${encodeURIComponent(resourceID)}`);

      const response = await fetch(
        `/api/resources/_?paramName=${options.paramName}&param=${options.param}${c.length > 0 ? c.join('') : ''}${
          n.length > 0 ? n.join('') : ''
        }${r.length > 0 ? r.join('') : ''}`,
        {
          method: 'get',
        },
      );
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
    },
  );

  useEffect(() => {
    if (data && data.length > 0) {
      setState({ activeKey: data[0].resource.id, selectedRow: -1 });
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={isInline}
        title="An error occured while resources were fetched"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IResourceResponse[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={SearchIcon} />
        <Title headingLevel="h2" size="lg">
          No resource found
        </Title>
        <EmptyStateBody>No resources match the filter criteria.</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Tabs
      activeKey={state.activeKey}
      isFilled={false}
      onSelect={(event: React.MouseEvent<HTMLElement, MouseEvent>, eventKey: string | number): void => {
        setState({ activeKey: eventKey.toString(), selectedRow: -1 });
        if (setDetails) {
          setDetails(undefined);
        }
      }}
      mountOnEnter={true}
      unmountOnExit={true}
    >
      {data.map((resourceResponse) => (
        <Tab
          key={resourceResponse.resource.id}
          eventKey={resourceResponse.resource.id}
          title={<TabTitleText>{resourceResponse.resource.title}</TabTitleText>}
        >
          <ResourcesPanelTable
            resourceResponse={resourceResponse}
            columns={options.columns?.filter((column) => column.resource === resourceResponse.resource.id)}
            filter={options.filter}
            selectedRow={state.selectedRow}
            selectRow={
              setDetails
                ? (
                    rowIndex: number,
                    resource: IResource,
                    resourceData: IResourceRow,
                    integrations: IIntegrations,
                  ): void => {
                    setState({ ...state, selectedRow: rowIndex });
                    setDetails(
                      <Details
                        resource={resource}
                        resourceData={resourceData}
                        integrations={integrations}
                        close={(): void => {
                          setState({ ...state, selectedRow: -1 });
                          setDetails(undefined);
                        }}
                      />,
                    );
                  }
                : undefined
            }
          />
        </Tab>
      ))}
    </Tabs>
  );
};

export default ResourcesPanel;
