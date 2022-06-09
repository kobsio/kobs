import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useRef, useState } from 'react';
import { LogViewer } from '@patternfly/react-log-viewer';

import { IPluginInstance, useDimensions } from '@kobsio/shared';
import { IContainerLogs } from './interfaces';

interface IDetailsLogsProps {
  instance: IPluginInstance;
  resourceGroup: string;
  containerGroup: string;
  containers: string[];
  tail: number;
  timestamps: boolean;
}

const DetailsLogs: React.FunctionComponent<IDetailsLogsProps> = ({
  instance,
  resourceGroup,
  containerGroup,
  containers,
  tail,
  timestamps,
}: IDetailsLogsProps) => {
  const [container, setContainer] = useState<string>(containers.length > 0 ? containers[0] : '');
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const refWrapper = useRef<HTMLDivElement>(null);
  const wrapperSize = useDimensions(refWrapper);

  const { isError, isLoading, error, data, refetch } = useQuery<IContainerLogs, Error>(
    ['azure/containergroups/containergroup/logs', instance, resourceGroup, containerGroup, container, tail, timestamps],
    async () => {
      try {
        if (container !== '') {
          const response = await fetch(
            `/api/plugins/azure/containerinstances/containergroup/logs?resourceGroup=${resourceGroup}&containerGroup=${containerGroup}&container=${container}&tail=${tail}&timestamps=${timestamps}`,
            {
              headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'x-kobs-plugin': instance.name,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'x-kobs-satellite': instance.satellite,
              },
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
        }
      } catch (err) {
        throw err;
      }
    },
  );

  const selectContainer = (value: string): void => {
    setContainer(value);
    setShowSelect(false);
  };

  return (
    <div
      className="kobsio-hide-scrollbar"
      style={{ height: '100%', maxWidth: '100%', overflow: 'auto' }}
      ref={refWrapper}
    >
      <Select
        variant={SelectVariant.single}
        typeAheadAriaLabel="Select container"
        placeholderText="Select container"
        onToggle={(): void => setShowSelect(!showSelect)}
        onSelect={(e, value): void => selectContainer(value as string)}
        selections={container}
        isOpen={showSelect}
      >
        {containers.map((container, index) => (
          <SelectOption key={index} value={container} />
        ))}
      </Select>

      <p>&nbsp;</p>

      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get container logs"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IContainerLogs, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data.logs ? (
        <LogViewer hasLineNumbers={false} height={wrapperSize.height - 36 - 21} data={data.logs} theme="light" />
      ) : (
        <p>&nbsp;</p>
      )}
      <p>&nbsp;</p>
    </div>
  );
};

export default DetailsLogs;
