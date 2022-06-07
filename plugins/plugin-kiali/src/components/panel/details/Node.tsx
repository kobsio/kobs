import {
  Badge,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { IEdgeWrapper, INodeData, INodeWrapper } from '../../../utils/interfaces';
import { IPluginInstance, ITimes } from '@kobsio/shared';
import NodeMetricsWrapper from './NodeMetricsWrapper';
import NodeTrafficGRPC from './NodeTrafficGRPC';
import NodeTrafficHTTP from './NodeTrafficHTTP';
import { getTitle } from '../../../utils/helpers';

interface IEdges {
  source: IEdgeWrapper[];
  target: IEdgeWrapper[];
}

const getEdges = (node: INodeData, nodes: INodeWrapper[], edges: IEdgeWrapper[]): IEdges => {
  if (node.nodeType === 'box') {
    const childrens = nodes
      .filter((children) => children.data?.parent === node.id)
      .map((children) => children.data?.id || '');

    return {
      source: edges.filter((edge) => edge.data && childrens.includes(edge.data.source)),
      target: edges.filter((edge) => edge.data && childrens.includes(edge.data.target)),
    };
  }

  return {
    source: edges.filter((edge) => edge.data?.source === node.id),
    target: edges.filter((edge) => edge.data?.target === node.id),
  };
};

interface IKialiDetailsNodeProps {
  instance: IPluginInstance;
  times: ITimes;
  node: INodeData;
  nodes: INodeWrapper[];
  edges: IEdgeWrapper[];
  close: () => void;
}

const KialiDetailsNode: React.FunctionComponent<IKialiDetailsNodeProps> = ({
  instance,
  times,
  node,
  nodes,
  edges,
  close,
}: IKialiDetailsNodeProps) => {
  const title = getTitle(node);
  const filteredEdges = getEdges(node, nodes, edges);

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <span>
          <span className="pf-c-title pf-m-lg">
            <Badge isRead={false}>{title.badge}</Badge>
            <span className="pf-u-pl-sm">{title.title}</span>
          </span>
        </span>
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <NodeTrafficHTTP sourceEdges={filteredEdges.source} targetEdges={filteredEdges.target} />
        <NodeTrafficGRPC sourceEdges={filteredEdges.source} targetEdges={filteredEdges.target} />
        <NodeMetricsWrapper instance={instance} times={times} node={node} />
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default KialiDetailsNode;
