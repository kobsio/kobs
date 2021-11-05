import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IResponseProjectMeasures } from '../../utils/interfaces';
import Measure from './Measure';

interface IMeasuresProps {
  name: string;
  project: string;
  metricKeys?: string[];
}

const Measures: React.FunctionComponent<IMeasuresProps> = ({ name, project, metricKeys }: IMeasuresProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IResponseProjectMeasures, Error>(
    ['sonarqube/projectmeasures', name, project, metricKeys],
    async () => {
      try {
        const metricKeyParams = metricKeys ? metricKeys.map((key) => `metricKey=${key}`).join('&') : '';

        const response = await fetch(
          `/api/plugins/sonarqube/projectmeasures/${name}?project=${project}&${metricKeyParams}`,
          {
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
    <TableComposable aria-label="Measures" variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          <Th>Metric</Th>
          <Th>Value</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.component.measures.map((measure) => (
          <Measure key={measure.metric} measure={measure} metrics={data.metrics} />
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default Measures;
