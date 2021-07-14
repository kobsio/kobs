import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IOptions } from '../../utils/interfaces';

interface ITracesActionsProps extends IOptions {
  name: string;
}

export const TracesActions: React.FunctionComponent<ITracesActionsProps> = ({
  name,
  limit,
  maxDuration,
  minDuration,
  operation,
  service,
  tags,
  times,
}: ITracesActionsProps) => {
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
                to={`/${name}?limit=${limit}&maxDuration=${maxDuration}&minDuration=${minDuration}&operation=${operation}&service=${service}&tags=${tags}&time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}`}
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

export default TracesActions;
