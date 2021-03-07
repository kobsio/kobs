import {
  Card,
  CardBody,
  Flex,
  FlexItem,
  SimpleList,
  SimpleListItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { DatasourceMetrics } from 'generated/proto/datasources_pb';
import DefaultChart from 'components/applications/details/metrics/charts/Default';

interface IDataProps {
  data: DatasourceMetrics[];
}

// Data is used to render the fetched time series, for a user provided query. By default the corresponding chart will
// render all loaded time series. When the user selects a specif time series, the chart will only render this series.
// A user can also decided, how he wants to see his data: As line vs. area chart or unstacked vs. stacked.
const Data: React.FunctionComponent<IDataProps> = ({ data }: IDataProps) => {
  const [type, setType] = useState<string>('line');
  const [stacked, setStacked] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<DatasourceMetrics[]>([]);

  const select = (series: DatasourceMetrics): void => {
    if (selectedData.length === 1 && selectedData[0].getLabel() === series.getLabel()) {
      setSelectedData(data);
    } else {
      setSelectedData([series]);
    }
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <Card isFlat={true}>
      <CardBody>
        <Flex>
          <FlexItem>
            <ToggleGroup aria-label="Chart Type">
              <ToggleGroupItem text="Line" isSelected={type === 'line'} onChange={(): void => setType('line')} />
              <ToggleGroupItem text="Area" isSelected={type === 'area'} onChange={(): void => setType('area')} />
            </ToggleGroup>
          </FlexItem>
          <FlexItem>
            <ToggleGroup aria-label="Stacked Chart">
              <ToggleGroupItem text="Unstacked" isSelected={!stacked} onChange={(): void => setStacked(false)} />
              <ToggleGroupItem text="Stacked" isSelected={stacked} onChange={(): void => setStacked(true)} />
            </ToggleGroup>
          </FlexItem>
        </Flex>

        <p>&nbsp;</p>

        <DefaultChart
          type={type}
          unit=""
          stacked={stacked}
          disableLegend={true}
          metrics={selectedData.length === 0 ? data : selectedData}
        />

        <p>&nbsp;</p>

        <SimpleList aria-label="Prometheus Data" isControlled={false}>
          {data.map((series, index) => (
            <SimpleListItem
              key={index}
              onClick={(): void => select(series)}
              isActive={selectedData.length === 1 && selectedData[0].getLabel() === series.getLabel()}
            >
              {series.getLabel()}
              <span style={{ float: 'right' }}>{series.getDataList()[series.getDataList().length - 1].getY()}</span>
            </SimpleListItem>
          ))}
        </SimpleList>
      </CardBody>
    </Card>
  );
};

export default Data;
