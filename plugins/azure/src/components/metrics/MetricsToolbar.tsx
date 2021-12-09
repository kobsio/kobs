import { Card } from '@patternfly/react-core';
import React from 'react';

import { IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';

interface IMetricsToolbarProps {
  times: IPluginTimes;
  setTimes: (times: IPluginTimes) => void;
}

const MetricsToolbar: React.FunctionComponent<IMetricsToolbarProps> = ({ times, setTimes }: IMetricsToolbarProps) => {
  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setTimes(times);
  };

  return (
    <Card style={{ maxWidth: '100%' }}>
      <Toolbar times={times} showOptions={true} showSearchButton={false} setOptions={changeOptions} />
    </Card>
  );
};

export default MetricsToolbar;
