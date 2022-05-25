import { Alert, AlertActionLink, AlertVariant, Grid, GridItem, Spinner, Title } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { InView } from 'react-intersection-observer';

import { IDashboard, IRow, IVariableValues } from '../../crds/dashboard';
import { rowHeight, toGridSpans } from './utils/dashboards';
import DashboardToolbar from './DashboardToolbar';
import { ITimes } from '@kobsio/shared';
import PluginPanel from '../plugins/PluginPanel';
import { interpolate } from './utils/interpolate';

interface IDashboardProps {
  dashboard: IDashboard;
  forceDefaultSpan: boolean;
  setDetails?: (details: React.ReactNode) => void;
}

const Dashboard: React.FunctionComponent<IDashboardProps> = ({
  dashboard,
  forceDefaultSpan,
  setDetails,
}: IDashboardProps) => {
  const [times, setTimes] = useState<ITimes>({
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  const [variables, setVariables] = useState<IVariableValues[] | undefined>(
    dashboard.variables?.map((variable) => {
      return {
        ...variable,
        value: '',
        values: [],
      };
    }),
  );

  const { isError, error, data, refetch } = useQuery<IVariableValues[] | null, Error>(
    ['dashboard/variables', dashboard, variables, times],
    async () => {
      return [];
    },
    { keepPreviousData: true },
  );

  const rows: IRow[] = JSON.parse(interpolate(JSON.stringify(dashboard.rows), data ? data : [], times));
  const containsUnlimited = rows.filter((row) => row.size === -1).length > 0;

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Variables were not fetched"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IVariableValues[] | null, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  return (
    <React.Fragment>
      <DashboardToolbar variables={data} setVariables={setVariables} times={times} setTimes={setTimes} />

      <p>&nbsp;</p>

      <Grid hasGutter={true}>
        {rows.map((row, rowIndex) => (
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
                {containsUnlimited ? (
                  <div
                    className="kobsio-hide-scrollbar"
                    style={
                      row.size !== undefined && row.size === -1
                        ? undefined
                        : { height: rowHeight(row.size, panel.rowSpan), overflow: 'auto' }
                    }
                  >
                    <PluginPanel
                      title={panel.title}
                      description={panel.description}
                      satellite={panel.plugin.satellite}
                      type={panel.plugin.type}
                      name={panel.plugin.name}
                      options={panel.plugin.options}
                      times={times}
                      setDetails={setDetails}
                    />
                  </div>
                ) : (
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
                              title={panel.title}
                              description={panel.description}
                              satellite={panel.plugin.satellite}
                              type={panel.plugin.type}
                              name={panel.plugin.name}
                              options={panel.plugin.options}
                              times={times}
                              setDetails={setDetails}
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
                )}
              </GridItem>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </React.Fragment>
  );
};

export default Dashboard;
