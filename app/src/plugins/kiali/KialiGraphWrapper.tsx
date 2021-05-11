import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import React, { memo, useCallback, useEffect, useState } from 'react';
import cytoscape from 'cytoscape';

import {
  EdgeWrapper,
  GetGraphRequest,
  GetGraphResponse,
  KialiPromiseClient,
  NodeWrapper,
} from 'proto/kiali_grpc_web_pb';
import KialiGraph from 'plugins/kiali/KialiGraph';
import { apiURL } from 'utils/constants';

// kialiService is the gRPC service to get the graph from a Kiali instance.
const kialiService = new KialiPromiseClient(apiURL, null, null);

interface IDataState {
  edges: EdgeWrapper.AsObject[];
  error: string;
  isLoading: boolean;
  nodes: NodeWrapper.AsObject[];
}

interface IKialiGraphWrapperProps {
  name: string;
  namespaces: string[];
  duration: number;
  setDetails?: (details: React.ReactNode) => void;
}

const KialiGraphWrapper: React.FunctionComponent<IKialiGraphWrapperProps> = ({
  name,
  namespaces,
  duration,
  setDetails,
}: IKialiGraphWrapperProps) => {
  const [data, setData] = useState<IDataState>({ edges: [], error: '', isLoading: false, nodes: [] });

  const fetchGraph = useCallback(async (): Promise<void> => {
    try {
      setData({ edges: [], error: '', isLoading: true, nodes: [] });

      const getGraphRequest = new GetGraphRequest();
      getGraphRequest.setName(name);
      getGraphRequest.setNamespacesList(namespaces);
      getGraphRequest.setDuration(duration);
      getGraphRequest.setGraphtype('versionedApp');
      getGraphRequest.setGroupby('app');
      getGraphRequest.setInjectservicenodes(true);
      getGraphRequest.setAppendersList(['deadNode', 'sidecarsCheck', 'serviceEntry', 'istio']);

      const getGraphResponse: GetGraphResponse = await kialiService.getGraph(getGraphRequest, null);
      const graphData = getGraphResponse.toObject();

      if (graphData.elements) {
        setData({
          edges: graphData.elements.edgesList,
          error: '',
          isLoading: false,
          nodes: graphData.elements.nodesList,
        });
      } else {
        setData({ edges: [], error: '', isLoading: false, nodes: [] });
      }
    } catch (err) {
      setData({ edges: [], error: err.message, isLoading: false, nodes: [] });
    }
  }, [name, namespaces, duration]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  if (data.isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (data.error) {
    return (
      <Alert variant={AlertVariant.danger} title="Could not get graph data">
        <p>{data.error}</p>
      </Alert>
    );
  }

  return (
    <div style={{ height: '100%', minHeight: '100%' }}>
      <KialiGraph
        name={name}
        duration={duration}
        edges={data.edges as cytoscape.ElementDefinition[]}
        nodes={data.nodes as cytoscape.ElementDefinition[]}
        setDetails={setDetails}
      />
    </div>
  );
};

export default memo(KialiGraphWrapper, (prevProps, nextProps) => {
  if (
    JSON.stringify(prevProps.namespaces) === JSON.stringify(nextProps.namespaces) &&
    prevProps.duration === nextProps.duration
  ) {
    return true;
  }

  return false;
});
