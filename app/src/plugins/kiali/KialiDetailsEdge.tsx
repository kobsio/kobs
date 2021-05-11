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

import { Edge, NodeWrapper } from 'proto/kiali_grpc_web_pb';
import KialiDetailsEdgeFlags from 'plugins/kiali/KialiDetailsEdgeFlags';
import KialiDetailsEdgeHosts from 'plugins/kiali/KialiDetailsEdgeHosts';
import KialiDetailsEdgeMetrics from 'plugins/kiali/KialiDetailsEdgeMetrics';
import KialiDetailsEdgeTrafficGRPC from 'plugins/kiali/KialiDetailsEdgeTrafficGRPC';
import KialiDetailsEdgeTrafficHTTP from 'plugins/kiali/KialiDetailsEdgeTrafficHTTP';
import { getTitle } from 'plugins/kiali/helpers';

interface IKialiDetailsEdgeProps {
  name: string;
  duration: number;
  edge: Edge.AsObject;
  nodes: NodeWrapper.AsObject[];
  close: () => void;
}

// KialiDetailsEdge is used as the drawer panel component to display the details about a selected edge.
const KialiDetailsEdge: React.FunctionComponent<IKialiDetailsEdgeProps> = ({
  name,
  duration,
  edge,
  nodes,
  close,
}: IKialiDetailsEdgeProps) => {
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
                <KialiDetailsEdgeTrafficHTTP edge={edge} />
              </div>
            </Tab>
          ) : null}
          {edge.traffic?.protocol === 'grpc' ? (
            <Tab eventKey="trafficGRPC" title={<TabTitleText>Traffic</TabTitleText>}>
              <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
                <KialiDetailsEdgeTrafficGRPC edge={edge} />
              </div>
            </Tab>
          ) : null}
          <Tab eventKey="flags" title={<TabTitleText>Flags</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <KialiDetailsEdgeFlags edge={edge} />
            </div>
          </Tab>
          <Tab eventKey="hosts" title={<TabTitleText>Hosts</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <KialiDetailsEdgeHosts edge={edge} />
            </div>
          </Tab>
        </Tabs>

        {sourceNode.length === 1 && sourceNode[0].data && targetNode.length === 1 && targetNode[0].data ? (
          <KialiDetailsEdgeMetrics
            name={name}
            duration={duration}
            edge={edge}
            sourceNode={sourceNode[0].data}
            targetNode={targetNode[0].data}
          />
        ) : null}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default KialiDetailsEdge;
