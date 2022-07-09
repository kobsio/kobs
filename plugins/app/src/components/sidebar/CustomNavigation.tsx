import { NavGroup } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from 'react-query';

import CustomNavigationItem from './CustomNavigationItem';
import { INavigationGroup } from './utils/interfaces';

const CustomNavigation: React.FunctionComponent = () => {
  const { data } = useQuery<INavigationGroup[], Error>(['app/navigation'], async () => {
    const response = await fetch(`/api/navigation/groups`, {
      method: 'get',
    });
    const json = await response.json();

    if (response.status >= 200 && response.status < 300) {
      return json;
    } else {
      if (json.error) {
        throw new Error(json.error);
      } else {
        throw new Error('An unknown error occured');
      }
    }
  });

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      {data.map((group, groupIndex) => (
        <NavGroup key={groupIndex} title={group.title}>
          {group.items.map((item, itemIndex) => (
            <CustomNavigationItem key={itemIndex} item={item} />
          ))}
        </NavGroup>
      ))}
    </React.Fragment>
  );
};

export default CustomNavigation;
