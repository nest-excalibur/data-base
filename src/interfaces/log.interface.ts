import {BulkErrors} from './bulk-errors.interface';

export interface LogInterface {
    creationOrder: number;
    entityName: string;
    errors?: any;
    created?: number;
    connection: string;
}
