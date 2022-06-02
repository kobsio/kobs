import { Text, TextContent } from '@patternfly/react-core';
import React from 'react';

export interface IPluginPageTitleProps {
  satellite: string;
  name: string;
  description: string;
}

export const PluginPageTitle: React.FunctionComponent<IPluginPageTitleProps> = ({
  satellite,
  name,
  description,
}: IPluginPageTitleProps) => {
  return (
    <TextContent>
      <Text component="h1">
        {name}
        <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">({satellite})</span>
      </Text>
      <Text component="p">{description}</Text>
    </TextContent>
  );
};
