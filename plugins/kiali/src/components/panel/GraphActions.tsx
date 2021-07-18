import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface IGraphActionsProps {
  name: string;
  namespaces: string[];
  duration: number;
}

export const GraphActions: React.FunctionComponent<IGraphActionsProps> = ({
  name,
  namespaces,
  duration,
}: IGraphActionsProps) => {
  const [show, setShow] = useState<boolean>(false);
  const namespaceParams = namespaces ? namespaces.map((namespace) => `&namespace=${namespace}`) : [];

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
            component={<Link to={`/${name}?duration=${duration}${namespaceParams.join('')}`}>Explore</Link>}
          />,
        ]}
      />
    </CardActions>
  );
};

export default GraphActions;
