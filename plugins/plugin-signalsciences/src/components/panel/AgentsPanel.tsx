import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import Agents from '../panel/Agents';
import { IAgent } from '../../utils/interfaces';

interface IAgentsPanelProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
  siteName: string;
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const AgentsPanel: React.FunctionComponent<IAgentsPanelProps> = ({
  title,
  description,
  instance,
  siteName,
  times,
  setDetails,
}: IAgentsPanelProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IAgent[], Error>(
    ['signalsciences/agents', instance, times],
    async () => {
      const response = await fetch(`/api/plugins/signalsciences/agents?siteName=${encodeURIComponent(siteName)}`, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-plugin': instance.name,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-satellite': instance.satellite,
        },
        method: 'get',
      });
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

  return (
    <PluginPanel title={title} description={description}>
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get agents"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IAgent[], Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data?.length > 0 ? (
        <Agents agents={data} setDetails={setDetails} />
      ) : (
        <Alert variant={AlertVariant.info} isInline={false} title="No agents found">
          <p>No agents were found for the provided site name.</p>
        </Alert>
      )}
    </PluginPanel>
  );
};

export default AgentsPanel;
