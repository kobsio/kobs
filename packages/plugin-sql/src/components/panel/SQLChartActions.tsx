import { CardActions, Dropdown, DropdownItem, KebabToggle, Spinner } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance } from '@kobsio/shared';

interface ISQLChartActionsProps {
  instance: IPluginInstance;
  query: string;
  isFetching: boolean;
}

export const SQLChartActions: React.FunctionComponent<ISQLChartActionsProps> = ({
  instance,
  query,
  isFetching,
}: ISQLChartActionsProps) => {
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
          dropdownItems={[
            <DropdownItem
              key={0}
              component={
                <Link to={`/plugins/${instance.satellite}/${instance.type}/${instance.name}?query=${query}`}>
                  Explore
                </Link>
              }
            />,
          ]}
        />
      )}
    </CardActions>
  );
};

export default SQLChartActions;
