import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';

interface ISearchActionsProps {
  instance: IPluginInstance;
}

export const SearchActions: React.FunctionComponent<ISearchActionsProps> = ({ instance }: ISearchActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Dropdown
      style={{ zIndex: 400 }}
      toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
      isOpen={show}
      isPlain={true}
      position="right"
      dropdownItems={[<DropdownItem key={0} component={<Link to={`${pluginBasePath(instance)}`}>Overview</Link>} />]}
    />
  );
};

export default SearchActions;
