import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  InputGroup,
  InputGroupText,
  KebabToggle,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';
import { ITrace } from '../../../utils/interfaces';

interface ITraceActionsProps {
  instance: IPluginInstance;
  trace: ITrace;
}

const TraceActions: React.FunctionComponent<ITraceActionsProps> = ({ instance, trace }: ITraceActionsProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [compareTrace, setCompareTrace] = useState<string>('');

  const compare = (): void => {
    setShowDropdown(false);
    setShowModal(true);
  };

  const copy = (): void => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.host}${pluginBasePath(instance)}/trace/${trace.traceID}`);
    }
    setShowDropdown(false);
  };

  const dropdownItems = [
    <DropdownItem key={0} component={<Link to={`${pluginBasePath(instance)}/trace/${trace.traceID}`}>Details</Link>} />,
    <DropdownItem key={1} onClick={compare}>
      Compare
    </DropdownItem>,
    <DropdownItem key={2} onClick={copy}>
      Copy
    </DropdownItem>,
    <DropdownItem
      key={3}
      component={
        <a
          href={URL.createObjectURL(new Blob([JSON.stringify({ data: [trace] }, null, 2)]))}
          download={`${trace.traceID}.json`}
        >
          JSON
        </a>
      }
    />,
  ];

  if (instance.options && instance.options.address) {
    dropdownItems.push(
      <DropdownItem
        key={4}
        component={
          <a href={`${instance.options.address}/trace/${trace.traceID}`} target="_blank" rel="noreferrer">
            Open in Jaeger
          </a>
        }
      />,
    );
  }

  return (
    <React.Fragment>
      <Dropdown
        className="pf-c-drawer__close"
        toggle={<KebabToggle onToggle={(): void => setShowDropdown(!showDropdown)} />}
        isOpen={showDropdown}
        isPlain={true}
        position="right"
        dropdownItems={dropdownItems}
      />

      <Modal
        variant={ModalVariant.small}
        title="Compare traces"
        isOpen={showModal}
        onClose={(): void => setShowModal(false)}
        actions={[
          <Link key="compare" to={`${pluginBasePath(instance)}/trace/${trace.traceID}?compare=${compareTrace}`}>
            <Button variant={ButtonVariant.primary}>Compare</Button>
          </Link>,

          <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShowModal(false)}>
            Cancel
          </Button>,
        ]}
      >
        <InputGroup>
          <InputGroupText>Trace ID:</InputGroupText>
          <TextInput id="trace-id-to-compare-with" type="search" value={compareTrace} onChange={setCompareTrace} />
        </InputGroup>
      </Modal>
    </React.Fragment>
  );
};

export default TraceActions;
