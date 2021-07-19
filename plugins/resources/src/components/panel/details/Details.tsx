import {
  Card,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { IRow } from '@patternfly/react-table';
import yaml from 'js-yaml';

import { Editor, IResource, Title } from '@kobsio/plugin-core';
import Actions from './Actions';
import Dashboards from './Dashboards';
import Events from './Events';
import Links from './Links';
import Logs from './Logs';
import Overview from './Overview';
import Pods from './Pods';

// getSelector is used to get the label selector for various resources as string. The returned string can be used in
// a Kubernetes API request to get the all pods, which are matching the label selector.
const getSelector = (request: IResource, resource: IRow): string => {
  if (
    request.resource === 'deployments' ||
    request.resource === 'daemonsets' ||
    request.resource === 'statefulsets' ||
    request.resource === 'jobs'
  ) {
    return resource.props?.spec?.selector?.matchLabels
      ? Object.keys(resource.props.spec.selector.matchLabels)
          .map((key) => `${key}=${resource.props.spec.selector.matchLabels[key]}`)
          .join(',')
      : '';
  }

  return '';
};

interface IDetailsProps {
  request: IResource;
  resource: IRow;
  close: () => void;
  refetch: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({ request, resource, close, refetch }: IDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const podSelector = getSelector(request, resource);

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={resource.name.title}
          subtitle={
            resource.namespace ? `${resource.namespace.title} (${resource.cluster.title})` : resource.cluster.title
          }
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <Actions request={request} resource={resource} refetch={refetch} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Links resource={resource} />

        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={true}
          mountOnEnter={true}
        >
          <Tab eventKey="overview" title={<TabTitleText>Overview</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Overview request={request} resource={resource} />
            </div>
          </Tab>

          <Tab eventKey="yaml" title={<TabTitleText>Yaml</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Card>
                <Editor value={yaml.dump(resource.props)} mode="yaml" readOnly={true} />
              </Card>
            </div>
          </Tab>

          <Tab eventKey="events" title={<TabTitleText>Events</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Events
                cluster={resource.cluster.title}
                namespace={resource.namespace ? resource.namespace.title : ''}
                name={resource.name.title}
              />
            </div>
          </Tab>

          {request.resource === 'pods' ? (
            <Tab eventKey="logs" title={<TabTitleText>Logs</TabTitleText>}>
              <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
                <Logs
                  cluster={resource.cluster.title}
                  namespace={resource.namespace ? resource.namespace.title : ''}
                  name={resource.name.title}
                  pod={resource.props}
                />
              </div>
            </Tab>
          ) : null}

          {podSelector || request.resource === 'nodes' ? (
            <Tab eventKey="pods" title={<TabTitleText>Pods</TabTitleText>}>
              <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
                <Pods
                  cluster={resource.cluster.title}
                  namespace={resource.namespace ? resource.namespace.title : ''}
                  paramName={podSelector ? 'labelSelector' : 'fieldSelector'}
                  param={podSelector ? podSelector : `spec.nodeName=${resource.props.metadata.name}`}
                />
              </div>
            </Tab>
          ) : null}

          <Tab eventKey="dashboards" title={<TabTitleText>Dashboards</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Dashboards resource={resource} />
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
