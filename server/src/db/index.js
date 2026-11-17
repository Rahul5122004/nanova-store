import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config/db.config.js';

let activeClient = 'none'; // 'mysql' | 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

/**
 * Universal Database Wrapper
 */
export async function initDatabase() {
  if (config.db.client === 'mysql' || config.db.client === 'auto') {
    try {
      console.log(`[DB] Attempting MySQL connection on ${config.db.host}:${config.db.port}...`);
      const testPool = mysql.createPool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        decimalNumbers: true
      });

      // Test connection
      await testPool.query('SELECT 1');
      mysqlPool = testPool;
      activeClient = 'mysql';
      console.log(`[DB] Successfully connected to MySQL database "${config.db.database}"!`);
      return { client: 'mysql', db: mysqlPool };
    } catch (err) {
      console.warn(`[DB] MySQL connection failed (${err.message}). Falling back to SQLite for seamless operation.`);
    }
  }

  // Fallback / Standalone SQLite
  const dbDir = path.dirname(config.db.sqlitePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sqliteDb = new sqlite3.Database(config.db.sqlitePath);
  activeClient = 'sqlite';
  console.log(`[DB] Connected to SQLite database at: ${config.db.sqlitePath}`);

  // Enable foreign keys
  await new Promise((resolve, reject) => {
    sqliteDb.run('PRAGMA foreign_keys = ON;', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  return { client: 'sqlite', db: sqliteDb };
}

/**
 * Universal Query Handler
 * Converts parameterized queries consistently across MySQL (?) and SQLite (?)
 */
export async function query(sql, params = []) {
  if (!activeClient || activeClient === 'none') {
    await initDatabase();
  }

  if (activeClient === 'mysql') {
    const [rows, fields] = await mysqlPool.execute(sql, params);
    // If it's an INSERT/UPDATE result, normalize properties
    if (rows && typeof rows.insertId !== 'undefined') {
      return {
        rows: [],
        insertId: rows.insertId,
        affectedRows: rows.affectedRows
      };
    }
    return rows;
  } else {
    return new Promise((resolve, reject) => {
      const trimmed = sql.trim().toUpperCase();
      if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({
            insertId: this.lastID,
            affectedRows: this.changes
          });
        });
      }
    });
  }
}

/**
 * Convenience helper to get a single row
 */
export async function getOne(sql, params = []) {
  const rows = await query(sql, params);
  if (Array.isArray(rows)) {
    return rows[0] || null;
  }
  return null;
}

/**
 * Transaction Wrapper
 */
export async function transaction(callback) {
  if (activeClient === 'mysql') {
    const connection = await mysqlPool.getConnection();
    await connection.beginTransaction();
    try {
      const txHelper = {
        query: async (sql, params = []) => {
          const [res] = await connection.execute(sql, params);
          return res;
        },
        getOne: async (sql, params = []) => {
          const [res] = await connection.execute(sql, params);
          return Array.isArray(res) ? res[0] : null;
        }
      };
      const result = await callback(txHelper);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } else {
    await query('BEGIN TRANSACTION');
    try {
      const txHelper = {
        query: (sql, params = []) => query(sql, params),
        getOne: (sql, params = []) => getOne(sql, params)
      };
      const result = await callback(txHelper);
      await query('COMMIT');
      return result;
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }
}

export function getActiveClient() {
  return activeClient;
}

export default {
  initDatabase,
  query,
  getOne,
  transaction,
  getActiveClient
};
