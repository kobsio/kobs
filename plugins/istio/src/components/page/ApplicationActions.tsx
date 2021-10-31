import {
  Badge,
  Button,
  ButtonVariant,
  CardActions,
  Dropdown,
  DropdownItem,
  Form,
  FormGroup,
  KebabToggle,
  Modal,
  ModalVariant,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import { FilterIcon, TimesIcon } from '@patternfly/react-icons';
import React, { useEffect, useState } from 'react';

import { IFilters } from '../../utils/interfaces';

export interface IApplicationActionsProps {
  liveUpdate: boolean;
  filters: IFilters;
  setLiveUpdate: (value: boolean) => void;
  setFilters: (value: IFilters) => void;
}

const ApplicationActions: React.FunctionComponent<IApplicationActionsProps> = ({
  liveUpdate,
  filters,
  setLiveUpdate,
  setFilters,
}: IApplicationActionsProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [internalFilters, setInternalFilters] = useState<IFilters>(filters);

  const clearFilter = (): void => {
    setFilters({ method: '', path: '', upstreamCluster: '' });
    setShowDropdown(false);
  };

  useEffect(() => {
    setInternalFilters(filters);
  }, [filters]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtersCount = Object.keys(filters).filter((key) => (filters as any)[key] !== '').length;

  return (
    <CardActions>
      <Dropdown
        toggle={<KebabToggle onToggle={(): void => setShowDropdown(!showDropdown)} />}
        isOpen={showDropdown}
        isPlain={true}
        position="right"
        dropdownItems={[
          <DropdownItem
            key={0}
            component={
              <Switch
                id="live"
                label="Live Update is on"
                labelOff="Live Update is off"
                isChecked={liveUpdate}
                onChange={(): void => setLiveUpdate(!liveUpdate)}
              />
            }
          />,
          <DropdownItem
            key={1}
            component="button"
            icon={<FilterIcon />}
            onClick={(): void => {
              setShowDropdown(false);
              setShowModal(true);
            }}
          >
            Set Filters {filtersCount > 0 ? <Badge className="pf-u-ml-md">{filtersCount}</Badge> : null}
          </DropdownItem>,
          <DropdownItem key={2} component="button" icon={<TimesIcon />} onClick={(): void => clearFilter()}>
            Clear Filters
          </DropdownItem>,
        ]}
      />

      <Modal
        variant={ModalVariant.small}
        title="Filter"
        isOpen={showModal}
        onClose={(): void => setShowModal(false)}
        actions={[
          <Button
            key="filter"
            variant={ButtonVariant.primary}
            onClick={(): void => {
              setFilters({ ...internalFilters });
              setShowModal(false);
            }}
          >
            Filter
          </Button>,
          <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShowModal(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Form isHorizontal={true}>
          <FormGroup label="Upstream Cluster" fieldId="form-tab-upstreamcluster">
            <TextInput
              value={internalFilters.upstreamCluster}
              isRequired
              type="text"
              id="form-tab-upstreamcluster"
              aria-describedby="form-tab-upstreamcluster"
              name="form-tab-upstreamcluster"
              onChange={(value): void => setInternalFilters({ ...internalFilters, upstreamCluster: value })}
            />
          </FormGroup>
          <FormGroup label="Method" fieldId="form-tab-method">
            <TextInput
              value={internalFilters.method}
              isRequired
              type="text"
              id="form-tab-method"
              aria-describedby="form-tab-method"
              name="form-tab-method"
              onChange={(value): void => setInternalFilters({ ...internalFilters, method: value })}
            />
          </FormGroup>
          <FormGroup label="Path" fieldId="form-tab-path">
            <TextInput
              value={internalFilters.path}
              isRequired
              type="text"
              id="form-tab-path"
              aria-describedby="form-tab-path"
              name="form-tab-path"
              onChange={(value): void => setInternalFilters({ ...internalFilters, path: value })}
            />
          </FormGroup>
        </Form>
      </Modal>
    </CardActions>
  );
};

export default ApplicationActions;
