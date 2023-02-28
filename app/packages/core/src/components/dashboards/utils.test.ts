import { interpolate, interpolateJSONPath } from './utils';

describe('interpolate', () => {
  it('should replace variables with their values', async () => {
    const str = `{"name": "{% .name %}", "namespace": "{% .namespace %}", "timeStart": "{% .__timeStart %}", "timeEnd": "{% .__timeEnd %}"}`;
    const res = interpolate(
      str,
      [
        {
          name: 'namespace',
          plugin: {
            cluster: '',
            name: '',
            type: '',
          },
          value: 'namespace1',
          values: [],
        },
        {
          name: 'name',
          plugin: {
            cluster: '',
            name: '',
            type: '',
          },
          value: 'name1',
          values: [],
        },
      ],
      { time: 'last15Minutes', timeEnd: 2, timeStart: 1 },
    );
    expect(res).toBe(`{"name": "name1", "namespace": "namespace1", "timeStart": "1", "timeEnd": "2"}`);
  });

  it('should replace placeholders', async () => {
    const str = `{"stringvar": "{% .stringvar %}", "numbervar": "{% .numbervar %}", "objectvar": "{% .objectvar %}"}`;
    const res = interpolate(
      str,
      [
        {
          name: 'numbervar',
          plugin: {
            cluster: '',
            name: 'placeholder',
            options: {
              type: 'number',
            },
            type: 'core',
          },
          value: '1',
          values: [],
        },
        {
          name: 'objectvar',
          plugin: {
            cluster: '',
            name: 'placeholder',
            options: {
              type: 'object',
            },
            type: 'core',
          },
          value: '["test1","test2"]',
          values: [],
        },
        {
          name: 'stringvar',
          plugin: {
            cluster: '',
            name: 'placeholder',
            type: 'core',
          },
          value: 'mystring',
          values: [],
        },
      ],
      { time: 'last15Minutes', timeEnd: 2, timeStart: 1 },
    );
    expect(res).toBe(`{"stringvar": "mystring", "numbervar": 1, "objectvar": ["test1","test2"]}`);
  });
});

describe('interpolateJSONPath', () => {
  const manifest = {
    cluster: 'cluster1',
    metadata: {
      name: 'metadataname1',
      namespace: 'metadatanamespace1',
    },
    name: 'name1',
    namespace: 'namespace1',
  };

  it('should replace a JSONPath with the correct value from the manifest', async () => {
    const str = `{"name": "<% $.name %>", "namespace": "<% $.metadata.namespace %>"}`;
    const res = interpolateJSONPath(str, manifest);
    expect(res).toBe(`{"name": "name1", "namespace": "metadatanamespace1"}`);
  });

  it('should work with custom interpolator', async () => {
    const str = `{"name": "{% $.name %}", "namespace": "{% $.metadata.namespace %}"}`;
    const res = interpolateJSONPath(str, manifest, ['{%', '%}']);
    expect(res).toBe(`{"name": "name1", "namespace": "metadatanamespace1"}`);
  });

  it('should replace invalid json path with empty string', async () => {
    const str = `{"name": "<% $.name %>", "namespace": "<% $.metadata.invalid %>"}`;
    const res = interpolateJSONPath(str, manifest);
    expect(res).toBe(`{"name": "name1", "namespace": ""}`);
  });
});
