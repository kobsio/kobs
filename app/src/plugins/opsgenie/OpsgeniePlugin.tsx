import React, { useState } from 'react';

import { IPluginProps } from 'utils/plugins';
import OpsgenieAlerts from 'plugins/opsgenie/OpsgenieAlerts';
import OpsgeniePluginToolbar from 'plugins/opsgenie/OpsgeniePluginToolbar';
import PluginDataMissing from 'components/plugins/PluginDataMissing';
import { Query } from 'proto/opsgenie_grpc_web_pb';

// OpsgeniePlugin is the component, which implements the plugin component for the Opsgenie plugin.
const OpsgeniePlugin: React.FunctionComponent<IPluginProps> = ({
  name,
  description,
  plugin,
  showDetails,
}: IPluginProps) => {
  const queries = plugin.opsgenie ? plugin.opsgenie.queriesList : [];
  const [query, setQuery] = useState<Query.AsObject | undefined>(queries.length > 0 ? queries[0] : undefined);

  // When the opsgenie property of the plugin is missing, we use the shared PluginDataMissing component, with a link to
  // the corresponding documentation for the Opsgenie plugin.
  if (!plugin.opsgenie) {
    return (
      <PluginDataMissing
        title="Opsgenie properties are missing"
        description="The Opsgenie properties are missing in your CR for this application. Visit the documentation to learn more on how to use the Opsgenie plugin in an Application CR."
        documentation="https://kobs.io/plugins/opsgenie/"
        type="opsgenie"
      />
    );
  }

  return (
    <React.Fragment>
      <OpsgeniePluginToolbar queries={queries} query={query} setQuery={setQuery} />
      <p>&nbsp;</p>
      {query && query.name ? <OpsgenieAlerts name={name} query={query.query} /> : null}
    </React.Fragment>
  );
};

export default OpsgeniePlugin;
