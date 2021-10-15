import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginTimes } from '@kobsio/plugin-core';

interface IGraphActionsProps {
  name: string;
  namespaces: string[];
  times: IPluginTimes;
}

export const GraphActions: React.FunctionComponent<IGraphActionsProps> = ({
  name,
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
              <Link to={`/${name}?timeStart=${times.timeStart}&timeEnd${times.timeEnd}${namespaceParams.join('')}`}>
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
