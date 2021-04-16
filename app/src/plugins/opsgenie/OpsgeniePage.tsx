import { Route, Switch } from 'react-router-dom';
import React from 'react';

import { IPluginPageProps } from 'utils/plugins';
import OpsgeniePageAlert from 'plugins/opsgenie/OpsgeniePageAlert';
import OpsgeniePageAlerts from 'plugins/opsgenie/OpsgeniePageAlerts';

// OpsgeniePage is the component, which implements the page component for the Opsgenie plugin. The plugin supports two
// routes, one to get a list of alerts and another one to get the detils of the alert.
const OpsgeniePage: React.FunctionComponent<IPluginPageProps> = ({ name, description }: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/plugins/${name}`}>
        <OpsgeniePageAlerts name={name} description={description} />
      </Route>
      <Route exact={true} path={`/plugins/${name}/alert/:alertID`}>
        <OpsgeniePageAlert name={name} />
      </Route>
    </Switch>
  );
};

export default OpsgeniePage;
