import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPanelOptions } from '../../utils/interfaces';

interface IPanelActionsProps {
  options: IPanelOptions[];
}

export const PanelActions: React.FunctionComponent<IPanelActionsProps> = ({ options }: IPanelActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <CardActions>
      <Dropdown
        toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
        isOpen={show}
        isPlain={true}
        position="right"
        dropdownItems={options.map((option, index) => (
          <DropdownItem
            key={index}
            component={
              <Link
                to={`/helm?${option.clusters ? option.clusters.map((cluster) => `&cluster=${cluster}`).join('') : ''}${
                  option.namespaces ? option.namespaces.map((namespace) => `&namespace=${namespace}`).join('') : ''
                }`}
              >
                Explore
              </Link>
            }
          />
        ))}
      />
    </CardActions>
  );
};

export default PanelActions;
