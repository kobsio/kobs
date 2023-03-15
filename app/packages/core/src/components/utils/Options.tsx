import { AccessTime, Refresh, Search } from '@mui/icons-material';
import {
  useTheme,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  InputAdornment,
  TextField,
  MenuItem,
  MenuList,
  FormControl,
  InputLabel,
  Select,
  Stack,
  ButtonGroup,
  Typography,
} from '@mui/material';
import { FunctionComponent, useEffect, useState } from 'react';

import { ITimes, TTimeQuick, formatTimestamp, timeOptions } from '../../utils/times';

export type TOptionsAdditionalFields = 'text' | 'select';

/**
 * `IOptionsAdditionalFields` is the interface for an additional field which should be shown in the options modal. This
 * allows the usage of the component within a plugin (e.g. the Prometheus plugin can use the Options component to allow
 * a user to select the time range and additional he can also select the resolution). Each field must define a label,
 * name, placeholder and value.
 */
export interface IOptionsAdditionalFields {
  label: string;
  name: string;
  placeholder: string;
  type?: TOptionsAdditionalFields;
  value: string;
  values?: string[];
}

/**
 * `IOptionsProps` is the interface for the properties of the Options component. The user can pass in some additional
 * fields and must pass the time, timeEnd and time Start value. The required setOptions function is used to change the
 * properties in the parent component.
 */
interface IOptionsProps {
  additionalFields?: IOptionsAdditionalFields[];
  setOptions: (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => void;
  showOptions: boolean;
  showSearchButton: boolean;
  times: ITimes;
}

/**
 * The `Options` component is used to render a button in a `Toolbar` to select a time range, to refresh the selected
 * time range or to trigger the search. It will show a `Dialog` with all available time range options and an optional
 * list of `additionalFields`.
 */
export const Options: FunctionComponent<IOptionsProps> = ({
  times,
  additionalFields,
  showOptions,
  showSearchButton,
  setOptions,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [show, setShow] = useState<boolean>(false);
  const [internalAdditionalFields, setInternalAdditionalFields] = useState<IOptionsAdditionalFields[] | undefined>(
    additionalFields,
  );
  const [customTimeEnd, setCustomTimeEnd] = useState<string>(formatTimestamp(times.timeEnd));
  const [customTimeStart, setCustomTimeStart] = useState<string>(formatTimestamp(times.timeStart));
  const [customTimeEndError, setCustomTimeEndError] = useState<string>('');
  const [customTimeStartError, setCustomTimeStartError] = useState<string>('');

  /**
   * `apply` parses the value of the start and end input fields. If the user provided a correct data/time format, we
   * change the start and end time to the new values. If the string couldn't be parsed, the user will see an error below
   * the corresponding input field.
   */
  const apply = () => {
    // If the time wasn't changed by the user, we keep the selected time interval and only refresh the time for the
    // selected interval and change the additional fields. This allows a user to adjust an additional field without
    // switching to a custom time interval.
    if (
      customTimeEnd === formatTimestamp(times.timeEnd) &&
      customTimeStart === formatTimestamp(times.timeStart) &&
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

  /**
   * `quick` is the function for the quick select option. We always use the current time in seconds and substract the
   * seconds specified in the quick select option.
   */
  const quick = (t: TTimeQuick) => {
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

  /**
   * `changeAdditionalField` changes one of the given addtional fields.
   */
  const changeAdditionalField = (index: number, value: string) => {
    if (additionalFields && additionalFields.length > 0) {
      const tmpAdditionalField = [...additionalFields];
      tmpAdditionalField[index].value = value;
      setInternalAdditionalFields(tmpAdditionalField);
    }
  };

  /**
   * `refreshTimes` is used to refresh the start and end time, when the user selected a time range from the quick
   * selection list.
   */
  const refreshTimes = () => {
    if (times.time !== 'custom') {
      setOptions(
        {
          time: times.time,
          timeEnd: Math.floor(Date.now() / 1000),
          timeStart: Math.floor(Date.now() / 1000) - timeOptions[times.time].seconds,
        },
        additionalFields,
      );
    } else {
      setOptions(
        {
          time: times.time,
          timeEnd: times.timeEnd,
          timeStart: times.timeStart,
        },
        additionalFields,
      );
    }
  };

  /**
   * `useEffect` is used to update the UI, every time a property changes.
   */
  useEffect(() => {
    setInternalAdditionalFields(additionalFields);
    setCustomTimeEnd(formatTimestamp(times.timeEnd));
    setCustomTimeStart(formatTimestamp(times.timeStart));
  }, [times, additionalFields]);

  return (
    <>
      {showOptions && (
        <>
          {showSearchButton ? (
            <Button variant="contained" color="primary" onClick={() => setShow(true)}>
              <Typography noWrap={true}>
                {times.time === 'custom'
                  ? `${formatTimestamp(times.timeStart)} to ${formatTimestamp(times.timeEnd)}`
                  : timeOptions[times.time].label}
              </Typography>
            </Button>
          ) : (
            <ButtonGroup variant="contained" color="primary">
              <Button onClick={() => setShow(true)}>
                <Typography noWrap={true}>
                  {times.time === 'custom'
                    ? `${formatTimestamp(times.timeStart)} to ${formatTimestamp(times.timeEnd)}`
                    : timeOptions[times.time].label}
                </Typography>
              </Button>
              <Button onClick={refreshTimes}>
                <Refresh />
              </Button>
            </ButtonGroup>
          )}

          <Dialog open={show} onClose={() => setShow(false)} fullScreen={fullScreen} maxWidth="md">
            <DialogTitle>Options</DialogTitle>
            <DialogContent>
              <Stack direction={{ md: 'row', xs: 'column' }} minWidth="100%" spacing={6}>
                <Stack direction="column" spacing={6} sx={{ py: '8px' }}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Start Time"
                    placeholder="Start Time"
                    fullWidth={true}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                    }}
                    value={customTimeStart}
                    onChange={(e) => setCustomTimeStart(e.target.value)}
                    helperText={customTimeStartError}
                    error={customTimeStartError ? true : false}
                  />
                  <TextField
                    size="small"
                    variant="outlined"
                    label="End Time"
                    placeholder="End Time"
                    fullWidth={true}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                    }}
                    value={customTimeEnd}
                    onChange={(e) => setCustomTimeEnd(e.target.value)}
                    helperText={customTimeEndError}
                    error={customTimeEndError ? true : false}
                  />
                </Stack>

                <MenuList>
                  <MenuItem onClick={() => quick('last5Minutes')}>{timeOptions['last5Minutes'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last15Minutes')}>{timeOptions['last15Minutes'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last30Minutes')}>{timeOptions['last30Minutes'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last1Hour')}>{timeOptions['last1Hour'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last3Hours')}>{timeOptions['last3Hours'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last6Hours')}>{timeOptions['last6Hours'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last12Hours')}>{timeOptions['last12Hours'].label}</MenuItem>
                </MenuList>

                <MenuList>
                  <MenuItem onClick={() => quick('last1Day')}>{timeOptions['last1Day'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last2Days')}>{timeOptions['last2Days'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last7Days')}>{timeOptions['last7Days'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last30Days')}>{timeOptions['last30Days'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last90Days')}>{timeOptions['last90Days'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last6Months')}>{timeOptions['last6Months'].label}</MenuItem>
                  <MenuItem onClick={() => quick('last1Year')}>{timeOptions['last1Year'].label}</MenuItem>
                </MenuList>

                {internalAdditionalFields && internalAdditionalFields.length > 0 ? (
                  <MenuList>
                    {internalAdditionalFields.map((field, index) =>
                      field.type === 'select' ? (
                        <FormControl key={field.name} size="small" fullWidth={true}>
                          <InputLabel id={field.name}>{field.name}</InputLabel>
                          <Select
                            labelId={field.name}
                            label={field.name}
                            value={field.value}
                            onChange={(e) => changeAdditionalField(index, e.target.value)}
                          >
                            {field.values
                              ? field.values.map((value) => (
                                  <MenuItem key={value} value={value}>
                                    {value}
                                  </MenuItem>
                                ))
                              : null}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          key={field.name}
                          size="small"
                          variant="outlined"
                          label={field.label}
                          placeholder={field.placeholder}
                          fullWidth={true}
                          value={field.value}
                          onChange={(e) => changeAdditionalField(index, e.target.value)}
                        />
                      ),
                    )}
                  </MenuList>
                ) : null}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="primary" size="small" onClick={apply}>
                Apply
              </Button>
              <Button variant="outlined" size="small" onClick={() => setShow(false)}>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      {showSearchButton && (
        <Button sx={{ ml: 3 }} variant="contained" color="primary" startIcon={<Search />} onClick={refreshTimes}>
          Search
        </Button>
      )}
    </>
  );
};
