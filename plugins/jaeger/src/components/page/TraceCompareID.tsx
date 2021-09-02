import {
  Alert,
  AlertActionLink,
  AlertVariant,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ITrace } from '../../utils/interfaces';
import TraceCompare from './TraceCompare';
import { addColorForProcesses } from '../../utils/colors';
import { transformTraceData } from '../../utils/helpers';

interface ITraceCompareIDProps {
  name: string;
  traceID: string;
}

const TraceCompareID: React.FunctionComponent<ITraceCompareIDProps> = ({ name, traceID }: ITraceCompareIDProps) => {
  const history = useHistory();

  const { isError, isLoading, error, data, refetch } = useQuery<ITrace | null, Error>(
    ['jaeger/trace', name, traceID],
    async () => {
      try {
        const response = await fetch(`/api/plugins/jaeger/trace/${name}?traceID=${traceID}`, {
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
              <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
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

  return <TraceCompare name={name} trace={data} />;
};

export default TraceCompareID;
