import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface IPanelActionsProps {
  view: string;
  clusters: string[];
  namespaces: string[];
}

export const PanelActions: React.FunctionComponent<IPanelActionsProps> = ({
  view,
  clusters,
  namespaces,
}: IPanelActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  const clusterParams = clusters.map((cluster) => `&cluster=${cluster}`).join('');
  const namespaceParams = namespaces.map((namespace) => `&namespace=${namespace}`).join('');

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
            component={<Link to={`/applications?view=${view}${clusterParams}${namespaceParams}`}>Explore</Link>}
          />,
        ]}
      />
    </CardActions>
  );
};

export default PanelActions;
