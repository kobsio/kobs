import { Card, Toolbar, ToolbarContent } from '@patternfly/react-core';
import React from 'react';

import { IOptionsAdditionalFields, ITimes, Options } from '@kobsio/shared';

interface IMetricsToolbarProps {
  times: ITimes;
  setTimes: (times: ITimes) => void;
}

const MetricsToolbar: React.FunctionComponent<IMetricsToolbarProps> = ({ times, setTimes }: IMetricsToolbarProps) => {
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setTimes(times);
  };

  return (
    <Card style={{ maxWidth: '100%' }}>
      <Toolbar>
        <ToolbarContent>
          <Options times={times} showOptions={true} showSearchButton={false} setOptions={changeOptions} />
        </ToolbarContent>
      </Toolbar>
    </Card>
  );
};

export default MetricsToolbar;
