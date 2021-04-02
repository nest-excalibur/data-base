import * as _ from 'lodash';

import { LogInterface } from '../interfaces/log.interface';

export interface ILogDetail {
    creationOrder: number;
    entityName: string;
    errors?: any;
    created?: number;
    refs?: number;
}


export type ConnectionLog = Record<string, ILogDetail[]>;


export interface Repository<T> {
    save: (args: T) => any;
    find: () => any;
}



export class LogRepository implements Repository<LogInterface> {

    private readonly connectionLogInternal: ConnectionLog;


    constructor(){
        this.connectionLogInternal = {};
    }


    save(logEntry: LogInterface){
        
        const currentLogs = this.connectionLogInternal[logEntry.connection];

        this.connectionLogInternal[logEntry.connection]= [
            ...currentLogs || [],
            _.omit(logEntry, ['connection']),
        ];
    }

    find() {
        return this.connectionLogInternal;
    }

}
