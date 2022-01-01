import React, { useState } from 'react';
import { ToolbarItem } from '@patternfly/react-core';

import { IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';
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

  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({
      scope: scope,
      times: times,
    });
  };

  return (
    <Toolbar times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions}>
      <ToolbarItem variant="label">Scope</ToolbarItem>
      <ToolbarItem style={{ width: '100%' }}>
        <CostManagementToolbarItemScope scope={scope} setScope={setScope} resourceGroups={resourceGroups} />
      </ToolbarItem>
    </Toolbar>
  );
};

export default CostManagementToolbar;
