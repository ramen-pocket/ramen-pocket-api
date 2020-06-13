import { UpsertResult } from 'mariadb';
import { QueryAgent } from './query-agent';
import { MariadbConnection } from './mariadb-connection';
import { TransactionTask } from './transaction-task';

export class MariadbQueryAgent implements QueryAgent {
  constructor(private connection: MariadbConnection) {}

  private async checkConnection() {
    if (!(await this.connection.isConnected())) {
      await this.connection.connect();
    }
  }

  async query<T = any[]>(script: string, parameters?: any[]): Promise<T> {
    this.checkConnection();
    return this.connection.query<T>(script, parameters);
  }

  async batch(script: string, parameters?: any[]): Promise<UpsertResult[]> {
    this.checkConnection();
    return this.connection.batch(script, parameters);
  }

  async beginTransaction(): Promise<void> {
    this.checkConnection();
    this.connection.beginTransaction();
  }
  async commit(): Promise<void> {
    this.checkConnection();
    this.connection.commit();
  }
  async rollback(): Promise<void> {
    this.checkConnection();
    this.connection.rollback();
  }

  async runTransactionTask(task: TransactionTask): Promise<void> {
    this.checkConnection();
    this.connection.runTransactionTask(task);
  }
}
