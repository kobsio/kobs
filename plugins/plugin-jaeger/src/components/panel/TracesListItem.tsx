import {
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Label,
  LabelProps,
} from '@patternfly/react-core';
import { ExclamationIcon } from '@patternfly/react-icons';
import React from 'react';

import { IPluginInstance, LinkWrapper } from '@kobsio/shared';
import { doesTraceContainsError, formatTraceTime } from '../../utils/helpers';
import { ITrace } from '../../utils/interfaces';
import { getColorForService } from '../../utils/colors';

interface ITracesListItemProps {
  instance: IPluginInstance;
  trace: ITrace;
  setDetails?: (details: React.ReactNode) => void;
}

const TracesListItem: React.FunctionComponent<ITracesListItemProps> = ({
  instance,
  trace,
  setDetails,
}: ITracesListItemProps) => {
  const item = (
    <DataListItem id={trace.traceID} aria-labelledby={trace.traceID}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <p>
                    {trace.traceName}
                    <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{trace.traceID}</span>
                    {doesTraceContainsError(trace) ? (
                      <ExclamationIcon
                        className="pf-u-ml-sm pf-u-font-size-sm"
                        style={{ color: 'var(--pf-global--danger-color--100)' }}
                      />
                    ) : null}
                  </p>
                </FlexItem>
                <Flex>
                  <FlexItem>
                    <Label color="grey">{trace.spans.length} Spans</Label>
                  </FlexItem>

                  {trace.services && trace.services.length > 0 && (
                    <FlexItem>
                      {trace.services.map((service, index) => (
                        <Label
                          key={index}
                          className="pf-u-mr-sm"
                          color={getColorForService(trace.processes, service.name) as LabelProps['color']}
                        >
                          {service.name} ({service.numberOfSpans})
                        </Label>
                      ))}
                    </FlexItem>
                  )}
                </Flex>
              </Flex>
            </DataListCell>,
          ]}
        />
        <DataListAction aria-labelledby={trace.traceID} id={trace.traceID} aria-label="Actions">
          <span>
            {trace.duration / 1000}ms
            <br />
            <span className="pf-u-font-size-sm pf-u-color-400">{formatTraceTime(trace.startTime)}</span>
          </span>
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  );

  if (!setDetails) {
    return (
      <LinkWrapper to={`/plugins/${instance.satellite}/${instance.type}/${instance.name}/trace/${trace.traceID}`}>
        {item}
      </LinkWrapper>
    );
  }

  return item;
};

export default TracesListItem;
