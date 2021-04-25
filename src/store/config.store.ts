import { RefsException } from '../exceptions/refs-exception';
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

  static getRealIndex(entityName: string, metaID: string): string {
    const entityMap = ConfigStore.noSqlRefs[entityName];
    if (!entityMap) {
      throw new RefsException(`Entity Map was not found: ${entityName}`);
    }
    const realIndex = entityMap[metaID];
    if (!realIndex) {
      throw new RefsException(`Real index was not found for ${entityName} with metaID: ${metaID}`);
    }
    return realIndex;
  }

  static dispose(): void {
    this.noSqlRefsInternal = {};
  }
}
