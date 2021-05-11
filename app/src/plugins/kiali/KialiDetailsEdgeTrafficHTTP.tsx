import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { ChartBullet, ChartThemeColor } from '@patternfly/react-charts';
import React, { useEffect, useRef, useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Edge, Response } from 'proto/kiali_grpc_web_pb';

interface IRates {
  http: number;
  httpPercentErr: number;
  httpPercentSuc: number;
}

// getTableDataFromRates is used to generate the data for the traffic table. For that we have to get the rate and errors
// from the "http" and "httpPercentErr" field in the rates map. The percent value for successfull requests is generated,
// by subtracting the percent value for the errors.
const getTableDataFromRates = (ratesMap: [string, string][]): IRates => {
  let http = 0;
  let httpPercentErr = 0;

  for (const rate of ratesMap) {
    if (rate[0] === 'http') {
      http = parseFloat(rate[1]);
    } else if (rate[0] === 'httpPercentErr') {
      httpPercentErr = parseFloat(rate[1]);
    }
  }

  return {
    http: http,
    httpPercentErr: httpPercentErr,
    httpPercentSuc: 100 - httpPercentErr,
  };
};

// IPercentag is the interface for the bullet chart data. It contains the name of the data point, a value with the real
// percentage for a status code and a y value which is used for rendering. The y value is the value + the value of all
// percentages, which are rendered befor.
interface IPercentag {
  name: string;
  value: number;
  y: number;
}

const sumFlagPercentages = (flagsMap: [string, string][]): number => {
  let sum = 0;

  for (const flag of flagsMap) {
    sum = sum + parseFloat(flag[1]);
  }

  return sum;
};

// getGraphDataFromResponses is used to generate the data for the bullet chart. It contains the distribution of the
// requests by there status code. To be able to render the chart we also have to add a value, which also contains the
// sum of all values, which are rendered befor.
const getGraphDataFromResponses = (responsesMap: [string, Response.AsObject][]): IPercentag[] => {
  let http3xxResponse = 0;
  let http4xxResponse = 0;
  let http5xxResponse = 0;

  for (const response of responsesMap) {
    if (response[0].startsWith('3')) {
      http3xxResponse = sumFlagPercentages(response[1].flagsMap);
    } else if (response[0].startsWith('4')) {
      http4xxResponse = sumFlagPercentages(response[1].flagsMap);
    } else if (response[0].startsWith('5')) {
      http5xxResponse = sumFlagPercentages(response[1].flagsMap);
    }
  }

  const http2xxResponse = 100 - http3xxResponse - http4xxResponse - http5xxResponse;

  const percentages: IPercentag[] = [];
  percentages.push({ name: '2xx', value: http2xxResponse, y: http2xxResponse });
  percentages.push({ name: '3xx', value: http3xxResponse, y: percentages[0].y + http3xxResponse });
  percentages.push({ name: '4xx', value: http4xxResponse, y: percentages[1].y + http4xxResponse });
  percentages.push({ name: '5xx', value: http5xxResponse, y: percentages[2].y + http5xxResponse });

  return percentages;
};

interface IKialiDetailsEdgeTrafficHTTPProps {
  edge: Edge.AsObject;
}

// KialiDetailsEdgeTrafficHTTP is the component for the tabs content for the traffic details of an http edge. It
// displays a table (rate, success, error) and bullet chart with the percent values for the different status codes (2xx,
// 3xx, 4xx, 5xx).
const KialiDetailsEdgeTrafficHTTP: React.FunctionComponent<IKialiDetailsEdgeTrafficHTTPProps> = ({
  edge,
}: IKialiDetailsEdgeTrafficHTTPProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  const rates = edge.traffic?.ratesMap ? getTableDataFromRates(edge.traffic?.ratesMap) : undefined;
  const percentages = edge.traffic?.responsesMap ? getGraphDataFromResponses(edge.traffic?.responsesMap) : undefined;

  // useEffect is executed on every render of this component. This is needed, so that we are able to use a width of 100%
  // and a static height for the chart.
  useEffect(() => {
    if (refChart && refChart.current) {
      setWidth(refChart.current.getBoundingClientRect().width);
      setHeight(refChart.current.getBoundingClientRect().height);
    }
  }, []);

  return (
    <Card isCompact={true}>
      <CardTitle>HTTP requests per second</CardTitle>
      <CardBody>
        {rates ? (
          <TableComposable aria-label="Rates" variant={TableVariant.compact} borders={false}>
            <Thead>
              <Tr>
                <Th>Total</Th>
                <Th>Success (%)</Th>
                <Th>Error (%)</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td dataLabel="Total">{rates.http}</Td>
                <Td dataLabel="Success (%)">{rates.httpPercentSuc}</Td>
                <Td dataLabel="Error (%)">{rates.httpPercentErr}</Td>
              </Tr>
            </Tbody>
          </TableComposable>
        ) : null}
        <div style={{ height: '150px', width: '100%' }} ref={refChart}>
          {percentages ? (
            <ChartBullet
              constrainToVisibleArea={true}
              height={height}
              labels={({ datum }): string => `${datum.name}: ${datum.value.toFixed(2)}`}
              maxDomain={{ y: 100 }}
              padding={{
                bottom: 10,
                left: 10,
                right: 10,
                top: 0,
              }}
              primarySegmentedMeasureData={percentages}
              primarySegmentedMeasureLegendData={percentages.map((percentage) => {
                return { name: percentage.name };
              })}
              themeColor={ChartThemeColor.multiOrdered}
              width={width}
            />
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
};

export default KialiDetailsEdgeTrafficHTTP;
