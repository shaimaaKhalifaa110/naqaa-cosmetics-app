tailwind.config = {
    theme: {
        extend: {
            colors: {

                brandRed: '#dc2626',    /* أحمر */
                brandPink: '#fbcfe8',   /* بينك فاتح */
                brandPinkDark: '#f472b6', /* بينك غامق للأزرار */
                bgWhite: '#ffffff',     /* أبيض */
                bgLight: '#fff1f2'      /* خلفية الصفحة (بينك مائل للأبيض) */
            }
        }
    }
}

// 1. المتغيرات (State) - [الأسبوع 1]
// نشأنا مصفوفة فارغة لتخزين المنتجات بمجرد وصولها من السيرفر. استخدمنا let وليس const لأننا سنقوم بتعديل محتواها لاحقاً (بملئها بالبيانات).

let productsList = []; 
// عداد رقمي يبدأ من الصفر، وظيفته تتبع عدد المنتجات التي أضافتها المستخدمة للسلة.

let cartCount = 0;

// الإمساك بعناصر الـ DOM - [الأسبوع 3]
const container = document.querySelector("#products-container");
const searchInput = document.querySelector("#search-input");
const cartCountDisplay = document.querySelector("#cart-count");

let cartItems = []; // مصفوفة السلة الجديدة التي ستحتوي على بيانات المنتجات

// الإمساك بعناصر نافذة السلة
const cartModal = document.querySelector("#cart-modal");
const cartOpenBtn = document.querySelector("#cart-open-btn");
const cartCloseBtn = document.querySelector("#cart-close-btn");
const cartItemsContainer = document.querySelector("#cart-items-container");
const cartTotalDisplay = document.querySelector("#cart-total");

// 2. دالة جلب البيانات (Fetch API) - [الأسبوع 4]
const fetchCosmetics = async () => {
    try {
        // نستخدم API حقيقي يرجع منتجات تجميل ومكياج
        const response = await fetch("https://dummyjson.com/products/category/beauty");
        const data = await response.json();
        
        productsList = data.products; // تخزين المنتجات في المتغير
        renderProducts(productsList); // استدعاء دالة العرض

    } catch (error) {
        console.error("حدث خطأ:", error);
        container.innerHTML = `<p class="text-center col-span-full text-brandRed font-bold">حدث خطأ في تحميل البيانات ❌</p>`;
    }
};

// 3. دالة العرض باستخدام (Map) - [الأسبوع 2]
const renderProducts = (productsToRender) => {
    // حالة: إذا كان البحث لا يطابق أي منتج
    if (productsToRender.length === 0) {
        container.innerHTML = `<p class="text-center col-span-full text-gray-500 text-xl">لا توجد منتجات مطابقة لبحثك 🥲</p>`;
        return;
    }

    // تحويل كل كائن إلى بطاقة HTML
    const productsHTML = productsToRender.map(product => {
        // استخدام التفكيك (Destructuring) - [الأسبوع 1]
        const { id, title, price, thumbnail } = product;
        
        return `
            <div class="bg-bgWhite p-5 rounded-3xl shadow-lg border-2 border-transparent hover:border-brandPinkDark transition duration-300 flex flex-col justify-between">
                <img src="${thumbnail}" alt="${title}" class="w-full h-48 object-contain rounded-xl mb-4 bg-gray-50">
                <h3 class="text-lg font-bold text-gray-700 mb-2 truncate" title="${title}">${title}</h3>
                
                <div class="flex justify-between items-center mt-4">
                    <span class="text-brandRed font-extrabold text-xl">${price} $</span>
                   <button onclick="addToCart(${id})" class="bg-brandPink hover:bg-brandPinkDark hover:text-white text-brandRed font-bold py-2 px-4 rounded-full transition duration-300">
    شراء 🛒
</button>
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = productsHTML;

    // تفعيل الأزرار بعد رسمها في الشاشة - [الأسبوع 3]
    activateCartButtons();
};

// 4. دالة البحث اللحظي باستخدام (Filter) - [الأسبوع 2 و 3]
searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // تصفية المنتجات التي يحتوي اسمها على النص المكتوب
    const filteredProducts = productsList.filter(product => 
        product.title.toLowerCase().includes(searchTerm)
    );
    
    renderProducts(filteredProducts); // إعادة رسم الشاشة بالمنتجات المفلترة
});

// 5. دالة تفعيل أزرار السلة (Event Listeners) - [الأسبوع 3]
const activateCartButtons = () => {
    // نمسك بكل أزرار "شراء" الموجودة حالياً في الصفحة
    const buttons = document.querySelectorAll(".add-to-cart-btn");
    
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            cartCount++; // زيادة العداد
            cartCountDisplay.textContent = cartCount; // تحديث الرقم في الناف بار
        });
    });
};

// 1. فتح وإغلاق السلة عند الضغط
cartOpenBtn.addEventListener("click", () => cartModal.classList.remove("hidden"));
cartCloseBtn.addEventListener("click", () => cartModal.classList.add("hidden"));

// 2. دالة الإضافة للسلة (تُستدعى عند الضغط على "شراء")
const addToCart = (productId) => {
    // أ- البحث عن المنتج الأصلي من مصفوفة المنتجات (productsList) باستخدام find
    const product = productsList.find(p => p.id === productId);

    // ب- هل المنتج موجود بالفعل داخل السلة؟
    const existingItem = cartItems.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1; // إذا موجود، نزيد الكمية فقط
    } else {
        // إذا غير موجود، ننسخ بياناته ونضيف له خاصية (الكمية = 1)
        cartItems.push({ ...product, quantity: 1 });
    }

    renderCart(); // تحديث شاشة السلة
    cartModal.classList.remove("hidden"); // فتح السلة تلقائياً عند إضافة منتج لتنبيه المستخدم
};

// 3. دالة حذف منتج من السلة (باستخدام filter)
const removeFromCart = (productId) => {
    cartItems = cartItems.filter(item => item.id !== productId);
    renderCart();
};

// 4. دالة عرض محتويات السلة وحساب الإجمالي (الريندر)
const renderCart = () => {
    // تحديث الرقم الصغير بجوار أيقونة السلة (عدد العناصر)
    cartCountDisplay.textContent = cartItems.reduce((total, item) => total + item.quantity, 0);

    // إذا كانت السلة فارغة
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = "<p class='text-center text-gray-500 mt-10'>السلة فارغة حالياً 🥲</p>";
        cartTotalDisplay.textContent = "0";
        return;
    }

    // رسم المنتجات داخل السلة باستخدام map
    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
            <div class="flex items-center gap-3">
                <img src="${item.thumbnail}" alt="" class="w-12 h-12 object-contain rounded-md bg-gray-50">
                <div>
                    <h4 class="text-sm font-bold w-32 truncate" title="${item.title}">${item.title}</h4>
                    <p class="text-xs text-gray-500">الكمية: ${item.quantity}</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-brandRed font-bold text-sm">${(item.price * item.quantity).toFixed(2)}$</span>
                <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500 transition">❌</button>
            </div>
        </div>
    `).join("");

    // حساب إجمالي السعر باستخدام reduce بطلة الأسبوع الثاني
    const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    cartTotalDisplay.textContent = totalPrice.toFixed(2); // التقريب لرقمين عشريين
};

// تشغيل التطبيق فور فتح الصفحة
fetchCosmetics();