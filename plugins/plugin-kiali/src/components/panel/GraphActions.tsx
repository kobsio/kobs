import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, ITimes, pluginBasePath } from '@kobsio/shared';

interface IGraphActionsProps {
  instance: IPluginInstance;
  namespaces: string[];
  times: ITimes;
}

export const GraphActions: React.FunctionComponent<IGraphActionsProps> = ({
  instance,
  namespaces,
  times,
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
            component={
              <Link
                to={`${pluginBasePath(instance)}?time=${times.time}&timeStart=${times.timeStart}&timeEnd${
                  times.timeEnd
                }${namespaceParams.join('')}`}
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

export default GraphActions;
