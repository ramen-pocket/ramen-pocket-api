import { createConnection, Connection } from 'mariadb';

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

export interface Options {
  host?: string;
  username?: string;
  password?: string;
  database?: string;
}

export class DatabaseConnection {
  private options: Options;
  private connection?: Connection;

  public constructor(options: Options = {}) {
    this.options = {
      host: options.host || DB_HOST,
      username: options.username || DB_USERNAME,
      password: options.password || DB_PASSWORD,
      database: options.database || DB_DATABASE,
    };
  }

  public get isConnected(): boolean {
    return !!this.connection;
  }

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

  public async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = undefined;
    }
  }

  public async query(script: string, parameters?: any[]) {
    return this.connection.query(script, parameters);
  }

  public async batch(script: string, parameters?: any[]) {
    return this.connection.batch(script, parameters);
  }
}
