import { AccordionContent, AccordionItem, AccordionToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { ExclamationIcon } from '@patternfly/react-icons';

import { IProcesses, ISpan } from '../../../utils/interfaces';
import SpanLogs from './SpanLogs';
import SpanTag from './SpanTag';
import { doesSpanContainsError } from '../../../utils/helpers';

const PADDING = 24;

export interface ISpanProps {
  name: string;
  span: ISpan;
  processes: IProcesses;
  level: number;
}

const Span: React.FunctionComponent<ISpanProps> = ({ name, span, processes, level }: ISpanProps) => {
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

  const treeOffset = [];
  for (let index = 0; index < level; index++) {
    if (index > 0) {
      treeOffset.push(
        <span
          key={index}
          style={{
            borderRight: '1px dashed #8a8d90',
            height: '40px',
            paddingLeft: `${(index + 1) * PADDING - PADDING / 2}px`,
            position: 'absolute',
            zIndex: 300,
          }}
        ></span>,
      );
    }
  }

  return (
    <React.Fragment>
      <AccordionItem>
        {treeOffset}
        <AccordionToggle
          id={`span-${span.spanID}`}
          className="kobsio-jaeger-accordion-toggle"
          style={{ paddingLeft: `${level * PADDING}px` }}
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
          <div style={{ paddingLeft: `${level * PADDING - 16}px` }}>
            {processes[span.processID].tags.length > 0 ? (
              <div className="pf-u-pb-md">
                Process:
                {processes[span.processID].tags.map((tag, index) => (
                  <SpanTag key={index} tag={tag} />
                ))}
              </div>
            ) : null}
            {span.tags.length > 0 ? (
              <div className="pf-u-pb-md">
                Tags:
                {span.tags.map((tag, index) => (
                  <SpanTag key={index} tag={tag} />
                ))}
              </div>
            ) : null}
            {span.logs.length > 0 ? (
              <div className="pf-u-pb-md">
                Logs:
                <SpanLogs logs={span.logs} />
              </div>
            ) : null}
          </div>

          {expanded && span.fill !== undefined && span.offset !== undefined ? time : null}
        </AccordionContent>
      </AccordionItem>

      {span.childs
        ? span.childs.map((span, index) => (
            <Span key={index} name={name} span={span} processes={processes} level={level + 1} />
          ))
        : null}
    </React.Fragment>
  );
};

export default Span;
