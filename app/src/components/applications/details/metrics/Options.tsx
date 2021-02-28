import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Level,
  LevelItem,
  Modal,
  ModalVariant,
  SimpleList,
  SimpleListItem,
  TextInput,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { IDatasourceOptions } from 'utils/proto';
import { formatTime } from 'utils/helpers';

interface IOptionsProps {
  type: string;
  options: IDatasourceOptions;
  setOptions: (options: IDatasourceOptions) => void;
}

// Options is the component, where the user can select various options for the current view. The user can select a time
// range for all queries via the quick select option or he can specify a start and end time via the input fields. Later
// we can also display datasource specific options within the modal component.
const Options: React.FunctionComponent<IOptionsProps> = ({ options, setOptions }: IOptionsProps) => {
  const [show, setShow] = useState<boolean>(false);
  const [timeStart, setTimeStart] = useState<string>(formatTime(options.timeStart));
  const [timeEnd, setTimeEnd] = useState<string>(formatTime(options.timeEnd));
  const [timeStartError, setTimeStartError] = useState<string>('');
  const [timeEndError, setTimeEndError] = useState<string>('');

  // apply parses the value of the start and end input fields. If the user provided a correct data/time format, we
  // change the start and end time to the new values. If the string couldn't be parsed, the user will see an error below
  // the corresponding input field.
  const apply = (): void => {
    const parsedTimeStart = new Date(timeStart.replace(' ', 'T') + 'Z');
    const parsedTimeEnd = new Date(timeEnd.replace(' ', 'T') + 'Z');

    if (parsedTimeStart.toString() === 'Invalid Date') {
      setTimeStartError('Invalid time format.');
      setTimeEndError('');
    } else if (parsedTimeEnd.toString() === 'Invalid Date') {
      setTimeStartError('');
      setTimeEndError('Invalid time format.');
    } else {
      setTimeStartError('');
      setTimeEndError('');
      setOptions({
        ...options,
        timeEnd: parsedTimeStart.getTime() / 1000,
        timeStart: parsedTimeStart.getTime() / 1000,
      });
      setShow(false);
    }
  };

  // quick is the function for the quick select option. We always use the current time in seconds and substract the
  // seconds specified in the quick select option.
  const quick = (seconds: number): void => {
    setOptions({
      ...options,
      timeEnd: Math.floor(Date.now() / 1000),
      timeStart: Math.floor(Date.now() / 1000) - seconds,
    });
    setShow(false);
  };

  return (
    <React.Fragment>
      <Button variant={ButtonVariant.control} onClick={(): void => setShow(true)}>
        {formatTime(options.timeStart)} to {formatTime(options.timeEnd)}
      </Button>
      <Modal
        title="Options"
        variant={ModalVariant.medium}
        isOpen={show}
        showClose={true}
        onClose={(): void => setShow(false)}
        actions={[
          <Button key="confirm" variant="primary" onClick={apply}>
            Apply
          </Button>,
          <Button key="cancel" variant="link" onClick={(): void => setShow(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Level hasGutter={true}>
          <LevelItem className="kobsio-options-list-item">
            <Form>
              <FormGroup
                label="Start Time"
                isRequired={false}
                fieldId="options-time-start"
                helperTextInvalid="Age has to be a number"
                validated={timeStartError ? 'error' : undefined}
              >
                <TextInput
                  type="text"
                  id="options-time-start"
                  name="options-time-start"
                  iconVariant="clock"
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  validated={timeStartError ? 'error' : undefined}
                  value={timeStart}
                  onChange={(value): void => setTimeStart(value)}
                />
              </FormGroup>
              <FormGroup
                label="End Time"
                isRequired={false}
                fieldId="options-time-end"
                helperTextInvalid="Age has to be a number"
                validated={timeEndError ? 'error' : undefined}
              >
                <TextInput
                  type="text"
                  id="options-time-end"
                  name="options-time-end"
                  iconVariant="clock"
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  validated={timeEndError ? 'error' : undefined}
                  value={timeEnd}
                  onChange={(value): void => setTimeEnd(value)}
                />
              </FormGroup>
            </Form>
          </LevelItem>
          <LevelItem className="kobsio-options-list-item">
            <SimpleList>
              <SimpleListItem onClick={(): void => quick(300)}>Last 5 Minutes</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(900)}>Last 15 Minutes</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(1800)}>Last 30 Minutes</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(3600)}>Last 1 Hour</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(10800)}>Last 3 Hours</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(21600)}>Last 6 Hours</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(43200)}>Last 12 Hours</SimpleListItem>
            </SimpleList>
          </LevelItem>
          <LevelItem className="kobsio-options-list-item">
            <SimpleList>
              <SimpleListItem onClick={(): void => quick(86400)}>Last 1 Day</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(172800)}>Last 2 Days</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(604800)}>Last 7 Days</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(2592000)}>Last 30 Days</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(7776000)}>Last 90 Days</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(15552000)}>Last 6 Months</SimpleListItem>
              <SimpleListItem onClick={(): void => quick(31536000)}>Last 1 Year</SimpleListItem>
            </SimpleList>
          </LevelItem>
        </Level>
      </Modal>
    </React.Fragment>
  );
};

export default Options;
