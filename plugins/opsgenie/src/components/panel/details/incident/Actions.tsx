import { Alert, AlertActionCloseButton, AlertGroup, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useContext, useState } from 'react';

import { IIncident, IMessage } from '../../../../utils/interfaces';
import { IPluginsContext, PluginsContext } from '@kobsio/plugin-core';
import Close from './actions/Close';
import Resolve from './actions/Resolve';

interface IActionsProps {
  name: string;
  incident: IIncident;
  refetch: () => void;
}

const Actions: React.FunctionComponent<IActionsProps> = ({ name, incident, refetch }: IActionsProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const pluginDetails = pluginsContext.getPluginDetails(name);
  const url =
    pluginDetails && pluginDetails.options && pluginDetails.options && pluginDetails.options.url
      ? pluginDetails.options.url
      : undefined;

  const dropdownItems = [
    <Resolve
      key="resolve"
      name={name}
      incident={incident}
      refetch={refetch}
      hideDropdown={(): void => setShowDropdown(false)}
      setMessage={(message: IMessage): void => setMessages([...messages, message])}
    />,
    <Close
      key="close"
      name={name}
      incident={incident}
      refetch={refetch}
      hideDropdown={(): void => setShowDropdown(false)}
      setMessage={(message: IMessage): void => setMessages([...messages, message])}
    />,
  ];

  if (url) {
    dropdownItems.push(
      <DropdownItem key="url" href={`${url}/incident/detail/${incident.id}`} target="_blank">
        Open in Opsgenie
      </DropdownItem>,
    );
  }

  // removeMessage is used to remove a message from the list of messages, when the user clicks the close button.
  const removeMessage = (index: number): void => {
    const tmpMessages = [...messages];
    tmpMessages.splice(index, 1);
    setMessages(tmpMessages);
  };

  return (
    <React.Fragment>
      <Dropdown
        className="pf-c-drawer__close"
        toggle={<KebabToggle onToggle={(): void => setShowDropdown(!showDropdown)} />}
        isOpen={showDropdown}
        isPlain={true}
        position="right"
        dropdownItems={dropdownItems}
      />

      <AlertGroup isToast={true}>
        {messages.map((message, index) => (
          <Alert
            key={index}
            isLiveRegion={true}
            variant={message.variant}
            title={message.title}
            actionClose={<AlertActionCloseButton onClick={(): void => removeMessage(index)} />}
          />
        ))}
      </AlertGroup>
    </React.Fragment>
  );
};

export default Actions;
