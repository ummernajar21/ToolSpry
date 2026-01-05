// MINIMAL TEST dataset-loader.js
console.log('🔥 dataset-loader.js LOADED!');

let isInitialized = false;
let db = null;

// Make sure these are global
window.isInitialized = isInitialized;
window.db = db;

async function initSQLjs() {
  try {
    console.log('🔄 initSQLjs called');
    const SQL = await initSqlJs();
    db = new SQL.Database();
    isInitialized = true;
    window.isInitialized = true;
    console.log('✅ MINIMAL SQL.js ready!');
  } catch (e) {
    console.error('❌ initSQLjs failed:', e);
  }
}

window.initSQLjs = initSQLjs;
window.isInitialized = false;
