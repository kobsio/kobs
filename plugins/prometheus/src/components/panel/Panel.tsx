import React from 'react';

import { IPluginPanelProps } from '@kobsio/shared';

const Panel: React.FunctionComponent<IPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IPluginPanelProps) => {
  return (
    <div>
      {title} {description} {JSON.stringify(options)} {JSON.stringify(instance)} {JSON.stringify(times)}{' '}
      {JSON.stringify(setDetails)}
    </div>
  );
};

export default Panel;
