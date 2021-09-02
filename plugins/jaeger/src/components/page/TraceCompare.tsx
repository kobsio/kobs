import { Grid, GridItem, PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import React from 'react';

import { ITrace } from '../../utils/interfaces';
import Spans from '../panel/details/Spans';
import TraceActions from '../panel/details/TraceActions';
import TraceHeader from '../panel/details/TraceHeader';

interface ITraceCompareProps {
  name: string;
  trace: ITrace;
}

const TraceCompare: React.FunctionComponent<ITraceCompareProps> = ({ name, trace }: ITraceCompareProps) => {
  return (
    <React.Fragment>
      <Grid>
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
              <TraceActions name={name} trace={trace} />
            </div>
          </PageSection>
        </GridItem>

        <GridItem sm={12} md={12} lg={12} xl={12} xl2={12}>
          <PageSection variant={PageSectionVariants.default}>
            <div style={{ position: 'relative' }}>
              <Spans name={name} trace={trace} />
            </div>
          </PageSection>
        </GridItem>
      </Grid>
    </React.Fragment>
  );
};

export default TraceCompare;
