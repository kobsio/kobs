import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Level,
  LevelItem,
  Modal,
  ModalVariant,
  SimpleList,
  SimpleListItem,
  TextInput,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { RedoIcon } from '@patternfly/react-icons';

import { formatTime } from '../../utils/time';

export type TOptionsAdditionalFields = 'text' | 'select';

// IOptionsAdditionalFields is the interface for an additional field which should be shown in the options modal. This
// allows the usage of the component within a plugin (e.g. the Prometheus plugin can use the Options component to allow
// a user to select the time range and additional he can also select the resolution). Each field must define a label,
// name, placeholder and value.
export interface IOptionsAdditionalFields {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  values?: string[];
  type?: TOptionsAdditionalFields;
}

// TTime is the type with all possible values for the time property. A value of "custom" identifies that a user
// specified a custom start and end time via the text input fields. The other values are used for the quick select
// options.
export type TTime =
  | 'custom'
  | 'last12Hours'
  | 'last15Minutes'
  | 'last1Day'
  | 'last1Hour'
  | 'last1Year'
  | 'last2Days'
  | 'last30Days'
  | 'last30Minutes'
  | 'last3Hours'
  | 'last5Minutes'
  | 'last6Hours'
  | 'last6Months'
  | 'last7Days'
  | 'last90Days';

// TTimeOptions is an array with all available type for TTime. It is used to verify that the value of a string is an
//valid option for the TTime type.
export const TTimeOptions = [
  'custom',
  'last12Hours',
  'last15Minutes',
  'last1Day',
  'last1Hour',
  'last1Year',
  'last2Days',
  'last30Days',
  'last30Minutes',
  'last3Hours',
  'last5Minutes',
  'last6Hours',
  'last6Months',
  'last7Days',
  'last90Days',
];

// ITime is the interface for a time in the times map. It contains a label which should be displayed in the Options
// component and the seconds between the start and the end time.
interface ITime {
  label: string;
  seconds: number;
}

// ITimes is the interface for the map of all available time options. The key in this interface must be a value from the
// TTime type.
interface ITimes {
  [key: string]: ITime;
}

// times implements the ITimes interface with all the available time options we have. These options are then displayed
// as list to allow a user to quickly select a time range.
const times: ITimes = {
  last12Hours: { label: 'Last 12 Hours', seconds: 43200 },
  last15Minutes: { label: 'Last 15 Minutes', seconds: 900 },
  last1Day: { label: 'Last 1 Day', seconds: 86400 },
  last1Hour: { label: 'Last 1 Hour', seconds: 3600 },
  last1Year: { label: 'Last 1 Year', seconds: 31536000 },
  last2Days: { label: 'Last 2 Days', seconds: 172800 },
  last30Days: { label: 'Last 30 Days', seconds: 2592000 },
  last30Minutes: { label: 'Last 30 Minutes', seconds: 1800 },
  last3Hours: { label: 'Last 3 Hours', seconds: 10800 },
  last5Minutes: { label: 'Last 5 Minutes', seconds: 300 },
  last6Hours: { label: 'Last 6 Hours', seconds: 21600 },
  last6Months: { label: 'Last 6 Months', seconds: 15552000 },
  last7Days: { label: 'Last 7 Days', seconds: 604800 },
  last90Days: { label: 'Last 90 Days', seconds: 7776000 },
};

// IOptionsProps is the interface for the properties of the Options component. The user can pass in some additional
// fields and must pass the time, timeEnd and time Start value. The required setOptions function is used to change the
// properties in the parent component.
interface IOptionsProps {
  additionalFields?: IOptionsAdditionalFields[];
  time: TTime;
  timeEnd: number;
  timeStart: number;
  setOptions: (
    refresh: boolean,
    additionalFields: IOptionsAdditionalFields[] | undefined,
    time: TTime,
    timeEnd: number,
    timeStart: number,
  ) => void;
}

// Options is a shared component, which can be used by plugins. It should provide the same interface to select a time
// range and can be extended with additional fields, which are unique for a plugin.
// The component contains a two buttons and a modal. The first button is used to display the currently selected time
// range (when the user entered a custom time we display the start and end time, if he doesn't entered a custom time we
// display the corresponding label for the selction). When a user clicks on the first button we also show the modal. The
// second button can be used to refresh the start and end time for the current selection.
export const Options: React.FunctionComponent<IOptionsProps> = ({
  additionalFields,
  time,
  timeEnd,
  timeStart,
  setOptions,
}: IOptionsProps) => {
  const [show, setShow] = useState<boolean>(false);
  const [internalAdditionalFields, setInternalAdditionalFields] = useState<IOptionsAdditionalFields[] | undefined>(
    additionalFields,
  );
  const [customTimeEnd, setCustomTimeEnd] = useState<string>(formatTime(timeEnd));
  const [customTimeStart, setCustomTimeStart] = useState<string>(formatTime(timeStart));
  const [customTimeEndError, setCustomTimeEndError] = useState<string>('');
  const [customTimeStartError, setCustomTimeStartError] = useState<string>('');

  // apply parses the value of the start and end input fields. If the user provided a correct data/time format, we
  // change the start and end time to the new values. If the string couldn't be parsed, the user will see an error below
  // the corresponding input field.
  const apply = (): void => {
    // If the time wasn't changed by the user, we keep the selected time interval and only refresh the time for the
    // selected interval and change the additional fields. This allows a user to adjust an additional field without
    // switching to a custom time interval.
    if (customTimeEnd === formatTime(timeEnd) && customTimeStart === formatTime(timeStart) && time !== 'custom') {
      setOptions(
        false,
        additionalFields,
        time,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) - times[time].seconds,
      );
      setShow(false);
      return;
    }

    // Get a new date object for the users current timezone. This allows us to ignore the timezone, while parsing the
    // provided time string. The parsed date object will be in UTC, to transform the parsed date into the users timezone
    // we have to add the minutes between UTC and the users timezon (getTimezoneOffset()).
    const d = new Date();

    const parsedTimeStart = new Date(customTimeStart.replace(' ', 'T') + 'Z');
    const parsedTimeEnd = new Date(customTimeEnd.replace(' ', 'T') + 'Z');

    parsedTimeStart.setMinutes(parsedTimeStart.getMinutes() + d.getTimezoneOffset());
    parsedTimeEnd.setMinutes(parsedTimeEnd.getMinutes() + d.getTimezoneOffset());

    if (parsedTimeStart.toString() === 'Invalid Date') {
      setCustomTimeStartError('Invalid time format.');
      setCustomTimeEndError('');
    } else if (parsedTimeEnd.toString() === 'Invalid Date') {
      setCustomTimeStartError('');
      setCustomTimeEndError('Invalid time format.');
    } else {
      setCustomTimeStartError('');
      setCustomTimeEndError('');
      setOptions(
        false,
        additionalFields,
        'custom',
        Math.floor(parsedTimeEnd.getTime() / 1000),
        Math.floor(parsedTimeStart.getTime() / 1000),
      );
      setShow(false);
    }
  };

  // quick is the function for the quick select option. We always use the current time in seconds and substract the
  // seconds specified in the quick select option.
  const quick = (t: TTime): void => {
    setOptions(
      false,
      additionalFields,
      t,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) - times[t].seconds,
    );
    setShow(false);
  };

  // changeAdditionalField changes one of the given addtional fields.
  const changeAdditionalField = (index: number, value: string): void => {
    if (additionalFields && additionalFields.length > 0) {
      const tmpAdditionalField = [...additionalFields];
      tmpAdditionalField[index].value = value;
      setInternalAdditionalFields(tmpAdditionalField);
    }
  };

  // refreshTimes is used to refresh the start and end time, when the user selected a time range from the quick
  // selection list.
  const refreshTimes = (): void => {
    if (time !== 'custom') {
      setOptions(
        true,
        additionalFields,
        time,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) - times[time].seconds,
      );
    }
  };

  // useEffect is used to update the UI, every time a property changes.
  useEffect(() => {
    setInternalAdditionalFields(additionalFields);
    setCustomTimeEnd(formatTime(timeEnd));
    setCustomTimeStart(formatTime(timeStart));
  }, [additionalFields, timeEnd, timeStart]);

  return (
    <React.Fragment>
      <Button variant={ButtonVariant.control} onClick={(): void => setShow(true)}>
        {time === 'custom' ? `${formatTime(timeStart)} to ${formatTime(timeEnd)}` : times[time].label}
      </Button>

      <Button variant={ButtonVariant.control} onClick={refreshTimes}>
        <RedoIcon />
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
                helperTextInvalid={customTimeStartError}
                validated={customTimeStartError ? 'error' : undefined}
              >
                <TextInput
                  type="text"
                  id="options-time-start"
                  name="options-time-start"
                  iconVariant="clock"
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  validated={customTimeStartError ? 'error' : undefined}
                  value={customTimeStart}
                  onChange={(value): void => setCustomTimeStart(value)}
                />
              </FormGroup>
              <FormGroup
                label="End Time"
                isRequired={false}
                fieldId="options-time-end"
                helperTextInvalid={customTimeEndError}
                validated={customTimeEndError ? 'error' : undefined}
              >
                <TextInput
                  type="text"
                  id="options-time-end"
                  name="options-time-end"
                  iconVariant="clock"
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  validated={customTimeEndError ? 'error' : undefined}
                  value={customTimeEnd}
                  onChange={(value): void => setCustomTimeEnd(value)}
                />
              </FormGroup>
            </Form>
          </LevelItem>
          <LevelItem style={{ paddingBottom: '16px' }}>
            <SimpleList>
              <SimpleListItem onClick={(): void => quick('last5Minutes')}>{times['last5Minutes'].label}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last15Minutes')}>
                {times['last15Minutes'].label}
              </SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last30Minutes')}>
                {times['last30Minutes'].label}
              </SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last1Hour')}>{times['last1Hour'].label}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last3Hours')}>{times['last3Hours'].label}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last6Hours')}>{times['last6Hours'].label}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last12Hours')}>{times['last12Hours'].label}</SimpleListItem>
            </SimpleList>
          </LevelItem>
          <LevelItem style={{ paddingBottom: '16px' }}>
            <SimpleList>
              <SimpleListItem onClick={(): void => quick('last1Day')}>{times['last1Day'].label}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last2Days')}>{times['last2Days'].label}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last7Days')}>{times['last7Days'].label}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last30Days')}>{times['last30Days'].label}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last90Days')}>{times['last90Days'].label}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last6Months')}>{times['last6Months'].label}</SimpleListItem>
              <SimpleListItem onClick={(): void => quick('last1Year')}>{times['last1Year'].label}</SimpleListItem>
            </SimpleList>
          </LevelItem>
          {internalAdditionalFields && internalAdditionalFields.length > 0 ? (
            <LevelItem style={{ paddingBottom: '16px' }}>
              <Form>
                {internalAdditionalFields.map((field, index) =>
                  field.type === 'select' ? (
                    <FormGroup key={index} label={field.label} isRequired={false} fieldId={field.name}>
                      <FormSelect
                        value={field.value}
                        onChange={(value): void => changeAdditionalField(index, value)}
                        id={field.name}
                        name={field.name}
                        aria-label={field.name}
                      >
                        {field.values
                          ? field.values.map((value) => <FormSelectOption key={value} value={value} label={value} />)
                          : null}
                      </FormSelect>
                    </FormGroup>
                  ) : (
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
                  ),
                )}
              </Form>
            </LevelItem>
          ) : null}
        </Level>
      </Modal>
    </React.Fragment>
  );
};
