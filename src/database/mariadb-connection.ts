import { Connection, createConnection, UpsertResult } from 'mariadb';
import { DatabaseConnectionOptions } from './database-connection-options';
import { TransactionTask } from './transaction-task';

export class MariadbConnection {
  private static readonly ENV_KEY_DB_HOST = 'DB_HOST';
  private static readonly ENV_KEY_DB_USERNAME = 'DB_USERNAME';
  private static readonly ENV_KEY_DB_PASSWORD = 'DB_PASSWORD';
  private static readonly ENV_KEY_DB_DATABASE = 'DB_DATABASE';

  private readonly options: DatabaseConnectionOptions;
  private connection?: Connection;

  /**
   * Construct an instance of `DatabaseConnection`.
   *
   * If the parameter `options` is not provided,
   * the value of each property in the four database connection options will be
   * set to the corresponding environment variable's value.
   *
   * The connection options and their correspond envrionment variable:
   * - `host`: `DB_HOST`
   * - `username`: `DB_USERNAME`
   * - `password`: `DB_PASSWORD`
   * - `database`: `DB_DATABASE`
   * @param options It is used to set the database connection options.
   */
  constructor(options: DatabaseConnectionOptions = {}) {
    const ENV = process.env;

    this.options = {
      host: options.host || ENV[MariadbConnection.ENV_KEY_DB_HOST],
      username: options.username || ENV[MariadbConnection.ENV_KEY_DB_USERNAME],
      password: options.password || ENV[MariadbConnection.ENV_KEY_DB_PASSWORD],
      database: options.database || ENV[MariadbConnection.ENV_KEY_DB_DATABASE],
    };
  }

  /**
   * Check whether the connection is alive.
   */
  public get isConnected(): boolean {
    return !!this.connection && this.connection.isValid();
  }

  /**
   * Connect to the database.
   * Throw an error if it fails.
   */
  public async connect() {
    if (this.connection) return;

    this.connection = await createConnection({
      host: this.options.host,
      user: this.options.username,
      password: this.options.password,
      database: this.options.database,
    });
  }

  /**
   * Close the connection. If the connection is already closed, it will do nothing.
   *
   * An error will be thrown if the disconnection is not caused by the current end command.
   */
  public async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = undefined;
    }
  }

  /**
   * Send a query to the database.
   * @param script The script of the query.
   * @param parameters An array of Placeholder values.
   */
  public async query<T = any[]>(script: string, parameters?: any[]): Promise<T> {
    return this.connection.query(script, parameters);
  }

  /**
   * Send one or many `INSERT` command to the database.
   *
   * An error will be thrown if the connection is invalid or its not a `INSERT` command.
   * @param script The query of a `INSERT` command.
   * @param parameters An array of Placeholder values. Usually an array of array, but in cases of only one placeholder per value, it can be given as a single array.
   */
  public async batch(script: string, parameters?: any[]): Promise<UpsertResult[]> {
    return this.connection.batch(script, parameters);
  }

  /**
   * Start a transaction.
   * An error will be thrown if the connection is invalid.
   */
  public async beginTransaction() {
    this.checkConnection();
    await this.connection.beginTransaction();
  }

  /**
   * Commit one or many transactions.
   * An error will be thrown if the connection is invalid.
   */
  public async commit() {
    this.checkConnection();
    await this.connection.commit();
  }

  /**
   * Rolls back the current transaction, if there is one active.
   * An error will be thrown if the connection is invalid.
   */
  public async rollback() {
    this.checkConnection();
    await this.connection.rollback();
  }

  /**
   * Accept a callback function where all queries sent by this instance are wrapped into a transaction.
   *
   * The transaction will have been established once the callback function is called.
   *
   * After the callback function is finished, a `COMMIT` will be sent to the database.
   *
   * An error will be thrown if the connection or a query is invalid.
   * @param task A callback function. Queries sent by this instance will be in the transaction.
   */
  public async runTransactionTask(task: TransactionTask) {
    this.checkConnection();
    try {
      await this.beginTransaction();
      await task();
      await this.commit();
    } catch (err) {
      await this.rollback();
      throw err;
    }
  }

  /**
   * It will throw an error if the connection does not exist or is invalid.
   * Otherwise, this function will do nothing.
   */
  private checkConnection() {
    if (!this.connection || !this.connection.isValid()) {
      throw new Error('This connection does not exist or is not valid.');
    }
  }
}
