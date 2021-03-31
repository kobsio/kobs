import { Button, ButtonVariant, InputGroup, InputGroupText, TextInput } from '@patternfly/react-core';
import React, { useState } from 'react';
import { SearchIcon } from '@patternfly/react-icons';

interface IJaegerPageCompareInputProps {
  changeCompareTrace: (traceID: string) => void;
}

// JaegerPageCompareInput is the component, which allows the user to provide a second trace id, to compare two traces.
const JaegerPageCompareInput: React.FunctionComponent<IJaegerPageCompareInputProps> = ({
  changeCompareTrace,
}: IJaegerPageCompareInputProps) => {
  const [compareTrace, setCompareTrace] = useState<string>('');

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the
  // changeCompareTrace function to trigger the comparision of traces.
  const onEnter = (e: React.KeyboardEvent<HTMLDivElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      changeCompareTrace(compareTrace);
    }
  };

  return (
    <InputGroup>
      <InputGroupText>Trace ID:</InputGroupText>
      <TextInput
        id="trace-id-to-compare-with"
        type="search"
        value={compareTrace}
        onChange={setCompareTrace}
        onKeyDown={onEnter}
      />
      <Button variant={ButtonVariant.control} onClick={(): void => changeCompareTrace(compareTrace)}>
        <SearchIcon />
      </Button>
    </InputGroup>
  );
};

export default JaegerPageCompareInput;
