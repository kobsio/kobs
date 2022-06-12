import {
  Badge,
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

import { IEdgeData, INodeWrapper } from '../../../utils/interfaces';
import { IPluginInstance, ITimes } from '@kobsio/shared';
import EdgeFlags from './EdgeFlags';
import EdgeHosts from './EdgeHosts';
import EdgeMetricsHTTP from './EdgeMetricsHTTP';
import EdgeMetricsTCP from './EdgeMetricsTCP';
import EdgeMetricsgRPC from './EdgeMetricsgRPC';
import EdgeTrafficGRPC from './EdgeTrafficGRPC';
import EdgeTrafficHTTP from './EdgeTrafficHTTP';
import { getTitle } from '../../../utils/helpers';

interface IEdgeProps {
  instance: IPluginInstance;
  times: ITimes;
  edge: IEdgeData;
  nodes: INodeWrapper[];
  close: () => void;
}

// Edge is used as the drawer panel component to display the details about a selected edge.
const Edge: React.FunctionComponent<IEdgeProps> = ({ instance, times, edge, nodes, close }: IEdgeProps) => {
  const [activeTab, setActiveTab] = useState<string>(
    edge.traffic?.protocol === 'http' ? 'trafficHTTP' : edge.traffic?.protocol === 'grpc' ? 'trafficGRPC' : 'flags',
  );

  // To display the edge details like metrics, we have to get the source and target node of the edge. After that we,
  // generate the title for both nodes and display them in the format "From: ... To: ...".
  const sourceNode = nodes.filter((node) => node.data?.id === edge.source);
  const sourceTitle =
    sourceNode.length === 1 && sourceNode[0].data ? getTitle(sourceNode[0].data) : { badge: 'U', title: 'Unknown' };
  const targetNode = nodes.filter((node) => node.data?.id === edge.target);
  const targetTitle =
    targetNode.length === 1 && targetNode[0].data ? getTitle(targetNode[0].data) : { badge: 'U', title: 'Unknown' };

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <span>
          <span className="pf-u-font-size-sm pf-u-color-400">From:</span>
          <span className="pf-u-pl-sm pf-c-title pf-m-lg">
            <Badge isRead={false}>{sourceTitle.badge}</Badge>
            <span className="pf-u-pl-sm">{sourceTitle.title}</span>
          </span>
          <span className="pf-u-pl-lg pf-u-font-size-sm pf-u-color-400">To:</span>
          <span className="pf-u-pl-sm pf-c-title pf-m-lg">
            <Badge isRead={false}>{targetTitle.badge}</Badge>
            <span className="pf-u-pl-sm">{targetTitle.title}</span>
          </span>
        </span>
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={true}
          mountOnEnter={true}
        >
          {edge.traffic?.protocol === 'http' ? (
            <Tab eventKey="trafficHTTP" title={<TabTitleText>Traffic</TabTitleText>}>
              <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
                <EdgeTrafficHTTP edge={edge} />
              </div>
            </Tab>
          ) : null}
          {edge.traffic?.protocol === 'grpc' ? (
            <Tab eventKey="trafficGRPC" title={<TabTitleText>Traffic</TabTitleText>}>
              <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
                <EdgeTrafficGRPC edge={edge} />
              </div>
            </Tab>
          ) : null}
          <Tab eventKey="flags" title={<TabTitleText>Flags</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <EdgeFlags edge={edge} />
            </div>
          </Tab>
          <Tab eventKey="hosts" title={<TabTitleText>Hosts</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <EdgeHosts edge={edge} />
            </div>
          </Tab>
        </Tabs>

        <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
          {sourceNode.length === 1 && targetNode.length === 1 ? (
            edge.traffic?.protocol === 'tcp' ? (
              <EdgeMetricsTCP instance={instance} times={times} sourceNode={sourceNode[0]} targetNode={targetNode[0]} />
            ) : edge.traffic?.protocol === 'http' ? (
              <EdgeMetricsHTTP
                instance={instance}
                times={times}
                sourceNode={sourceNode[0]}
                targetNode={targetNode[0]}
              />
            ) : edge.traffic?.protocol === 'grpc' ? (
              <EdgeMetricsgRPC
                instance={instance}
                times={times}
                sourceNode={sourceNode[0]}
                targetNode={targetNode[0]}
              />
            ) : null
          ) : null}
        </div>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Edge;
