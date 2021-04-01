import {ConectionConfig} from './connection-config.type';

export interface DataBaseConfig {
    connections: ConectionConfig;
    productionFlag: boolean;
}
