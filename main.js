// ============================================
// 🏭 مروان هوب - النظام المحلي المتكامل
// SQLite + JavaScript - بدون Firebase
// ============================================

// تحميل مكتبة SQL.js
const SQLITE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
let SQL = null;

// تحميل SQL.js
async function loadSQL() {
    if (SQL) return SQL;
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SQLITE_URL;
        script.onload = async () => {
            SQL = await initSqlJs({
                locateFile: () => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm'
            });
            resolve(SQL);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ============================================
// تهيئة قاعدة البيانات
// ============================================
let db = null;

async function initDatabase() {
    await loadSQL();
    
    const savedDB = localStorage.getItem('marwanhub_db');
    
    if (savedDB) {
        const buf = new Uint8Array(JSON.parse(savedDB));
        db = new SQL.Database(buf);
        console.log('✅ تم تحميل قاعدة البيانات المحفوظة');
    } else {
        db = new SQL.Database();
        await createTables();
        await insertSampleData();
        saveDatabase();
        console.log('✅ تم إنشاء قاعدة بيانات جديدة');
    }
    
    return db;
}

function saveDatabase() {
    if (!db) return;
    const data = db.export();
    const array = Array.from(data);
    localStorage.setItem('marwanhub_db', JSON.stringify(array));
}

// ============================================
// إنشاء الجداول
// ============================================
async function createTables() {
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

// ============================================
// إضافة بيانات تجريبية
// ============================================
async function insertSampleData() {
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
        ['نظام مدارس', 'إدارة المدارس والطلاب', 2000, '🏫', 'مصنع التعليم', '4 دقائق', 'school', JSON.stringify(['طلاب', 'درجات', 'شهادات', 'تواصل أولياء'])]
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

// ============================================
// دوال جلب البيانات
// ============================================

// جلب جميع المنتجات
async function getAllProducts() {
    if (!db) await initDatabase();
    const result = db.exec('SELECT * FROM products ORDER BY id DESC');
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
        let obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
            if (col === 'specs' && row[i]) {
                try {
                    obj[col] = JSON.parse(row[i]);
                } catch (e) {}
            }
        });
        return obj;
    });
}

// جلب منتج واحد
async function getProduct(id) {
    if (!db) await initDatabase();
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
            } catch (e) {}
        }
    });
    
    return product;
}

// إنشاء طلب جديد
async function createOrder(productId, customerName, customerEmail, customerPhone) {
    if (!db) await initDatabase();
    
    const product = await getProduct(productId);
    if (!product) return null;
    
    const orderNumber = 'ORD-' + Date.now();
    
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
    if (!db) await initDatabase();
    const result = db.exec('SELECT stat_key, stat_value FROM stats');
    if (result.length === 0) return {};
    
    const stats = {};
    result[0].values.forEach(row => {
        stats[row[0]] = row[1];
    });
    
    return stats;
}

// ============================================
// تهيئة الصفحات
// ============================================

// تحميل المنتجات في الصفحة الرئيسية
async function loadHomeProducts() {
    const products = await getAllProducts();
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    let html = '';
    products.slice(0, 4).forEach(p => {
        html += `
            <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'">
                <div class="product-icon">${p.icon || '💻'}</div>
                <h3>${p.name}</h3>
                <p>${p.description.substring(0, 30)}...</p>
                <div class="product-price">$${p.price}</div>
                <button class="btn-buy" onclick="event.stopPropagation(); buyNow(${p.id})">🛒 اشتري الآن</button>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    // تحديث إحصائية المنتجات
    const productsStat = document.getElementById('products-stat');
    if (productsStat) productsStat.textContent = products.length;
}

// تحميل جميع المنتجات
async function loadAllProducts() {
    const products = await getAllProducts();
    const grid = document.getElementById('products-grid-full');
    if (!grid) return;
    
    let html = '';
    products.forEach(p => {
        html += `
            <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'">
                <div class="product-icon">${p.icon || '💻'}</div>
                <h3>${p.name}</h3>
                <p>${p.description.substring(0, 50)}...</p>
                <div class="product-price">$${p.price}</div>
                <button class="btn-buy" onclick="event.stopPropagation(); buyNow(${p.id})">🛒 اشتري الآن</button>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

// تحميل صفحة المنتج
async function loadProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) return;
    
    const product = await getProduct(productId);
    if (!product) return;
    
    document.title = `${product.name} | مروان هوب`;
    
    const container = document.querySelector('.product-details');
    if (container) {
        const specs = product.specs || ['محاسبة متكاملة', 'إدارة المخازن', 'تقارير حية'];
        
        container.innerHTML = `
            <div class="product-header">
                <div class="product-icon-large">${product.icon || '💻'}</div>
                <h1>${product.name}</h1>
            </div>
            
            <div class="product-specs">
                <h3>📋 المواصفات</h3>
                <ul>
                    ${specs.map(spec => `<li>• ${spec}</li>`).join('')}
                </ul>
            </div>
            
            <div class="product-meta">
                <p><strong>🏭 منتج من:</strong> ${product.factory || 'مصنع التقني'}</p>
                <p><strong>⚡ وقت الإنتاج:</strong> ${product.production_time || '3 دقائق'}</p>
                <p><strong>🎯 الجودة:</strong> 10/10</p>
            </div>
            
            <div class="product-price-large">
                <span class="price">$${product.price}</span>
                <button class="btn btn-primary" onclick="buyNow(${product.id})">🛒 اشتري الآن</button>
            </div>
        `;
    }
}

// شراء منتج
window.buyNow = async function(productId) {
    const product = await getProduct(productId);
    
    const order = {
        id: 'ORD-' + Date.now(),
        productId: productId,
        productName: product.name,
        price: product.price,
        date: new Date().toISOString(),
        status: 'completed'
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(order));
    window.location.href = 'success.html';
};

// تحميل صفحة النجاح
function loadSuccessPage() {
    const order = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (order) {
        document.getElementById('order-product').textContent = order.productName;
        document.getElementById('order-price').textContent = `$${order.price}`;
        document.getElementById('order-date').textContent = new Date(order.date).toLocaleDateString('ar-EG');
        document.getElementById('order-id').textContent = order.id;
        document.getElementById('download-link').href = `#download-${order.productId}`;
    }
}

// ============================================
// تشغيل النظام
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // تهيئة قاعدة البيانات
    await initDatabase();
    
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        loadHomeProducts();
    }
    
    if (path.includes('products.html')) {
        loadAllProducts();
    }
    
    if (path.includes('product.html')) {
        loadProductPage();
    }
    
    if (path.includes('success.html')) {
        loadSuccessPage();
    }
    
    // تحديث الإحصائيات
    const stats = await getStats();
    const speedStat = document.getElementById('speed-stat');
    if (speedStat) speedStat.textContent = `${stats.speed || 1000}%`;
    
    const factoriesStat = document.getElementById('factories-stat');
    if (factoriesStat) factoriesStat.textContent = stats.active_factories || 4;
});

console.log('🏭 مروان هوب - النظام المحلي جاهز!');
