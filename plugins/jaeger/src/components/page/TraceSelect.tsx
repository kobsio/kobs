import {
  Bullseye,
  Button,
  ButtonVariant,
  Divider,
  Grid,
  GridItem,
  InputGroup,
  InputGroupText,
  PageSection,
  PageSectionVariants,
  TextInput,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { SearchIcon } from '@patternfly/react-icons';
import { useDropzone } from 'react-dropzone';

import { ITrace } from '../../utils/interfaces';

interface ITraceSelectProps {
  setTrace: (trace: ITrace) => void;
  setTraceID: (traceID: string) => void;
}

const TraceSelect: React.FunctionComponent<ITraceSelectProps> = ({ setTrace, setTraceID }: ITraceSelectProps) => {
  const [compareTrace, setCompareTrace] = useState<string>('');

  const { fileRejections, getRootProps, getInputProps } = useDropzone({
    accept: 'application/json',
    maxFiles: 1,
    onDrop: (files) => {
      if (files.length === 1) {
        const reader = new FileReader();
        reader.readAsText(files[0], 'UTF-8');
        reader.onload = (e): void => {
          if (e.target && e.target.result && typeof e.target.result === 'string') {
            const traceData = JSON.parse(e.target.result).data;
            setTrace(traceData[0]);
          }
        };
      }
    },
  });

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <div key={file.name}>
      {errors.map((e) => (
        <span key={e.code}>{e.message}</span>
      ))}
    </div>
  ));

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the
  // changeCompareTrace function to trigger the comparision of traces.
  const onEnter = (e: React.KeyboardEvent<HTMLDivElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setTraceID(compareTrace);
    }
  };

  return (
    <Bullseye>
      <Grid>
        <GridItem sm={12} md={12} lg={12} xl={12} xl2={12}>
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
            <InputGroup>
              <InputGroupText>Trace ID:</InputGroupText>
              <TextInput
                id="trace-id-to-compare-with"
                type="search"
                value={compareTrace}
                onChange={setCompareTrace}
                onKeyDown={onEnter}
              />
              <Button variant={ButtonVariant.control} onClick={(): void => setTraceID(compareTrace)}>
                <SearchIcon />
              </Button>
            </InputGroup>
            <p>&nbsp;</p>
            <Divider />
            <p>&nbsp;</p>
            <div {...getRootProps({ className: 'dropzone' })}>
              <input {...getInputProps()} />
              <p>Drag &apos;n&apos; drop a Trace here, or click to select a Trace</p>
              {fileRejectionItems}
            </div>
          </PageSection>
        </GridItem>
      </Grid>
    </Bullseye>
  );
};

export default TraceSelect;
