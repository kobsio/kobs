import { AccordionContent, AccordionItem, AccordionToggle, Badge } from '@patternfly/react-core';
import React, { useState } from 'react';
import { ExclamationIcon } from '@patternfly/react-icons';

import { IProcesses, ISpan, doesSpanContainsError } from 'plugins/jaeger/helpers';
import JaegerSpanLogs from 'plugins/jaeger/JaegerSpanLogs';

import 'plugins/jaeger/jaeger.css';

export interface IJaegerSpanProps {
  span: ISpan;
  processes: IProcesses;
  padding: number;
}

const JaegerSpan: React.FunctionComponent<IJaegerSpanProps> = ({ span, processes, padding }: IJaegerSpanProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const time = (
    <span
      style={{
        bottom: '0',
        height: '5px',
        left: '0',
        position: 'absolute',
        width: '100%',
      }}
    >
      <span
        style={{
          backgroundColor: processes[span.processID].color
            ? processes[span.processID].color
            : 'var(--pf-global--primary-color--100)',
          height: '5px',
          left: `${span.offset}%`,
          position: 'absolute',
          width: `${span.fill}%`,
        }}
      ></span>
    </span>
  );

  return (
    <React.Fragment>
      <AccordionItem>
        <AccordionToggle
          id={`span-${span.spanID}`}
          className="kobsio-jaeger-accordion-toggle"
          style={{ paddingLeft: `${padding}px` }}
          onClick={(): void => setExpanded(!expanded)}
          isExpanded={expanded}
        >
          <span>
            {processes[span.processID].serviceName}: {span.operationName}
          </span>
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {span.spanID}
            {doesSpanContainsError(span) ? (
              <ExclamationIcon
                className="pf-u-ml-sm pf-u-font-size-sm"
                style={{ color: 'var(--pf-global--danger-color--100)' }}
              />
            ) : null}
          </span>
          <span className="pf-u-font-size-sm pf-u-color-400" style={{ float: 'right' }}>
            {span.duration / 1000}ms
          </span>
          {!expanded && span.fill !== undefined && span.offset !== undefined ? time : null}
        </AccordionToggle>

        <AccordionContent id={`span-${span.spanID}`} isHidden={!expanded} isFixed={false}>
          <div style={{ paddingLeft: `${padding - 16}px` }}>
            {processes[span.processID].tags.length > 0 ? (
              <div className="pf-u-pb-md">
                Process:
                {processes[span.processID].tags.map((tag, index) => (
                  <Badge key={index} className="pf-u-ml-sm pf-u-mb-sm" isRead={true}>
                    {tag.key}: {tag.value}
                  </Badge>
                ))}
              </div>
            ) : null}
            {span.tags.length > 0 ? (
              <div className="pf-u-pb-md">
                Tags:
                {span.tags.map((tag, index) => (
                  <Badge key={index} className="pf-u-ml-sm pf-u-mb-sm" isRead={true}>
                    {tag.key}: {tag.value}
                  </Badge>
                ))}
              </div>
            ) : null}
            {span.logs.length > 0 ? (
              <div className="pf-u-pb-md">
                Logs:
                <JaegerSpanLogs logs={span.logs} />
              </div>
            ) : null}
          </div>

          {expanded && span.fill !== undefined && span.offset !== undefined ? time : null}
        </AccordionContent>
      </AccordionItem>

      {span.childs
        ? span.childs.map((span, index) => (
            <JaegerSpan key={index} span={span} processes={processes} padding={padding + 16} />
          ))
        : null}
    </React.Fragment>
  );
};

export default JaegerSpan;
