import { Card, Select, SelectOption, SelectVariant, ToolbarItem } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';

interface IDetailsMetricsVirtualMachineToolbarProps {
  virtualMachines: string[];
  selectedVirtualMachine: string;
  setSelectedVirtualMachine: (virtualMachine: string) => void;
  times: IPluginTimes;
  setTimes: (times: IPluginTimes) => void;
}

const DetailsMetricsVirtualMachineToolbar: React.FunctionComponent<IDetailsMetricsVirtualMachineToolbarProps> = ({
  virtualMachines,
  selectedVirtualMachine,
  setSelectedVirtualMachine,
  times,
  setTimes,
}: IDetailsMetricsVirtualMachineToolbarProps) => {
  const [show, setShow] = useState<boolean>(false);

  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setTimes(times);
  };

  const changeSelectedVirtualMachine = (virtualMachine: string): void => {
    setShow(false);
    setSelectedVirtualMachine(virtualMachine);
  };

  return (
    <Card style={{ maxWidth: '100%' }}>
      <Toolbar times={times} showOptions={true} showSearchButton={false} setOptions={changeOptions}>
        <ToolbarItem>
          <Select
            variant={SelectVariant.typeahead}
            typeAheadAriaLabel="Virtual Machine"
            placeholderText="Virtual Machine"
            onToggle={(): void => setShow(!show)}
            onSelect={(e, value): void => changeSelectedVirtualMachine(value as string)}
            selections={selectedVirtualMachine}
            isOpen={show}
          >
            {virtualMachines.map((virtualMachine) => (
              <SelectOption key={virtualMachine} value={virtualMachine}>
                {virtualMachine}
              </SelectOption>
            ))}
          </Select>
        </ToolbarItem>
      </Toolbar>
    </Card>
  );
};

export default DetailsMetricsVirtualMachineToolbar;
