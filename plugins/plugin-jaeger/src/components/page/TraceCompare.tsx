import { Grid, GridItem, PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance } from '@kobsio/shared';
import { ITrace } from '../../utils/interfaces';
import Spans from '../panel/details/Spans';
import TraceActions from '../panel/details/TraceActions';
import TraceHeader from '../panel/details/TraceHeader';

interface ITraceCompareProps {
  instance: IPluginInstance;
  trace: ITrace;
}

const TraceCompare: React.FunctionComponent<ITraceCompareProps> = ({ instance, trace }: ITraceCompareProps) => {
  return (
    <React.Fragment>
      <Grid style={{ minHeight: 'calc(100% - 78px)' }}>
        <GridItem sm={11} md={11} lg={11} xl={11} xl2={11}>
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
            <Title className="pf-u-text-nowrap pf-u-text-truncate" headingLevel="h6" size="xl">
              {trace.traceName}
              <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{trace.traceID}</span>
            </Title>
            <p>
              <TraceHeader trace={trace} />
            </p>
          </PageSection>
        </GridItem>

        <GridItem sm={1} md={1} lg={1} xl={1} xl2={1}>
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
            <div style={{ float: 'right', textAlign: 'right' }}>
              <TraceActions instance={instance} trace={trace} />
            </div>
          </PageSection>
        </GridItem>

        <GridItem style={{ minHeight: '100%' }} sm={12} md={12} lg={12} xl={12} xl2={12}>
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.default}>
            <Spans instance={instance} trace={trace} fixedHeight={false} />
          </PageSection>
        </GridItem>
      </Grid>
    </React.Fragment>
  );
};

export default TraceCompare;
