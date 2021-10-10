import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { IPluginData, IPluginsContext, PluginsContext } from '../../../context/PluginsContext';
import { LinkWrapper } from '../../misc/LinkWrapper';

// IPluginItemProps is the interface for an item on the home page. Each item contains a title, body, link and icon.
interface IPluginItemProps {
  plugin: IPluginData;
}

// PluginItem is used to render an item in the home page. It requires a title, body, link and icon. When the card is
// clicked, the user is redirected to the provided link.
const PluginItem: React.FunctionComponent<IPluginItemProps> = ({ plugin }: IPluginItemProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);

  return (
    <LinkWrapper link={`/${plugin.name}`}>
      <Card style={{ cursor: 'pointer' }} isHoverable={true}>
        <CardHeader>
          <img
            src={pluginsContext.getPluginIcon(plugin.type)}
            alt={plugin.displayName}
            width="27px"
            style={{ marginRight: '5px' }}
          />
          <CardTitle>{plugin.displayName}</CardTitle>
        </CardHeader>
        <CardBody>{plugin.description}</CardBody>
      </Card>
    </LinkWrapper>
  );
};

export default PluginItem;
