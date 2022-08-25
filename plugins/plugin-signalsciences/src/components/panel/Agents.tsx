import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Badge } from '@patternfly/react-core';

import AgentsDetails from './AgentsDetails';
import { IAgent } from '../../utils/interfaces';
import { formatTime } from '@kobsio/shared';
import { roundNumber } from '../../utils/helpers';

interface IAgentsProps {
  agents: IAgent[];
  setDetails?: (details: React.ReactNode) => void;
}

const Agents: React.FunctionComponent<IAgentsProps> = ({ agents, setDetails }: IAgentsProps) => {
  const [selectedAgent, setSelectedAgent] = useState<IAgent>();

  const selectRow = (agent: IAgent): void => {
    if (setDetails) {
      setSelectedAgent(agent);
      setDetails(
        <AgentsDetails
          agent={agent}
          close={(): void => {
            setSelectedAgent(undefined);
            setDetails(undefined);
          }}
        />,
      );
    }
  };

  return (
    <TableComposable aria-label="agents table" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Status</Th>
          <Th>Version</Th>
          <Th>P50</Th>
          <Th>P95</Th>
          <Th>P99</Th>
        </Tr>
      </Thead>
      <Tbody>
        {agents.map((agent) => (
          <Tr
            key={agent['agent.name']}
            isHoverable={setDetails ? true : false}
            isRowSelected={selectedAgent && selectedAgent['agent.name'] === agent['agent.name'] ? true : false}
            onClick={(): void => (setDetails ? selectRow(agent) : undefined)}
          >
            <Td dataLabel="Name">
              <div className="pf-u-font-weight-bold">{agent['agent.name']}</div>
              <div>{agent['host.remote_addr']}</div>
            </Td>
            <Td dataLabel="Status">
              <div>
                {agent['agent.status'] === 'online' ? (
                  <Badge style={{ backgroundColor: 'var(--pf-global--success-color--100)' }}>
                    {agent['agent.status']}
                  </Badge>
                ) : (
                  <Badge style={{ backgroundColor: 'var(--pf-global--danger-color--100)' }}>
                    {agent['agent.status']}
                  </Badge>
                )}
              </div>
              <div>{formatTime(Math.floor(new Date(agent['agent.last_seen']).getTime() / 1000))}</div>
            </Td>
            <Td dataLabel="Version">
              {agent['agent.version']}
              <span className="pf-u-ml-sm pf-u-font-weight-bold">
                {agent['agent.versions_behind'] > 0 ? '(Outdated)' : ''}
              </span>
            </Td>
            <Td dataLabel="P50">{roundNumber(agent['agent.latency_time_50th'])}ms</Td>
            <Td dataLabel="P95">{roundNumber(agent['agent.latency_time_95th'])}ms</Td>
            <Td dataLabel="P99">{roundNumber(agent['agent.latency_time_99th'])}ms</Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default Agents;
