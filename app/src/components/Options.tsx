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
import React, { useEffect, useState } from 'react';

import { formatTime } from 'utils/helpers';

// IAdditionalFields is the interface for an additional field. Each field must define a label, name, placeholder and
// value.
export interface IAdditionalFields {
  label: string;
  name: string;
  placeholder: string;
  value: string;
}

// IOptionsProps is the interface for the properties of the Options compoennt.
interface IOptionsProps {
  pAdditionalFields?: IAdditionalFields[];
  pTimeEnd: number;
  pTimeStart: number;
  setValues: (additionalFields: IAdditionalFields[] | undefined, timeEnd: number, timeStart: number) => void;
}

// Options is a shared component, which can be used by plugins. It should provide the same interface to select a time
// range and can be extended with additional fields, which are unique for a plugin.
const Options: React.FunctionComponent<IOptionsProps> = ({
  pAdditionalFields,
  pTimeEnd,
  pTimeStart,
  setValues,
}: IOptionsProps) => {
  const [show, setShow] = useState<boolean>(false);
  const [additionalFields, setAdditionalFields] = useState<IAdditionalFields[] | undefined>(pAdditionalFields);
  const [timeEnd, setTimeEnd] = useState<string>(formatTime(pTimeEnd));
  const [timeStart, setTimeStart] = useState<string>(formatTime(pTimeStart));
  const [timeEndError, setTimeEndError] = useState<string>('');
  const [timeStartError, setTimeStartError] = useState<string>('');

  // apply parses the value of the start and end input fields. If the user provided a correct data/time format, we
  // change the start and end time to the new values. If the string couldn't be parsed, the user will see an error below
  // the corresponding input field.
  const apply = (): void => {
    // Get a new date object for the users current timezone. This allows us to ignore the timezone, while parsing the
    // provided time string. The parsed date object will be in UTC, to transform the parsed date into the users timezone
    // we have to add the minutes between UTC and the users timezon (getTimezoneOffset()).
    const d = new Date();

    const parsedTimeStart = new Date(timeStart.replace(' ', 'T') + 'Z');
    const parsedTimeEnd = new Date(timeEnd.replace(' ', 'T') + 'Z');

    parsedTimeStart.setMinutes(parsedTimeStart.getMinutes() + d.getTimezoneOffset());
    parsedTimeEnd.setMinutes(parsedTimeEnd.getMinutes() + d.getTimezoneOffset());

    if (parsedTimeStart.toString() === 'Invalid Date') {
      setTimeStartError('Invalid time format.');
      setTimeEndError('');
    } else if (parsedTimeEnd.toString() === 'Invalid Date') {
      setTimeStartError('');
      setTimeEndError('Invalid time format.');
    } else {
      setTimeStartError('');
      setTimeEndError('');
      setValues(
        additionalFields,
        Math.floor(parsedTimeEnd.getTime() / 1000),
        Math.floor(parsedTimeStart.getTime() / 1000),
      );
      setShow(false);
    }
  };

  // quick is the function for the quick select option. We always use the current time in seconds and substract the
  // seconds specified in the quick select option.
  const quick = (seconds: number): void => {
    setValues(additionalFields, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) - seconds);
    setShow(false);
  };

  // changeAdditionalField changes one of the given addtional fields.
  const changeAdditionalField = (index: number, value: string): void => {
    if (additionalFields && additionalFields.length > 0) {
      const tmpAdditionalField = [...additionalFields];
      tmpAdditionalField[index].value = value;
      setAdditionalFields(tmpAdditionalField);
    }
  };

  // useEffect is used to update the UI, every time a property changes.
  useEffect(() => {
    setAdditionalFields(pAdditionalFields);
    setTimeEnd(formatTime(pTimeEnd));
    setTimeStart(formatTime(pTimeStart));
  }, [pAdditionalFields, pTimeEnd, pTimeStart]);

  return (
    <React.Fragment>
      <Button variant={ButtonVariant.control} onClick={(): void => setShow(true)}>
        {formatTime(pTimeStart)} to {formatTime(pTimeEnd)}
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
        <Level style={{ alignItems: 'flex-start' }} hasGutter={true}>
          <LevelItem style={{ paddingBottom: '16px' }}>
            <Form>
              <FormGroup
                label="Start Time"
                isRequired={false}
                fieldId="options-time-start"
                helperTextInvalid={timeStartError}
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
                helperTextInvalid={timeEndError}
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
          <LevelItem style={{ paddingBottom: '16px' }}>
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
          <LevelItem style={{ paddingBottom: '16px' }}>
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
          {additionalFields && additionalFields.length > 0 ? (
            <LevelItem style={{ paddingBottom: '16px' }}>
              <Form>
                {additionalFields.map((field, index) => (
                  <FormGroup key={index} label={field.label} isRequired={false} fieldId={field.name}>
                    <TextInput
                      type="text"
                      id={field.name}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={field.value}
                      onChange={(value): void => changeAdditionalField(index, value)}
                    />
                  </FormGroup>
                ))}
              </Form>
            </LevelItem>
          ) : null}
        </Level>
      </Modal>
    </React.Fragment>
  );
};

export default Options;
