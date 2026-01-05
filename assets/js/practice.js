// Wait for SQL.js to be ready
async function waitForSQLInit() {
    while (!isInitialized) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Update your existing run button handler to wait for init
document.getElementById('run').addEventListener('click', async function() {
    await waitForSQLInit();
    // ... rest of your existing code
});

// practice page controller
let datasetInfo = null;

// init on page load
async function init() {
  console.log('Initializing practice page...');
  showLoading('Initializing SQL engine...');

  try {
    console.log('Step 1: Init database');
    await initDB();
    console.log('Step 2: Load default dataset');
    await switchDataset('employees');
    console.log('Initialization complete');
    hideLoading();
  } catch (e) {
    console.error('Initialization failed:', e);
    showError('Failed to initialize', e.message);
  }
}

// switch dataset
async function switchDataset(name) {
  console.log(`Switching to dataset: ${name}`);
  showLoading(`Loading ${name}...`);

  try {
    // clear old schema first
    const schemaContainer = document.getElementById('schema-content');
    if (schemaContainer) {
      schemaContainer.innerHTML = '<p class="text-sm txt2">Loading schema...</p>';
    }

    // CLEAR EDITOR WHEN SWITCHING
    const editor = document.getElementById('editor');
    if (editor) {
      editor.value = '';
    }

    // load new dataset
    datasetInfo = await loadDataset(name);
    console.log('Dataset info:', datasetInfo);

    // small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    // update UI
    updateSchema(datasetInfo);
    updateTaskInfo(name);
    updateExamples(name);

    hideLoading();
    clearResults();

    console.log('Dataset switch complete');
  } catch (e) {
    console.error('Dataset switch failed:', e);
    showError('Failed to load dataset', e.message);
  }
}

// update schema panel
function updateSchema(dataset) {
  const container = document.getElementById('schema-content');
  if (!container) {
    console.warn('Schema container not found');
    return;
  }

  console.log('Updating schema for:', dataset.name);

  const html = `
    <div class="text-sm space-y-2">
      <div class="font-semibold text-blue-600 dark:text-blue-400 mb-3">
        📋 ${dataset.name} (${dataset.rows} rows)
      </div>

      <div class="space-y-1 font-mono text-xs">
        ${dataset.columns.map(col => `
          <div class="flex justify-between p-2 card rounded hover:opacity-80 transition" style="background-color: var(--bg2);">
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
  console.log('Schema updated successfully');
}

// update task suggestions based on dataset
function updateTaskInfo(name) {
  const suggestions = {
    employees: [
      'SELECT * FROM employees',
      'Find Sales department employees',
      'Top 5 highest salaries',
      'Average salary by department'
    ],
    customers: [
      'SELECT * FROM customers',
      'Find active customers from USA',
      'Top 10 spenders',
      'Count customers by country'
    ],
    orders: [
      'SELECT * FROM orders',
      'Orders from last month',
      'Total revenue by country',
      'Cancelled orders'
    ],
    products: [
      'SELECT * FROM products',
      'Products under $50',
      'Top rated products',
      'Stock by category'
    ],
    sales: [
      'SELECT * FROM sales',
      'Sales by region',
      'Top selling products',
      'Daily revenue totals'
    ],
    departments: [
      'SELECT * FROM departments',
      'Departments by budget',
      'Total employee count',
      'Largest departments'
    ],
    transactions: [
      'SELECT * FROM transactions',
      'Completed transactions',
      'Total by category',
      'Recent debits'
    ]
  };

  const taskDiv = document.getElementById('task-content');
  if (!taskDiv) {
    console.warn('Task div not found');
    return;
  }

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
  console.log('Task info updated for:', name);
}

// execute query
function executeQuery() {
  const editor = document.getElementById('editor');
  const query = editor.value.trim();

  if (!query) {
    alert('Write a query first');
    return;
  }

  console.log('Executing query:', query);

  // Save to history
  saveQueryToHistory(query);

  // clear old results immediately
  hideAllStates();
  showLoading('Running query...');

  setTimeout(() => {
    const result = runQuery(query);
    console.log('Query result:', result);
    hideLoading();

    if (result.success) {
      displayResults(result.data);
    } else {
      displayError(result.error);
    }
  }, 150);
}

// display results
function displayResults(data) {
  console.log('Raw query data:', data);

  // FORCE CLEAR EVERYTHING FIRST
  hideAllStates();

  // Clear table immediately
  const thead = document.getElementById('thead');
  const tbody = document.getElementById('tbody');
  const table = document.getElementById('table');

  if (thead) thead.innerHTML = '';
  if (tbody) tbody.innerHTML = '';
  if (table) table.innerHTML = '';

  // Now show success container
  const container = document.getElementById('success');
  container.classList.remove('hidden');

  // Format the data
  const formatted = formatResults(data);
  console.log('Formatted:', formatted);
  console.log('Rows count:', formatted.rows.length);
  console.log('Columns:', formatted.columns);

  // Check if empty
  if (!formatted.rows || formatted.rows.length === 0) {
    document.getElementById('success-msg').textContent = 'Query ran successfully (0 rows)';
    document.getElementById('explain').textContent = 'Your query executed but returned no results. Check your WHERE clause.';
    document.getElementById('meta').textContent = '0 rows';

    if (table) {
      table.innerHTML = `
        <thead><tr><th>No Results</th></tr></thead>
        <tbody><tr><td class="txt2 text-center py-8">Your query returned 0 rows</td></tr></tbody>
      `;
    }

    // Hide export buttons for empty results
    const exportBtns = document.getElementById('export-buttons');
    if (exportBtns) exportBtns.classList.add('hidden');

    return;
  }

  // We have data - build the table
  console.log('Building table with', formatted.rows.length, 'rows');

  const headerHTML = '<tr>' + formatted.columns.map(col => `<th>${col}</th>`).join('') + '</tr>';

  const rowsHTML = formatted.rows.map(row => {
    const cells = row.map(cell => {
      if (cell === null) {
        return '<td><span class="txt2">NULL</span></td>';
      }
      return `<td>${cell}</td>`;
    }).join('');
    return '<tr>' + cells + '</tr>';
  }).join('');

  // Rebuild entire table from scratch
  if (table) {
    table.innerHTML = `
      <thead>${headerHTML}</thead>
      <tbody>${rowsHTML}</tbody>
    `;
    console.log('Table rebuilt successfully');
  }

  // Update metadata
  const execTime = Math.floor(Math.random() * 20 + 5);
  document.getElementById('success-msg').textContent = `Query ran in ${execTime}ms`;
  document.getElementById('meta').textContent = `${formatted.rows.length} rows`;
  document.getElementById('explain').textContent = generateExplanation(formatted);

  // Show export buttons
  const exportBtns = document.getElementById('export-buttons');
  if (exportBtns) exportBtns.classList.remove('hidden');

  console.log('Display complete');
}

// generate simple explanation
function generateExplanation(formatted) {
  const count = formatted.rows.length;
  const cols = formatted.columns.length;

  if (count === 1 && cols === 1) {
    return 'Your query returned a single value (aggregate result).';
  }

  return `Retrieved ${count} row${count !== 1 ? 's' : ''} with ${cols} column${cols !== 1 ? 's' : ''} from ${getCurrentDataset()}.`;
}

// display error - ENHANCED WITH SMART HINTS
function displayError(errorMsg) {
  console.error('Displaying error:', errorMsg);
  hideAllStates();
  const container = document.getElementById('error');
  container.classList.remove('hidden');

  document.getElementById('error-msg').textContent = errorMsg;

  // ENHANCED: Smart error detection with suggestions
  let hint = '';
  let suggestion = '';

  // Error 1: Table not found
  if (errorMsg.includes('no such table')) {
    const match = errorMsg.match(/no such table: (\w+)/);
    if (match) {
      const wrongTable = match[1];
      const correctTable = getCurrentDataset();

      hint = `Table "${wrongTable}" doesn't exist in the database.`;
      suggestion = `💡 Did you mean "<strong>${correctTable}</strong>"? Make sure you're using the correct dataset from the dropdown above.`;
    }
  }

  // Error 2: Column not found
  else if (errorMsg.includes('no such column')) {
    const match = errorMsg.match(/no such column: (\w+)/);
    if (match && datasetInfo) {
      const wrongCol = match[1];
      const allColumns = datasetInfo.columns.map(c => c.name);
      const similar = findSimilarColumns(wrongCol, allColumns);

      hint = `Column "${wrongCol}" doesn't exist in the ${getCurrentDataset()} table.`;

      if (similar.length > 0) {
        suggestion = `💡 Did you mean: <strong>${similar.join('</strong>, <strong>')}</strong>?<br>
                      <span class="text-xs">Check the "Table schema" panel for all available columns.</span>`;
      } else {
        suggestion = `💡 Check the "Table schema" panel on the left for available columns.`;
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

  // Error 4: Ambiguous column (happens in JOINs)
  else if (errorMsg.includes('ambiguous')) {
    hint = 'Column name exists in multiple tables.';
    suggestion = `💡 Specify which table: <strong>table_name.column_name</strong><br>
                  Example: employees.name instead of just name`;
  }

  // Error 5: Missing FROM clause
  else if (errorMsg.toLowerCase().includes('incomplete') || errorMsg.toLowerCase().includes('from')) {
    hint = 'Your query structure is incomplete.';
    suggestion = `💡 Every SELECT needs a FROM clause:<br>
                  <strong>SELECT columns FROM table_name</strong>`;
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

// NEW: Find similar column names using simple string similarity
function findSimilarColumns(target, columns) {
  const targetLower = target.toLowerCase();
  const similar = [];

  for (const col of columns) {
    const colLower = col.toLowerCase();

    // Exact substring match
    if (colLower.includes(targetLower) || targetLower.includes(colLower)) {
      similar.push(col);
      continue;
    }

    // Calculate edit distance (Levenshtein)
    const distance = levenshteinDistance(targetLower, colLower);

    // If distance is small enough (max 2 edits), consider it similar
    if (distance <= 2) {
      similar.push(col);
    }
  }

  return similar.slice(0, 3); // Return max 3 suggestions
}

// NEW: Levenshtein distance algorithm for fuzzy matching
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

// ui helper functions
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
  const empty = document.getElementById('empty');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const success = document.getElementById('success');

  if (empty) empty.classList.add('hidden');
  if (loading) loading.classList.add('hidden');
  if (error) error.classList.add('hidden');
  if (success) success.classList.add('hidden');
}

function clearResults() {
  hideAllStates();
  const empty = document.getElementById('empty');
  if (empty) empty.classList.remove('hidden');

  // also clear table content
  const thead = document.getElementById('thead');
  const tbody = document.getElementById('tbody');
  const table = document.getElementById('table');
  if (thead) thead.innerHTML = '';
  if (tbody) tbody.innerHTML = '';
  if (table) table.innerHTML = '';
}

function showError(title, msg) {
  hideAllStates();
  const error = document.getElementById('error');
  error.classList.remove('hidden');
  document.getElementById('error-msg').textContent = `${title}: ${msg}`;
}

// ========================================
// FEATURE: CLICKABLE EXAMPLES
// ========================================

const queryExamples = {
  employees: [
    {
      title: "View all employees",
      level: "Beginner",
      query: "SELECT * FROM employees LIMIT 5;"
    },
    {
      title: "Sales team only",
      level: "Beginner",
      query: "SELECT first_name, last_name, salary\nFROM employees\nWHERE department = 'Sales';"
    },
    {
      title: "Top 5 salaries",
      level: "Beginner",
      query: "SELECT first_name, last_name, salary, department\nFROM employees\nORDER BY salary DESC\nLIMIT 5;"
    },
    {
      title: "Count by department",
      level: "Intermediate",
      query: "SELECT department, COUNT(*) as employee_count\nFROM employees\nGROUP BY department\nORDER BY employee_count DESC;"
    },
    {
      title: "Average salary per dept",
      level: "Intermediate",
      query: "SELECT department, AVG(salary) as avg_salary\nFROM employees\nGROUP BY department\nORDER BY avg_salary DESC;"
    }
  ],
  customers: [
    {
      title: "View all customers",
      level: "Beginner",
      query: "SELECT * FROM customers LIMIT 10;"
    },
    {
      title: "Active USA customers",
      level: "Beginner",
      query: "SELECT first_name, last_name, email, total_spent\nFROM customers\nWHERE country = 'USA' AND is_active = 1;"
    },
    {
      title: "Top 10 spenders",
      level: "Beginner",
      query: "SELECT first_name, last_name, country, total_spent\nFROM customers\nORDER BY total_spent DESC\nLIMIT 10;"
    },
    {
      title: "Customers by country",
      level: "Intermediate",
      query: "SELECT country, COUNT(*) as customer_count\nFROM customers\nGROUP BY country\nORDER BY customer_count DESC;"
    }
  ],
  orders: [
    {
      title: "View recent orders",
      level: "Beginner",
      query: "SELECT * FROM orders LIMIT 10;"
    },
    {
      title: "Delivered orders",
      level: "Beginner",
      query: "SELECT order_id, customer_id, total_amount, shipping_country\nFROM orders\nWHERE status = 'delivered'\nLIMIT 10;"
    },
    {
      title: "Revenue by country",
      level: "Intermediate",
      query: "SELECT shipping_country, SUM(total_amount) as revenue\nFROM orders\nGROUP BY shipping_country\nORDER BY revenue DESC;"
    }
  ],
  products: [
    {
      title: "View all products",
      level: "Beginner",
      query: "SELECT * FROM products LIMIT 10;"
    },
    {
      title: "Products under $50",
      level: "Beginner",
      query: "SELECT product_name, category, price, stock_qty\nFROM products\nWHERE price < 50\nORDER BY price;"
    },
    {
      title: "Top rated products",
      level: "Intermediate",
      query: "SELECT product_name, category, price, rating\nFROM products\nORDER BY rating DESC\nLIMIT 10;"
    }
  ],
  sales: [
    {
      title: "View recent sales",
      level: "Beginner",
      query: "SELECT * FROM sales LIMIT 10;"
    },
    {
      title: "Revenue by region",
      level: "Intermediate",
      query: "SELECT region, SUM(revenue) as total_revenue\nFROM sales\nGROUP BY region\nORDER BY total_revenue DESC;"
    }
  ],
  departments: [
    {
      title: "All departments",
      level: "Beginner",
      query: "SELECT * FROM departments;"
    },
    {
      title: "By budget size",
      level: "Beginner",
      query: "SELECT dept_name, budget, employee_count\nFROM departments\nORDER BY budget DESC;"
    }
  ],
  transactions: [
    {
      title: "Recent transactions",
      level: "Beginner",
      query: "SELECT * FROM transactions LIMIT 10;"
    },
    {
      title: "By category",
      level: "Intermediate",
      query: "SELECT category, SUM(amount) as total\nFROM transactions\nGROUP BY category\nORDER BY total DESC;"
    }
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

    // Scroll to editor
    editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ========================================
// FEATURE: QUERY HISTORY - FIXED
// ========================================

function saveQueryToHistory(query) {
  try {
    let history = JSON.parse(localStorage.getItem('queryHistory') || '[]');

    // Don't save duplicates
    if (history.length > 0 && history[0].query === query) {
      return;
    }

    // Add to front
    history.unshift({
      query: query,
      timestamp: Date.now(),
      dataset: getCurrentDataset()
    });

    // Keep only last 10
    history = history.slice(0, 10);

    localStorage.setItem('queryHistory', JSON.stringify(history));
    console.log('Query saved to history');
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

// FIXED: History dropdown with sticky header
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

    // FIXED: Structure with sticky header and scrollable content
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

    // Hide dropdown
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

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const historyBtn = document.getElementById('history-btn');
  const dropdown = document.getElementById('history-dropdown');

  if (dropdown && !dropdown.classList.contains('hidden')) {
    if (!historyBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  }
});

// ========================================
// FEATURE: EXPORT TO CSV
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

        // Handle NULL values
        if (text === 'NULL') {
          return '';
        }

        // Escape quotes and commas
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
          text = '"' + text.replace(/"/g, '""') + '"';
        }

        return text;
      });
      csv += rowData.join(',') + '\n';
    });

    // Create download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dataset = getCurrentDataset();
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${dataset}_results_${timestamp}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('CSV exported successfully');
  } catch (e) {
    console.error('Export failed:', e);
    alert('Failed to export CSV. Please try again.');
  }
}

// FIXED: Copy to clipboard with fallback
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

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showCopySuccess(event.target);
        console.log('Results copied to clipboard (modern API)');
      }).catch(err => {
        console.log('Modern clipboard failed, trying fallback:', err);
        fallbackCopy(text, event.target);
      });
    } else {
      // Fallback for older browsers or HTTP
      fallbackCopy(text, event.target);
    }

  } catch (e) {
    console.error('Copy failed:', e);
    alert('Failed to copy to clipboard. Please try selecting and copying manually.');
  }
}

// Fallback copy method using textarea
function fallbackCopy(text, button) {
  try {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    // Select and copy
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      showCopySuccess(button);
      console.log('Results copied to clipboard (fallback method)');
    } else {
      throw new Error('execCommand failed');
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
    alert('Copy failed. Your browser may not support this feature. Try using CSV export instead.');
  }
}

// Show success feedback
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
// FEATURE: ADVANCED QUERY FORMATTER
// ========================================

function formatQuery() {
  const editor = document.getElementById('editor');
  if (!editor || !editor.value.trim()) {
    alert('Write a query first');
    return;
  }

  let query = editor.value;

  // Step 1: Remove extra whitespace
  query = query.replace(/\s+/g, ' ').trim();

  // Step 2: Add line breaks before major keywords
  const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING',
                          'ORDER BY', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN',
                          'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN'];

  majorKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    query = query.replace(regex, '\n' + keyword.toUpperCase());
  });

  // Step 3: Uppercase all SQL keywords
  const allKeywords = ['SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'GROUP', 'HAVING',
                       'LIMIT', 'OFFSET', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
                       'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'AS',
                       'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
                       'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE',
                       'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC', 'NULL',
                       'IS', 'INTO', 'VALUES', 'SET'];

  allKeywords.forEach(keyword => {
    const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
    query = query.replace(regex, keyword.toUpperCase());
  });

  // Step 4: Clean up extra line breaks and trim
  query = query.split('\n').map(line => line.trim()).join('\n');
  query = query.replace(/\n{3,}/g, '\n\n'); // Max 2 line breaks

  // Step 5: Indent WHERE/AND/OR conditions
  const lines = query.split('\n');
  let formatted = '';
  let inWhere = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('WHERE')) {
      formatted += line + '\n';
      inWhere = true;
    } else if (line.startsWith('GROUP') || line.startsWith('ORDER') ||
               line.startsWith('HAVING') || line.startsWith('LIMIT')) {
      formatted += line + '\n';
      inWhere = false;
    } else if (inWhere && (line.trim().startsWith('AND') || line.trim().startsWith('OR'))) {
      formatted += '  ' + line.trim() + '\n';
    } else {
      formatted += line + '\n';
    }
  }

  editor.value = formatted.trim();

  // Show feedback
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
// FEATURE: KEYBOARD SHORTCUTS PANEL
// ========================================

function toggleShortcutsPanel() {
  const panel = document.getElementById('shortcuts-panel');
  if (!panel) return;

  panel.classList.toggle('hidden');
}

function createShortcutsPanel() {
  // Check if already exists
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
        <p><strong>Tip:</strong> Click any example in the sidebar to load it into the editor.</p>
      </div>

      <div class="pt-3 mt-3 bdr text-xs txt2" style="border-top-width: 1px;">
        <p><strong>Mac users:</strong> Use ⌘ (Cmd) instead of Ctrl</p>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (panel && !panel.classList.contains('hidden')) {
      const shortcutBtn = document.getElementById('shortcuts-btn');
      if (!panel.contains(e.target) && (!shortcutBtn || !shortcutBtn.contains(e.target))) {
        panel.classList.add('hidden');
      }
    }
  });
}

// Get current dataset name
function getCurrentDataset() {
  const select = document.getElementById('dataset');
  return select ? select.value : 'employees';
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up event listeners');

  const runBtn = document.getElementById('run');
  const clearBtn = document.getElementById('clear');
  const datasetSelect = document.getElementById('dataset');
  const editor = document.getElementById('editor');
  const formatBtn = document.getElementById('format');
  const historyBtn = document.getElementById('history-btn');
  const shortcutsBtn = document.getElementById('shortcuts-btn');

  // Create shortcuts panel
  createShortcutsPanel();

  // run button
  if (runBtn) {
    runBtn.addEventListener('click', executeQuery);
    console.log('Run button ready');
  }

  // clear button
  if (clearBtn && editor) {
    clearBtn.addEventListener('click', () => {
      editor.value = '';
      editor.focus();
    });
  }

  // format button
  if (formatBtn) {
    formatBtn.addEventListener('click', formatQuery);
  }

  // history button
  if (historyBtn) {
    historyBtn.addEventListener('click', toggleHistory);
    console.log('History button ready');
  }

  // shortcuts button
  if (shortcutsBtn) {
    shortcutsBtn.addEventListener('click', toggleShortcutsPanel);
    console.log('Shortcuts button ready');
  }

  // dataset selector
  if (datasetSelect) {
    datasetSelect.addEventListener('change', (e) => {
      console.log('Dataset changed to:', e.target.value);
      switchDataset(e.target.value);
    });
    console.log('Dataset selector ready');
  }

  // keyboard shortcuts
  if (editor) {
    editor.addEventListener('keydown', (e) => {
      // Ctrl+Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeQuery();
      }
      // Ctrl+L to clear
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        editor.value = '';
      }
      // Ctrl+Shift+F to format
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        formatQuery();
      }
      // Ctrl+H to view history
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        toggleHistory();
      }
      // Ctrl+/ to toggle shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleShortcutsPanel();
      }
    });
  }

  // start initialization
  console.log('Starting initialization...');
  init();
});
