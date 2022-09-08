import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

interface IMonitorToolbarSpanKindsProps {
  spanKinds: string[];
  setSpanKind: (spanKind: string) => void;
}

const MonitorToolbarSpanKinds: React.FunctionComponent<IMonitorToolbarSpanKindsProps> = ({
  spanKinds,
  setSpanKind,
}: IMonitorToolbarSpanKindsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Select
      variant={SelectVariant.checkbox}
      typeAheadAriaLabel="Span Kinds"
      placeholderText="Span Kinds"
      onToggle={(): void => setShow(!show)}
      onSelect={(e, value): void => setSpanKind(value as string)}
      selections={spanKinds}
      isOpen={show}
      maxHeight="50vh"
    >
      {['unspecified', 'internal', 'server', 'client', 'producer', 'consumer'].map((spanKind) => (
        <SelectOption key={spanKind} value={spanKind} />
      ))}
    </Select>
  );
};

export default MonitorToolbarSpanKinds;
