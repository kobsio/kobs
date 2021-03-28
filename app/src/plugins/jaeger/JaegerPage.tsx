import { Route, Switch } from 'react-router-dom';
import React from 'react';

import { IPluginPageProps } from 'utils/plugins';
import JaegerPageCompare from 'plugins/jaeger/JaegerPageCompare';
import JaegerPageTraces from 'plugins/jaeger/JaegerPageTraces';

// JaegerPage is the component, which implements the page component for the Jaeger plugin. The Jaeger plugin supports,
// two routes, one to search for traces and another one to render a single trace and compare it with another one.
const JaegerPage: React.FunctionComponent<IPluginPageProps> = ({ name, description }: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/plugins/${name}`}>
        <JaegerPageTraces name={name} description={description} />
      </Route>
      <Route exact={true} path={`/plugins/${name}/trace/:traceID`}>
        <JaegerPageCompare name={name} />
      </Route>
    </Switch>
  );
};

export default JaegerPage;
