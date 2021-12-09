import { CardActions, Dropdown, DropdownItem, KebabToggle, Spinner } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginTimes } from '@kobsio/plugin-core';
import { IQuery } from '../../utils/interfaces';

interface IActionsProps {
  name: string;
  isFetching: boolean;
  times: IPluginTimes;
  queries?: IQuery[];
}

export const Actions: React.FunctionComponent<IActionsProps> = ({
  name,
  isFetching,
  times,
  queries,
}: IActionsProps) => {
  const [show, setShow] = useState<boolean>(false);
  const queryParams = queries ? queries.map((query) => `&query=${query.query}`) : undefined;

  return (
    <CardActions>
      {isFetching ? (
        <Spinner size="md" />
      ) : queryParams ? (
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
                  to={`/${name}?time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}${
                    queryParams.length > 0 ? queryParams.join('') : ''
                  }`}
                >
                  Explore
                </Link>
              }
            />,
          ]}
        />
      ) : null}
    </CardActions>
  );
};

export default Actions;
