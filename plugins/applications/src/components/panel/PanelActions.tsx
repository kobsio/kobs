import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface IPanelActionsProps {
  view: string;
  clusters: string[];
  namespaces: string[];
  tags: string[];
}

export const PanelActions: React.FunctionComponent<IPanelActionsProps> = ({
  view,
  clusters,
  namespaces,
  tags,
}: IPanelActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  const clusterParams = clusters.map((cluster) => `&cluster=${cluster}`).join('');
  const namespaceParams = namespaces.map((namespace) => `&namespace=${namespace}`).join('');
  const tagParams = tags.map((tag) => `&tag=${tag}`).join('');

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
              <Link to={`/applications?view=${view}${clusterParams}${namespaceParams}${tagParams}`}>Explore</Link>
            }
          />,
        ]}
      />
    </CardActions>
  );
};

export default PanelActions;
