import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import Markdown from './Markdown';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({ title, description, options }: IPanelProps) => {
  if (!options || !options.text) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Markdown panel are missing or invalid"
        details="The panel doesn't contain the a text property."
        documentation=""
      />
    );
  }

  return (
    <PluginCard title={title} description={description}>
      <Markdown text={options.text} />
    </PluginCard>
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.options?.text === nextProps.options?.text
  ) {
    return true;
  }

  return false;
});
