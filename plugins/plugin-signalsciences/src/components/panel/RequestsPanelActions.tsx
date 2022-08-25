import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, ITimes, pluginBasePath } from '@kobsio/shared';

interface IRequestsPanelActionsProps {
  instance: IPluginInstance;
  siteName: string;
  query: string;
  times: ITimes;
}

export const RequestsPanelActions: React.FunctionComponent<IRequestsPanelActionsProps> = ({
  instance,
  siteName,
  query,
  times,
}: IRequestsPanelActionsProps) => {
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
                to={`${pluginBasePath(instance)}/requests?query=${encodeURIComponent(
                  query,
                )}&siteName=${encodeURIComponent(siteName)}&time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${
                  times.timeStart
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

export default RequestsPanelActions;
