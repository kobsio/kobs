import { CardActions, Dropdown, DropdownItem, KebabToggle, Spinner } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginTimes } from '@kobsio/plugin-core';
import { IQuery } from '../../utils/interfaces';

interface IActionsProps {
  name: string;
  queries: IQuery[];
  times: IPluginTimes;
  isFetching: boolean;
}

export const Actions: React.FunctionComponent<IActionsProps> = ({
  name,
  queries,
  times,
  isFetching,
}: IActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <CardActions>
      {isFetching ? (
        <Spinner size="md" />
      ) : (
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
                  to={`/${name}?timeEnd=${times.timeEnd}&timeStart=${times.timeStart}&query=${query.query}${
                    query.fields ? query.fields.map((field) => `&field=${field}`).join('') : ''
                  }`}
                >
                  {query.name}
                </Link>
              }
            />
          ))}
        />
      )}
    </CardActions>
  );
};

export default Actions;
