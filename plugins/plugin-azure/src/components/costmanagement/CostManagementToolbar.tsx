import React, { useState } from 'react';
import { ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';

import { IOptionsAdditionalFields, ITimes, Options } from '@kobsio/shared';
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
    <ToolbarContent>
      <ToolbarGroup style={{ width: '100%' }}>
        <ToolbarItem variant="label">Scope</ToolbarItem>
        <ToolbarItem style={{ width: '100%' }}>
          <CostManagementToolbarItemScope scope={scope} setScope={setScope} resourceGroups={resourceGroups} />
        </ToolbarItem>

        <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
      </ToolbarGroup>
    </ToolbarContent>
  );
};

export default CostManagementToolbar;
