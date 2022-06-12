import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';

interface IPanelActionsProps {
  instance: IPluginInstance;
  options: IPanelOptions;
}

export const PanelActions: React.FunctionComponent<IPanelActionsProps> = ({
  instance,
  options,
}: IPanelActionsProps) => {
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
              <Link
                to={`${pluginBasePath(instance)}?${
                  options.clusters ? options.clusters.map((cluster) => `&cluster=${cluster}`).join('') : ''
                }${
                  options.namespaces ? options.namespaces.map((namespace) => `&namespace=${namespace}`).join('') : ''
                }`}
              >
                Explore
              </Link>
            }
          />,
        ]}
      />
    </CardActions>
  );
};

export default PanelActions;
