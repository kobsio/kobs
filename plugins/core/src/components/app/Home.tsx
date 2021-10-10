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
import Account from './account/Account';
import Plugins from './plugins/Plugins';
import { getGravatarImageUrl } from '../../utils/gravatar';

const HomePage: React.FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();

  const authContext = useContext<IAuthContext>(AuthContext);
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const pluginHome = pluginsContext.getPluginHome();
  const [activePage, setActivePage] = useState<string>('plugins');

  const pluginDetails = pluginsContext.getPluginDetails(activePage);
  const Component =
    pluginDetails && pluginsContext.components.hasOwnProperty(pluginDetails.type)
      ? pluginsContext.components[pluginDetails.type].home
      : undefined;

  const changeActivePage = (
    event?: React.MouseEvent<Element, MouseEvent> | undefined,
    itemId?: string | number | undefined,
  ): void => {
    if (itemId) {
      history.push({
        pathname: location.pathname,
        search: `?page=${itemId}`,
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page');

    if (page) {
      setActivePage(page);
    }
  }, [location.search]);

  return (
    <PageSection variant={PageSectionVariants.default}>
      <Grid hasGutter={true}>
        <GridItem sm={12} md={12} lg={3} xl={2} xl2={2}>
          {authContext.user.hasProfile && (
            <React.Fragment>
              <Card
                style={{ cursor: 'pointer' }}
                isCompact={true}
                isHoverable={true}
                onClick={(): void => changeActivePage(undefined, 'account')}
              >
                <CardBody>
                  <div className="pf-u-text-align-center">
                    <Avatar
                      src={getGravatarImageUrl(authContext.user.profile.email, 64)}
                      alt={authContext.user.profile.fullName}
                      style={{ height: '64px', width: '64px' }}
                    />
                    <div className="pf-c-title pf-m-xl">{authContext.user.profile.fullName}</div>
                    <div className="pf-u-font-size-md pf-u-color-400">{authContext.user.profile.position}</div>
                  </div>
                </CardBody>
              </Card>
              <p>&nbsp;</p>
            </React.Fragment>
          )}
          <Menu activeItemId={activePage} onSelect={changeActivePage}>
            <MenuContent>
              <MenuList>
                <MenuItem itemId="plugins">Plugins</MenuItem>
                {pluginHome.map((plugin, index) => (
                  <MenuItem key={index} itemId={plugin.name}>
                    {plugin.displayName}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuContent>
          </Menu>
        </GridItem>
        <GridItem sm={12} md={12} lg={9} xl={10} xl2={10}>
          {activePage !== 'plugins' && activePage !== 'account' && pluginDetails && Component ? (
            <Component
              name={pluginDetails.name}
              displayName={pluginDetails.displayName}
              description={pluginDetails.description}
              options={pluginDetails.options}
            />
          ) : activePage === 'account' ? (
            <Account />
          ) : (
            <Plugins plugins={pluginsContext.plugins} />
          )}
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default HomePage;
