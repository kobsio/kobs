import { Alert, AlertVariant, Card, CardBody, Spinner } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import ApplicationDetailsChartSparkline from './ApplicationDetailsChartSparkline';
import { IDatum } from './utils/interfaces';
import { IInsight } from '../../crds/application';
import { ITimes } from '@kobsio/shared';

interface IApplicationDetailsChartProps {
  insight: IInsight;
  times: ITimes;
}

const ApplicationDetailsChart: React.FunctionComponent<IApplicationDetailsChartProps> = ({
  insight,
  times,
}: IApplicationDetailsChartProps) => {
  const { isError, isLoading, error, data } = useQuery<IDatum[], Error>(
    ['app/applications/insight', insight, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/${insight.plugin.type}/insight?timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
          {
            body: JSON.stringify(insight.plugin.options),
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': insight.plugin.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': insight.plugin.satellite,
            },
            method: 'post',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <Alert variant={AlertVariant.danger} isInline={true} title={error?.message} />;
  }

  if (!data || data.length === 0) {
    return <Alert variant={AlertVariant.warning} isInline={true} title="No data found" />;
  }

  if (insight.type === 'sparkline') {
    return (
      <ApplicationDetailsChartSparkline
        title={insight.title}
        data={data}
        unit={insight.unit}
        mappings={insight.mappings}
        times={times}
      />
    );
  }

  if (insight.type === 'sparkline') {
    return (
      <Card isCompact={true}>
        <CardBody>
          <ApplicationDetailsChartSparkline
            title={insight.title}
            data={data}
            unit={insight.unit}
            mappings={insight.mappings}
            times={times}
          />
        </CardBody>
      </Card>
    );
  }

  return <Alert variant={AlertVariant.danger} isInline={true} title="Invalid insight type" />;
};

export default ApplicationDetailsChart;
