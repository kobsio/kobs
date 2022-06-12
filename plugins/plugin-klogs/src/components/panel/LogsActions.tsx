import { CardActions, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, ITimes, pluginBasePath } from '@kobsio/shared';
import { IQuery } from '../../utils/interfaces';

interface IActionsProps {
  instance: IPluginInstance;
  queries: IQuery[];
  times: ITimes;
}

export const Actions: React.FunctionComponent<IActionsProps> = ({ instance, queries, times }: IActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <CardActions>
      <Dropdown
        toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
        isOpen={show}
        isPlain={true}
        position="right"
        dropdownItems={queries.map((query, index) => (
          <DropdownItem
            key={index}
            component={
              <Link
                to={`${pluginBasePath(instance)}?time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${
                  times.timeStart
                }&query=${query.query}${query.fields ? query.fields.map((field) => `&field=${field}`).join('') : ''}`}
              >
                {query.name}
              </Link>
            }
          />
        ))}
      />
    </CardActions>
  );
};

export default Actions;
