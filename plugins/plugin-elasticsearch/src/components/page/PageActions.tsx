import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';

export const PageActions: React.FunctionComponent = () => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Dropdown
      style={{ zIndex: 400 }}
      toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
      isOpen={show}
      isPlain={true}
      position="right"
      dropdownItems={[
        <DropdownItem
          key={0}
          component={
            <a href="https://kobs.io/main/plugins/elasticsearch/" target="_blank" rel="noreferrer">
              Documentation
            </a>
          }
        />,
      ]}
    />
  );
};

export default PageActions;
