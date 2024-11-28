import { db } from "../config/index.js";
import { handleErrorInDatabaseFunctions } from "../utils/errorUtils.js";
import { DB_CONFIG } from "../constants/index.js";

class DatabaseHelper {
  async execute(sql, params = [], context = "") {
    if (!DB_CONFIG?.isEnabled) {
      return null;
    }
    let connection;
    try {
      connection = await db.pool.getConnection();
      await connection.beginTransaction();
      const [results] = await connection.execute(sql, params);
      await connection.commit();
      return results || null;
    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {}
      }
      handleErrorInDatabaseFunctions(
        error,
        context || "DatabaseHelper.executeTransaction"
      );
    } finally {
      if (connection) {
        try {
          connection.release();
        } catch (releaseError) {}
      }
    }
  }

  _sanitizeValues(data) {
    if (Array.isArray(data)) {
      return data.map((row) => this._sanitizeValues(row));
    }

    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === undefined ? null : value,
      ])
    );
  }

  _prepareWhereAndValue(conditions = {}) {
    const entries = Object.entries(conditions);
    const where = entries
      .map(([key, value]) => {
        if (value === "IS NOT NULL") {
          return `${key} IS NOT NULL`;
        }
        if (value === "IS NULL") {
          return `${key} IS NULL`;
        }
        return `${key} = ?`;
      })
      .join(" AND ");

    const values = entries
      .filter(([_, value]) => value !== "IS NOT NULL" && value !== "IS NULL")
      .map(([_, value]) => value);

    return { where, values };
  }

  async insert(table, data) {
    const sanitizedData = this._sanitizeValues(data);
    const keys = Object.keys(sanitizedData);
    const values = Object.values(sanitizedData);
    const placeholders = keys.map(() => "?").join(", ");

    const sql = `INSERT INTO ${table} (${keys.join(
      ", "
    )}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${keys
      .map((key) => `${key} = VALUES(${key})`)
      .join(", ")}`;

    return await this.execute(sql, values, "DatabaseHelper.insert");
  }

  async batchInsert(table, data) {
    if (!DB_CONFIG?.isEnabled || !data?.length) {
      return null;
    }

    const sanitizedData = this._sanitizeValues(data);
    const keys = Object.keys(sanitizedData[0]);

    const rowPlaceholders = sanitizedData
      .map(() => `(${keys.map(() => "?").join(", ")})`)
      .join(", ");

    const flattenedValues = sanitizedData.reduce((acc, row) => {
      return acc.concat(Object.values(row));
    }, []);

    const sql = `
      INSERT INTO ${table} (${keys.join(", ")})
      VALUES ${rowPlaceholders}
      ON DUPLICATE KEY UPDATE 
      ${keys.map((key) => `${key} = VALUES(${key})`).join(", ")}
    `;

    return await this.execute(
      sql,
      flattenedValues,
      "DatabaseHelper.batchInsert"
    );
  }

  async findOne(table, conditions = {}, orderBy = "") {
    const { where, values } = this._prepareWhereAndValue(conditions);

    const sql = `SELECT * FROM ${table} ${where ? `WHERE ${where}` : ""} ${
      orderBy ? `ORDER BY ${orderBy}` : ""
    } LIMIT 1`;

    console.log("sql", sql);

    const results = await this.execute(sql, values, "DatabaseHelper.findOne");

    return results?.[0] || null;
  }

  async find(table, conditions = {}, orderBy = "") {
    const { where, values } = this._prepareWhereAndValue(conditions);

    const sql = `SELECT * FROM ${table} ${where ? `WHERE ${where}` : ""} ${
      orderBy ? `ORDER BY ${orderBy}` : ""
    }`;

    return await this.execute(sql, values, "DatabaseHelper.find");
  }

  async getPaginatedData(table, conditions = {}, page, limit, orderBy = "") {
    const { where, values } = this._prepareWhereAndValue(conditions);
    const offset = (page - 1) * limit;

    const sql = `SELECT * FROM ${table} ${where ? `WHERE ${where}` : ""} ${
      orderBy ? `ORDER BY ${orderBy}` : ""
    } LIMIT ${limit} OFFSET ${offset}`;

    const countSql = `SELECT COUNT(*) AS total_entries FROM ${table} ${
      where ? `WHERE ${where}` : ""
    }`;

    const [data, totalEntries] = await Promise.all([
      this.execute(sql, values, "DatabaseHelper.getPaginatedData"),
      this.execute(countSql, values, "DatabaseHelper.getPaginatedData"),
    ]);

    return {
      data: data,
      pagination: {
        currentPage: page,
        lastPage: Math.ceil(totalEntries[0].total_entries / limit),
        total: totalEntries[0].total_entries,
        perPage:
          limit > totalEntries[0].total_entries
            ? totalEntries[0].total_entries
            : limit,
        hasNextPage: page * limit < totalEntries[0].total_entries,
      },
    };
  }

  async search(table, conditions = {}, page, limit) {
    // This is a FULLTEXT INDEX search
    // Only one condition is allowed for now

    const [primaryKey, searchKeyword] = Object.entries(conditions)[0];
    const offset = (page - 1) * limit;

    const fieldsForMatch = Array.isArray(primaryKey)
      ? primaryKey.join(", ")
      : primaryKey;

    const sql = `
        SELECT * FROM ${table}
        WHERE MATCH(${fieldsForMatch}) AGAINST('${searchKeyword}' IN NATURAL LANGUAGE MODE)
        LIMIT ${limit} OFFSET ${offset}
    `;

    const countSql = `
        SELECT COUNT(*) AS total_entries FROM ${table}
        WHERE MATCH(${fieldsForMatch}) AGAINST('${searchKeyword}' IN NATURAL LANGUAGE MODE)
    `;

    const [data, totalEntries] = await Promise.all([
      this.execute(sql, [], "DatabaseHelper.search"),
      this.execute(countSql, [], "DatabaseHelper.search"),
    ]);

    return {
      data: data,
      pagination: {
        currentPage: page,
        lastPage: Math.ceil(totalEntries[0].total_entries / limit),
        total: totalEntries[0].total_entries,
        perPage:
          limit > totalEntries[0].total_entries
            ? totalEntries[0].total_entries
            : limit,
        hasNextPage: page * limit < totalEntries[0].total_entries,
      },
    };
  }

  async truncateTable(table) {
    const sql = `TRUNCATE TABLE ${table}`;
    return await this.execute(sql, [], "DatabaseHelper.truncateTable");
  }

  async findDataByForeignKey(animeSyncTable, dataTable, condition = {}) {
    // pass only one condition
    const entries = Object.entries(condition);
    const [field, value] = entries[0];

    const sql = `SELECT dt.*
      FROM ${animeSyncTable} asi
      JOIN ${dataTable} dt ON asi.idAni = dt.idAni
      WHERE asi.${field} = ?`;

    const results = await this.execute(
      sql,
      [value],
      "DatabaseHelper.findDataByForeignKey"
    );

    return results?.[0] || null;
  }
}

export const dbHelper = new DatabaseHelper();
