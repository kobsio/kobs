import { Accordion, AccordionContent, AccordionItem, AccordionToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { ILog, formatTraceTime } from 'plugins/jaeger/helpers';

export interface IJaegerSpanLogsProps {
  logs: ILog[];
}

const JaegerSpanLogs: React.FunctionComponent<IJaegerSpanLogsProps> = ({ logs }: IJaegerSpanLogsProps) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (id: string): void => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((item) => item !== id));
    } else {
      setExpanded([...expanded, id]);
    }
  };

  return (
    <Accordion asDefinitionList={false}>
      {logs.map((log, index) => (
        <AccordionItem key={index}>
          <AccordionToggle
            onClick={(): void => toggle(`logs-accordion-${index}`)}
            isExpanded={expanded.includes(`logs-accordion-${index}`)}
            id={`resources-toggle-${index}`}
          >
            {formatTraceTime(log.timestamp)} ()
          </AccordionToggle>
          <AccordionContent
            id={`resources-content-${index}`}
            style={{ maxWidth: '100%', overflowX: 'scroll' }}
            isHidden={!expanded.includes(`logs-accordion-${index}`)}
            isFixed={false}
          >
            <TableComposable aria-label="Logs" variant={TableVariant.compact} borders={true}>
              <Thead>
                <Tr>
                  <Th>Key</Th>
                  <Th>Value</Th>
                </Tr>
              </Thead>

              <Tbody>
                {log.fields.map((field, rowIndex) => (
                  <Tr key={rowIndex}>
                    <Td dataLabel="Key">{field.key}</Td>
                    <Td dataLabel="Value">{field.value}</Td>
                  </Tr>
                ))}
              </Tbody>
            </TableComposable>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default JaegerSpanLogs;
