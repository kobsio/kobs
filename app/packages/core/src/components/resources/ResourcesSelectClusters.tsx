import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Autocomplete, Checkbox, Chip, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext, FunctionComponent } from 'react';

import { APIContext, IAPIContext } from '../../context/APIContext';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

/**
 * `IResourcesSelectClustersProps` is the interface for the `ResourcesSelectClusters` component, which requires a list
 * of clusters and a function to change the selected clusters.
 */
interface IResourcesSelectClustersProps {
  selectClusters: (clusters: string[]) => void;
  selectedClusters: string[];
}

/**
 * The `ResourcesSelectClusters` renders a select box, which allows a user to select a list of clusters, to filter the
 * shown resources on a page. The component is also responsible for loading the clusters from our API.
 */
const ResourcesSelectClusters: FunctionComponent<IResourcesSelectClustersProps> = ({
  selectedClusters,
  selectClusters,
}: IResourcesSelectClustersProps) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<string[], Error>(['core/clusters'], async () => {
    return apiContext.client.get<string[]>('/api/clusters');
  });

  return (
    <Autocomplete
      size="small"
      multiple={true}
      disableCloseOnSelect={true}
      loading={isLoading}
      options={data ?? []}
      getOptionLabel={(option) => option ?? ''}
      value={selectedClusters}
      onChange={(e, value) => selectClusters(value)}
      renderTags={(value) => <Chip size="small" label={value.length} />}
      renderOption={(props, option, { selected }) => (
        <li {...props} style={{ padding: 1 }}>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
          {option}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Clusters" placeholder="Clusters" />}
    />
  );
};

export default ResourcesSelectClusters;
