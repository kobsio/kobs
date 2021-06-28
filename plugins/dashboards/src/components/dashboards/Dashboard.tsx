import { Grid, GridItem, Title, gridSpans } from '@patternfly/react-core';
import React, { useEffect, useRef, useState } from 'react';

import { IPluginDefaults, PluginPanel, useWindowWidth } from '@kobsio/plugin-core';
import { IDashboard } from '../../utils/interfaces';

const toGridSpans = (defaultSpan: gridSpans, force: boolean, span: number | undefined): gridSpans => {
  if (!span || span < 1 || span > 12 || force) {
    return defaultSpan;
  }

  return span as gridSpans;
};

const rowHeight = (rowSize: number | undefined, rowSpan: number | undefined): string => {
  if (!rowSize || rowSize < 1 || rowSize > 12) {
    rowSize = 2;
  }

  if (rowSpan && rowSpan > 1 && rowSpan <= 12) {
    return `${rowSize * 150 * rowSpan + (rowSpan - 1) * 16}px`;
  }

  return `${rowSize * 150}px`;
};

interface IDashboardProps {
  defaults: IPluginDefaults;
  dashboard: IDashboard;
  showDetails?: (details: React.ReactNode) => void;
}

const Dashboard: React.FunctionComponent<IDashboardProps> = ({ defaults, dashboard, showDetails }: IDashboardProps) => {
  const width = useWindowWidth();
  const refGrid = useRef<HTMLDivElement>(null);
  const [forceDefaultSpan, setForceDefaultSpan] = useState<boolean>(false);

  // useEffect is executed every time the window width changes, to determin the size of the grid and use a static span
  // size of 12 if necessary. We have to use the with of the grid instead of the window width, because it is possible
  // that the chart is rendered in a drawer (e.g. for applications in the applications page).
  useEffect(() => {
    if (refGrid && refGrid.current) {
      if (refGrid.current.getBoundingClientRect().width >= 1200) {
        setForceDefaultSpan(false);
      } else {
        setForceDefaultSpan(true);
      }
    }
  }, [width]);

  return (
    <div ref={refGrid}>
      <Grid hasGutter={true}>
        {dashboard.rows.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.title ? (
              <Title headingLevel="h6" size="lg">
                {row.title}
              </Title>
            ) : null}
            {row.panels.map((panel, panelIndex) => (
              <GridItem
                key={panelIndex}
                span={toGridSpans(12, forceDefaultSpan, panel.colSpan)}
                rowSpan={toGridSpans(1, forceDefaultSpan, panel.rowSpan)}
              >
                <div
                  style={
                    row.size !== undefined && row.size === -1
                      ? undefined
                      : { height: rowHeight(row.size, panel.rowSpan), overflow: 'scroll' }
                  }
                >
                  <PluginPanel
                    defaults={defaults}
                    title={panel.title}
                    description={panel.description}
                    name={panel.plugin.name}
                    options={panel.plugin.options}
                    showDetails={showDetails}
                  />
                </div>
              </GridItem>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </div>
  );
};

export default Dashboard;
