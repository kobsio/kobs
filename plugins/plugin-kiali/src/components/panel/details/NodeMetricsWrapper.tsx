import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import { INodeData } from '../../../utils/interfaces';
import NodeMetrics from './NodeMetrics';

interface INodeMetricsWrapperProps {
  instance: IPluginInstance;
  times: ITimes;
  node: INodeData;
}

const NodeMetricsWrapper: React.FunctionComponent<INodeMetricsWrapperProps> = ({
  instance,
  times,
  node,
}: INodeMetricsWrapperProps) => {
  if (node.namespace === 'unknown') {
    return null;
  }

  if (node.nodeType === 'app') {
    return (
      <React.Fragment>
        <NodeMetrics
          instance={instance}
          times={times}
          nodeNamespace={node.namespace}
          nodeType="workloads"
          nodeName={node.workload || ''}
          filters="&filters[]=request_count&filters[]=request_error_count&filters[]=tcp_sent&filters[]=tcp_received"
          byLabels="&byLabels[]=request_protocol"
          direction="outbound"
          reporter="source"
        />
        <NodeMetrics
          instance={instance}
          times={times}
          nodeNamespace={node.namespace}
          nodeType="workloads"
          nodeName={node.workload || ''}
          filters="&filters[]=request_count&filters[]=request_error_count"
          byLabels="&byLabels[]=request_protocol"
          direction="inbound"
          reporter="destination"
        />
        <NodeMetrics
          instance={instance}
          times={times}
          nodeNamespace={node.namespace}
          nodeType="workloads"
          nodeName={node.workload || ''}
          filters="&filters[]=tcp_sent&filters[]=tcp_received"
          byLabels=""
          direction="inbound"
          reporter="source"
        />
      </React.Fragment>
    );
  } else if (node.nodeType === 'service') {
    return (
      <React.Fragment>
        <NodeMetrics
          instance={instance}
          times={times}
          nodeNamespace={node.namespace}
          nodeType="services"
          nodeName={node.service || ''}
          filters="&filters[]=request_count&filters[]=request_error_count"
          byLabels="&byLabels[]=request_protocol"
          direction="inbound"
          reporter="destination"
        />
        <NodeMetrics
          instance={instance}
          times={times}
          nodeNamespace={node.namespace}
          nodeType="services"
          nodeName={node.service || ''}
          filters="&filters[]=tcp_sent&filters[]=tcp_received"
          byLabels=""
          direction="inbound"
          reporter="source"
        />
      </React.Fragment>
    );
  } else if (node.nodeType === 'box') {
    return (
      <React.Fragment>
        <NodeMetrics
          instance={instance}
          times={times}
          nodeNamespace={node.namespace}
          nodeType="apps"
          nodeName={node.app || ''}
          filters="&filters[]=request_count&filters[]=request_error_count&filters[]=tcp_sent&filters[]=tcp_received"
          byLabels="&byLabels[]=request_protocol"
          direction="outbound"
          reporter="source"
        />
        <NodeMetrics
          instance={instance}
          times={times}
          nodeNamespace={node.namespace}
          nodeType="apps"
          nodeName={node.app || ''}
          filters="&filters[]=request_count&filters[]=request_error_count&filters[]=tcp_sent&filters[]=tcp_received"
          byLabels="&byLabels[]=request_protocol"
          direction="inbound"
          reporter="destination"
        />
      </React.Fragment>
    );
  }

  return null;
};

export default NodeMetricsWrapper;
