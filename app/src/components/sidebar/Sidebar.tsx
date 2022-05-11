import { Link, useLocation } from 'react-router-dom';
import { Nav, NavItem, NavList, PageSidebar } from '@patternfly/react-core';
import React from 'react';

const Sidebar: React.FunctionComponent = () => {
  const location = useLocation();

  const PageNav = (
    <Nav aria-label="Nav">
      <NavList>
        <NavItem isActive={location.pathname === '/' || location.pathname.startsWith('/applications')}>
          <Link to="/">Applications</Link>
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
      </NavList>
    </Nav>
  );

  return <PageSidebar nav={PageNav} />;
};

export default Sidebar;
