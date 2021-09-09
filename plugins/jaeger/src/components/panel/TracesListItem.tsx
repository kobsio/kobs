import { Badge, Card, CardActions, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
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
  showDetails?: (details: React.ReactNode) => void;
}

const TracesListItem: React.FunctionComponent<ITracesListItemProps> = ({
  name,
  trace,
  showDetails,
}: ITracesListItemProps) => {
  const card = (
    <Card
      style={{ cursor: 'pointer' }}
      isCompact={true}
      isHoverable={true}
      onClick={
        showDetails
          ? (): void => showDetails(<Trace name={name} trace={trace} close={(): void => showDetails(undefined)} />)
          : undefined
      }
    >
      <CardHeader>
        <CardTitle>
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
        </CardTitle>
        <CardActions>
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{trace.duration / 1000}ms</span>
        </CardActions>
      </CardHeader>
      <CardBody>
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

        <span style={{ float: 'right' }}>{formatTraceTime(trace.startTime)}</span>
      </CardBody>
    </Card>
  );

  if (!showDetails) {
    return <LinkWrapper link={`/${name}/trace/${trace.traceID}`}>{card}</LinkWrapper>;
  }

  return card;
};

export default TracesListItem;
