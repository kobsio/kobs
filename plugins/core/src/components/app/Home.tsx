import {
  Avatar,
  Card,
  CardBody,
  Grid,
  GridItem,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { IPluginsContext, PluginsContext } from '../../context/PluginsContext';
import Authenticated from './authenticated/Authenticated';
import Dashboard from './dashboard/Dashboard';
import { LinkWrapper } from '../misc/LinkWrapper';
import Plugins from './plugins/Plugins';
import { getGravatarImageUrl } from '../../utils/gravatar';

const HomePage: React.FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();

  const authContext = useContext<IAuthContext>(AuthContext);
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const pluginHome = pluginsContext.getPluginHome();
  const [activePage, setActivePage] = useState<string>('');

  const changeActivePage = (itemId: string): void => {
    history.push({
      pathname: location.pathname,
      search: `?page=${itemId}`,
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page');
    setActivePage(page ?? '');
  }, [location.search]);

  return (
    <PageSection variant={PageSectionVariants.default}>
      <Grid hasGutter={true}>
        <GridItem sm={12} md={12} lg={3} xl={2} xl2={2}>
          <React.Fragment>
            <Card
              style={{ cursor: 'pointer' }}
              isCompact={true}
              isHoverable={true}
              onClick={(): void => changeActivePage('')}
            >
              <CardBody>
                <div className="pf-u-text-align-center">
                  <Avatar
                    src={getGravatarImageUrl(authContext.user.profile.email ? authContext.user.profile.email : '', 64)}
                    alt={authContext.user.profile.fullName}
                    style={{ height: '64px', width: '64px' }}
                  />
                  <div className="pf-c-title pf-m-xl">
                    {authContext.user.profile.fullName
                      ? authContext.user.profile.fullName
                      : authContext.user.id !== 'kobs.io'
                      ? authContext.user.id
                      : 'Welcome to kobs'}
                  </div>
                  <div className="pf-u-font-size-md pf-u-color-400">
                    {authContext.user.profile.position ? authContext.user.profile.position : ''}
                  </div>
                </div>
              </CardBody>
            </Card>
            <p>&nbsp;</p>
          </React.Fragment>

          <Menu activeItemId={activePage}>
            <MenuContent>
              <MenuList>
                {pluginHome.map((plugin, index) => (
                  <LinkWrapper key={plugin.name} link={`/${plugin.name}`}>
                    <MenuItem>{plugin.displayName}</MenuItem>
                  </LinkWrapper>
                ))}
                <MenuItem onClick={(): void => changeActivePage('plugins')}>All Plugins</MenuItem>
              </MenuList>
            </MenuContent>
          </Menu>
        </GridItem>
        <GridItem sm={12} md={12} lg={9} xl={10} xl2={10}>
          {activePage === 'plugins' ? (
            <Plugins plugins={pluginsContext.plugins} />
          ) : authContext.user.id !== 'kobs.io' &&
            authContext.user &&
            authContext.user.rows &&
            authContext.user.rows.length > 0 ? (
            <Dashboard
              cluster={authContext.user.cluster}
              namespace={authContext.user.namespace}
              rows={authContext.user.rows}
            />
          ) : authContext.user.id !== 'kobs.io' && authContext.user.teams && authContext.user.teams.length > 0 ? (
            <Authenticated teams={authContext.user.teams} />
          ) : (
            <Plugins plugins={pluginsContext.plugins} />
          )}
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default HomePage;
