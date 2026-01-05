// dataset loader for sql.js
let db = null;
let currentDataset = 'employees';

const datasets = {
  employees: '/assets/datasets/employees.json',
  customers: '/assets/datasets/customers.json',
  orders: '/assets/datasets/orders.json',
  products: '/assets/datasets/products.json',
  sales: '/assets/datasets/sales.json',
  departments: '/assets/datasets/departments.json',
  transactions: '/assets/datasets/transactions.json'
};

// init sql.js
async function initDB() {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
    db = new SQL.Database();
    console.log('Database initialized');
    return db;
  } catch (e) {
    console.error('Failed to init DB:', e);
    throw e;
  }
}

// load dataset from json
async function loadDataset(name) {
  if (!datasets[name]) {
    throw new Error(`Dataset ${name} not found`);
  }

  console.log(`Loading dataset: ${name} from ${datasets[name]}`);

  try {
    const response = await fetch(datasets[name]);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to load ${name}`);
    }

    const dataset = await response.json();
    console.log('Dataset loaded:', dataset.name, 'rows:', dataset.rows);

    currentDataset = name;

    // drop table if exists
    try {
      db.run(`DROP TABLE IF EXISTS ${dataset.name}`);
      console.log(`Dropped existing table: ${dataset.name}`);
    } catch (e) {
      console.log('No existing table to drop');
    }

    // create table
    const cols = dataset.columns.map(c => `${c.name} ${c.type}`).join(', ');
    const createSQL = `CREATE TABLE ${dataset.name} (${cols})`;
    console.log('Creating table:', createSQL);
    db.run(createSQL);
    console.log('Table created successfully');

    // insert data
    const placeholders = dataset.columns.map(() => '?').join(', ');
    const insertSQL = `INSERT INTO ${dataset.name} VALUES (${placeholders})`;
    const stmt = db.prepare(insertSQL);

    let insertedRows = 0;
    for (const row of dataset.data) {
      stmt.run(row);
      insertedRows++;
    }
    stmt.free();

    console.log(`Inserted ${insertedRows} rows into ${dataset.name}`);

    // verify data
    const verify = db.exec(`SELECT COUNT(*) as count FROM ${dataset.name}`);
    console.log('Verification query result:', verify);

    return dataset;
  } catch (e) {
    console.error('Error loading dataset:', e);
    throw e;
  }
}

// run query
function runQuery(sql) {
  if (!db) {
    return {
      success: false,
      data: null,
      error: 'Database not initialized'
    };
  }

  console.log('Running query:', sql);

  try {
    const result = db.exec(sql);
    console.log('Query result:', result);
    return {
      success: true,
      data: result,
      error: null
    };
  } catch (e) {
    console.error('Query error:', e);
    return {
      success: false,
      data: null,
      error: e.message
    };
  }
}

// get table schema
function getSchema(tableName) {
  if (!db) return null;

  try {
    const result = db.exec(`PRAGMA table_info(${tableName})`);
    if (result.length === 0) return null;

    return result[0].values.map(row => ({
      name: row[1],
      type: row[2],
      nullable: row[3] === 0
    }));
  } catch (e) {
    console.error('Schema error:', e);
    return null;
  }
}

// get row count
function getRowCount(tableName) {
  if (!db) return 0;

  try {
    const result = db.exec(`SELECT COUNT(*) FROM ${tableName}`);
    return result[0].values[0][0];
  } catch (e) {
    return 0;
  }
}

// format results for display
function formatResults(execResult) {
  if (!execResult || execResult.length === 0) {
    return { columns: [], rows: [] };
  }

  const data = execResult[0];
  return {
    columns: data.columns,
    rows: data.values
  };
}

// make functions global
window.initDB = initDB;
window.loadDataset = loadDataset;
window.runQuery = runQuery;
window.getSchema = getSchema;
window.getRowCount = getRowCount;
window.formatResults = formatResults;
window.getCurrentDataset = () => currentDataset;
