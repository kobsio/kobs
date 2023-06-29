export const description =
  'The Runbooks plugin allows you to link alerts to runbooks via the Prometheus Operator CRDs and similar resources.';

export const example = `plugin:
  name: runbooks
  type: runbooks
  options:
    alert: myalertname
    group: myalertgroup`;

export interface IRunbook {
  alert: string;
  expr: string;
  group: string;
  id: string;
  message: string;
  runbook: string;
  severity: string;
}
