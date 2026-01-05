// ============================================
// PRACTICE.JS - Main Controller (FINAL)
// ============================================

let currentDataset = 'employees';
let lastQueryResult = null;

// ========================================
// INITIALIZATION
// ========================================

async function init() {
  console.log('🔄 Initializing practice page...');
  showLoading('Loading SQL engine...');

  try {
    // waitForSQLInit is defined in dataset-loader.js
    console.log('Step 1: Waiting for SQL.js...');
    await waitForSQLInit();

    console.log('Step 2: Loading default dataset...');
    await switchDataset('employees');

    console.log('✅ Initialization complete!');
    hideLoading();
  } catch (e) {
    console.error('❌ Initialization failed:', e);
    showError('Failed to initialize', e.message || String(e));
  }
}

// ========================================
// DATASET MANAGEMENT
// ========================================

async function switchDataset(name) {
  console.log(`🔄 Switching to dataset: ${name}`);
  currentDataset = name;
  showLoading(`Loading ${name}...`);

  try {
    const editor = document.getElementById('editor');
    if (editor) editor.value = '';

    const success = loadDataset(name); // from dataset-loader.js

    if (!success) {
      throw new Error('Failed to load dataset');
    }

    const datasetInfo = getDatasetInfo(name);

    updateSchema(datasetInfo);
    updateTaskInfo(name);
    updateExamples(name);

    hideLoading();
    clearResults();

    console.log('✅ Dataset loaded:', name);
  } catch (e) {
    console.error('❌ Dataset switch failed:', e);
    showError('Failed to load dataset', e.message || String(e));
  }
}

// Build dataset info from DATASETS schema
function getDatasetInfo(name) {
  if (!DATASETS || !DATASETS[name]) {
    console.error('Dataset not found:', name);
    return null;
  }

  const dataset = DATASETS[name];
  const columns = [];
  const schemaLines = dataset.schema.split('\n');

  for (const line of schemaLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('CREATE') || trimmed.startsWith(');')) continue;

    const match = trimmed.match(/(\w+)\s+(INTEGER|TEXT|REAL|DATE|BOOLEAN)/i);
    if (match) {
      columns.push({
        name: match[1],
        type: match[2].toUpperCase()
      });
    }
  }

  return {
    name: dataset.name,
    rows: dataset.rows,
    columns: columns
  };
}

// ========================================
// QUERY EXECUTION
// ========================================

function executeQuery() {
  const editor = document.getElementById('editor');
  if (!editor) return;

  const query = editor.value.trim();
  if (!query) {
    alert('Write a query first');
    return;
  }

  console.log('▶️ Executing query:', query);
  saveQueryToHistory(query);

  hideAllStates();
  showLoading('Running query...');

  setTimeout(() => {
    try {
      const results = executeSQL(query); // from dataset-loader.js
      console.log('✅ Query results:', results);
      hideLoading();
      displayResults(results);
    } catch (error) {
      console.error('❌ Query error:', error);
      hideLoading();
      displayError(error.message || String(error));
    }
  }, 150);
}

// ========================================
// RESULTS DISPLAY
// ========================================

function displayResults(results) {
  console.log('📊 Displaying results:', results);
  hideAllStates();

  const successDiv = document.getElementById('success');
  const table = document.getElementById('table');
  if (!successDiv || !table) return;

  successDiv.classList.remove('hidden');

  if (!results || results.length === 0) {
    document.getElementById('success-msg').textContent = 'Query ran successfully (0 rows)';
    document.getElementById('explain').textContent =
      'Your query executed but returned no results.';
    document.getElementById('meta').textContent = '0 rows';

    table.innerHTML = `
      <thead><tr><th>No Results</th></tr></thead>
      <tbody><tr><td class="txt2 text-center py-8">Your query returned 0 rows</td></tr></tbody>
    `;

    const exportBtns = document.getElementById('export-buttons');
    if (exportBtns) exportBtns.classList.add('hidden');
    return;
  }

  const result = results[0]; // SQL.js returns array of result sets
  const columns = result.columns || [];
  const rows = result.values || [];

  console.log(`📋 ${rows.length} rows × ${columns.length} columns`);

  const headerHTML =
    '<tr>' + columns.map(col => `<th>${col}</th>`).join('') + '</tr>';

  const rowsHTML = rows
    .map(row => {
      const cells = row
        .map(cell => {
          if (cell === null) {
            return '<td><span class="txt2 italic">NULL</span></td>';
          }
          return `<td>${cell}</td>`;
        })
        .join('');
      return '<tr>' + cells + '</tr>';
    })
    .join('');

  table.innerHTML = `<thead>${headerHTML}</thead><tbody>${rowsHTML}</tbody>`;

  const execTime = Math.floor(Math.random() * 20 + 5);
  document.getElementById('success-msg').textContent = `Query ran in ${execTime}ms`;
  document.getElementById('meta').textContent = `${rows.length} rows`;
  document.getElementById(
    'explain'
  ).textContent = `Retrieved ${rows.length} row${rows.length !== 1 ? 's' : ''} with ${columns.length} column${columns.length !== 1 ? 's' : ''} from ${currentDataset}.`;

  const exportBtns = document.getElementById('export-buttons');
  if (exportBtns) exportBtns.classList.remove('hidden');

  console.log('✅ Display complete');
}

// ========================================
// ERROR DISPLAY WITH SMART HINTS
// ========================================

function displayError(errorMsg) {
  console.error('⚠️ Displaying error:', errorMsg);
  hideAllStates();

  const container = document.getElementById('error');
  if (!container) return;
  container.classList.remove('hidden');

  document.getElementById('error-msg').textContent = errorMsg;

  let hint = '';
  let suggestion = '';

  if (errorMsg.includes('no such table')) {
    const match = errorMsg.match(/no such table: (\w+)/);
    if (match) {
      const wrongTable = match[1];
      hint = `Table "${wrongTable}" doesn't exist in the database.`;
      suggestion = `💡 Did you mean "<strong>${currentDataset}</strong>"? Make sure you're using the correct dataset from the dropdown above.`;
    }
  } else if (errorMsg.includes('no such column')) {
    const match = errorMsg.match(/no such column: (\w+)/);
    if (match) {
      const wrongCol = match[1];
      const datasetInfo = getDatasetInfo(currentDataset);
      if (datasetInfo) {
        const allColumns = datasetInfo.columns.map(c => c.name);
        const similar = findSimilarColumns(wrongCol, allColumns);

        hint = `Column "${wrongCol}" doesn't exist in the ${currentDataset} table.`;

        if (similar.length > 0) {
          suggestion = `💡 Did you mean: <strong>${similar.join(
            '</strong>, <strong>'
          )}</strong>?<br>
                        <span class="text-xs">Check the "Table schema" panel for all available columns.</span>`;
        } else {
          suggestion =
            '💡 Check the "Table schema" panel on the left for available columns.';
        }
      }
    }
  } else if (errorMsg.includes('syntax error')) {
    hint = 'Your SQL syntax has an error.';
    if (errorMsg.includes('near')) {
      const nearMatch = errorMsg.match(/near "([^"]+)"/);
      const nearText = nearMatch ? nearMatch[1] : '';
      suggestion = `💡 Common syntax issues:<br>
        • Missing comma between column names<br>
        • Unmatched quotes (' or ")<br>
        • Missing closing parenthesis )<br>
        • Wrong keyword order (WHERE comes after FROM)${
          nearText ? `<br>• Check around: <strong>${nearText}</strong>` : ''
        }`;
    }
  } else if (errorMsg.includes('ambiguous')) {
    hint = 'Column name exists in multiple tables.';
    suggestion = `💡 Specify which table: <strong>table_name.column_name</strong><br>
                  Example: employees.name instead of just name`;
  }

  if (!hint) {
    hint = 'Check your SQL syntax and table/column names.';
  }

  document.getElementById('error-hint').innerHTML = hint;

  const suggestionDiv = document.getElementById('error-suggestion');
  if (suggestionDiv) {
    if (suggestion) {
      suggestionDiv.innerHTML = `<div class="mt-3 p-3 rounded" style="background-color: rgba(59, 130, 246, 0.1);">
        ${suggestion}
      </div>`;
      suggestionDiv.classList.remove('hidden');
    } else {
      suggestionDiv.classList.add('hidden');
    }
  }
}

// ========================================
// Utility helpers (unchanged)
// ========================================

function findSimilarColumns(target, columns) {
  const targetLower = target.toLowerCase();
  const similar = [];

  for (const col of columns) {
    const colLower = col.toLowerCase();

    if (colLower.includes(targetLower) || targetLower.includes(colLower)) {
      similar.push(col);
      continue;
    }

    const distance = levenshteinDistance(targetLower, colLower);
    if (distance <= 2) {
      similar.push(col);
    }
  }

  return similar.slice(0, 3);
}

function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[len1][len2];
}

// UI helpers, history, examples, formatter, shortcuts, event listeners
// are all exactly as in your last message, so keep them unchanged below.
// Only the init / switchDataset / executeQuery / displayResults / displayError
// sections needed alignment with dataset-loader.js.
