import React from 'react';

import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';

interface IMongoDBPluginPanelProps extends IPluginPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

// The Panel component is always used, when a user tries to use your plugin in a Application or Dashboard. Since we can
// not valide the options property on the server side, you should always validate the given user value within your code.
// As for the Page component, the Panel component can return whatever you want, to have a unified styling across kobs,
// we recommend to use the PluginPanel component from the "@kobsio/shared" package as a wrapper for your content.
const Panel: React.FunctionComponent<IMongoDBPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IMongoDBPluginPanelProps) => {
  if (options) {
    return (
      <PluginPanel title={title} description={description}>
        <div>
          <div>{JSON.stringify(options)}</div>
          <div>{JSON.stringify(instance)}</div>
          <div>{JSON.stringify(times)}</div>
          <div>{JSON.stringify(setDetails)}</div>
        </div>
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for MongoDB panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from MongoDB."
      documentation="https://kobs.io/main/community-plugins/mongodb"
    />
  );
};

export default Panel;
