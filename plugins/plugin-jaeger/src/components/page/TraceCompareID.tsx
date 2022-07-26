import {
  Alert,
  AlertActionLink,
  AlertVariant,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { IPluginInstance } from '@kobsio/shared';
import { ITrace } from '../../utils/interfaces';
import TraceCompare from './TraceCompare';
import { addColorForProcesses } from '../../utils/colors';
import { transformTraceData } from '../../utils/helpers';

interface ITraceCompareIDProps {
  instance: IPluginInstance;
  traceID: string;
}

const TraceCompareID: React.FunctionComponent<ITraceCompareIDProps> = ({ instance, traceID }: ITraceCompareIDProps) => {
  const navigate = useNavigate();

  const { isError, isLoading, error, data, refetch } = useQuery<ITrace | null, Error>(
    ['jaeger/trace', instance, traceID],
    async () => {
      try {
        const response = await fetch(`/api/plugins/jaeger/trace?traceID=${traceID}`, {
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
          return transformTraceData(addColorForProcesses(json.data)[0]);
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <PageSection variant={PageSectionVariants.default}>
        <Alert
          variant={AlertVariant.danger}
          title="Could not get trace"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<ITrace | null, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      </PageSection>
    );
  }

  if (!data) {
    return null;
  }

  return <TraceCompare instance={instance} trace={data} />;
};

export default TraceCompareID;
