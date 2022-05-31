import { Alert, AlertActionCloseButton, AlertGroup, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IAlert, IMessage } from '../../../../utils/interfaces';
import Acknowledge from './actions/Acknowledge';
import Close from './actions/Close';
import { IPluginInstance } from '@kobsio/shared';
import Snooze from './actions/Snooze';

interface IActionsProps {
  instance: IPluginInstance;
  alert: IAlert;
  refetch: () => void;
}

const Actions: React.FunctionComponent<IActionsProps> = ({ instance, alert, refetch }: IActionsProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const url = instance.options && instance.options.url ? instance.options.url : undefined;

  const dropdownItems = [
    <Acknowledge
      key="acknowledge"
      instance={instance}
      alert={alert}
      refetch={refetch}
      hideDropdown={(): void => setShowDropdown(false)}
      setMessage={(message: IMessage): void => setMessages([...messages, message])}
    />,
    <Snooze
      key="snooze"
      instance={instance}
      alert={alert}
      refetch={refetch}
      hideDropdown={(): void => setShowDropdown(false)}
      setMessage={(message: IMessage): void => setMessages([...messages, message])}
    />,
    <Close
      key="close"
      instance={instance}
      alert={alert}
      refetch={refetch}
      hideDropdown={(): void => setShowDropdown(false)}
      setMessage={(message: IMessage): void => setMessages([...messages, message])}
    />,
  ];

  if (url) {
    dropdownItems.push(
      <DropdownItem key="url" href={`${url}/alert/detail/${alert.id}/details`} target="_blank">
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
