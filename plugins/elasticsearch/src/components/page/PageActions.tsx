import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';

interface IPageActionsProps {
  name: string;
}

export const PageActions: React.FunctionComponent<IPageActionsProps> = ({ name }: IPageActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <span style={{ float: 'right', position: 'absolute', right: 0, top: 0 }}>
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
    </span>
  );
};

export default PageActions;
