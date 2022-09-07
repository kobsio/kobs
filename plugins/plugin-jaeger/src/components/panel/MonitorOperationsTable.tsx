import { CardActions, CardFooter, Pagination, PaginationVariant, TextInput } from '@patternfly/react-core';
import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import { IOperationData } from '../../utils/interfaces';
import Operation from './details/Operation';

interface IMonitorOperationsTableProps {
  title: string;
  description?: string;
  data: IOperationData[];
  instance: IPluginInstance;
  service: string;
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const MonitorOperationsTable: React.FunctionComponent<IMonitorOperationsTableProps> = ({
  title,
  description,
  data,
  instance,
  service,
  times,
  setDetails,
}: IMonitorOperationsTableProps) => {
  const [selectedOperation, setSelectedOperation] = useState<IOperationData>();
  const [options, setOptions] = useState<{ filter: string; page: number; perPage: number }>({
    filter: '',
    page: 1,
    perPage: 20,
  });
  const impact = data[0].impact;

  const selectOperation = (operation: IOperationData): void => {
    if (setDetails) {
      setSelectedOperation(operation);
      setDetails(
        <Operation
          operation={operation}
          instance={instance}
          service={service}
          times={times}
          close={(): void => {
            setSelectedOperation(undefined);
            setDetails(undefined);
          }}
        />,
      );
    }
  };

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        <CardActions>
          <TextInput
            placeholder="Filter"
            aria-label="Filter"
            value={options.filter}
            onChange={(value: string): void => setOptions({ filter: value, page: 1, perPage: options.perPage })}
          />
        </CardActions>
      }
      footer={
        <CardFooter>
          <Pagination
            style={{ padding: 0 }}
            itemCount={data.length}
            perPage={options.perPage}
            page={options.page}
            variant={PaginationVariant.bottom}
            onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
              setOptions({ ...options, page: newPage })
            }
            onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
              setOptions({ ...options, page: 1, perPage: newPerPage })
            }
            onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
              setOptions({ ...options, page: newPage })
            }
            onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
              setOptions({ ...options, page: newPage })
            }
            onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
              setOptions({ ...options, page: newPage })
            }
            onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
              setOptions({ ...options, page: newPage })
            }
          />
        </CardFooter>
      }
    >
      <TableComposable aria-label="Events" variant={TableVariant.compact} borders={true}>
        <Thead>
          <Tr>
            <Th>Operation</Th>
            <Th>P50</Th>
            <Th>P75</Th>
            <Th>P95</Th>
            <Th>Request Rate</Th>
            <Th>Error Rate</Th>
            <Th>Impact</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data
            .filter((operation) => operation.operation.toLowerCase().includes(options.filter.toLowerCase()))
            .slice((options.page - 1) * options.perPage, options.page * options.perPage)
            .map((operation) => (
              <Tr
                key={operation.operation}
                isHoverable={setDetails ? true : false}
                isRowSelected={selectedOperation?.operation === operation.operation}
                onClick={(): void => (setDetails ? selectOperation(operation) : undefined)}
              >
                <Td dataLabel="Operation">{operation.operation}</Td>
                <Td dataLabel="P50">{operation.avgs[0] ? `${operation.avgs[0]} ms` : '-'}</Td>
                <Td dataLabel="P75">{operation.avgs[1] ? `${operation.avgs[1]} ms` : '-'}</Td>
                <Td dataLabel="P95">{operation.avgs[2] ? `${operation.avgs[2]} ms` : '-'}</Td>
                <Td dataLabel="Request Rate">{operation.avgs[4] ? `${operation.avgs[4]} req/s` : '-'}</Td>
                <Td dataLabel="Error Rate">{operation.avgs[3] ? `${operation.avgs[3]} %` : '-'}</Td>
                <Td dataLabel="Impact">
                  <div
                    style={{
                      backgroundColor: 'rgba(0, 102, 204, 0.2)',
                      height: '12px',
                      width: '200px',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: 'rgba(0, 102, 204, 1)',
                        height: '12px',
                        width: `${200 * (operation.impact / impact)}px`,
                      }}
                    ></div>
                  </div>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </TableComposable>
    </PluginPanel>
  );
};

export default MonitorOperationsTable;
