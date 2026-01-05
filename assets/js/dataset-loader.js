// ============================================
// DATASET LOADER - SQL.js Initialization
// ============================================

let db = null;
let SQL = null;
let isInitialized = false;

// Initialize SQL.js on page load
async function initSQLjs() {
    try {
        console.log('🔄 Initializing SQL.js...');

        // Check if initSqlJs is available
        if (typeof initSqlJs === 'undefined') {
            throw new Error('SQL.js library not loaded from CDN');
        }

        // Initialize SQL.js
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
        });

        // Create database
        db = new SQL.Database();
        isInitialized = true;

        console.log('✅ SQL.js initialized successfully!');
        return true;

    } catch (error) {
        console.error('❌ Failed to initialize SQL.js:', error);
        showError('Failed to load SQL engine: ' + error.message);
        return false;
    }
}

// Load dataset into database
function loadDataset(datasetName) {
    if (!isInitialized || !db) {
        console.error('Database not initialized');
        return false;
    }

    try {
        // Drop existing tables
        try {
            const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
            if (tables.length > 0 && tables[0].values) {
                tables[0].values.forEach(row => {
                    db.run(`DROP TABLE IF EXISTS ${row[0]}`);
                });
            }
        } catch (e) {
            // Ignore errors when dropping tables
        }

        // Load the selected dataset
        const dataset = DATASETS[datasetName];
        if (!dataset) {
            throw new Error(`Dataset "${datasetName}" not found`);
        }

        // Create table
        db.run(dataset.schema);

        // Insert data
        db.run(dataset.data);

        console.log(`✅ Loaded dataset: ${datasetName}`);
        return true;

    } catch (error) {
        console.error('❌ Error loading dataset:', error);
        showError('Failed to load dataset: ' + error.message);
        return false;
    }
}

// Execute SQL query
function executeSQL(query) {
    if (!isInitialized || !db) {
        throw new Error('Database not initialized. Please refresh the page.');
    }

    try {
        const results = db.exec(query);
        return results;
    } catch (error) {
        throw error;
    }
}

// ============================================
// DATASETS DEFINITIONS
// ============================================

const DATASETS = {
    employees: {
        name: 'employees',
        rows: 180,
        schema: `
            CREATE TABLE employees (
                employee_id INTEGER PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE,
                department TEXT,
                job_title TEXT,
                salary INTEGER,
                hire_date TEXT,
                manager_id INTEGER,
                office_location TEXT
            );
        `,
        data: `
            INSERT INTO employees VALUES
            (1, 'John', 'Smith', 'john.smith@company.com', 'Sales', 'Sales Manager', 75000, '2020-01-15', NULL, 'New York'),
            (2, 'Sarah', 'Johnson', 'sarah.j@company.com', 'Engineering', 'Senior Developer', 95000, '2019-03-20', NULL, 'San Francisco'),
            (3, 'Mike', 'Davis', 'mike.d@company.com', 'Sales', 'Sales Representative', 55000, '2021-06-10', 1, 'New York'),
            (4, 'Emily', 'Brown', 'emily.b@company.com', 'Engineering', 'Junior Developer', 65000, '2022-01-05', 2, 'San Francisco'),
            (5, 'David', 'Wilson', 'david.w@company.com', 'Marketing', 'Marketing Manager', 72000, '2020-09-15', NULL, 'Chicago'),
            (6, 'Lisa', 'Anderson', 'lisa.a@company.com', 'HR', 'HR Director', 80000, '2018-05-20', NULL, 'New York'),
            (7, 'Tom', 'Martinez', 'tom.m@company.com', 'Sales', 'Sales Representative', 53000, '2022-03-01', 1, 'Los Angeles'),
            (8, 'Anna', 'Garcia', 'anna.g@company.com', 'Engineering', 'Developer', 85000, '2020-07-12', 2, 'San Francisco'),
            (9, 'James', 'Rodriguez', 'james.r@company.com', 'Marketing', 'Content Writer', 48000, '2021-11-08', 5, 'Chicago'),
            (10, 'Mary', 'Lopez', 'mary.l@company.com', 'HR', 'HR Specialist', 52000, '2021-02-14', 6, 'New York'),
            (11, 'Robert', 'Lee', 'robert.l@company.com', 'Sales', 'Sales Representative', 54000, '2021-08-20', 1, 'New York'),
            (12, 'Jennifer', 'White', 'jennifer.w@company.com', 'Engineering', 'Senior Developer', 98000, '2018-11-05', 2, 'San Francisco'),
            (13, 'William', 'Harris', 'william.h@company.com', 'Marketing', 'Social Media Manager', 58000, '2020-04-15', 5, 'Chicago'),
            (14, 'Linda', 'Clark', 'linda.c@company.com', 'Sales', 'Account Manager', 68000, '2019-12-01', 1, 'Los Angeles'),
            (15, 'Richard', 'Lewis', 'richard.l@company.com', 'Engineering', 'DevOps Engineer', 92000, '2020-06-18', 2, 'San Francisco');
        `
    },

    customers: {
        name: 'customers',
        rows: 350,
        schema: `
            CREATE TABLE customers (
                customer_id INTEGER PRIMARY KEY,
                first_name TEXT,
                last_name TEXT,
                email TEXT,
                phone TEXT,
                address TEXT,
                city TEXT,
                state TEXT,
                country TEXT,
                postal_code TEXT,
                registration_date TEXT
            );
        `,
        data: `
            INSERT INTO customers VALUES
            (1, 'Alice', 'Johnson', 'alice.j@email.com', '555-0101', '123 Main St', 'New York', 'NY', 'USA', '10001', '2023-01-15'),
            (2, 'Bob', 'Williams', 'bob.w@email.com', '555-0102', '456 Oak Ave', 'Los Angeles', 'CA', 'USA', '90001', '2023-02-20'),
            (3, 'Carol', 'Brown', 'carol.b@email.com', '555-0103', '789 Pine Rd', 'Chicago', 'IL', 'USA', '60601', '2023-03-10'),
            (4, 'David', 'Jones', 'david.j@email.com', '555-0104', '321 Elm St', 'Houston', 'TX', 'USA', '77001', '2023-04-05'),
            (5, 'Emma', 'Davis', 'emma.d@email.com', '555-0105', '654 Maple Dr', 'Phoenix', 'AZ', 'USA', '85001', '2023-05-12'),
            (6, 'Frank', 'Miller', 'frank.m@email.com', '555-0106', '987 Cedar Ln', 'Philadelphia', 'PA', 'USA', '19101', '2023-06-18'),
            (7, 'Grace', 'Wilson', 'grace.w@email.com', '555-0107', '147 Birch Ct', 'San Antonio', 'TX', 'USA', '78201', '2023-07-22'),
            (8, 'Henry', 'Moore', 'henry.m@email.com', '555-0108', '258 Spruce Way', 'San Diego', 'CA', 'USA', '92101', '2023-08-30'),
            (9, 'Ivy', 'Taylor', 'ivy.t@email.com', '555-0109', '369 Walnut Pl', 'Dallas', 'TX', 'USA', '75201', '2023-09-14'),
            (10, 'Jack', 'Anderson', 'jack.a@email.com', '555-0110', '741 Ash Blvd', 'San Jose', 'CA', 'USA', '95101', '2023-10-25');
        `
    },

    products: {
        name: 'products',
        rows: 250,
        schema: `
            CREATE TABLE products (
                product_id INTEGER PRIMARY KEY,
                product_name TEXT,
                category TEXT,
                price REAL,
                stock_quantity INTEGER,
                supplier TEXT,
                sku TEXT UNIQUE,
                weight_kg REAL,
                release_date TEXT
            );
        `,
        data: `
            INSERT INTO products VALUES
            (1, 'Laptop Pro 15', 'Electronics', 1299.99, 45, 'TechSupply Inc', 'LAP-PRO-15', 2.1, '2023-01-10'),
            (2, 'Wireless Mouse', 'Electronics', 29.99, 250, 'AccessoryCo', 'MOU-WIR-01', 0.15, '2022-08-15'),
            (3, 'Office Desk', 'Furniture', 399.99, 30, 'FurniturePlus', 'DSK-OFF-120', 25.5, '2022-05-20'),
            (4, 'Ergonomic Chair', 'Furniture', 249.99, 60, 'FurniturePlus', 'CHR-ERG-01', 12.3, '2022-06-10'),
            (5, 'USB-C Cable', 'Electronics', 12.99, 500, 'AccessoryCo', 'CBL-USC-2M', 0.08, '2023-02-01'),
            (6, '27" Monitor', 'Electronics', 349.99, 80, 'TechSupply Inc', 'MON-27-4K', 5.2, '2023-03-15'),
            (7, 'Mechanical Keyboard', 'Electronics', 129.99, 120, 'AccessoryCo', 'KEY-MEC-RGB', 0.95, '2023-01-25'),
            (8, 'Standing Desk', 'Furniture', 599.99, 20, 'FurniturePlus', 'DSK-STD-ELE', 35.0, '2023-04-05'),
            (9, 'Desk Lamp', 'Home', 45.99, 150, 'HomeLighting', 'LMP-DSK-LED', 1.2, '2022-11-20'),
            (10, 'Laptop Bag', 'Accessories', 59.99, 100, 'BagCompany', 'BAG-LAP-BLK', 0.75, '2023-02-15');
        `
    },

    orders: {
        name: 'orders',
        rows: 650,
        schema: `
            CREATE TABLE orders (
                order_id INTEGER PRIMARY KEY,
                customer_id INTEGER,
                order_date TEXT,
                total_amount REAL,
                status TEXT,
                payment_method TEXT,
                shipping_address TEXT,
                delivery_date TEXT
            );
        `,
        data: `
            INSERT INTO orders VALUES
            (1, 1, '2024-01-10', 1329.98, 'Delivered', 'Credit Card', '123 Main St, New York, NY', '2024-01-15'),
            (2, 2, '2024-01-12', 29.99, 'Delivered', 'PayPal', '456 Oak Ave, Los Angeles, CA', '2024-01-17'),
            (3, 3, '2024-01-15', 649.98, 'Shipped', 'Debit Card', '789 Pine Rd, Chicago, IL', '2024-01-22'),
            (4, 1, '2024-01-18', 349.99, 'Processing', 'Credit Card', '123 Main St, New York, NY', NULL),
            (5, 4, '2024-01-20', 129.99, 'Delivered', 'Credit Card', '321 Elm St, Houston, TX', '2024-01-25'),
            (6, 5, '2024-01-22', 45.99, 'Delivered', 'PayPal', '654 Maple Dr, Phoenix, AZ', '2024-01-27'),
            (7, 2, '2024-01-25', 399.99, 'Shipped', 'Credit Card', '456 Oak Ave, Los Angeles, CA', '2024-02-01'),
            (8, 6, '2024-01-28', 249.99, 'Processing', 'Debit Card', '987 Cedar Ln, Philadelphia, PA', NULL),
            (9, 3, '2024-02-01', 72.98, 'Delivered', 'Credit Card', '789 Pine Rd, Chicago, IL', '2024-02-06'),
            (10, 7, '2024-02-03', 599.99, 'Shipped', 'PayPal', '147 Birch Ct, San Antonio, TX', '2024-02-10');
        `
    },

    sales: {
        name: 'sales',
        rows: 800,
        schema: `
            CREATE TABLE sales (
                sale_id INTEGER PRIMARY KEY,
                product_id INTEGER,
                quantity INTEGER,
                sale_date TEXT,
                sale_amount REAL,
                region TEXT,
                salesperson TEXT
            );
        `,
        data: `
            INSERT INTO sales VALUES
            (1, 1, 2, '2024-01-05', 2599.98, 'North', 'John Smith'),
            (2, 2, 5, '2024-01-06', 149.95, 'West', 'Sarah Johnson'),
            (3, 3, 1, '2024-01-07', 399.99, 'East', 'Mike Davis'),
            (4, 4, 3, '2024-01-08', 749.97, 'South', 'Emily Brown'),
            (5, 5, 10, '2024-01-09', 129.90, 'North', 'John Smith'),
            (6, 6, 2, '2024-01-10', 699.98, 'West', 'Sarah Johnson'),
            (7, 7, 4, '2024-01-11', 519.96, 'East', 'Mike Davis'),
            (8, 8, 1, '2024-01-12', 599.99, 'South', 'Emily Brown'),
            (9, 9, 6, '2024-01-13', 275.94, 'North', 'John Smith'),
            (10, 10, 3, '2024-01-14', 179.97, 'West', 'Sarah Johnson');
        `
    },

    departments: {
        name: 'departments',
        rows: 12,
        schema: `
            CREATE TABLE departments (
                department_id INTEGER PRIMARY KEY,
                department_name TEXT UNIQUE,
                manager_name TEXT,
                budget INTEGER,
                location TEXT,
                employee_count INTEGER
            );
        `,
        data: `
            INSERT INTO departments VALUES
            (1, 'Sales', 'John Smith', 500000, 'New York', 25),
            (2, 'Engineering', 'Sarah Johnson', 1200000, 'San Francisco', 45),
            (3, 'Marketing', 'David Wilson', 400000, 'Chicago', 18),
            (4, 'HR', 'Lisa Anderson', 300000, 'New York', 12),
            (5, 'Finance', 'Robert Taylor', 600000, 'New York', 20),
            (6, 'Operations', 'Jennifer White', 800000, 'Los Angeles', 30),
            (7, 'Customer Service', 'William Harris', 350000, 'Chicago', 22),
            (8, 'IT Support', 'Linda Clark', 450000, 'San Francisco', 15),
            (9, 'Product', 'Richard Lewis', 900000, 'San Francisco', 28),
            (10, 'Legal', 'Mary Lopez', 400000, 'New York', 10),
            (11, 'Research', 'James Rodriguez', 700000, 'Boston', 16),
            (12, 'Design', 'Anna Garcia', 500000, 'Los Angeles', 14);
        `
    },

    transactions: {
        name: 'transactions',
        rows: 500,
        schema: `
            CREATE TABLE transactions (
                transaction_id INTEGER PRIMARY KEY,
                customer_id INTEGER,
                transaction_date TEXT,
                amount REAL,
                transaction_type TEXT,
                status TEXT,
                payment_method TEXT
            );
        `,
        data: `
            INSERT INTO transactions VALUES
            (1, 1, '2024-01-10 10:30:00', 1329.98, 'Purchase', 'Completed', 'Credit Card'),
            (2, 2, '2024-01-12 14:15:00', 29.99, 'Purchase', 'Completed', 'PayPal'),
            (3, 3, '2024-01-15 09:45:00', 649.98, 'Purchase', 'Completed', 'Debit Card'),
            (4, 1, '2024-01-18 16:20:00', 349.99, 'Purchase', 'Pending', 'Credit Card'),
            (5, 4, '2024-01-20 11:00:00', 129.99, 'Purchase', 'Completed', 'Credit Card'),
            (6, 5, '2024-01-22 13:30:00', 45.99, 'Purchase', 'Completed', 'PayPal'),
            (7, 2, '2024-01-25 10:10:00', 399.99, 'Purchase', 'Completed', 'Credit Card'),
            (8, 6, '2024-01-28 15:45:00', 249.99, 'Purchase', 'Pending', 'Debit Card'),
            (9, 3, '2024-02-01 12:20:00', 72.98, 'Purchase', 'Completed', 'Credit Card'),
            (10, 1, '2024-01-16 09:00:00', -50.00, 'Refund', 'Completed', 'Credit Card');
        `
    }
};

// Initialize on page load
window.addEventListener('load', initSQLjs);
