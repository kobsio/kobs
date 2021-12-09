import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IOptions } from '../../utils/interfaces';

interface IIncidentsActionsProps extends IOptions {
  name: string;
}

export const IncidentsActions: React.FunctionComponent<IIncidentsActionsProps> = ({
  name,
  query,
  times,
  type,
}: IIncidentsActionsProps) => {
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
                to={`/${name}?type=${type}&query=${encodeURIComponent(query)}&time=${times.time}&timeEnd=${
                  times.timeEnd
                }&timeStart=${times.timeStart}`}
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

export default IncidentsActions;
