import { Inject, Injectable } from '@nestjs/common';
import { BulkDataConfig, InsertionResponse } from './interfaces';
import { BULKS_CONFIG, ENV_CONFIG, LOGS_REPOSITORY } from './constants/inject-keys';
import { LogInterface } from './interfaces';
import { DataBaseHelper } from './utils/data-base-helper';
import { Repository } from './utils/log-repository';
import { LogTable } from './utils/log-table';
import { ILogDetail } from './interfaces';

@Injectable()
export class DataBaseService {
  constructor(
    @Inject(ENV_CONFIG)
    private readonly productionFlag: boolean,
    @Inject(BULKS_CONFIG)
    private readonly bulksConfig: BulkDataConfig[],
    @Inject(LOGS_REPOSITORY)
    private readonly logRepository: Repository<LogInterface>
  ) {
  }

  async insertData(): Promise<void> {
    const bulksConfig = this.bulksConfigOrdered;
    for (const bulk of bulksConfig) {
      const entity = bulk.entity;
      const name = bulk.aliasName ? bulk.aliasName : entity.name;
      const connection = bulk.connection ? bulk.connection : 'default';
      const currentLog: ILogDetail = {
        creationOrder: bulk.creationOrder,
        entityName: name,
        fileSize: 0,
        connection
      };
      const filePath = this.productionFlag ? bulk.pathProd : bulk.pathDev;
      if (filePath) {
        const DtoClass = bulk.dtoClassValidation;
        let totalCreated: InsertionResponse = {created: 0, fileSize: 0};
        try {
          totalCreated = await DataBaseHelper
            .insertData(
              filePath,
              DtoClass,
              entity,
              connection
            );
          currentLog.created = totalCreated.created;
          currentLog.fileSize = totalCreated.fileSize;
        } catch (error) {
          currentLog.errors = error;
        }
      }
      this.logRepository.save(currentLog);
    }
  }

  private get bulksConfigOrdered() {
    return this.bulksConfig.sort(
      (aFBC, befBC) => aFBC.creationOrder - befBC.creationOrder
    );
  }

  public showSummary(lightBorder = true): void {
    const logsRow = LogTable.makeLogRows(this.logRepository.find(), lightBorder);
    const logTable = new LogTable(logsRow);
    logTable.draw();
  }

}
