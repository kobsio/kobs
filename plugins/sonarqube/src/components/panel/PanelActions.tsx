import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';

interface IPanelActionsProps {
  url: string;
  project: string;
}

export const PanelActions: React.FunctionComponent<IPanelActionsProps> = ({ url, project }: IPanelActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <CardActions>
      <Dropdown
        toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
        isOpen={show}
        isPlain={true}
        position="right"
        dropdownItems={[
          <DropdownItem
            key={0}
            component={
              <a href={`${url}/dashboard?id=${project}`} target="_blank" rel="noreferrer">
                Show in SonarQube
              </a>
            }
          />,
        ]}
      />
    </CardActions>
  );
};

export default PanelActions;
