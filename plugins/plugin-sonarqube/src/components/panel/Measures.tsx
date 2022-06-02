import { Alert, AlertActionLink, AlertVariant, Flex, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IPluginInstance } from '@kobsio/shared';
import { IResponseProjectMeasures } from '../../utils/interfaces';
import Measure from './Measure';

interface IMeasuresProps {
  instance: IPluginInstance;
  project: string;
  metricKeys?: string[];
}

const Measures: React.FunctionComponent<IMeasuresProps> = ({ instance, project, metricKeys }: IMeasuresProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IResponseProjectMeasures, Error>(
    ['sonarqube/projectmeasures', instance, project, metricKeys],
    async () => {
      try {
        const metricKeyParams = metricKeys ? metricKeys.map((key) => `metricKey=${key}`).join('&') : '';

        const response = await fetch(`/api/plugins/sonarqube/projectmeasures?project=${project}&${metricKeyParams}`, {
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
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title="Could not get projects"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IResponseProjectMeasures, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.component || !data.metrics) {
    return null;
  }

  return (
    <Flex justifyContent={{ default: 'justifyContentCenter' }}>
      {data.component.measures.map((measure) => (
        <Measure key={measure.metric} measure={measure} metrics={data.metrics} />
      ))}
    </Flex>
  );
};

export default Measures;
