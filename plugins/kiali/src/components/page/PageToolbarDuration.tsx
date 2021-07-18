import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';

interface IKialiPageToolbarDurationProps {
  duration: number;
  setDuration: (duration: number) => void;
}

const KialiPageToolbarDuration: React.FunctionComponent<IKialiPageToolbarDurationProps> = ({
  duration,
  setDuration,
}: IKialiPageToolbarDurationProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Select
      variant={SelectVariant.single}
      typeAheadAriaLabel="Select duration"
      placeholderText="Select duration"
      onToggle={(): void => setShow(!show)}
      onSelect={(
        event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
        value: string | SelectOptionObject,
      ): void => setDuration(parseInt(value as string))}
      selections={duration}
      isOpen={show}
    >
      <SelectOption key={0} value={60}>
        1m
      </SelectOption>
      <SelectOption key={1} value={300}>
        5m
      </SelectOption>
      <SelectOption key={2} value={900}>
        15m
      </SelectOption>
      <SelectOption key={3} value={1800}>
        30m
      </SelectOption>
      <SelectOption key={4} value={3600}>
        1h
      </SelectOption>
      <SelectOption key={5} value={10800}>
        3h
      </SelectOption>
      <SelectOption key={6} value={21600}>
        6h
      </SelectOption>
      <SelectOption key={7} value={43200}>
        12h
      </SelectOption>
      <SelectOption key={8} value={86400}>
        1d
      </SelectOption>
      <SelectOption key={9} value={604800}>
        7d
      </SelectOption>
      <SelectOption key={10} value={2592000}>
        30d
      </SelectOption>
    </Select>
  );
};

export default KialiPageToolbarDuration;
