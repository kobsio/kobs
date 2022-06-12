import {
  Resource,
  Sku,
  VirtualMachineExtension,
  VirtualMachineScaleSet,
  VirtualMachineScaleSetVM,
} from '@azure/arm-compute';

export interface IVirtualMachineScaleSet extends Resource {
  properties?: Omit<VirtualMachineScaleSet, 'sku' | 'zones'>;
  sku?: Sku;
  zones?: string[];
}

export interface IVirtualMachine extends Resource {
  properties?: Omit<VirtualMachineScaleSetVM, 'sku' | 'zones' | 'resources'>;
  instanceId?: string;
  resources?: VirtualMachineExtension[];
  sku?: Sku;
  zones?: string[];
}
