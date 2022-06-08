import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface IPanelActionsProps {
  link: string;
}

export const PanelActions: React.FunctionComponent<IPanelActionsProps> = ({ link }: IPanelActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <CardActions>
      <Dropdown
        toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
        isOpen={show}
        isPlain={true}
        position="right"
        dropdownItems={[<DropdownItem key={0} component={<Link to={link}>Explore</Link>} />]}
      />
    </CardActions>
  );
};

export default PanelActions;
