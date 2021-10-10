import {
  Divider,
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
import Account from './Account';
import Plugins from './Plugins';

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
          <Menu activeItemId={activePage} onSelect={changeActivePage}>
            <MenuContent>
              <MenuList>
                <MenuItem itemId="plugins">Plugins</MenuItem>
                {pluginHome.map((plugin, index) => (
                  <MenuItem key={index} itemId={plugin.name}>
                    {plugin.displayName}
                  </MenuItem>
                ))}
                {authContext.user.hasProfile && (
                  <React.Fragment>
                    <Divider component="li" />
                    <MenuItem itemId="account">My Account</MenuItem>
                  </React.Fragment>
                )}
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
