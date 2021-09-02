import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { ITrace } from '../../../utils/interfaces';
import Spans from './Spans';
import { Title } from '@kobsio/plugin-core';
import TraceActions from './TraceActions';
import TraceHeader from './TraceHeader';

export interface ITraceProps {
  name: string;
  trace: ITrace;
  close: () => void;
}

const Trace: React.FunctionComponent<ITraceProps> = ({ name, trace, close }: ITraceProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title title={trace.traceName} subtitle={trace.traceID} size="lg" />
        <DrawerActions style={{ padding: 0 }}>
          <TraceActions name={name} trace={trace} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <TraceHeader trace={trace} />
        <p>&nbsp;</p>
        <Spans name={name} trace={trace} />
        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Trace;
