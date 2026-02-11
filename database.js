// ============================================
// 🗄️ مروان هوب - قاعدة البيانات المحلية
// SQLite في المتصفح - بدون سيرفر
// ============================================

// تهيئة قاعدة البيانات
let db = null;
let initPromise = null;

// تحميل مكتبة SQLite
async function loadSQLite() {
    if (initPromise) return initPromise;
    
    initPromise = new Promise(async (resolve, reject) => {
        try {
            // تحميل SQL.js
            const SQL = await initSqlJs({
                locateFile: file => `https://sql.js.org/dist/${file}`
            });
            
            // إنشاء قاعدة بيانات جديدة أو تحميل المخزنة
            const savedData = localStorage.getItem('marwanhub_db');
            
            if (savedData) {
                // تحميل قاعدة البيانات المحفوظة
                const dataArray = new Uint8Array(JSON.parse(savedData));
                db = new SQL.Database(dataArray);
                console.log('✅ تم تحميل قاعدة البيانات المحفوظة');
            } else {
                // إنشاء قاعدة بيانات جديدة
                db = new SQL.Database();
                createTables();
                insertSampleData();
                saveDatabase();
                console.log('✅ تم إنشاء قاعدة بيانات جديدة');
            }
            
            resolve(db);
        } catch (error) {
            console.error('❌ فشل تحميل SQLite:', error);
            reject(error);
        }
    });
    
    return initPromise;
}

// إنشاء الجداول
function createTables() {
    // جدول المنتجات
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL,
            icon TEXT,
            factory TEXT,
            production_time TEXT,
            category TEXT,
            specs TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // جدول المصانع
    db.run(`
        CREATE TABLE IF NOT EXISTS factories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT,
            monthly_capacity INTEGER,
            efficiency INTEGER,
            active BOOLEAN DEFAULT 1
        );
    `);
    
    // جدول الطلبات
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE,
            product_id INTEGER,
            customer_name TEXT,
            customer_email TEXT,
            customer_phone TEXT,
            price INTEGER,
            status TEXT DEFAULT 'completed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
    `);
    
    // جدول الإحصائيات
    db.run(`
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stat_key TEXT UNIQUE,
            stat_value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

// إضافة بيانات تجريبية
function insertSampleData() {
    // إضافة المصانع
    const factories = [
        ['مصنع التقني', '💻', 750, 10],
        ['مصنع الإبداع', '🎨', 420, 10],
        ['مصنع التعليم', '📚', 600, 10],
        ['مصنع المؤسسات', '🏛️', 300, 10]
    ];
    
    factories.forEach(f => {
        db.run(`
            INSERT INTO factories (name, icon, monthly_capacity, efficiency)
            VALUES (?, ?, ?, ?)
        `, f);
    });
    
    // إضافة المنتجات
    const products = [
        ['نظام ERP كامل', 'نظام محاسبة ومخازن ومبيعات متكامل', 2500, '💻', 'مصنع التقني', '3 دقائق', 'erp', JSON.stringify(['محاسبة متكاملة', 'إدارة المخازن', 'الموارد البشرية', 'تقارير حية'])],
        ['CRM متقدم', 'نظام إدارة علاقات العملاء', 1900, '📊', 'مصنع التقني', '2 دقيقة', 'crm', JSON.stringify(['عملاء', 'تيكتس', 'تقارير', 'مهام'])],
        ['متجر VIP', 'متجر إلكتروني احترافي', 2800, '🏬', 'مصنع الإبداع', '5 دقائق', 'ecommerce', JSON.stringify(['شوبيفاي', 'لايكر', 'بوابات دفع', 'تطبيق موبايل'])],
        ['تحليلات مبيعات', 'نظام تحليل وتقارير', 1500, '📈', 'مصنع التقني', '2 دقيقة', 'analytics', JSON.stringify(['مبيعات', 'عملاء', 'أرباح', 'توقعات'])],
        ['نظام عيادات', 'إدارة العيادات والمرضى', 2200, '🏥', 'مصنع المؤسسات', '4 دقائق', 'clinic', JSON.stringify(['حجوزات', 'ملفات مرضى', 'فواتير', 'مواعيد'])],
        ['نظام مدارس', 'إدارة المدارس والطلاب', 2000, '🏫', 'مصنع التعليم', '4 دقائق', 'school', JSON.stringify(['طلاب', 'درجات', 'شهادات', 'تواصل أولياء'])],
        ['نظام محاسبة', 'دفاتر وقيد وميزانية', 1800, '💰', 'مصنع التقني', '3 دقائق', 'accounting', JSON.stringify(['دفتر يومية', 'ميزانية', 'ضرائب', 'تقارير مالية'])],
        ['نظام مخازن', 'إدارة المخزون والمشتريات', 1700, '📦', 'مصنع التقني', '3 دقائق', 'inventory', JSON.stringify(['مشتريات', 'مبيعات', 'جرد', 'تنبيهات'])],
        ['تطبيق موبايل', 'تطبيق Android + iOS', 3200, '📱', 'مصنع الإبداع', '7 دقائق', 'mobile', JSON.stringify(['Android', 'iOS', 'API', 'لوحة تحكم'])],
        ['بوابة دفع', 'ربط بوابات الدفع', 1200, '💳', 'مصنع التقني', '2 دقيقة', 'payment', JSON.stringify(['Stripe', 'PayPal', 'فوري', 'مدى'])]
    ];
    
    products.forEach(p => {
        db.run(`
            INSERT INTO products (name, description, price, icon, factory, production_time, category, specs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, p);
    });
    
    // إضافة الإحصائيات
    const stats = [
        ['speed', '1000'],
        ['quality', '10/10'],
        ['active_factories', '4'],
        ['total_products', products.length.toString()]
    ];
    
    stats.forEach(s => {
        db.run(`
            INSERT INTO stats (stat_key, stat_value)
            VALUES (?, ?)
        `, s);
    });
}

// حفظ قاعدة البيانات في localStorage
function saveDatabase() {
    if (!db) return;
    const data = db.export();
    const array = Array.from(data);
    localStorage.setItem('marwanhub_db', JSON.stringify(array));
}

// ============================================
// دوال التعامل مع البيانات
// ============================================

// جلب جميع المنتجات
async function getAllProducts() {
    await loadSQLite();
    const result = db.exec('SELECT * FROM products ORDER BY id DESC');
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
        let obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
            // تحويل JSON specs
            if (col === 'specs' && row[i]) {
                try {
                    obj[col] = JSON.parse(row[i]);
                } catch (e) {
                    obj[col] = row[i];
                }
            }
        });
        return obj;
    });
}

// جلب منتج واحد
async function getProduct(id) {
    await loadSQLite();
    const result = db.exec('SELECT * FROM products WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    
    const columns = result[0].columns;
    const row = result[0].values[0];
    
    let product = {};
    columns.forEach((col, i) => {
        product[col] = row[i];
        if (col === 'specs' && row[i]) {
            try {
                product[col] = JSON.parse(row[i]);
            } catch (e) {
                product[col] = row[i];
            }
        }
    });
    
    return product;
}

// جلب منتجات حسب الفئة
async function getProductsByCategory(category) {
    await loadSQLite();
    const result = db.exec('SELECT * FROM products WHERE category = ?', [category]);
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
        let obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
}

// إنشاء طلب جديد
async function createOrder(productId, customerName, customerEmail, customerPhone) {
    await loadSQLite();
    
    // جلب المنتج
    const product = await getProduct(productId);
    if (!product) return null;
    
    // إنشاء رقم طلب
    const orderNumber = 'ORD-' + Date.now();
    
    // إضافة الطلب
    db.run(`
        INSERT INTO orders (order_number, product_id, customer_name, customer_email, customer_phone, price)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [orderNumber, productId, customerName, customerEmail, customerPhone, product.price]);
    
    saveDatabase();
    
    return {
        orderNumber,
        productName: product.name,
        price: product.price
    };
}

// جلب الإحصائيات
async function getStats() {
    await loadSQLite();
    const result = db.exec('SELECT stat_key, stat_value FROM stats');
    if (result.length === 0) return {};
    
    const stats = {};
    result[0].values.forEach(row => {
        stats[row[0]] = row[1];
    });
    
    return stats;
}

// تحديث إحصائية
async function updateStat(key, value) {
    await loadSQLite();
    db.run(`
        INSERT OR REPLACE INTO stats (stat_key, stat_value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [key, value]);
    saveDatabase();
}

// زيادة عداد المشاهدات
async function incrementProductView(productId) {
    // هتضاف في الإصدار الجاي
}

// ============================================
// تصدير الدوال
// ============================================
window.MarwanHubDB = {
    loadSQLite,
    getAllProducts,
    getProduct,
    getProductsByCategory,
    createOrder,
    getStats,
    updateStat
};

console.log('🗄️ قاعدة بيانات مروان هوب المحلية جاهزة!');
