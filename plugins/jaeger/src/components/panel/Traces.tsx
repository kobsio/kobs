import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useEffect, useState } from 'react';

import { IPluginTimes, PluginCard } from '@kobsio/plugin-core';
import { IQuery, ITrace } from '../../utils/interfaces';
import { encodeTags, transformTraceData } from '../../utils/helpers';
import TracesActions from './TracesActions';
import TracesChart from './TracesChart';
import TracesList from './TracesList';
import { addColorForProcesses } from '../../utils/colors';

interface ITracesProps {
  name: string;
  title: string;
  description?: string;
  showChart: boolean;
  queries: IQuery[];
  times: IPluginTimes;
  setDetails?: (details: React.ReactNode) => void;
}

const Traces: React.FunctionComponent<ITracesProps> = ({
  name,
  title,
  description,
  times,
  setDetails,
  showChart,
  queries,
}: ITracesProps) => {
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const [selectedQuery, setSelectedQuery] = useState<IQuery>(queries[0]);

  const { isError, isLoading, error, data, refetch } = useQuery<ITrace[], Error>(
    ['jaeger/traces', name, selectedQuery, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/jaeger/${name}/traces?limit=${selectedQuery.limit || '20'}&maxDuration=${
            selectedQuery.maxDuration || ''
          }&minDuration=${selectedQuery.minDuration || ''}&operation=${selectedQuery.operation || ''}&service=${
            selectedQuery.service || ''
          }&tags=${encodeTags(selectedQuery.tags || '')}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          const traceData = addColorForProcesses(json.data);
          const traces: ITrace[] = [];

          for (const trace of traceData) {
            const transformedTrace = transformTraceData(trace);
            if (transformedTrace) {
              traces.push(transformedTrace);
            }
          }

          return traces;
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

  useEffect(() => {
    if (queries.length === 1) {
      setSelectedQuery(queries[0]);
    }
  }, [queries]);

  const select = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ): void => {
    const query = queries.filter((query) => query.name === value);
    if (query.length === 1) {
      setSelectedQuery(query[0]);
    }
    setShowSelect(false);
  };

  return (
    <PluginCard
      title={title}
      description={description}
      transparent={true}
      actions={<TracesActions name={name} queries={queries} times={times} />}
    >
      <div>
        {queries.length > 1 ? (
          <div>
            <Select
              variant={SelectVariant.single}
              typeAheadAriaLabel="Select query"
              placeholderText="Select query"
              onToggle={(): void => setShowSelect(!showSelect)}
              onSelect={select}
              selections={selectedQuery.name}
              isOpen={showSelect}
            >
              {queries.map((query, index) => (
                <SelectOption
                  key={index}
                  value={query.name}
                  description={`Service: ${query.service || '-'}, Operation: ${query.operation || '-'}, Max Duration: ${
                    query.maxDuration || '-'
                  }, Min Duration: ${query.minDuration || '-'}, Tags: ${query.tags || '-'}`}
                />
              ))}
            </Select>
            <p>&nbsp;</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            title="Could not get traces"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<ITrace[], Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data && data.length > 0 ? (
          <React.Fragment>
            {showChart ? (
              <React.Fragment>
                <TracesChart name={name} traces={data} setDetails={setDetails} />
                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <p>&nbsp;</p>
              </React.Fragment>
            ) : null}

            <TracesList name={name} traces={data} setDetails={setDetails} />
          </React.Fragment>
        ) : null}
      </div>
    </PluginCard>
  );
};

export default Traces;
