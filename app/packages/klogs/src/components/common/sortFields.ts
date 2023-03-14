// TODO: make this configurable in plugin options
/* eslint-disable sort-keys */
const columnPriority: Partial<Record<string, number>> = {
  namespace: 8000,
  app: 7000,
  cluster: 6000,
  container_name: 5000,
  pod_name: 4000,
  timestamp: 3000,
  log: 2000,
  host: 1000,
};
/* eslint-enable sort-keys */

const compareFields = (a: string, b: string) => {
  let pa = columnPriority[a] ?? 0;
  let pb = columnPriority[b] ?? 0;

  if (pa === 0 && a.startsWith('content_')) {
    pa = 100;
  }

  if (pb === 0 && b.startsWith('content_')) {
    pb = 100;
  }

  return pb - pa;
};

export default compareFields;
