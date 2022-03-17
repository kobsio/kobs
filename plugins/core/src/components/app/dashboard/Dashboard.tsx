import { Grid, GridItem, Title, gridSpans } from '@patternfly/react-core';
import React, { useRef } from 'react';
import { InView } from 'react-intersection-observer';

import { IDashboardRow, IDashboardVariableValues } from '../../../crds/dashboard';
import { IPluginTimes } from '../../../context/PluginsContext';
import { PluginPanel } from '../../plugin/PluginPanel';
import { interpolate } from '../../../utils/interpolate';
import { useDimensions } from '../../../utils/useDimensions';

export const toGridSpans = (defaultSpan: gridSpans, force: boolean, span: number | undefined): gridSpans => {
  if (!span || span < 1 || span > 12 || force) {
    return defaultSpan;
  }

  return span as gridSpans;
};

export const rowHeight = (rowSize: number | undefined, rowSpan: number | undefined): string => {
  if (!rowSize || rowSize < 1 || rowSize > 12) {
    rowSize = 2;
  }

  if (rowSpan && rowSpan > 1 && rowSpan <= 12) {
    return `${rowSize * 150 * rowSpan + (rowSpan - 1) * 16}px`;
  }

  return `${rowSize * 150}px`;
};

export interface IDashboardProps {
  cluster: string;
  namespace: string;
  rows: IDashboardRow[];
}

const Dashboard: React.FunctionComponent<IDashboardProps> = ({ cluster, namespace, rows }: IDashboardProps) => {
  const times: IPluginTimes = {
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  };
  const variables: IDashboardVariableValues[] = [
    {
      hide: true,
      label: '__cluster',
      name: '__cluster',
      plugin: {
        name: 'core',
        options: {
          items: [cluster],
          type: 'static',
        },
      },
      value: cluster,
      values: [cluster],
    },
    {
      hide: true,
      label: '__namespace',
      name: '__namespace',
      plugin: {
        name: 'core',
        options: {
          items: [namespace],
          type: 'static',
        },
      },
      value: namespace,
      values: [namespace],
    },
  ];
  const interpolateRows: IDashboardRow[] = JSON.parse(interpolate(JSON.stringify(rows), variables, times));

  const refGrid = useRef<HTMLDivElement>(null);
  const gridSize = useDimensions(refGrid);
  const forceDefaultSpan = gridSize.width < 1200;

  return (
    <div ref={refGrid}>
      {gridSize.width > 0 ? (
        <Grid hasGutter={true}>
          {interpolateRows.map((row, rowIndex) => (
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
                  <InView>
                    {({ inView, ref }): React.ReactNode => (
                      <div ref={ref}>
                        {inView ? (
                          <div
                            className="kobsio-hide-scrollbar"
                            style={
                              row.size !== undefined && row.size === -1
                                ? undefined
                                : { height: rowHeight(row.size, panel.rowSpan), overflow: 'auto' }
                            }
                          >
                            <PluginPanel
                              times={times}
                              title={panel.title}
                              description={panel.description}
                              name={panel.plugin.name}
                              options={panel.plugin.options}
                            />
                          </div>
                        ) : (
                          <div
                            className="kobsio-hide-scrollbar"
                            style={
                              row.size !== undefined && row.size === -1
                                ? undefined
                                : { height: rowHeight(row.size, panel.rowSpan), overflow: 'auto' }
                            }
                          ></div>
                        )}
                      </div>
                    )}
                  </InView>
                </GridItem>
              ))}
            </React.Fragment>
          ))}
        </Grid>
      ) : null}
    </div>
  );
};

export default Dashboard;
