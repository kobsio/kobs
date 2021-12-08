import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

export interface ICostManagementToolbarItemTimeframeProps {
  timeframe: number;
  setTimeframe: (timeframe: number) => void;
}

// CostManagementToolbarItemTimeframe lets the user select the timeframe
const CostManagementToolbarItemTimeframe: React.FunctionComponent<ICostManagementToolbarItemTimeframeProps> = ({
  timeframe,
  setTimeframe,
}: ICostManagementToolbarItemTimeframeProps) => {
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const options = [{ value: '7' }, { value: '30' }];

  return (
    <Select
      variant={SelectVariant.single}
      typeAheadAriaLabel="Select timeframe"
      placeholderText="Select timeframe"
      onToggle={(): void => setShowSelect(!showSelect)}
      onSelect={(e, value): void => setTimeframe(value as number)}
      selections={timeframe}
      isOpen={showSelect}
    >
      {options.map((tf, index) => (
        <SelectOption key={index} value={tf.value} description="days" />
      ))}
    </Select>
  );
};

export default CostManagementToolbarItemTimeframe;
