import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  CodeBlock,
  CodeBlockCode,
  Label,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { Editor } from '@kobsio/shared';
import { ILog } from '../../utils/interfaces';

export interface ILogsTableRowDetailsProps {
  log: ILog;
}

const LogsTableRowDetails: React.FunctionComponent<ILogsTableRowDetailsProps> = ({
  log,
}: ILogsTableRowDetailsProps) => {
  const [contentIsExpanded, setContentIsExpanded] = useState<boolean>(log.attributes?.message ? true : false);
  const [jsonIsExpanded, setJsonIsExpanded] = useState<boolean>(!log.attributes?.message ? true : false);

  return (
    <div style={{ padding: '24px 0px' }}>
      <div>
        <strong>Tags:</strong>
        {log.attributes?.tags?.map((tag) => (
          <Label key={tag} className="pf-u-ml-sm pf-u-mb-sm">
            {tag}
          </Label>
        ))}
      </div>

      <p>&nbsp;</p>

      <Accordion asDefinitionList={true}>
        {log.attributes?.message && (
          <AccordionItem key={`${log.id}-content`}>
            <AccordionToggle
              onClick={(): void => setContentIsExpanded(!contentIsExpanded)}
              isExpanded={contentIsExpanded}
              id={`${log.id}-content`}
            >
              Content
            </AccordionToggle>
            <AccordionContent id={`${log.id}-content`} isHidden={!contentIsExpanded}>
              <CodeBlock>
                <CodeBlockCode id={`${log.id}-content`}>{log.attributes?.message}</CodeBlockCode>
              </CodeBlock>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem key={`${log.id}-json`}>
          <AccordionToggle
            onClick={(): void => setJsonIsExpanded(!jsonIsExpanded)}
            isExpanded={jsonIsExpanded}
            id={`${log.id}-json`}
          >
            JSON
          </AccordionToggle>
          <AccordionContent id={`${log.id}-json`} isHidden={!jsonIsExpanded}>
            <Editor value={JSON.stringify(log, null, 2)} mode="json" readOnly={true} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LogsTableRowDetails;
