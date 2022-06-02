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
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { RedoIcon, SearchIcon } from '@patternfly/react-icons';

import { ITimes, TTime, formatTime, timeOptions } from '../../utils/times';

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

// IOptionsProps is the interface for the properties of the Options component. The user can pass in some additional
// fields and must pass the time, timeEnd and time Start value. The required setOptions function is used to change the
// properties in the parent component.
interface IOptionsProps {
  times: ITimes;
  additionalFields?: IOptionsAdditionalFields[];
  showOptions: boolean;
  showSearchButton: boolean;
  setOptions: (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => void;
}

export const Options: React.FunctionComponent<IOptionsProps> = ({
  times,
  additionalFields,
  showOptions,
  showSearchButton,
  setOptions,
}: IOptionsProps) => {
  const [show, setShow] = useState<boolean>(false);
  const [internalAdditionalFields, setInternalAdditionalFields] = useState<IOptionsAdditionalFields[] | undefined>(
    additionalFields,
  );
  const [customTimeEnd, setCustomTimeEnd] = useState<string>(formatTime(times.timeEnd));
  const [customTimeStart, setCustomTimeStart] = useState<string>(formatTime(times.timeStart));
  const [customTimeEndError, setCustomTimeEndError] = useState<string>('');
  const [customTimeStartError, setCustomTimeStartError] = useState<string>('');

  // apply parses the value of the start and end input fields. If the user provided a correct data/time format, we
  // change the start and end time to the new values. If the string couldn't be parsed, the user will see an error below
  // the corresponding input field.
  const apply = (): void => {
    // If the time wasn't changed by the user, we keep the selected time interval and only refresh the time for the
    // selected interval and change the additional fields. This allows a user to adjust an additional field without
    // switching to a custom time interval.
    if (
      customTimeEnd === formatTime(times.timeEnd) &&
      customTimeStart === formatTime(times.timeStart) &&
      times.time !== 'custom'
    ) {
      setOptions(
        {
          time: times.time,
          timeEnd: Math.floor(Date.now() / 1000),
          timeStart: Math.floor(Date.now() / 1000) - timeOptions[times.time].seconds,
        },
        additionalFields,
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
        {
          time: 'custom',
          timeEnd: Math.floor(parsedTimeEnd.getTime() / 1000),
          timeStart: Math.floor(parsedTimeStart.getTime() / 1000),
        },
        additionalFields,
      );
      setShow(false);
    }
  };

  // quick is the function for the quick select option. We always use the current time in seconds and substract the
  // seconds specified in the quick select option.
  const quick = (t: TTime): void => {
    setOptions(
      {
        time: t,
        timeEnd: Math.floor(Date.now() / 1000),
        timeStart: Math.floor(Date.now() / 1000) - timeOptions[t].seconds,
      },
      additionalFields,
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
    if (times.time !== 'custom') {
      setOptions(
        {
          time: times.time,
          timeEnd: Math.floor(Date.now() / 1000),
          timeStart: Math.floor(Date.now() / 1000) - timeOptions[times.time].seconds,
        },
        additionalFields,
      );
    }
  };

  // useEffect is used to update the UI, every time a property changes.
  useEffect(() => {
    setInternalAdditionalFields(additionalFields);
    setCustomTimeEnd(formatTime(times.timeEnd));
    setCustomTimeStart(formatTime(times.timeStart));
  }, [times, additionalFields]);

  return (
    <React.Fragment>
      {showOptions && (
        <ToolbarItem alignment={{ default: 'alignRight' }}>
          <Button variant={ButtonVariant.control} onClick={(): void => setShow(true)}>
            {times.time === 'custom'
              ? `${formatTime(times.timeStart)} to ${formatTime(times.timeEnd)}`
              : timeOptions[times.time].label}
          </Button>

          {!showSearchButton && (
            <Button variant={ButtonVariant.control} onClick={refreshTimes}>
              <RedoIcon />
            </Button>
          )}

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
                  <SimpleListItem onClick={(): void => quick('last5Minutes')}>
                    {timeOptions['last5Minutes'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last15Minutes')}>
                    {timeOptions['last15Minutes'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last30Minutes')}>
                    {timeOptions['last30Minutes'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last1Hour')}>
                    {timeOptions['last1Hour'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last3Hours')}>
                    {timeOptions['last3Hours'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last6Hours')}>
                    {timeOptions['last6Hours'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last12Hours')}>
                    {timeOptions['last12Hours'].label}
                  </SimpleListItem>
                </SimpleList>
              </LevelItem>
              <LevelItem style={{ paddingBottom: '16px' }}>
                <SimpleList>
                  <SimpleListItem onClick={(): void => quick('last1Day')}>
                    {timeOptions['last1Day'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last2Days')}>
                    {timeOptions['last2Days'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last7Days')}>
                    {timeOptions['last7Days'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last30Days')}>
                    {timeOptions['last30Days'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last90Days')}>
                    {timeOptions['last90Days'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last6Months')}>
                    {timeOptions['last6Months'].label}
                  </SimpleListItem>
                  <SimpleListItem onClick={(): void => quick('last1Year')}>
                    {timeOptions['last1Year'].label}
                  </SimpleListItem>
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
                              ? field.values.map((value) => (
                                  <FormSelectOption key={value} value={value} label={value} />
                                ))
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
        </ToolbarItem>
      )}
      {showSearchButton && (
        <ToolbarItem>
          <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={refreshTimes}>
            Search
          </Button>
        </ToolbarItem>
      )}
    </React.Fragment>
  );
};
