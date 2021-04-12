import { BulkDataConfig } from '../interfaces';

export class ConfigStore {
  private static readonly bulksConfig: BulkDataConfig[] = [];

  static addBulkConfig(
    config: BulkDataConfig
  ): void {
    this.bulksConfig.push(config);
  }

  static get bulkDataConfigStore(): BulkDataConfig[] {
    return this.bulksConfig;
  }
}
