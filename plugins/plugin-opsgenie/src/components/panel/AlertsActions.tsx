import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, ITimes, pluginBasePath } from '@kobsio/shared';

interface IAlertsActionsProps {
  instance: IPluginInstance;
  queries: string[];
  type: string;
  times: ITimes;
  interval?: number;
}

export const AlertsActions: React.FunctionComponent<IAlertsActionsProps> = ({
  instance,
  queries,
  times,
  type,
  interval,
}: IAlertsActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  const adjustedTime: ITimes = interval
    ? { time: 'custom', timeEnd: Math.floor(Date.now() / 1000), timeStart: Math.floor(Date.now() / 1000) - interval }
    : times;

  return (
    <CardActions>
      <Dropdown
        toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
        isOpen={show}
        isPlain={true}
        position="right"
        dropdownItems={queries.map((query) => (
          <DropdownItem
            key={query}
            component={
              <Link
                to={`${pluginBasePath(instance)}?type=${type}&query=${encodeURIComponent(query)}&time=${
                  adjustedTime.time
                }&timeEnd=${adjustedTime.timeEnd}&timeStart=${adjustedTime.timeStart}`}
              >
                {query}
              </Link>
            }
          />
        ))}
      />
    </CardActions>
  );
};

export default AlertsActions;
