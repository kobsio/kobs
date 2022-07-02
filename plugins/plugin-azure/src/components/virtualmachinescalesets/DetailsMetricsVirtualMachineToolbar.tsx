import { Card, Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IOptionsAdditionalFields, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';

interface IDetailsMetricsVirtualMachineToolbarProps {
  virtualMachines: string[];
  selectedVirtualMachine: string;
  setSelectedVirtualMachine: (virtualMachine: string) => void;
  times: ITimes;
  setTimes: (times: ITimes) => void;
}

const DetailsMetricsVirtualMachineToolbar: React.FunctionComponent<IDetailsMetricsVirtualMachineToolbarProps> = ({
  virtualMachines,
  selectedVirtualMachine,
  setSelectedVirtualMachine,
  times,
  setTimes,
}: IDetailsMetricsVirtualMachineToolbarProps) => {
  const [show, setShow] = useState<boolean>(false);

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setTimes(times);
  };

  const changeSelectedVirtualMachine = (virtualMachine: string): void => {
    setShow(false);
    setSelectedVirtualMachine(virtualMachine);
  };

  return (
    <Card style={{ maxWidth: '100%' }}>
      <Toolbar usePageInsets={true}>
        <ToolbarItem width="250px">
          <Select
            variant={SelectVariant.typeahead}
            typeAheadAriaLabel="Virtual Machine"
            placeholderText="Virtual Machine"
            onToggle={(): void => setShow(!show)}
            onSelect={(e, value): void => changeSelectedVirtualMachine(value as string)}
            onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
              virtualMachines
                .filter((virtualMachine) => !value || virtualMachine.toLowerCase().includes(value.toLowerCase()))
                .map((virtualMachine: string) => (
                  <SelectOption key={virtualMachine} value={virtualMachine}>
                    {virtualMachine}
                  </SelectOption>
                ))
            }
            selections={selectedVirtualMachine}
            isOpen={show}
            maxHeight="50vh"
          >
            {virtualMachines.map((virtualMachine) => (
              <SelectOption key={virtualMachine} value={virtualMachine}>
                {virtualMachine}
              </SelectOption>
            ))}
          </Select>
        </ToolbarItem>

        <Options times={times} showOptions={true} showSearchButton={false} setOptions={changeOptions} />
      </Toolbar>
    </Card>
  );
};

export default DetailsMetricsVirtualMachineToolbar;
