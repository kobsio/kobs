import {
  Button,
  ButtonVariant,
  Checkbox,
  Level,
  LevelItem,
  Modal,
  ModalVariant,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  SimpleList,
  SimpleListItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';
import { LogViewerSearch } from '@patternfly/react-log-viewer';

// ITimes is the interface for all available times, which can be used for the log lines. The keys are the seconds, which
// are used for the Kubernetes API request (since) and the value is a string, for the user.
interface ITimes {
  [key: number]: string;
}

// times is the variable, which implements the ITimes interface. These are the available options for the since parameter
// to get the logs.
const times: ITimes = {
  10800: 'Last 3 Hours',
  172800: 'Last 2 Days',
  1800: 'Last 30 Minutes',
  21600: 'Last 6 Hours',
  300: 'Last 5 Minutes',
  3600: 'Last 1 Hour',
  43200: 'Last 12 Hours',
  604800: 'Last 7 Days',
  86400: 'Last 1 Day',
  900: 'Last 15 Minutes',
};

export interface IOptions {
  container: string;
  containers: string[];
  previous: boolean;
  since: number;
}

interface ILogsToolbarProps {
  isLoading: boolean;
  options: IOptions;
  setOptions: (options: IOptions) => void;
}

// LogsToolbar is the toolbar, to set some options for the Kubernetes logs request. The user can provide a
// regular expression, can select a container and time since when the logs should be returned. Last but not least a user
// can also select if he wants to view the logs of the previous container. The previous and time option are shown in a
// modal similar to the one used by the plugins.
const LogsToolbar: React.FunctionComponent<ILogsToolbarProps> = ({
  isLoading,
  options,
  setOptions,
}: ILogsToolbarProps) => {
  // The container is not set in the parent component, so that we have to set it from the containers option. This is
  // done, because we want to avoid an API call to get the logs, when the user hasn't clicked the search button.
  const [container, setContainer] = useState<string>(options.containers[0]);
  const [previous, setPrevious] = useState<boolean>(options.previous);
  const [since, setSince] = useState<number>(options.since);
  const [showContainer, setShowContainer] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  // quick is the function called, when the user selects a time from the options modal. We change the time and then we
  // close the modal.
  const quick = (seconds: number): void => {
    setSince(seconds);
    setShowModal(false);
  };

  return (
    <React.Fragment>
      <Toolbar id="logs-toolbar">
        <ToolbarContent>
          <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
            <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
              <ToolbarItem style={{ width: '100%' }}>
                <LogViewerSearch placeholder="Search" />
              </ToolbarItem>
              <ToolbarItem>
                <Select
                  variant={SelectVariant.single}
                  typeAheadAriaLabel="Select container"
                  placeholderText="Select container"
                  onToggle={(): void => setShowContainer(!showContainer)}
                  onSelect={(
                    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
                    value: string | SelectOptionObject,
                  ): void => setContainer(value as string)}
                  selections={container}
                  isOpen={showContainer}
                >
                  {options.containers.map((c, index) => (
                    <SelectOption key={index} value={c} />
                  ))}
                </Select>
              </ToolbarItem>
              <ToolbarItem>
                <Button variant={ButtonVariant.control} onClick={(): void => setShowModal(true)}>
                  {`${times[since]}${previous ? ` / Previous` : ''}`}
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant={ButtonVariant.primary}
                  icon={isLoading ? undefined : <SearchIcon />}
                  isLoading={isLoading}
                  onClick={(): void =>
                    setOptions({
                      container: container,
                      containers: options.containers,
                      previous: previous,
                      since: since,
                    })
                  }
                >
                  Search
                </Button>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarToggleGroup>
        </ToolbarContent>
      </Toolbar>

      <Modal
        title="Options"
        variant={ModalVariant.medium}
        isOpen={showModal}
        showClose={true}
        onClose={(): void => setShowModal(false)}
      >
        <Level style={{ alignItems: 'flex-start' }} hasGutter={true}>
          <LevelItem style={{ paddingBottom: '16px' }}>
            <Checkbox
              label="Previous logs"
              isChecked={previous}
              onChange={setPrevious}
              aria-label="Previous logs"
              id="previous-logs"
              name="previous-logs"
            />
          </LevelItem>
          <LevelItem style={{ paddingBottom: '16px' }}>
            <SimpleList>
              <SimpleListItem onClick={(): void => quick(300)}>{times[300]}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(900)}>{times[900]}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(1800)}>{times[1800]}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(3600)}>{times[3600]}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(10800)}>{times[10800]}</SimpleListItem>
            </SimpleList>
          </LevelItem>
          <LevelItem style={{ paddingBottom: '16px' }}>
            <SimpleList>
              <SimpleListItem onClick={(): void => quick(21600)}>{times[21600]}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(43200)}>{times[43200]}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(86400)}>{times[86400]}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(172800)}>{times[172800]}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(604800)}>{times[604800]}</SimpleListItem>
            </SimpleList>
          </LevelItem>
        </Level>
      </Modal>
    </React.Fragment>
  );
};

export default LogsToolbar;
