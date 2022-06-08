import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance } from '@kobsio/shared';
import { ITrace } from '../../../utils/interfaces';
import Spans from './Spans';
import TraceActions from './TraceActions';
import TraceHeader from './TraceHeader';

export interface ITraceProps {
  instance: IPluginInstance;
  trace: ITrace;
  close: () => void;
}

const Trace: React.FunctionComponent<ITraceProps> = ({ instance, trace, close }: ITraceProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {trace.traceName}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{trace.traceID}</span>
        </Title>
        <DrawerActions style={{ padding: 0 }}>
          <TraceActions instance={instance} trace={trace} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <TraceHeader trace={trace} />
        <p>&nbsp;</p>
        <div style={{ height: 'calc(100% - 48px)' }}>
          <Spans instance={instance} trace={trace} fixedHeight={true} />
        </div>
        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Trace;
