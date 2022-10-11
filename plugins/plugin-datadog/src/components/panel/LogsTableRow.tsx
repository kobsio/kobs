import React, { useState } from 'react';
import { TableText, Tbody, Td, Tr } from '@patternfly/react-table';

import { ILog } from '../../utils/interfaces';
import LogsTableRowDetails from './LogsTableRowDetails';
import { formatTime } from '../../utils/helpers';

interface ILogsTableRowProps {
  log: ILog;
}

const LogsTableRow: React.FunctionComponent<ILogsTableRowProps> = ({ log }: ILogsTableRowProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const defaultActions = [
    {
      title: (
        <a
          style={{ color: 'inherit', textDecoration: 'inherit' }}
          href={URL.createObjectURL(new Blob([JSON.stringify({ data: log }, null, 2)]))}
          download={`${log.id}.json`}
        >
          Download JSON
        </a>
      ),
    },
  ];

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td
          noPadding={true}
          style={{ padding: 0 }}
          expand={{ isExpanded: isExpanded, onToggle: (): void => setIsExpanded(!isExpanded), rowIndex: 0 }}
        />
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Time">
          <TableText wrapModifier="nowrap">{formatTime(log.attributes?.timestamp)}</TableText>
        </Td>
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Host">
          {log.attributes?.host}
        </Td>
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Service">
          {log.attributes?.service}
        </Td>
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Content">
          {log.attributes?.message}
        </Td>
        <Td noPadding={true} style={{ padding: 0 }} actions={{ items: defaultActions }} />
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td />
        <Td colSpan={6}>{isExpanded && <LogsTableRowDetails log={log} />}</Td>
        <Td />
      </Tr>
    </Tbody>
  );
};

export default LogsTableRow;
