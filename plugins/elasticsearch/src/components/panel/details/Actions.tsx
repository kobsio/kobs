import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IDocument } from '../../../utils/interfaces';

interface IActionsProps {
  document: IDocument;
}

const Actions: React.FunctionComponent<IActionsProps> = ({ document }: IActionsProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  return (
    <React.Fragment>
      <Dropdown
        className="pf-c-drawer__close"
        toggle={<KebabToggle onToggle={(): void => setShowDropdown(!showDropdown)} />}
        isOpen={showDropdown}
        isPlain={true}
        position="right"
        dropdownItems={[
          <DropdownItem
            key={0}
            component={
              <a
                href={URL.createObjectURL(new Blob([JSON.stringify({ data: document }, null, 2)]))}
                download={`${document['_id']}__${document['_index']}.json`}
              >
                JSON
              </a>
            }
          />,
        ]}
      />
    </React.Fragment>
  );
};

export default Actions;
