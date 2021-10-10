import {
  Button,
  ButtonVariant,
  Divider,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery } from 'react-query';

import { ClustersContext, IClusterContext, IDashboard, IPlaceholders } from '@kobsio/plugin-core';
import { getPlaceholdersObject } from '../../utils/dashboard';

interface IDashboardsModalProps {
  dashboard?: IDashboard;
  setDashboard: (value: IDashboard | undefined) => void;
}

const DashboardsModal: React.FunctionComponent<IDashboardsModalProps> = ({
  dashboard,
  setDashboard,
}: IDashboardsModalProps) => {
  const history = useHistory();
  const clustersContext = useContext<IClusterContext>(ClustersContext);

  const [cluster, setCluster] = useState<string>(clustersContext.clusters[0]);
  const [namespace, setNamespace] = useState<string>('');
  const [placeholders, setPlaceholders] = useState<IPlaceholders | undefined>(getPlaceholdersObject(dashboard));

  const { data } = useQuery<string[], Error>(['dashboards/namespaces', cluster], async () => {
    const namespaces = await clustersContext.getNamespaces([cluster]);
    return namespaces;
  });

  const changePlaceholder = (key: string, value: string): void => {
    const tmpPlaceholders = { ...placeholders };
    tmpPlaceholders[key] = value;
    setPlaceholders(tmpPlaceholders);
  };

  const showDashboard = (): void => {
    if (dashboard) {
      const placeholderParams = placeholders
        ? Object.keys(placeholders).map((key) => `&${key}=${placeholders[key]}`)
        : undefined;

      history.push(
        `/dashboards/${dashboard.cluster}/${dashboard.namespace}/${
          dashboard.name
        }?defaultCluster=${cluster}&defaultNamespace=${namespace}${
          placeholderParams && placeholderParams.length > 0 ? placeholderParams.join('') : ''
        }`,
      );
    }
  };

  useEffect(() => {
    setPlaceholders(getPlaceholdersObject(dashboard));
  }, [dashboard]);

  return (
    <Modal
      variant={ModalVariant.small}
      title="Show Dashboard"
      isOpen={dashboard !== undefined}
      onClose={(): void => setDashboard(undefined)}
      actions={[
        <Button key="show" variant={ButtonVariant.primary} onClick={(): void => showDashboard()}>
          Show Dashboard
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setDashboard(undefined)}>
          Cancel
        </Button>,
      ]}
    >
      <Form isHorizontal={true}>
        <b>Defaults</b>

        <FormGroup label="Cluster" fieldId="dashboard-form-cluster">
          <FormSelect
            value={cluster}
            onChange={(value): void => setCluster(value)}
            id="dashboard-form-cluster"
            name="dashboard-form-cluster"
            aria-label="Cluster"
          >
            {clustersContext.clusters.map((option, index) => (
              <FormSelectOption key={option} value={option} label={option} />
            ))}
          </FormSelect>
        </FormGroup>
        <FormGroup label="Namespace" fieldId="dashboard-form-namespace">
          <FormSelect
            value={namespace}
            onChange={(value): void => setNamespace(value)}
            id="dashboard-form-namespace"
            name="dashboard-form-namespace"
            aria-label="Namespace"
          >
            {data ? data.map((option) => <FormSelectOption key={option} value={option} label={option} />) : null}
          </FormSelect>
        </FormGroup>

        {placeholders ? (
          <React.Fragment>
            <Divider />
            <b>Placeholders</b>

            {Object.keys(placeholders).map((key) => (
              <FormGroup key={key} label={key} fieldId={`dashboard-form-placeholder-${key}`}>
                <TextInput
                  value={placeholders[key]}
                  isRequired
                  type="text"
                  id={`dashboard-form-placeholder-${key}`}
                  aria-describedby={`dashboard-form-placeholder-${key}`}
                  name={`dashboard-form-placeholder-${key}`}
                  onChange={(value): void => changePlaceholder(key, value)}
                />
              </FormGroup>
            ))}
          </React.Fragment>
        ) : null}
      </Form>
    </Modal>
  );
};

export default DashboardsModal;
