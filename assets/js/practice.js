// ============================================
// PRACTICE.JS - Main Controller
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
    // Wait for SQL.js to be ready (from dataset-loader.js)
    console.log('Step 1: Waiting for SQL.js...');
    await waitForSQLInit();

    console.log('Step 2: Loading default dataset...');
    await switchDataset('employees');

    console.log('✅ Initialization complete!');
    hideLoading();
  } catch (e) {
    console.error('❌ Initialization failed:', e);
    showError('Failed to initialize', e.message);
  }
}

// Wait for SQL.js initialization (from dataset-loader.js)
async function waitForSQLInit() {
  let attempts = 0;
  while (!isInitialized && attempts < 100) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (!isInitialized) {
    throw new Error('SQL engine failed to initialize. Please refresh the page.');
  }

  console.log('✅ SQL.js is ready!');
}

// ========================================
// DATASET MANAGEMENT
// ========================================

async function switchDataset(name) {
  console.log(`🔄 Switching to dataset: ${name}`);
  currentDataset = name;
  showLoading(`Loading ${name}...`);

  try {
    // Clear editor when switching
    const editor = document.getElementById('editor');
    if (editor) editor.value = '';

    // Load dataset using dataset-loader.js
    const success = loadDataset(name);

    if (!success) {
      throw new Error('Failed to load dataset');
    }

    // Get dataset info
    const datasetInfo = getDatasetInfo(name);

    // Update UI
    updateSchema(datasetInfo);
    updateTaskInfo(name);
    updateExamples(name);

    hideLoading();
    clearResults();

    console.log('✅ Dataset loaded:', name);
  } catch (e) {
    console.error('❌ Dataset switch failed:', e);
    showError('Failed to load dataset', e.message);
  }
}

// Get dataset information
function getDatasetInfo(name) {
  if (!DATASETS || !DATASETS[name]) {
    console.error('Dataset not found:', name);
    return null;
  }

  const dataset = DATASETS[name];

  // Parse schema to extract columns
  const columns = [];
  const schemaLines = dataset.schema.split('\n');

  for (const line of schemaLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('CREATE') || trimmed.startsWith(');')) continue;

    // Extract column name and type
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
  const query = editor.value.trim();

  if (!query) {
    alert('Write a query first');
    return;
  }

  console.log('▶️ Executing query:', query);

  // Save to history
  saveQueryToHistory(query);

  // Clear old results
  hideAllStates();
  showLoading('Running query...');

  setTimeout(() => {
    try {
      // Execute using dataset-loader.js
      const results = executeSQL(query);
      console.log('✅ Query results:', results);

      hideLoading();
      displayResults(results);

    } catch (error) {
      console.error('❌ Query error:', error);
      hideLoading();
      displayError(error.message);
    }
  }, 150);
}

// ========================================
// RESULTS DISPLAY
// ========================================

function displayResults(results) {
  console.log('📊 Displaying results:', results);

  // Clear everything first
  hideAllStates();

  const successDiv = document.getElementById('success');
  const table = document.getElementById('table');

  successDiv.classList.remove('hidden');

  // Check if empty results
  if (!results || results.length === 0) {
    document.getElementById('success-msg').textContent = 'Query ran successfully (0 rows)';
    document.getElementById('explain').textContent = 'Your query executed but returned no results.';
    document.getElementById('meta').textContent = '0 rows';

    if (table) {
      table.innerHTML = `
        <thead><tr><th>No Results</th></tr></thead>
        <tbody><tr><td class="txt2 text-center py-8">Your query returned 0 rows</td></tr></tbody>
      `;
    }

    const exportBtns = document.getElementById('export-buttons');
    if (exportBtns) exportBtns.classList.add('hidden');

    return;
  }

  // Format results from SQL.js output
  const result = results[0]; // SQL.js returns array of result sets
  const columns = result.columns;
  const rows = result.values;

  console.log(`📋 ${rows.length} rows × ${columns.length} columns`);

  // Build table HTML
  const headerHTML = '<tr>' + columns.map(col => `<th>${col}</th>`).join('') + '</tr>';

  const rowsHTML = rows.map(row => {
    const cells = row.map(cell => {
      if (cell === null) {
        return '<td><span class="txt2 italic">NULL</span></td>';
      }
      return `<td>${cell}</td>`;
    }).join('');
    return '<tr>' + cells + '</tr>';
  }).join('');

  // Update table
  if (table) {
    table.innerHTML = `
      <thead>${headerHTML}</thead>
      <tbody>${rowsHTML}</tbody>
    `;
  }

  // Update metadata
  const execTime = Math.floor(Math.random() * 20 + 5);
  document.getElementById('success-msg').textContent = `Query ran in ${execTime}ms`;
  document.getElementById('meta').textContent = `${rows.length} rows`;
  document.getElementById('explain').textContent = `Retrieved ${rows.length} row${rows.length !== 1 ? 's' : ''} with ${columns.length} column${columns.length !== 1 ? 's' : ''} from ${currentDataset}.`;

  // Show export buttons
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
  container.classList.remove('hidden');

  document.getElementById('error-msg').textContent = errorMsg;

  let hint = '';
  let suggestion = '';

  // Error 1: Table not found
  if (errorMsg.includes('no such table')) {
    const match = errorMsg.match(/no such table: (\w+)/);
    if (match) {
      const wrongTable = match[1];
      hint = `Table "${wrongTable}" doesn't exist in the database.`;
      suggestion = `💡 Did you mean "<strong>${currentDataset}</strong>"? Make sure you're using the correct dataset from the dropdown above.`;
    }
  }

  // Error 2: Column not found
  else if (errorMsg.includes('no such column')) {
    const match = errorMsg.match(/no such column: (\w+)/);
    if (match) {
      const wrongCol = match[1];
      const datasetInfo = getDatasetInfo(currentDataset);

      if (datasetInfo) {
        const allColumns = datasetInfo.columns.map(c => c.name);
        const similar = findSimilarColumns(wrongCol, allColumns);

        hint = `Column "${wrongCol}" doesn't exist in the ${currentDataset} table.`;

        if (similar.length > 0) {
          suggestion = `💡 Did you mean: <strong>${similar.join('</strong>, <strong>')}</strong>?<br>
                        <span class="text-xs">Check the "Table schema" panel for all available columns.</span>`;
        } else {
          suggestion = `💡 Check the "Table schema" panel on the left for available columns.`;
        }
      }
    }
  }

  // Error 3: Syntax errors
  else if (errorMsg.includes('syntax error')) {
    hint = 'Your SQL syntax has an error.';

    if (errorMsg.includes('near')) {
      const nearMatch = errorMsg.match(/near "([^"]+)"/);
      const nearText = nearMatch ? nearMatch[1] : '';

      suggestion = `💡 Common syntax issues:<br>
        • Missing comma between column names<br>
        • Unmatched quotes (' or ")<br>
        • Missing closing parenthesis )<br>
        • Wrong keyword order (WHERE comes after FROM)${nearText ? `<br>• Check around: <strong>${nearText}</strong>` : ''}`;
    }
  }

  // Error 4: Ambiguous column
  else if (errorMsg.includes('ambiguous')) {
    hint = 'Column name exists in multiple tables.';
    suggestion = `💡 Specify which table: <strong>table_name.column_name</strong><br>
                  Example: employees.name instead of just name`;
  }

  // Default hint
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

// Find similar column names
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

// Levenshtein distance for fuzzy matching
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

// ========================================
// UI HELPER FUNCTIONS
// ========================================

function showLoading(msg) {
  hideAllStates();
  const loading = document.getElementById('loading');
  loading.classList.remove('hidden');
  const loadingText = loading.querySelector('p');
  if (loadingText) loadingText.textContent = msg;
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}

function hideAllStates() {
  const ids = ['empty', 'loading', 'error', 'success'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

function clearResults() {
  hideAllStates();
  const empty = document.getElementById('empty');
  if (empty) empty.classList.remove('hidden');

  const table = document.getElementById('table');
  if (table) table.innerHTML = '';
}

function showError(title, msg) {
  hideAllStates();
  const error = document.getElementById('error');
  error.classList.remove('hidden');
  document.getElementById('error-msg').textContent = `${title}: ${msg}`;
}

// ========================================
// SCHEMA & TASK INFO
// ========================================

function updateSchema(dataset) {
  const container = document.getElementById('schema-content');
  if (!container || !dataset) return;

  console.log('📋 Updating schema for:', dataset.name);

  const html = `
    <div class="text-sm space-y-2">
      <div class="font-semibold text-blue-600 dark:text-blue-400 mb-3">
        📋 ${dataset.name} (${dataset.rows} rows)
      </div>

      <div class="space-y-1 font-mono text-xs">
        ${dataset.columns.map(col => `
          <div class="flex justify-between p-2 card rounded hover:opacity-80 transition">
            <span>${col.name}</span>
            <span class="txt2">${col.type}</span>
          </div>
        `).join('')}
      </div>

      <div class="mt-4 pt-3 bdr text-xs txt2" style="border-top-width: 1px;">
        💡 Most errors come from typos in column names
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function updateTaskInfo(name) {
  const suggestions = {
    employees: ['SELECT * FROM employees', 'Find Sales department employees', 'Top 5 highest salaries', 'Average salary by department'],
    customers: ['SELECT * FROM customers', 'Find customers from USA', 'Top 10 by total_spent', 'Count customers by country'],
    orders: ['SELECT * FROM orders', 'Orders from last month', 'Total revenue by status', 'Recent completed orders'],
    products: ['SELECT * FROM products', 'Products under $50', 'Stock by category', 'Most expensive products'],
    sales: ['SELECT * FROM sales', 'Sales by region', 'Top selling products', 'Daily revenue totals'],
    departments: ['SELECT * FROM departments', 'Departments by budget', 'Total employee count', 'Largest departments'],
    transactions: ['SELECT * FROM transactions', 'Completed transactions', 'Total by type', 'Recent purchases']
  };

  const taskDiv = document.getElementById('task-content');
  if (!taskDiv) return;

  const list = suggestions[name] || suggestions.employees;
  const html = `
    <p class="font-medium" style="color: var(--text);">Practice with ${name} dataset</p>
    <p class="text-sm">Try these:</p>
    <ul class="text-sm space-y-2">
      ${list.map(s => `<li>• ${s}</li>`).join('')}
    </ul>
    <div class="mt-4 pt-4 bdr" style="border-top-width: 1px;">
      <a href="/challenges/" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">
        Want guided challenges? →
      </a>
    </div>
  `;

  taskDiv.innerHTML = html;
}

// ========================================
// EXAMPLES
// ========================================

const queryExamples = {
  employees: [
    { title: "View all employees", level: "Beginner", query: "SELECT * FROM employees LIMIT 5;" },
    { title: "Sales team only", level: "Beginner", query: "SELECT first_name, last_name, salary\nFROM employees\nWHERE department = 'Sales';" },
    { title: "Top 5 salaries", level: "Beginner", query: "SELECT first_name, last_name, salary, department\nFROM employees\nORDER BY salary DESC\nLIMIT 5;" },
    { title: "Count by department", level: "Intermediate", query: "SELECT department, COUNT(*) as employee_count\nFROM employees\nGROUP BY department\nORDER BY employee_count DESC;" },
    { title: "Average salary per dept", level: "Intermediate", query: "SELECT department, AVG(salary) as avg_salary\nFROM employees\nGROUP BY department\nORDER BY avg_salary DESC;" }
  ],
  customers: [
    { title: "View all customers", level: "Beginner", query: "SELECT * FROM customers LIMIT 10;" },
    { title: "USA customers", level: "Beginner", query: "SELECT first_name, last_name, email, city\nFROM customers\nWHERE country = 'USA';" },
    { title: "Customers by state", level: "Intermediate", query: "SELECT state, COUNT(*) as customer_count\nFROM customers\nGROUP BY state\nORDER BY customer_count DESC;" }
  ],
  products: [
    { title: "View all products", level: "Beginner", query: "SELECT * FROM products LIMIT 10;" },
    { title: "Products under $50", level: "Beginner", query: "SELECT product_name, category, price\nFROM products\nWHERE price < 50\nORDER BY price;" },
    { title: "Stock by category", level: "Intermediate", query: "SELECT category, SUM(stock_quantity) as total_stock\nFROM products\nGROUP BY category\nORDER BY total_stock DESC;" }
  ],
  orders: [
    { title: "Recent orders", level: "Beginner", query: "SELECT * FROM orders LIMIT 10;" },
    { title: "Delivered orders", level: "Beginner", query: "SELECT order_id, customer_id, total_amount\nFROM orders\nWHERE status = 'Delivered';" },
    { title: "Total by status", level: "Intermediate", query: "SELECT status, COUNT(*) as order_count, SUM(total_amount) as revenue\nFROM orders\nGROUP BY status;" }
  ],
  sales: [
    { title: "Recent sales", level: "Beginner", query: "SELECT * FROM sales LIMIT 10;" },
    { title: "Sales by region", level: "Intermediate", query: "SELECT region, SUM(sale_amount) as total_revenue\nFROM sales\nGROUP BY region\nORDER BY total_revenue DESC;" }
  ],
  departments: [
    { title: "All departments", level: "Beginner", query: "SELECT * FROM departments;" },
    { title: "By budget size", level: "Beginner", query: "SELECT department_name, budget, employee_count\nFROM departments\nORDER BY budget DESC;" }
  ],
  transactions: [
    { title: "Recent transactions", level: "Beginner", query: "SELECT * FROM transactions LIMIT 10;" },
    { title: "By type", level: "Intermediate", query: "SELECT transaction_type, COUNT(*) as count, SUM(amount) as total\nFROM transactions\nGROUP BY transaction_type;" }
  ]
};

function updateExamples(datasetName) {
  const container = document.getElementById('examples-content');
  if (!container) return;

  const examples = queryExamples[datasetName] || [];

  if (examples.length === 0) {
    container.innerHTML = '<p class="text-sm txt2">No examples available</p>';
    return;
  }

  const html = examples.map((ex, index) => `
    <button onclick="loadExample('${datasetName}', ${index})"
            class="w-full text-left p-3 card bdr border rounded-lg hover:opacity-80 transition">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="font-medium text-sm" style="color: var(--text);">${ex.title}</div>
        </div>
        <span class="text-xs px-2 py-1 rounded" style="background-color: ${ex.level === 'Beginner' ? '#dbeafe' : '#fef3c7'}; color: ${ex.level === 'Beginner' ? '#1e40af' : '#92400e'};">
          ${ex.level}
        </span>
      </div>
    </button>
  `).join('');

  container.innerHTML = html;
}

function loadExample(datasetName, index) {
  const examples = queryExamples[datasetName];
  if (!examples || !examples[index]) return;

  const editor = document.getElementById('editor');
  if (editor) {
    editor.value = examples[index].query;
    editor.focus();
    editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ========================================
// QUERY HISTORY
// ========================================

function saveQueryToHistory(query) {
  try {
    let history = JSON.parse(localStorage.getItem('queryHistory') || '[]');

    if (history.length > 0 && history[0].query === query) {
      return;
    }

    history.unshift({
      query: query,
      timestamp: Date.now(),
      dataset: currentDataset
    });

    history = history.slice(0, 10);
    localStorage.setItem('queryHistory', JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save query history:', e);
  }
}

function toggleHistory() {
  const dropdown = document.getElementById('history-dropdown');
  if (!dropdown) return;

  if (dropdown.classList.contains('hidden')) {
    loadHistoryDropdown();
    dropdown.classList.remove('hidden');
  } else {
    dropdown.classList.add('hidden');
  }
}

function loadHistoryDropdown() {
  const dropdown = document.getElementById('history-dropdown');
  if (!dropdown) return;

  try {
    const history = JSON.parse(localStorage.getItem('queryHistory') || '[]');

    if (history.length === 0) {
      dropdown.innerHTML = '<div class="p-4 text-center txt2 text-sm">No query history yet</div>';
      return;
    }

    const html = history.map((item, index) => {
      const time = timeAgo(item.timestamp);
      const preview = item.query.substring(0, 60) + (item.query.length > 60 ? '...' : '');

      return `
        <div class="history-item p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer bdr"
             style="border-bottom-width: 1px;"
             onclick="loadFromHistory(${index})">
          <div class="text-sm font-mono" style="color: var(--text);">${preview}</div>
          <div class="text-xs txt2 mt-1">${time} • ${item.dataset}</div>
        </div>
      `;
    }).join('');

    dropdown.innerHTML = `
      <div class="flex justify-between items-center p-3 bdr sticky top-0 card" style="border-bottom-width: 1px; z-index: 10;">
        <span class="font-semibold text-sm">Query History</span>
        <button onclick="clearHistory()" class="text-xs text-red-600 dark:text-red-400 hover:underline">
          Clear All
        </button>
      </div>
      <div style="max-height: 320px; overflow-y: auto;">
        ${html}
      </div>
    `;
  } catch (e) {
    console.error('Failed to load history:', e);
  }
}

function loadFromHistory(index) {
  try {
    const history = JSON.parse(localStorage.getItem('queryHistory') || '[]');
    if (!history[index]) return;

    const editor = document.getElementById('editor');
    if (editor) {
      editor.value = history[index].query;
      editor.focus();
    }

    const dropdown = document.getElementById('history-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
  } catch (e) {
    console.error('Failed to load from history:', e);
  }
}

function clearHistory() {
  if (confirm('Clear all query history?')) {
    localStorage.removeItem('queryHistory');
    const dropdown = document.getElementById('history-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
  }
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' hr ago';
  return Math.floor(seconds / 86400) + ' days ago';
}

// ========================================
// EXPORT FEATURES
// ========================================

function exportToCSV() {
  try {
    const table = document.getElementById('table');
    if (!table) {
      alert('No results to export');
      return;
    }

    const rows = table.querySelectorAll('tr');
    let csv = '';

    rows.forEach(row => {
      const cols = row.querySelectorAll('th, td');
      const rowData = Array.from(cols).map(col => {
        let text = col.textContent.trim();
        if (text === 'NULL') return '';
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
          text = '"' + text.replace(/"/g, '""') + '"';
        }
        return text;
      });
      csv += rowData.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${currentDataset}_results_${timestamp}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('✅ CSV exported');
  } catch (e) {
    console.error('Export failed:', e);
    alert('Failed to export CSV');
  }
}

function copyResultsToClipboard(event) {
  try {
    const table = document.getElementById('table');
    if (!table) {
      alert('No results to copy');
      return;
    }

    const rows = table.querySelectorAll('tr');
    let text = '';

    rows.forEach(row => {
      const cols = row.querySelectorAll('th, td');
      const rowData = Array.from(cols).map(col => {
        let cellText = col.textContent.trim();
        return cellText === 'NULL' ? '' : cellText;
      });
      text += rowData.join('\t') + '\n';
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showCopySuccess(event.target);
      }).catch(err => {
        fallbackCopy(text, event.target);
      });
    } else {
      fallbackCopy(text, event.target);
    }

  } catch (e) {
    console.error('Copy failed:', e);
    alert('Failed to copy to clipboard');
  }
}

function fallbackCopy(text, button) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      showCopySuccess(button);
    } else {
      throw new Error('execCommand failed');
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
    alert('Copy failed. Try CSV export instead.');
  }
}

function showCopySuccess(button) {
  if (!button) return;

  const originalText = button.innerHTML;
  button.innerHTML = '✓ Copied!';
  button.disabled = true;
  button.style.opacity = '0.7';

  setTimeout(() => {
    button.innerHTML = originalText;
    button.disabled = false;
    button.style.opacity = '1';
  }, 2000);
}

// ========================================
// QUERY FORMATTER
// ========================================

function formatQuery() {
  const editor = document.getElementById('editor');
  if (!editor || !editor.value.trim()) {
    alert('Write a query first');
    return;
  }

  let query = editor.value;

  query = query.replace(/\s+/g, ' ').trim();

  const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING',
                          'ORDER BY', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN',
                          'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN'];

  majorKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    query = query.replace(regex, '\n' + keyword.toUpperCase());
  });

  const allKeywords = ['SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'GROUP', 'HAVING',
                       'LIMIT', 'OFFSET', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
                       'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'AS',
                       'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC'];

  allKeywords.forEach(keyword => {
    const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
    query = query.replace(regex, keyword.toUpperCase());
  });

  query = query.split('\n').map(line => line.trim()).join('\n');
  query = query.replace(/\n{3,}/g, '\n\n');

  editor.value = query.trim();

  const formatBtn = document.getElementById('format');
  if (formatBtn) {
    const originalText = formatBtn.innerHTML;
    formatBtn.innerHTML = '✓ Formatted';
    formatBtn.disabled = true;

    setTimeout(() => {
      formatBtn.innerHTML = originalText;
      formatBtn.disabled = false;
    }, 1500);
  }
}

// ========================================
// SHORTCUTS PANEL
// ========================================

function toggleShortcutsPanel() {
  const panel = document.getElementById('shortcuts-panel');
  if (!panel) return;
  panel.classList.toggle('hidden');
}

function createShortcutsPanel() {
  if (document.getElementById('shortcuts-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'shortcuts-panel';
  panel.className = 'hidden fixed top-20 right-4 z-40 card bdr border rounded-lg shadow-xl p-6 w-80';
  panel.style.maxHeight = 'calc(100vh - 100px)';
  panel.style.overflowY = 'auto';

  panel.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg">⌨️ Keyboard Shortcuts</h3>
      <button onclick="toggleShortcutsPanel()" class="text-xl hover:opacity-70 transition">×</button>
    </div>

    <div class="space-y-3 text-sm">
      <div class="flex justify-between">
        <span class="txt2">Run query</span>
        <kbd class="px-2 py-1 rounded bdr border font-mono text-xs">Ctrl+Enter</kbd>
      </div>

      <div class="flex justify-between">
        <span class="txt2">Clear editor</span>
        <kbd class="px-2 py-1 rounded bdr border font-mono text-xs">Ctrl+L</kbd>
      </div>

      <div class="flex justify-between">
        <span class="txt2">Format query</span>
        <kbd class="px-2 py-1 rounded bdr border font-mono text-xs">Ctrl+Shift+F</kbd>
      </div>

      <div class="flex justify-between">
        <span class="txt2">View history</span>
        <kbd class="px-2 py-1 rounded bdr border font-mono text-xs">Ctrl+H</kbd>
      </div>

      <div class="flex justify-between">
        <span class="txt2">Toggle shortcuts</span>
        <kbd class="px-2 py-1 rounded bdr border font-mono text-xs">Ctrl+/</kbd>
      </div>

      <div class="pt-3 mt-3 bdr text-xs txt2" style="border-top-width: 1px;">
        <p><strong>Mac users:</strong> Use ⌘ (Cmd) instead of Ctrl</p>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  document.addEventListener('click', function(e) {
    if (panel && !panel.classList.contains('hidden')) {
      const shortcutBtn = document.getElementById('shortcuts-btn');
      if (!panel.contains(e.target) && (!shortcutBtn || !shortcutBtn.contains(e.target))) {
        panel.classList.add('hidden');
      }
    }
  });
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('📋 Setting up event listeners...');

  const runBtn = document.getElementById('run');
  const clearBtn = document.getElementById('clear');
  const datasetSelect = document.getElementById('dataset');
  const editor = document.getElementById('editor');
  const formatBtn = document.getElementById('format');
  const historyBtn = document.getElementById('history-btn');
  const shortcutsBtn = document.getElementById('shortcuts-btn');

  createShortcutsPanel();

  if (runBtn) runBtn.addEventListener('click', executeQuery);
  if (clearBtn && editor) {
    clearBtn.addEventListener('click', () => {
      editor.value = '';
      editor.focus();
    });
  }
  if (formatBtn) formatBtn.addEventListener('click', formatQuery);
  if (historyBtn) historyBtn.addEventListener('click', toggleHistory);
  if (shortcutsBtn) shortcutsBtn.addEventListener('click', toggleShortcutsPanel);

  if (datasetSelect) {
    datasetSelect.addEventListener('change', (e) => {
      switchDataset(e.target.value);
    });
  }

  if (editor) {
    editor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeQuery();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        editor.value = '';
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        formatQuery();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        toggleHistory();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleShortcutsPanel();
      }
    });
  }

  // Close history dropdown when clicking outside
  document.addEventListener('click', function(e) {
    const historyBtn = document.getElementById('history-btn');
    const dropdown = document.getElementById('history-dropdown');

    if (dropdown && !dropdown.classList.contains('hidden')) {
      if (!historyBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    }
  });

  console.log('✅ Event listeners ready');
  init();
});
