import { AccordionContent, AccordionItem, AccordionToggle } from '@patternfly/react-core';
import { ExclamationIcon } from '@patternfly/react-icons';
import React from 'react';

import { IProcess, ISpan } from '../../../utils/interfaces';
import SpanLogs from './SpanLogs';
import SpanTag from './SpanTag';
import { doesSpanContainsError } from '../../../utils/helpers';

const PADDING = 24;

export interface ISpanProps {
  name: string;
  span: ISpan;
  duration: number;
  startTime: number;
  processes: Record<string, IProcess>;
  expanded: boolean;
  setExpanded: (spanID: string) => void;
}

const Span: React.FunctionComponent<ISpanProps> = ({
  name,
  span,
  duration,
  startTime,
  processes,
  expanded,
  setExpanded,
}: ISpanProps) => {
  const offset = ((span.startTime - startTime) / 1000 / (duration / 1000)) * 100;
  const fill = (span.duration / 1000 / (duration / 1000)) * 100;

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
          left: `${offset}%`,
          position: 'absolute',
          width: `${fill}%`,
        }}
      ></span>
    </span>
  );

  const treeOffset = [];
  for (let index = 0; index < span.depth + 1; index++) {
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
    <AccordionItem>
      {treeOffset}
      <AccordionToggle
        id={`span-${span.spanID}`}
        className="kobsio-jaeger-accordion-toggle"
        style={{ paddingLeft: `${(span.depth + 1) * PADDING}px` }}
        onClick={(): void => setExpanded(span.spanID)}
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
        {!expanded && fill !== undefined && offset !== undefined ? time : null}
      </AccordionToggle>

      <AccordionContent id={`span-${span.spanID}`} isHidden={!expanded} isFixed={false}>
        <div style={{ paddingLeft: `${(span.depth + 1) * PADDING - 16}px` }}>
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
          {span.warnings.length > 0 ? (
            <div className="pf-u-pb-md">
              Warnings:
              {span.warnings.map((warning, index) => (
                <div key={index} className="pf-c-chip pf-u-ml-sm pf-u-mb-sm" style={{ maxWidth: '100%' }}>
                  <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
                    {warning}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {expanded && fill !== undefined && offset !== undefined ? time : null}
      </AccordionContent>
    </AccordionItem>
  );
};

export default Span;
