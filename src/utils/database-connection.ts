import { createConnection, Connection, UpsertResult } from 'mariadb';

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

/**
 * A function signature for running a transaction.
 */
export type TransactionTask = () => Promise<void>;

/**
 * An option object for setting a database connection.
 */
export class DatabaseConnectionOptions {
  /**
   * The host name of the database server. (e.g. abc.domain.com)
   */
  host?: string;

  /**
   * The username of the user.
   */
  username?: string;

  /**
   * The password of the user.
   */
  password?: string;

  /**
   * The name of the database you want to access.
   */
  database?: string;
}

/**
 * A commonly used query result type for counting records.
 * This fits the query string like `SELECT COUNT(*) AS count FROM table_name ...`
 */
export class Counter {
  count: number;
}

/**
 * A class that is in charge of managing a connection to
 * a database through an instance of `Connection` from package `mariadb`.
 */
export class DatabaseConnection {
  private options: DatabaseConnectionOptions;
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
  public constructor(options: DatabaseConnectionOptions = {}) {
    this.options = {
      host: options.host || DB_HOST,
      username: options.username || DB_USERNAME,
      password: options.password || DB_PASSWORD,
      database: options.database || DB_DATABASE,
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
    if (this.connection) {
      throw new Error('Already connected to the database.');
    }

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
   * @param parameters
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
