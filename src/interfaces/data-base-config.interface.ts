import { ModuleMetadata } from '@nestjs/common';

export interface DataBaseConfig {
    productionFlag: boolean;
}

export type AsyncFactory = (...args: any[]) => Promise<DataBaseConfig> | DataBaseConfig;

export interface DataBaseConfigAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    name?: string;
    useFactory?: AsyncFactory;
    inject?: any[];
}
