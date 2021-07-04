import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginTimes } from '@kobsio/plugin-core';

interface IActionsProps {
  name: string;
  query: string;
  fields?: string[];
  times: IPluginTimes;
}

export const Actions: React.FunctionComponent<IActionsProps> = ({ name, query, fields, times }: IActionsProps) => {
  const [show, setShow] = useState<boolean>(false);
  const fieldParams = fields ? fields.map((field) => `&field=${field}`) : undefined;

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
                to={`/${name}?time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}&query=${query}${
                  fieldParams && fieldParams.length > 0 ? fieldParams.join('') : ''
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

export default Actions;
