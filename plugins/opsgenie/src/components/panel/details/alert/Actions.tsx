import { Alert, AlertActionCloseButton, AlertGroup, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useContext, useState } from 'react';

import { IAlert, IMessage } from '../../../../utils/interfaces';
import { IPluginsContext, PluginsContext } from '@kobsio/plugin-core';
import Acknowledge from './actions/Acknowledge';
import Close from './actions/Close';
import Snooze from './actions/Snooze';

interface IActionsProps {
  name: string;
  alert: IAlert;
}

const Actions: React.FunctionComponent<IActionsProps> = ({ name, alert }: IActionsProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const pluginDetails = pluginsContext.getPluginDetails(name);
  const options =
    pluginDetails && pluginDetails.options && pluginDetails.options && pluginDetails.options.url
      ? pluginDetails.options
      : undefined;
  const url = options && options.url ? options.url : undefined;
  // const acknowledge =
  //   options && options.actions && options.actions.acknowledge ? options.actions.acknowledge : undefined;
  // const close = options && options.actions && options.actions.close ? options.actions.close : undefined;

  const dropdownItems = [];
  if (options && options.actions && options.actions.acknowledge) {
    dropdownItems.push(
      <Acknowledge
        key="acknowledge"
        name={name}
        alert={alert}
        hideDropdown={(): void => setShowDropdown(false)}
        setMessage={(message: IMessage): void => setMessages([...messages, message])}
      />,
    );
  }
  if (options && options.actions && options.actions.snooze) {
    dropdownItems.push(
      <Snooze
        key="snooze"
        name={name}
        alert={alert}
        hideDropdown={(): void => setShowDropdown(false)}
        setMessage={(message: IMessage): void => setMessages([...messages, message])}
      />,
    );
  }
  if (options && options.actions && options.actions.close) {
    dropdownItems.push(
      <Close
        key="close"
        name={name}
        alert={alert}
        hideDropdown={(): void => setShowDropdown(false)}
        setMessage={(message: IMessage): void => setMessages([...messages, message])}
      />,
    );
  }
  if (url) {
    dropdownItems.push(
      <DropdownItem key="url" href={`${url}/alert/detail/${alert.id}/details`} target="_blank">
        Open in Opsgenie
      </DropdownItem>,
    );
  }

  if (dropdownItems.length === 0) {
    return null;
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
