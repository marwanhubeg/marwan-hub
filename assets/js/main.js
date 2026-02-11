// ============================================
// مروان هوب - Marwan Hub
// الوظائف التفاعلية - الإصدار 1.0
// ============================================

// تحديث الأرقام الحية
function updateStats() {
    const speedElement = document.getElementById('speedStat');
    const factoriesElement = document.getElementById('factoriesStat');
    const productsElement = document.getElementById('productsStat');
    
    if (speedElement) {
        // زيادة سرعة الإنتاج بشكل عشوائي (محاكاة)
        const baseSpeed = 1000;
        const variation = Math.floor(Math.random() * 100);
        speedElement.textContent = `${baseSpeed + variation}%`;
    }
    
    if (factoriesElement) {
        // تحديث عدد المصانع
        factoriesElement.textContent = '4';
    }
    
    if (productsElement) {
        // تحديث عدد المنتجات
        productsElement.textContent = '47';
    }
}

// تحديث كل 10 ثواني
setInterval(updateStats, 10000);

// تحديث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateStats);

// رسالة ترحيب في الكونسول
console.log('🏭 مروان هوب - مصانع رقمية شغالة 24/7');
console.log('⚡ سرعة الإنتاج: 1000% | 🎯 جودة: 10/10');
console.log('♥ ذكاء يبحث عن بيتك 🧠');
