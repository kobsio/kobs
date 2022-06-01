import { CardActions, Dropdown, DropdownItem, KebabToggle, Spinner } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance } from '@kobsio/shared';
import { IQuery } from '../../utils/interfaces';

interface ISQLActionsProps {
  instance: IPluginInstance;
  queries: IQuery[];
  isFetching: boolean;
}

export const SQLActions: React.FunctionComponent<ISQLActionsProps> = ({
  instance,
  queries,
  isFetching,
}: ISQLActionsProps) => {
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
                <Link to={`/plugins/${instance.satellite}/${instance.type}/${instance.name}?query=${query.query}`}>
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

export default SQLActions;
