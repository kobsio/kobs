import { Bullseye, Divider, Grid, GridItem, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React from 'react';
import { useDropzone } from 'react-dropzone';

import { ITrace } from 'plugins/jaeger/helpers';
import JaegerPageCompareInput from 'plugins/jaeger/JaegerPageCompareInput';

interface IJaegerPageCompareSelectTraceProps {
  setTrace: (trace: ITrace) => void;
  setTraceID: (traceID: string) => void;
}

const JaegerPageCompareSelectTrace: React.FunctionComponent<IJaegerPageCompareSelectTraceProps> = ({
  setTrace,
  setTraceID,
}: IJaegerPageCompareSelectTraceProps) => {
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

  return (
    <Bullseye>
      <Grid>
        <GridItem sm={12} md={12} lg={12} xl={12} xl2={12}>
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
            <JaegerPageCompareInput changeCompareTrace={setTraceID} />
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

export default JaegerPageCompareSelectTrace;
