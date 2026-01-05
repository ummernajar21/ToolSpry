// ============================================
// CHALLENGES.JS - Complete Challenge System
// ============================================

// ========================================
// CHALLENGES DATA - 35 CHALLENGES (5 per dataset)
// ========================================

const challenges = [

  // ============ EMPLOYEES DATASET (1-5) ============
  {
    id: 1,
    title: "View All Employees",
    level: "Beginner",
    dataset: "employees",
    problem: "Display all columns from the employees table. This is your first query!",
    expectedOutput: {
      columns: ["employee_id", "first_name", "last_name", "email", "department", "job_title", "salary", "hire_date", "manager_id", "office_location"],
      rowCount: 50
    },
    solution: "SELECT * FROM employees;",
    hints: [
      "Use SELECT to choose what to display",
      "Use * to select all columns",
      "Don't forget FROM employees at the end"
    ]
  },

  {
    id: 2,
    title: "High Salary Employees",
    level: "Beginner",
    dataset: "employees",
    problem: "Find all employees earning more than $70,000. Show their first name, last name, and salary.",
    expectedOutput: {
      columns: ["first_name", "last_name", "salary"]
    },
    solution: "SELECT first_name, last_name, salary FROM employees WHERE salary > 70000;",
    hints: [
      "Use WHERE to filter rows",
      "Use > for 'greater than'",
      "No quotes needed for numbers"
    ]
  },

  {
    id: 3,
    title: "Top 5 Earners",
    level: "Beginner",
    dataset: "employees",
    problem: "Find the 5 highest-paid employees. Show first name, last name, and salary, sorted highest to lowest.",
    expectedOutput: {
      columns: ["first_name", "last_name", "salary"],
      rowCount: 5
    },
    solution: "SELECT first_name, last_name, salary FROM employees ORDER BY salary DESC LIMIT 5;",
    hints: [
      "Use ORDER BY to sort",
      "DESC means descending (high to low)",
      "LIMIT 5 restricts to 5 rows"
    ]
  },

  {
    id: 4,
    title: "Count by Department",
    level: "Intermediate",
    dataset: "employees",
    problem: "Count how many employees are in each department. Show department name and count.",
    expectedOutput: {
      columns: ["department", "COUNT(*)"]
    },
    solution: "SELECT department, COUNT(*) FROM employees GROUP BY department;",
    hints: [
      "Use GROUP BY to group rows",
      "COUNT(*) counts rows in each group",
      "GROUP BY comes after FROM"
    ]
  },

  {
    id: 5,
    title: "Average Salary per Department",
    level: "Intermediate",
    dataset: "employees",
    problem: "Calculate the average salary for each department. Show department and average salary.",
    expectedOutput: {
      columns: ["department", "AVG(salary)"]
    },
    solution: "SELECT department, AVG(salary) FROM employees GROUP BY department;",
    hints: [
      "Use AVG() function",
      "Combine with GROUP BY",
      "AVG(salary) calculates the average"
    ]
  },

  // ============ CUSTOMERS DATASET (6-10) ============
  {
    id: 6,
    title: "View All Customers",
    level: "Beginner",
    dataset: "customers",
    problem: "Display all columns from the customers table.",
    expectedOutput: {
      columns: ["customer_id", "first_name", "last_name", "email", "phone", "country", "city", "signup_date", "is_active", "total_spent"],
      rowCount: 100
    },
    solution: "SELECT * FROM customers;",
    hints: [
      "Same as Challenge 1, but different table",
      "SELECT * FROM customers",
      "The * means all columns"
    ]
  },

  {
    id: 7,
    title: "Active Customers Only",
    level: "Beginner",
    dataset: "customers",
    problem: "Find all active customers (is_active = 1). Show first name, last name, and country.",
    expectedOutput: {
      columns: ["first_name", "last_name", "country"]
    },
    solution: "SELECT first_name, last_name, country FROM customers WHERE is_active = 1;",
    hints: [
      "Use WHERE to filter",
      "is_active = 1 means active",
      "Select the three specified columns"
    ]
  },

  {
    id: 8,
    title: "Top 10 Spenders",
    level: "Beginner",
    dataset: "customers",
    problem: "Find the 10 customers who spent the most money. Show first name, last name, and total_spent, sorted by spending.",
    expectedOutput: {
      columns: ["first_name", "last_name", "total_spent"],
      rowCount: 10
    },
    solution: "SELECT first_name, last_name, total_spent FROM customers ORDER BY total_spent DESC LIMIT 10;",
    hints: [
      "Sort by total_spent descending",
      "Use LIMIT 10",
      "DESC means highest first"
    ]
  },

  {
    id: 9,
    title: "Customers by Country",
    level: "Intermediate",
    dataset: "customers",
    problem: "Count how many customers are from each country. Show country and count.",
    expectedOutput: {
      columns: ["country", "COUNT(*)"]
    },
    solution: "SELECT country, COUNT(*) FROM customers GROUP BY country;",
    hints: [
      "GROUP BY country",
      "COUNT(*) to count customers",
      "Similar to Challenge 4"
    ]
  },

  {
    id: 10,
    title: "Average Spending by Country",
    level: "Intermediate",
    dataset: "customers",
    problem: "Calculate the average total_spent for customers in each country. Show country and average.",
    expectedOutput: {
      columns: ["country", "AVG(total_spent)"]
    },
    solution: "SELECT country, AVG(total_spent) FROM customers GROUP BY country;",
    hints: [
      "Use AVG(total_spent)",
      "GROUP BY country",
      "Shows spending patterns by location"
    ]
  },

  // ============ ORDERS DATASET (11-15) ============
  {
    id: 11,
    title: "View All Orders",
    level: "Beginner",
    dataset: "orders",
    problem: "Display all columns from the orders table.",
    expectedOutput: {
      columns: ["order_id", "customer_id", "order_date", "total_amount", "status", "shipping_country", "shipping_city", "payment_method"],
      rowCount: 200
    },
    solution: "SELECT * FROM orders;",
    hints: [
      "SELECT * FROM orders",
      "Same pattern as before",
      "Different table, same technique"
    ]
  },

  {
    id: 12,
    title: "Delivered Orders Only",
    level: "Beginner",
    dataset: "orders",
    problem: "Find all orders with status 'delivered'. Show order_id, total_amount, and shipping_country.",
    expectedOutput: {
      columns: ["order_id", "total_amount", "shipping_country"]
    },
    solution: "SELECT order_id, total_amount, shipping_country FROM orders WHERE status = 'delivered';",
    hints: [
      "Filter WHERE status = 'delivered'",
      "Text values need quotes",
      "Select the three columns"
    ]
  },

  {
    id: 13,
    title: "Largest Orders",
    level: "Beginner",
    dataset: "orders",
    problem: "Find the 5 orders with the highest total_amount. Show order_id and total_amount, sorted by amount.",
    expectedOutput: {
      columns: ["order_id", "total_amount"],
      rowCount: 5
    },
    solution: "SELECT order_id, total_amount FROM orders ORDER BY total_amount DESC LIMIT 5;",
    hints: [
      "ORDER BY total_amount DESC",
      "LIMIT 5",
      "Show biggest orders first"
    ]
  },

  {
    id: 14,
    title: "Orders by Status",
    level: "Intermediate",
    dataset: "orders",
    problem: "Count how many orders are in each status. Show status and count.",
    expectedOutput: {
      columns: ["status", "COUNT(*)"]
    },
    solution: "SELECT status, COUNT(*) FROM orders GROUP BY status;",
    hints: [
      "GROUP BY status",
      "COUNT(*) for each group",
      "See order distribution"
    ]
  },

  {
    id: 15,
    title: "Revenue by Country",
    level: "Intermediate",
    dataset: "orders",
    problem: "Calculate total revenue (sum of total_amount) for each shipping_country. Show country and total revenue.",
    expectedOutput: {
      columns: ["shipping_country", "SUM(total_amount)"]
    },
    solution: "SELECT shipping_country, SUM(total_amount) FROM orders GROUP BY shipping_country;",
    hints: [
      "Use SUM(total_amount)",
      "GROUP BY shipping_country",
      "Shows which countries generate most revenue"
    ]
  },

  // ============ PRODUCTS DATASET (16-20) ============
  {
    id: 16,
    title: "View All Products",
    level: "Beginner",
    dataset: "products",
    problem: "Display all columns from the products table.",
    expectedOutput: {
      columns: ["product_id", "product_name", "category", "price", "stock_qty", "supplier", "rating", "launch_date"],
      rowCount: 150
    },
    solution: "SELECT * FROM products;",
    hints: [
      "SELECT * FROM products",
      "All columns, all rows",
      "You've done this before!"
    ]
  },

  {
    id: 17,
    title: "Affordable Products",
    level: "Beginner",
    dataset: "products",
    problem: "Find products priced under $50. Show product_name, category, and price.",
    expectedOutput: {
      columns: ["product_name", "category", "price"]
    },
    solution: "SELECT product_name, category, price FROM products WHERE price < 50;",
    hints: [
      "Use WHERE price < 50",
      "< means less than",
      "Find budget-friendly products"
    ]
  },

  {
    id: 18,
    title: "Top Rated Products",
    level: "Beginner",
    dataset: "products",
    problem: "Find the 10 highest-rated products. Show product_name, category, and rating, sorted by rating.",
    expectedOutput: {
      columns: ["product_name", "category", "rating"],
      rowCount: 10
    },
    solution: "SELECT product_name, category, rating FROM products ORDER BY rating DESC LIMIT 10;",
    hints: [
      "ORDER BY rating DESC",
      "LIMIT 10",
      "Best products first"
    ]
  },

  {
    id: 19,
    title: "Products by Category",
    level: "Intermediate",
    dataset: "products",
    problem: "Count how many products are in each category. Show category and count.",
    expectedOutput: {
      columns: ["category", "COUNT(*)"]
    },
    solution: "SELECT category, COUNT(*) FROM products GROUP BY category;",
    hints: [
      "GROUP BY category",
      "COUNT(*) products",
      "See product distribution"
    ]
  },

  {
    id: 20,
    title: "Average Price by Category",
    level: "Intermediate",
    dataset: "products",
    problem: "Calculate the average price for products in each category. Show category and average price.",
    expectedOutput: {
      columns: ["category", "AVG(price)"]
    },
    solution: "SELECT category, AVG(price) FROM products GROUP BY category;",
    hints: [
      "AVG(price) function",
      "GROUP BY category",
      "Price comparison across categories"
    ]
  },

  // ============ SALES DATASET (21-25) ============
  {
    id: 21,
    title: "View All Sales",
    level: "Beginner",
    dataset: "sales",
    problem: "Display all columns from the sales table.",
    expectedOutput: {
      columns: ["sale_id", "product_id", "region", "sale_date", "quantity", "revenue", "salesperson"],
      rowCount: 300
    },
    solution: "SELECT * FROM sales;",
    hints: [
      "SELECT * FROM sales",
      "All sales records",
      "Standard query pattern"
    ]
  },

  {
    id: 22,
    title: "High Revenue Sales",
    level: "Beginner",
    dataset: "sales",
    problem: "Find sales with revenue greater than $500. Show region, quantity, and revenue.",
    expectedOutput: {
      columns: ["region", "quantity", "revenue"]
    },
    solution: "SELECT region, quantity, revenue FROM sales WHERE revenue > 500;",
    hints: [
      "WHERE revenue > 500",
      "Filter high-value sales",
      "Select three columns"
    ]
  },

  {
    id: 23,
    title: "Top 10 Sales",
    level: "Beginner",
    dataset: "sales",
    problem: "Find the 10 sales with the highest revenue. Show region, revenue, and salesperson, sorted by revenue.",
    expectedOutput: {
      columns: ["region", "revenue", "salesperson"],
      rowCount: 10
    },
    solution: "SELECT region, revenue, salesperson FROM sales ORDER BY revenue DESC LIMIT 10;",
    hints: [
      "ORDER BY revenue DESC",
      "LIMIT 10",
      "Biggest sales first"
    ]
  },

  {
    id: 24,
    title: "Sales by Region",
    level: "Intermediate",
    dataset: "sales",
    problem: "Count how many sales occurred in each region. Show region and count.",
    expectedOutput: {
      columns: ["region", "COUNT(*)"]
    },
    solution: "SELECT region, COUNT(*) FROM sales GROUP BY region;",
    hints: [
      "GROUP BY region",
      "COUNT(*) sales",
      "Regional activity"
    ]
  },

  {
    id: 25,
    title: "Total Revenue by Region",
    level: "Intermediate",
    dataset: "sales",
    problem: "Calculate total revenue for each region. Show region and total revenue.",
    expectedOutput: {
      columns: ["region", "SUM(revenue)"]
    },
    solution: "SELECT region, SUM(revenue) FROM sales GROUP BY region;",
    hints: [
      "SUM(revenue)",
      "GROUP BY region",
      "Which region makes most money?"
    ]
  },

  // ============ DEPARTMENTS DATASET (26-30) ============
  {
    id: 26,
    title: "View All Departments",
    level: "Beginner",
    dataset: "departments",
    problem: "Display all columns from the departments table.",
    expectedOutput: {
      columns: ["dept_id", "dept_name", "budget", "employee_count", "manager_name", "location"],
      rowCount: 12
    },
    solution: "SELECT * FROM departments;",
    hints: [
      "SELECT * FROM departments",
      "Simple query",
      "All department info"
    ]
  },

  {
    id: 27,
    title: "Large Departments",
    level: "Beginner",
    dataset: "departments",
    problem: "Find departments with more than 30 employees. Show dept_name, employee_count, and budget.",
    expectedOutput: {
      columns: ["dept_name", "employee_count", "budget"]
    },
    solution: "SELECT dept_name, employee_count, budget FROM departments WHERE employee_count > 30;",
    hints: [
      "WHERE employee_count > 30",
      "Filter by employee count",
      "Show department details"
    ]
  },

  {
    id: 28,
    title: "Highest Budget Departments",
    level: "Beginner",
    dataset: "departments",
    problem: "Find the 5 departments with the highest budgets. Show dept_name and budget, sorted by budget.",
    expectedOutput: {
      columns: ["dept_name", "budget"],
      rowCount: 5
    },
    solution: "SELECT dept_name, budget FROM departments ORDER BY budget DESC LIMIT 5;",
    hints: [
      "ORDER BY budget DESC",
      "LIMIT 5",
      "Richest departments"
    ]
  },

  {
    id: 29,
    title: "Total Company Budget",
    level: "Intermediate",
    dataset: "departments",
    problem: "Calculate the total budget across all departments. Show the sum.",
    expectedOutput: {
      columns: ["SUM(budget)"]
    },
    solution: "SELECT SUM(budget) FROM departments;",
    hints: [
      "Use SUM(budget)",
      "No GROUP BY needed",
      "Single value result"
    ]
  },

  {
    id: 30,
    title: "Average Department Size",
    level: "Intermediate",
    dataset: "departments",
    problem: "Calculate the average number of employees per department. Show the average.",
    expectedOutput: {
      columns: ["AVG(employee_count)"]
    },
    solution: "SELECT AVG(employee_count) FROM departments;",
    hints: [
      "AVG(employee_count)",
      "No GROUP BY",
      "Company-wide average"
    ]
  },

  // ============ TRANSACTIONS DATASET (31-35) ============
  {
    id: 31,
    title: "View All Transactions",
    level: "Beginner",
    dataset: "transactions",
    problem: "Display all columns from the transactions table.",
    expectedOutput: {
      columns: ["transaction_id", "account_id", "transaction_date", "amount", "type", "category", "description"],
      rowCount: 500
    },
    solution: "SELECT * FROM transactions;",
    hints: [
      "SELECT * FROM transactions",
      "Last dataset!",
      "All transaction records"
    ]
  },

  {
    id: 32,
    title: "Large Transactions",
    level: "Beginner",
    dataset: "transactions",
    problem: "Find transactions with amount greater than $1000. Show transaction_id, amount, and category.",
    expectedOutput: {
      columns: ["transaction_id", "amount", "category"]
    },
    solution: "SELECT transaction_id, amount, category FROM transactions WHERE amount > 1000;",
    hints: [
      "WHERE amount > 1000",
      "Big transactions only",
      "Select three columns"
    ]
  },

  {
    id: 33,
    title: "Credit Transactions",
    level: "Beginner",
    dataset: "transactions",
    problem: "Find all transactions where type is 'credit'. Show transaction_id, amount, and type.",
    expectedOutput: {
      columns: ["transaction_id", "amount", "type"]
    },
    solution: "SELECT transaction_id, amount, type FROM transactions WHERE type = 'credit';",
    hints: [
      "WHERE type = 'credit'",
      "Text needs quotes",
      "Filter by transaction type"
    ]
  },

  {
    id: 34,
    title: "Transactions by Category",
    level: "Intermediate",
    dataset: "transactions",
    problem: "Count how many transactions are in each category. Show category and count.",
    expectedOutput: {
      columns: ["category", "COUNT(*)"]
    },
    solution: "SELECT category, COUNT(*) FROM transactions GROUP BY category;",
    hints: [
      "GROUP BY category",
      "COUNT(*) transactions",
      "Category distribution"
    ]
  },

  {
    id: 35,
    title: "Total Amount by Category",
    level: "Intermediate",
    dataset: "transactions",
    problem: "Calculate the total amount for each category. Show category and total amount.",
    expectedOutput: {
      columns: ["category", "SUM(amount)"]
    },
    solution: "SELECT category, SUM(amount) FROM transactions GROUP BY category;",
    hints: [
      "SUM(amount)",
      "GROUP BY category",
      "Final challenge - you got this!"
    ]
  }
];

// ========================================
// STATE MANAGEMENT
// ========================================

let currentChallengeId = null;
let userProgress = {}; // {1: true, 2: true, ...}

// Load progress from localStorage
function loadProgress() {
  const saved = localStorage.getItem('challengeProgress');
  if (saved) {
    try {
      userProgress = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved progress:', e);
      userProgress = {};
    }
  }
}

// Save progress to localStorage
function saveProgress() {
  try {
    localStorage.setItem('challengeProgress', JSON.stringify(userProgress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

// Mark challenge as completed
function markCompleted(challengeId) {
  userProgress[challengeId] = true;
  saveProgress();
  updateProgressDisplay();
}

// Check if challenge is completed
function isCompleted(challengeId) {
  return userProgress[challengeId] === true;
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================

// Update progress statistics
function updateProgressDisplay() {
  const completed = Object.keys(userProgress).length;
  const total = challenges.length;
  const percent = Math.round((completed / total) * 100);

  document.getElementById('completed-count').textContent = completed;
  document.getElementById('progress-percent').textContent = percent + '%';
  document.getElementById('progress-text').textContent = `${completed} of ${total} completed`;
  document.getElementById('progress-bar').style.width = percent + '%';

  // Update level
  let level = 'Beginner';
  if (completed >= 21) level = 'Intermediate';
  if (completed >= 35) level = 'Completed!';
  document.getElementById('current-level').textContent = level;
}

// Render challenge cards on listing page
function renderChallenges() {
  const beginnerContainer = document.getElementById('beginner-challenges');
  const intermediateContainer = document.getElementById('intermediate-challenges');

  if (!beginnerContainer || !intermediateContainer) return;

  beginnerContainer.innerHTML = '';
  intermediateContainer.innerHTML = '';

  challenges.forEach(challenge => {
    const card = createChallengeCard(challenge);

    if (challenge.level === 'Beginner') {
      beginnerContainer.appendChild(card);
    } else {
      intermediateContainer.appendChild(card);
    }
  });
}

// Create individual challenge card
function createChallengeCard(challenge) {
  const div = document.createElement('div');
  const completed = isCompleted(challenge.id);

  div.className = `challenge-card card bdr border rounded-lg p-6 ${completed ? 'completed' : ''}`;
  div.onclick = () => loadChallenge(challenge.id);

  div.innerHTML = `
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="font-bold text-lg">#${challenge.id}</span>
        ${completed ? '<span class="text-green-600 text-xl">✓</span>' : ''}
      </div>
      <span class="text-xs px-2 py-1 rounded ${challenge.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'}">
        ${challenge.level}
      </span>
    </div>

    <h3 class="font-bold mb-2">${challenge.title}</h3>
    <p class="text-sm txt2 line-clamp-2">${challenge.problem}</p>

    <div class="mt-4 pt-3 bdr flex items-center gap-2 text-sm txt2" style="border-top-width: 1px;">
      <span>📊</span>
      <span>${challenge.dataset}</span>
    </div>
  `;

  return div;
}

// ========================================
// NAVIGATION
// ========================================

// Show listing view
function showListing() {
  document.getElementById('listing-view').classList.remove('hidden');
  document.getElementById('challenge-view').classList.add('hidden');
  currentChallengeId = null;
  window.scrollTo(0, 0);

  // Update URL
  window.history.pushState({}, '', '/challenges/');
}

// Load and show specific challenge
function loadChallenge(challengeId) {
  const challenge = challenges.find(c => c.id === challengeId);
  if (!challenge) return;

  currentChallengeId = challengeId;

  // Update URL
  window.history.pushState({}, '', `/challenges/#challenge-${challengeId}`);

  // Hide listing, show challenge
  document.getElementById('listing-view').classList.add('hidden');
  document.getElementById('challenge-view').classList.remove('hidden');

  // Populate challenge details
  document.getElementById('challenge-number').textContent = `Challenge #${challenge.id}`;
  document.getElementById('challenge-level').textContent = challenge.level;
  document.getElementById('challenge-level').className = `text-xs px-2 py-1 rounded ${challenge.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'}`;
  document.getElementById('challenge-title').textContent = challenge.title;
  document.getElementById('challenge-problem').textContent = challenge.problem;
  document.getElementById('challenge-dataset').textContent = challenge.dataset;

  // Show expected output
  let expectedHTML = '';
  if (challenge.expectedOutput.columns) {
    expectedHTML = `<strong>Columns:</strong> ${challenge.expectedOutput.columns.join(', ')}<br>`;
  }
  if (challenge.expectedOutput.rowCount) {
    expectedHTML += `<strong>Rows:</strong> ${challenge.expectedOutput.rowCount}`;
  }
  document.getElementById('challenge-expected').innerHTML = expectedHTML;

  // Load hints
  loadHints(challenge);

  // Load the dataset for this challenge
  loadDataset(challenge.dataset);

  // Clear editor
  document.getElementById('challenge-editor').value = '';

  // Reset results
  showResultsState('empty');

  window.scrollTo(0, 0);
}

// Load hints (hidden by default)
function loadHints(challenge) {
  const container = document.getElementById('hints-container');
  if (!container) return;

  container.innerHTML = '';

  challenge.hints.forEach((hint, index) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <button onclick="toggleHint(${index})" class="w-full text-left px-4 py-2 card bdr border rounded hover:opacity-80 transition">
        <span class="font-medium">Hint ${index + 1}</span>
        <span class="text-xs txt2 ml-2">Click to reveal</span>
      </button>
      <div id="hint-${index}" class="hidden mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
        ${hint}
      </div>
    `;
    container.appendChild(div);
  });
}

// Toggle hint visibility
function toggleHint(index) {
  const hint = document.getElementById(`hint-${index}`);
  if (hint) {
    hint.classList.toggle('hidden');
  }
}

// ========================================
// CHALLENGE SUBMISSION & VALIDATION
// ========================================

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
}

// Submit and validate challenge
async function submitChallenge() {
  const query = document.getElementById('challenge-editor').value.trim();

  if (!query) {
    alert('Please write a SQL query first');
    return;
  }

  const challenge = challenges.find(c => c.id === currentChallengeId);
  if (!challenge) return;

  showResultsState('loading');

  try {
    // Make sure SQL.js is ready
    await waitForSQLInit();

    // Load the dataset (from dataset-loader.js)
    loadDataset(challenge.dataset);

    // Execute user's query (from dataset-loader.js)
    const results = executeSQL(query);

    // Validate result
    const validation = validateResult(results, challenge);

    if (validation.correct) {
      // Success!
      markCompleted(challenge.id);
      showResultsState('success');
      document.getElementById('success-message').textContent = validation.message;
      displayResultTable('results-table', results);
    } else {
      // Wrong answer
      showResultsState('error');
      document.getElementById('error-message').textContent = validation.message;
      document.getElementById('error-hint').innerHTML = validation.hint;

      // Show comparison
      displayResultTable('user-output-table', results);
      displayExpectedOutput('expected-output-table', challenge);
    }

  } catch (e) {
    console.error('Query execution error:', e);
    showResultsState('error');
    document.getElementById('error-message').textContent = 'Query Error';
    document.getElementById('error-hint').textContent = e.message || 'Check your SQL syntax.';
  }
}

// Validate if user's result matches expected
function validateResult(results, challenge) {
  // Handle empty results
  if (!results || results.length === 0) {
    return {
      correct: false,
      message: 'Query returned no results',
      hint: 'Your query executed but returned 0 rows. Check your WHERE clause and table name.'
    };
  }

  const result = results[0]; // SQL.js returns array of result sets
  const userColumns = result.columns || [];
  const userRows = result.values || [];
  const expected = challenge.expectedOutput;

  // Check column names
  if (expected.columns) {
    const userColsLower = userColumns.map(c => c.toLowerCase());
    const expectedColsLower = expected.columns.map(c => c.toLowerCase());

    // Check if columns match (order matters)
    const columnsMatch = JSON.stringify(userColsLower) === JSON.stringify(expectedColsLower);

    if (!columnsMatch) {
      return {
        correct: false,
        message: 'Column names don\'t match',
        hint: `<strong>Expected columns:</strong> ${expected.columns.join(', ')}<br><strong>Your columns:</strong> ${userColumns.join(', ')}`
      };
    }
  }

  // Check row count
  if (expected.rowCount !== undefined) {
    if (userRows.length !== expected.rowCount) {
      return {
        correct: false,
        message: `Wrong number of rows`,
        hint: `Expected <strong>${expected.rowCount} rows</strong>, but got <strong>${userRows.length} rows</strong>.<br>Check your WHERE clause and LIMIT.`
      };
    }
  }

  // If we got here, it's correct!
  return {
    correct: true,
    message: 'Perfect! Your query matches the expected output. Well done!'
  };
}

// Display result in table
function displayResultTable(tableId, results) {
  const table = document.getElementById(tableId);
  if (!table) return;

  if (!results || results.length === 0) {
    table.innerHTML = '<tbody><tr><td class="p-4 txt2">No results</td></tr></tbody>';
    return;
  }

  const result = results[0];
  const columns = result.columns || [];
  const rows = result.values || [];

  if (rows.length === 0) {
    table.innerHTML = '<tbody><tr><td class="p-4 txt2">No results</td></tr></tbody>';
    return;
  }

  const headerHTML = '<tr>' + columns.map(col => `<th>${col}</th>`).join('') + '</tr>';
  const rowsHTML = rows.slice(0, 10).map(row => {
    const cells = row.map(cell => {
      if (cell === null) {
        return '<td><span class="txt2 italic">NULL</span></td>';
      }
      return `<td>${cell}</td>`;
    }).join('');
    return '<tr>' + cells + '</tr>';
  }).join('');

  table.innerHTML = `<thead>${headerHTML}</thead><tbody>${rowsHTML}</tbody>`;

  if (rows.length > 10) {
    const moreRow = `<tr><td colspan="${columns.length}" class="text-center txt2 text-xs py-2">... and ${rows.length - 10} more rows</td></tr>`;
    table.querySelector('tbody').insertAdjacentHTML('beforeend', moreRow);
  }
}

// Display expected output
function displayExpectedOutput(tableId, challenge) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const cols = challenge.expectedOutput.columns || [];

  if (cols.length === 0) {
    table.innerHTML = '<tbody><tr><td class="p-4 txt2">See problem description</td></tr></tbody>';
    return;
  }

  const headerHTML = '<tr>' + cols.map(col => `<th>${col}</th>`).join('') + '</tr>';
  const infoHTML = '<tr><td colspan="' + cols.length + '" class="p-4 txt2 text-center">See problem description for expected data</td></tr>';

  table.innerHTML = `<thead>${headerHTML}</thead><tbody>${infoHTML}</tbody>`;
}

// Show different result states
function showResultsState(state) {
  const states = ['empty', 'loading', 'success', 'error'];

  states.forEach(s => {
    const el = document.getElementById(`results-${s}`);
    if (el) {
      if (s === state) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Clear editor
function clearEditor() {
  const editor = document.getElementById('challenge-editor');
  if (editor) {
    editor.value = '';
    editor.focus();
  }
}

// Go to next challenge
function nextChallenge() {
  const nextId = currentChallengeId + 1;
  if (nextId <= challenges.length) {
    loadChallenge(nextId);
  } else {
    showListing();
    alert('🎉 Congratulations! You\'ve completed all 35 challenges!');
  }
}

// Skip challenge
function skipChallenge() {
  nextChallenge();
}

// Reset progress
function resetProgress() {
  const confirmed = confirm(
    '⚠️ Are you sure you want to reset all progress?\n\n' +
    'This will:\n' +
    '• Clear all completed challenges\n' +
    '• Reset your progress to 0%\n' +
    '• Allow you to redo all challenges\n\n' +
    'This action cannot be undone!'
  );

  if (!confirmed) return;

  // Clear localStorage
  localStorage.removeItem('challengeProgress');

  // Reset in-memory progress
  userProgress = {};

  // Update UI
  updateProgressDisplay();
  renderChallenges();

  // Show success message
  alert('✅ Progress reset! All challenges are now available again.');

  console.log('✅ Progress reset successfully');
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Challenges page loading...');

  try {
    // Load user progress
    loadProgress();

    // Wait for SQL.js to initialize
    console.log('⏳ Waiting for SQL.js...');
    await waitForSQLInit();
    console.log('✅ SQL.js ready!');

    // Render challenges
    renderChallenges();
    updateProgressDisplay();

    // Check URL for challenge ID
    const hash = window.location.hash;
    if (hash.startsWith('#challenge-')) {
      const id = parseInt(hash.replace('#challenge-', ''));
      if (id >= 1 && id <= challenges.length) {
        loadChallenge(id);
      }
    }

    console.log('✅ Challenges ready with 35 problems across 7 datasets!');
  } catch (e) {
    console.error('❌ Failed to initialize challenges:', e);
    alert('Failed to load challenges. Please refresh the page.');
  }
});
