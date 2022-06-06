import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance } from '@kobsio/shared';

interface IAggregationPageActionsProps {
  instance: IPluginInstance;
}

export const AggregationPageActions: React.FunctionComponent<IAggregationPageActionsProps> = ({
  instance,
}: IAggregationPageActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <span style={{ float: 'right', position: 'absolute', right: 0, top: 0 }}>
      <Dropdown
        style={{ zIndex: 400 }}
        toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
        isOpen={show}
        isPlain={true}
        position="right"
        dropdownItems={[
          <DropdownItem
            key={0}
            component={<Link to={`/plugins/${instance.satellite}/${instance.type}/${instance.name}`}>Logs</Link>}
          />,
          <DropdownItem
            key={1}
            component={
              <a href="https://kobs.io/main/plugins/klogs/" target="_blank" rel="noreferrer">
                Documentation
              </a>
            }
          />,
        ]}
      />
    </span>
  );
};

export default AggregationPageActions;