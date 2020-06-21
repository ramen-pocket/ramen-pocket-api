import { UpsertResult } from 'mariadb';
import { TransactionTask } from './transaction-task';

export interface QueryAgent {
  query<T = any[]>(script: string, parameters?: any[]): Promise<T>;
  batch(script: string, parameters?: any[]): Promise<UpsertResult[]>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  runTransactionTask(task: TransactionTask): Promise<void>;
}
