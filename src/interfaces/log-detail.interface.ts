export interface ILogDetail {
  creationOrder: number;
  entityName: string;
  errors?: any;
  created?: number;
  refs?: string[];
  connection: string;
  fileSize: number;
}
