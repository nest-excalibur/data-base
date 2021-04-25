import { BulkDataConfig } from '../interfaces';

export class ConfigStore {
  private static readonly bulksConfig: BulkDataConfig[] = [];
  private static noSqlRefsInternal: Record<string, Record<string, string>> = {};

  static addBulkConfig(
    config: BulkDataConfig
  ): void {
    this.bulksConfig.push(config);
  }

  static get bulkDataConfigStore(): BulkDataConfig[] {
    return this.bulksConfig;
  }

  static get noSqlRefs(): Record<string, Record<string, string>> {
    return this.noSqlRefsInternal;
  }

  static addRefs(entityName: string, metaID: string, realIndex: string): void {
    this.noSqlRefsInternal[entityName] = {
      ...this.noSqlRefsInternal[entityName],
      [metaID]: realIndex,
    };
  }
}
