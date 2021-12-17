import { Badge, MenuItem } from '@patternfly/react-core';
import { ExclamationIcon } from '@patternfly/react-icons';
import React from 'react';

import { LinkWrapper } from '@kobsio/plugin-core';

import { doesTraceContainsError, formatTraceTime } from '../../utils/helpers';
import { ITrace } from '../../utils/interfaces';
import Trace from './details/Trace';
import { getColorForService } from '../../utils/colors';

interface ITracesListItemProps {
  name: string;
  trace: ITrace;
  setDetails?: (details: React.ReactNode) => void;
}

const TracesListItem: React.FunctionComponent<ITracesListItemProps> = ({
  name,
  trace,
  setDetails,
}: ITracesListItemProps) => {
  const item = (
    <MenuItem
      className="kobsio-jaeger-trace-list-item"
      description={
        <span>
          <Badge className="pf-u-mr-xl" isRead={true}>
            {trace.spans.length} Spans
          </Badge>

          {trace.services.map((service, index) => (
            <Badge
              key={index}
              className="pf-u-ml-sm"
              style={{ backgroundColor: getColorForService(trace.processes, service.name) }}
            >
              {service.name} ({service.numberOfSpans})
            </Badge>
          ))}

          <span className="pf-u-float-right pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {formatTraceTime(trace.startTime)}
          </span>
        </span>
      }
      onClick={
        setDetails
          ? (): void => setDetails(<Trace name={name} trace={trace} close={(): void => setDetails(undefined)} />)
          : undefined
      }
    >
      {trace.traceName}
      <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
        {trace.traceID}
        {doesTraceContainsError(trace) ? (
          <ExclamationIcon
            className="pf-u-ml-sm pf-u-font-size-sm"
            style={{ color: 'var(--pf-global--danger-color--100)' }}
          />
        ) : null}
      </span>
      <span className="pf-u-float-right pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{trace.duration / 1000}ms</span>
    </MenuItem>
  );

  if (!setDetails) {
    return <LinkWrapper link={`/${name}/trace/${trace.traceID}`}>{item}</LinkWrapper>;
  }

  return item;
};

export default TracesListItem;
