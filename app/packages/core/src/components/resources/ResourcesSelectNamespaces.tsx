import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Autocomplete, Checkbox, Chip, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext, FunctionComponent } from 'react';

import { APIContext, IAPIContext } from '../../context/APIContext';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

/**
 * `IResourcesSelectNamespacesProps` is the interface for the `ResourcesSelectNamespaces` component, which requires a
 * list of clusters, namespaces and a function to change the selected list of namespaces. and a function to change the
 * selected clusters.
 */
interface IResourcesSelectNamespacesProps {
  selectNamespaces: (namespaces: string[]) => void;
  selectedClusters: string[];
  selectedNamespaces: string[];
}

/**
 * The `ResourcesSelectNamespaces` renders a select box, which allows a user to select a list of namespaces, to filter
 * the shown resources on a page. The component is also responsible for loading the namespaces from our API. To load the
 * namespaces from our API we also need a list of namespaces, so that we can only show the namespaces which are relevant
 * for the list of selected clusters.
 */
export const ResourcesSelectNamespaces: FunctionComponent<IResourcesSelectNamespacesProps> = ({
  selectedNamespaces,
  selectedClusters,
  selectNamespaces,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<string[], Error>(['core/namespaces', selectedClusters], async () => {
    const c = selectedClusters.map((cluster) => `&cluster=${encodeURIComponent(cluster)}`);
    return apiContext.client.get<string[]>(`/api/clusters/namespaces?${c.length > 0 ? c.join('') : ''}`);
  });

  return (
    <Autocomplete
      size="small"
      multiple={true}
      disableCloseOnSelect={true}
      loading={isLoading}
      options={data ?? []}
      getOptionLabel={(option) => option ?? ''}
      value={selectedNamespaces}
      onChange={(e, value) => selectNamespaces(value)}
      renderTags={(value) => <Chip size="small" label={value.length} />}
      renderOption={(props, option, { selected }) => (
        <li {...props} style={{ padding: 0 }}>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
          {option}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Namespaces" placeholder="Namespaces" />}
    />
  );
};
