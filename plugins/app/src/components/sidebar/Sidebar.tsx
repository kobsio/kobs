import { Link, useLocation } from 'react-router-dom';
import { Nav, NavGroup, NavItem, PageSidebar } from '@patternfly/react-core';
import React from 'react';

import CustomNavigation from './CustomNavigation';

const Sidebar: React.FunctionComponent = () => {
  const location = useLocation();

  const PageNav = (
    <Nav aria-label="Nav">
      <NavGroup title="System">
        <NavItem isActive={location.pathname.startsWith('/applications')}>
          <Link to="/applications">Applications</Link>
        </NavItem>
        <NavItem isActive={location.pathname.startsWith('/topology')}>
          <Link to="/topology">Topology</Link>
        </NavItem>
        <NavItem isActive={location.pathname.startsWith('/teams')}>
          <Link to="/teams">Teams</Link>
        </NavItem>
        <NavItem isActive={location.pathname.startsWith('/resources')}>
          <Link to="/resources">Kubernetes Resources</Link>
        </NavItem>
        <NavItem isActive={location.pathname.startsWith('/plugins')}>
          <Link to="/plugins">Plugins</Link>
        </NavItem>
      </NavGroup>

      <CustomNavigation />
    </Nav>
  );

  return <PageSidebar nav={PageNav} />;
};

export default Sidebar;
