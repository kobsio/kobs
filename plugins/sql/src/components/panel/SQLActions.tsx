import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IQuery } from '../../utils/interfaces';

interface IActionsProps {
  name: string;
  queries: IQuery[];
}

export const Actions: React.FunctionComponent<IActionsProps> = ({ name, queries }: IActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <CardActions>
      <Dropdown
        toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
        isOpen={show}
        isPlain={true}
        position="right"
        dropdownItems={queries.map((query, index) => (
          <DropdownItem key={index} component={<Link to={`/${name}?query=${query.query}`}>{query.name}</Link>} />
        ))}
      />
    </CardActions>
  );
};

export default Actions;
