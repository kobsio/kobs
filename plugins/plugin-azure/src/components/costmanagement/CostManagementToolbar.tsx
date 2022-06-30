import React, { useState } from 'react';

import { IOptionsAdditionalFields, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import CostManagementToolbarItemScope from './CostManagementToolbarItemScope';
import { IOptions } from './interfaces';

export interface ICostManagementToolbarProps {
  resourceGroups: string[];
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const CostManagementToolbar: React.FunctionComponent<ICostManagementToolbarProps> = ({
  resourceGroups,
  options,
  setOptions,
}: ICostManagementToolbarProps) => {
  const [scope, setScope] = useState<string>(options.scope);

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({
      scope: scope,
      times: times,
    });
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem isLabel={true}>Scope</ToolbarItem>
      <ToolbarItem grow={true}>
        <CostManagementToolbarItemScope scope={scope} setScope={setScope} resourceGroups={resourceGroups} />
      </ToolbarItem>

      <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default CostManagementToolbar;
