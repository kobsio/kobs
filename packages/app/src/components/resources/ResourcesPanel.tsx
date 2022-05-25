import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  CardTitle,
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
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useEffect, useState } from 'react';
import { SearchIcon } from '@patternfly/react-icons';

import { IOptions, IResourceResponse } from './utils/interfaces';
import Details from './details/Details';
import { IResource } from '../../resources/clusters';
import { IResourceRow } from './utils/tabledata';
import ResourcesPanelTable from './ResourcesPanelTable';

interface IResourcesPanelProps {
  title?: string;
  options: IOptions;
  setDetails?: (details: React.ReactNode) => void;
}

const ResourcesPanel: React.FunctionComponent<IResourcesPanelProps> = ({
  title,
  options,
  setDetails,
}: IResourcesPanelProps) => {
  const [state, setState] = useState<{ activeKey: string; selectedRow: number }>({ activeKey: '', selectedRow: -1 });

  const { isError, isLoading, error, data, refetch } = useQuery<IResourceResponse[], Error>(
    ['app/resources/resources', options],
    async () => {
      const c = options.clusterIDs.map((clusterID) => `&clusterID=${encodeURIComponent(clusterID)}`);
      const n = options.namespaceIDs.map((namespaceID) => `&namespaceID=${encodeURIComponent(namespaceID)}`);
      const r = options.resourceIDs.map((resourceID) => `&resourceID=${encodeURIComponent(resourceID)}`);

      const response = await fetch(
        `/api/resources?paramName=${options.paramName}&param=${options.param}${c.length > 0 ? c.join('') : ''}${
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
    const isLoadingComponent = (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );

    if (title) {
      return <Card isCompact={true}>{isLoadingComponent}</Card>;
    }

    return isLoadingComponent;
  }

  if (isError) {
    const errorComponent = (
      <Alert
        variant={AlertVariant.danger}
        isInline={title !== undefined}
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

    if (title) {
      return <Card isCompact={true}>{errorComponent}</Card>;
    }

    return errorComponent;
  }

  if (!data || data.length === 0) {
    if (title) {
      return (
        <Card isCompact={true}>
          <CardTitle>{title}</CardTitle>
          <CardBody>
            <EmptyState variant={EmptyStateVariant.small}>
              <EmptyStateIcon icon={SearchIcon} />
              <Title headingLevel="h2" size="lg">
                No resource found
              </Title>
              <EmptyStateBody>No resources match the filter criteria.</EmptyStateBody>
            </EmptyState>
          </CardBody>
        </Card>
      );
    }

    return null;
  }

  return (
    <Card isCompact={true}>
      <Tabs
        activeKey={state.activeKey}
        isFilled={true}
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
              columns={options.columns}
              selectedRow={state.selectedRow}
              selectRow={
                setDetails
                  ? (rowIndex: number, resource: IResource, resourceData: IResourceRow): void => {
                      setState({ ...state, selectedRow: rowIndex });
                      setDetails(
                        <Details
                          resource={resource}
                          resourceData={resourceData}
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
    </Card>
  );
};

export default ResourcesPanel;
