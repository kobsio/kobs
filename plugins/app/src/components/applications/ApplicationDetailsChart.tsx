import { Alert, AlertVariant, Card, CardBody, Spinner } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from 'react-query';

import ApplicationDetailsChartSparkline from './ApplicationDetailsChartSparkline';
import { IDatum } from './utils/interfaces';
import { IPreview } from '../../crds/application';
import { ITimes } from '@kobsio/shared';

interface IApplicationDetailsChartProps {
  preview: IPreview;
  times: ITimes;
}

const ApplicationDetailsChart: React.FunctionComponent<IApplicationDetailsChartProps> = ({
  preview,
  times,
}: IApplicationDetailsChartProps) => {
  const { isError, isLoading, error, data } = useQuery<IDatum[], Error>(
    ['app/applications/preview', preview, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/${preview.plugin.type}/preview?timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
          {
            body: JSON.stringify(preview.plugin.options),
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': preview.plugin.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': preview.plugin.satellite,
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

  if (preview.type === 'sparkline') {
    return (
      <ApplicationDetailsChartSparkline
        title={preview.title}
        data={data}
        unit={preview.unit}
        mappings={preview.mappings}
        times={times}
      />
    );
  }

  if (preview.type === 'sparkline') {
    return (
      <Card isCompact={true}>
        <CardBody>
          <ApplicationDetailsChartSparkline
            title={preview.title}
            data={data}
            unit={preview.unit}
            mappings={preview.mappings}
            times={times}
          />
        </CardBody>
      </Card>
    );
  }

  return <Alert variant={AlertVariant.danger} isInline={true} title="Invalid preview type" />;
};

export default ApplicationDetailsChart;
