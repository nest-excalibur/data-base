import * as _ from 'lodash';

import { LogInterface, ILogDetail } from '../interfaces';


export type ConnectionLog = Record<string, ILogDetail[]>;


export interface Repository<T> {
  save: (args: T) => void;
  find: () => any;
}


export class LogRepository implements Repository<LogInterface> {

  private readonly connectionLogInternal: ConnectionLog;


  constructor() {
    this.connectionLogInternal = {};
  }


  save(logEntry: LogInterface): void {

    const currentLogs = this.connectionLogInternal[logEntry.connection];

    this.connectionLogInternal[logEntry.connection] = [
      ...currentLogs || [],
      _.omit(logEntry, ['connection'])
    ];
  }

  find(): ConnectionLog {
    return this.connectionLogInternal;
  }

}
