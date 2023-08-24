export const description =
  'Velero is an open source tool to safely backup and restore, perform disaster recovery, and migrate Kubernetes cluster resources and persistent volumes.';

export const example = `plugin:
  name: velero
  type: velero
  options:
    # Type must be "backups", "restores" or "schedules"
    type: backups
    clusters:
      - mycluster`;

/**
 * `TVeleroType` is the type for the Velero resources we are supporting within the plugin.
 */
export type TVeleroType = 'backups' | 'restores' | 'schedules';

/**
 * `IVeleroResource` is the interface which must be implemented by a Velero resource. Each resource must contain a list
 * of `columns` we want to show in the UI, the `resource` name under which we can find the CRD, a `title` and the `type`
 * from the `TVeleroType` list.
 */
export interface IVeleroResource {
  columns: IVeleroResourceColumn[];
  resource: string;
  title: string;
  type: TVeleroType;
}

export interface IVeleroResourceColumn {
  jsonPath: string;
  title: string;
  type: string;
}

/**
 * `veleroResources` implements the `IVeleroResource` interface for all `TVeleroType`s.
 */
export const veleroResources: Record<TVeleroType, IVeleroResource> = {
  backups: {
    columns: [
      {
        jsonPath: '$.status.phase',
        title: 'Status',
        type: 'string',
      },
      {
        jsonPath: '$.status.errors',
        title: 'Errors',
        type: 'number',
      },
      {
        jsonPath: '$.status.warnings',
        title: 'Warnings',
        type: 'number',
      },
      {
        jsonPath: '$.metadata.creationTimestamp',
        title: 'Created',
        type: 'date',
      },
      {
        jsonPath: '$.status.expiration',
        title: 'Expires',
        type: 'date',
      },
      {
        jsonPath: '$.spec.storageLocation',
        title: 'Storage Location',
        type: 'string',
      },
    ],
    resource: 'backups.velero.io',
    title: 'Backups',
    type: 'backups',
  },
  restores: {
    columns: [
      {
        jsonPath: '$.spec.backupName',
        title: 'Backup',
        type: 'string',
      },
      {
        jsonPath: '$.status.phase',
        title: 'Status',
        type: 'string',
      },
      {
        jsonPath: '$.status.errors',
        title: 'Errors',
        type: 'number',
      },
      {
        jsonPath: '$.spec.warnings',
        title: 'Warnings',
        type: 'number',
      },
      {
        jsonPath: '$.status.startTimestamp',
        title: 'Started',
        type: 'date',
      },
      {
        jsonPath: '$.status.completionTimestamp',
        title: 'Completed',
        type: 'date',
      },
      {
        jsonPath: '$.metadata.creationTimestamp',
        title: 'Created',
        type: 'date',
      },
    ],
    resource: 'restores.velero.io',
    title: 'Restores',
    type: 'restores',
  },
  schedules: {
    columns: [
      {
        jsonPath: '$.status.phase',
        title: 'Status',
        type: 'string',
      },
      {
        jsonPath: '$.metadata.creationTimestamp',
        title: 'Created',
        type: 'date',
      },
      {
        jsonPath: '$.spec.schedule',
        title: 'Schedule',
        type: 'string',
      },
      {
        jsonPath: '$.spec.ttl',
        title: 'TTL',
        type: 'string',
      },
      {
        jsonPath: '$.status.lastBackup',
        title: 'Last Backup',
        type: 'date',
      },
      {
        jsonPath: '$.spec.paused',
        title: 'Paused',
        type: 'boolean',
      },
    ],
    resource: 'schedules.velero.io',
    title: 'Schedules',
    type: 'schedules',
  },
};
