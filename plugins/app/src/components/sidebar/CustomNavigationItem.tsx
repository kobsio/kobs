import { Link, useLocation } from 'react-router-dom';
import { NavExpandable, NavItem } from '@patternfly/react-core';
import React from 'react';

import { INavigationItem } from './utils/interfaces';

interface ICustomNavigationItemProps {
  item: INavigationItem;
}

const CustomNavigationItem: React.FunctionComponent<ICustomNavigationItemProps> = ({
  item,
}: ICustomNavigationItemProps) => {
  const location = useLocation();

  if (item.childs && item.childs.length > 0) {
    return (
      <NavExpandable title={item.title}>
        {item.childs.map((child, childKey) => (
          <CustomNavigationItem key={childKey} item={child} />
        ))}
      </NavExpandable>
    );
  }

  const path = `/dashboards/satellite/${item.dashboard.satellite}/cluster/${item.dashboard.cluster}/namespace/${item.dashboard.namespace}/name/${item.dashboard.name}`;
  const queryParameters = item.dashboard.placeholders
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Object.keys(item.dashboard.placeholders).map((key) => `&${key}=${item.dashboard.placeholders![key]}`)
    : [];

  return (
    <NavItem
      isActive={
        location.pathname === path &&
        location.search === (queryParameters.length > 0 ? `?${queryParameters.join('')}` : '')
      }
    >
      <Link to={`${path}${queryParameters.length > 0 ? `?${queryParameters.join('')}` : ''}`}>{item.title}</Link>
    </NavItem>
  );
};

export default CustomNavigationItem;
