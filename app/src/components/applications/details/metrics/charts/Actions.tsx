import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IDatasourceOptions } from 'utils/proto';

interface IActionsProps {
  datasourceName: string;
  datasourceType: string;
  datasourceOptions: IDatasourceOptions;
  interpolatedQueries: string[];
}

// Actions is a dropdown component, which provides various actions for a chart. For example it can be used to display a
// link for each query in the chart. When the user click on the link, he will be redirected to the corresponding
// datasource page, with the query and time data prefilled.
const Actions: React.FunctionComponent<IActionsProps> = ({
  datasourceName,
  datasourceType,
  datasourceOptions,
  interpolatedQueries,
}: IActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Dropdown
      toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
      isOpen={show}
      isPlain={true}
      position="right"
      dropdownItems={interpolatedQueries.map((query, index) => (
        <DropdownItem
          key={index}
          component={
            <Link
              to={`/datasources/${datasourceType}/${datasourceName}?query=${query}&resolution=${datasourceOptions.resolution}&timeEnd=${datasourceOptions.timeEnd}&timeStart=${datasourceOptions.timeStart}`}
              target="_blank"
            >
              Explore {query}
            </Link>
          }
        />
      ))}
    />
  );
};

export default Actions;
