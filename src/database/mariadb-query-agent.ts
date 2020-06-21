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
    await this.checkConnection();
    return this.connection.query<T>(script, parameters);
  }

  async batch(script: string, parameters?: any[]): Promise<UpsertResult[]> {
    await this.checkConnection();
    return this.connection.batch(script, parameters);
  }

  async beginTransaction(): Promise<void> {
    await this.checkConnection();
    await this.connection.beginTransaction();
  }

  async commit(): Promise<void> {
    await this.checkConnection();
    await this.connection.commit();
  }

  async rollback(): Promise<void> {
    await this.checkConnection();
    await this.connection.rollback();
  }

  async runTransactionTask(task: TransactionTask): Promise<void> {
    await this.checkConnection();
    await this.connection.runTransactionTask(task);
  }
}
