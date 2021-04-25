import { readFileSync, statSync } from 'fs';
import { join } from 'path';

import { getConnection, ObjectType, Repository } from 'typeorm';
import { parseAndValidateMany } from '@nest-excalibur/common-api/lib/api/shared-utils/validate-many';
import * as _ from 'lodash';

import { FileException } from '../exceptions/file-exception';
import { ValidateException } from '../exceptions/validate-exception';
import { ClassType } from 'class-transformer/ClassTransformer';
import { RepositoryException } from '../exceptions/repository-exception';
import { RefsException } from '../exceptions/refs-exception';
import { InsertionResponse, ValidationResponse } from '../interfaces';
import { ConfigStore } from '../store/config.store';


export class DataBaseHelper {
  static getRepository<T>(
    entity: ObjectType<T>,
    connection = 'default'
  ): Repository<T> {
    try {
      const manager = getConnection(connection);
      return manager.getRepository(entity);
    } catch (error) {
      throw new RepositoryException(
        error
      );
    }
  }

  static readFile(path: string): { rows: any[], fileSize: number } {
    const filePath = '../../../../../';
    const joinedPath = join(__dirname, filePath, path);
    const file = readFileSync(joinedPath, 'utf-8');
    const rows = JSON.parse(file);
    const fileSize = statSync(joinedPath).size / (1024);
    const isNotEmpty = rows.length > 0;
    if (isNotEmpty) {
      return { rows, fileSize: Number(fileSize.toFixed(2)) };
    } else {
      throw new FileException('The file is empty');
    }
  }

  static async validateMassive<D>(dtoClass: (new () => any) | D, rows: any[]): Promise<D[]> {
    let errors = [];
    let parseData: any[] = [];
    try {
      const response: { parsedData: D[], errors: ValidationResponse<D>[] } = await parseAndValidateMany(rows, dtoClass as ClassType<D>);
      errors = response.errors;
      parseData = response.parsedData;
    } catch (error) {
      throw new ValidateException(error.toString());
    }
    const hasErrors = errors.length > 0;
    if (hasErrors) {
      throw new ValidateException(errors);
    } else {
      return parseData;
    }
  }

  static async insertData<T = any, D = (new () => any)>(
    path: string,
    dtoClass: D | undefined,
    entity: ObjectType<T>,
    connection = 'default',
    refs?: Partial<Record<keyof T, any>>,
  ): Promise<InsertionResponse> {
    // Get repository
    const repository: Repository<T> = DataBaseHelper.getRepository(entity, connection);

    // Find file
    const records = DataBaseHelper.readFile(path);

    const { rows } = records;

    const mapedData = refs ? rows.map(parsedDat => DataBaseHelper.handleRefs(refs, parsedDat as any)) : rows;

    // validate Data from file
    if (dtoClass) {
      await DataBaseHelper.validateMassive(dtoClass, mapedData);
    }
    // insert data
    let createdCounter = 0;
    for (const row of mapedData) {
      const created = await repository.save(
        _.omit(row as any, ['$metaID']),
      );
      if ((row as any).$metaID) {
        DataBaseHelper.handleMetaIndex(entity.name, { ...row, ...created });
      }
      createdCounter ++;
    }

    return {
      created: createdCounter,
      fileSize: records.fileSize,
      refs: refs ? Object.keys(refs) : ['--'],
    };
  }

  private static handleRefs(refs: Partial<Record<string, any>> | undefined, record: any): any {
    // verify if bulk has refs
    try {
      const clonnedRecord = { ...record };
      const entries = Object.entries(refs);
      // retrieve relations
      return entries.reduce(
        (recordReference: any, [relationName, relationMap]: [string, any]) => {
          // {1: 'asdas1231', }
          const relationDocument = relationMap.name;
          const metaIndex = recordReference[relationName];
          recordReference[relationName] = ConfigStore.noSqlRefs[relationDocument][metaIndex];
          // delete recordReference[relationMap];
          return recordReference;
        },
        clonnedRecord,
      );
    } catch (error) {
      throw new RefsException(
        error.toString(),
      );
    }
  }

  private static handleMetaIndex(documentName: string, record: any): any {
    ConfigStore.addRefs(documentName, record.$metaID, record.id);
    return record;
  }
}
