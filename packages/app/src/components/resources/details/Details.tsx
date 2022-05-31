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
  Title,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import yaml from 'js-yaml';

import Actions from './Actions';
import { Editor } from '@kobsio/shared';
import Events from './Events';
import { IResource } from '../../../resources/clusters';
import { IResourceRow } from '../utils/tabledata';
import Logs from './Logs';
import Overview from './Overview';
import Pods from './Pods';
import Terminal from './Terminal';

// getSelector is used to get the label selector for various resources as string. The returned string can be used in
// a Kubernetes API request to get the all pods, which are matching the label selector.
const getSelector = (resource: IResource, resourceData: IResourceRow): string => {
  if (
    resource.id === 'deployments' ||
    resource.id === 'daemonsets' ||
    resource.id === 'statefulsets' ||
    resource.id === 'jobs'
  ) {
    return resourceData.props?.spec?.selector?.matchLabels
      ? Object.keys(resourceData.props.spec.selector.matchLabels)
          .map((key) => `${key}=${resourceData.props.spec.selector.matchLabels[key]}`)
          .join(',')
      : '';
  }

  return '';
};

interface IDetailsProps {
  resource: IResource;
  resourceData: IResourceRow;
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({ resource, resourceData, close }: IDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const podSelector = getSelector(resource, resourceData);

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {resourceData.name}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {resourceData.namespace
              ? `(${resourceData.namespace} / ${resourceData.cluster})`
              : `(${resourceData.cluster})`}
          </span>
        </Title>
        <DrawerActions>
          <Actions resource={resource} resourceData={resourceData} />
          <DrawerCloseButton onClick={close} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={false}
          usePageInsets={true}
          mountOnEnter={true}
          unmountOnExit={true}
        >
          <Tab eventKey="overview" title={<TabTitleText>Overview</TabTitleText>}>
            <div
              className="kobsio-hide-scrollbar"
              style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}
            >
              <Overview resource={resource} resourceData={resourceData} />
            </div>
          </Tab>

          <Tab eventKey="yaml" title={<TabTitleText>Yaml</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Card>
                <Editor value={yaml.dump(resourceData.props)} mode="yaml" readOnly={true} />
              </Card>
            </div>
          </Tab>

          <Tab eventKey="events" title={<TabTitleText>Events</TabTitleText>}>
            <div
              className="kobsio-hide-scrollbar"
              style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}
            >
              <Events
                satellite={resourceData.satellite}
                cluster={resourceData.cluster}
                namespace={resourceData.namespace ? resourceData.namespace : ''}
                name={resourceData.name}
              />
            </div>
          </Tab>

          {podSelector || resource.id === 'nodes' ? (
            <Tab eventKey="pods" title={<TabTitleText>Pods</TabTitleText>}>
              <div
                className="kobsio-hide-scrollbar"
                style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}
              >
                <Pods
                  satellite={resourceData.satellite}
                  cluster={resourceData.cluster}
                  namespace={resourceData.namespace ? resourceData.namespace : ''}
                  paramName={podSelector ? 'labelSelector' : 'fieldSelector'}
                  param={podSelector ? podSelector : `spec.nodeName=${resourceData.props.metadata.name}`}
                />
              </div>
            </Tab>
          ) : null}

          {resource.id === 'pods' ? (
            <Tab eventKey="logs" title={<TabTitleText>Logs</TabTitleText>}>
              <div
                className="kobsio-hide-scrollbar"
                style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}
              >
                <Logs resource={resource} resourceData={resourceData} />
              </div>
            </Tab>
          ) : null}

          {resource.id === 'pods' ? (
            <Tab eventKey="terminal" title={<TabTitleText>Terminal</TabTitleText>}>
              <div
                className="kobsio-hide-scrollbar"
                style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}
              >
                <Terminal resource={resource} resourceData={resourceData} />
              </div>
            </Tab>
          ) : null}
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
