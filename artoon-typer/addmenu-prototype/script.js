/**
 * script.js - Interactive logic for AddMenu Prototype
 */

// Initialize lucide icons
lucide.createIcons();

// Authentic data reflecting the BlockRegistry from the core engine
const blockData = {
    text: [
        { id: 'paragraph', name: 'فقرة', desc: 'نص عادي بدون تنسيق', icon: 'pilcrow' },
        { id: 'heading1', name: 'عنوان 1', desc: 'تنسيق عنوان كبير جداً', icon: 'heading-1' },
        { id: 'heading2', name: 'عنوان 2', desc: 'تنسيق عنوان كبير', icon: 'heading-2' },
        { id: 'heading3', name: 'عنوان 3', desc: 'تنسيق عنوان متوسط', icon: 'heading-3' },
        { id: 'heading4', name: 'عنوان 4', desc: 'تنسيق عنوان صغير', icon: 'heading-4' },
        { id: 'heading5', name: 'عنوان 5', desc: 'تنسيق عنوان صغير جداً', icon: 'heading-5' },
        { id: 'heading6', name: 'عنوان 6', desc: 'أصغر تنسيق للعنوان', icon: 'heading-6' },
        { id: 'quote', name: 'اقتباس', desc: 'إبراز نص كاقتباس مميز', icon: 'quote' },
        { id: 'preformatted', name: 'نص محفوظ التنسيق', desc: 'نص مع الحفاظ على الفراغات', icon: 'file-text' },
        { id: 'line-break', name: 'سطر جديد', desc: 'إدراج سطر جديد', icon: 'corner-down-left' },
        { id: 'word-break', name: 'فاصل كلمة', desc: 'فرصة لكسر الكلمة', icon: 'between-horizontal-start' }
    ],
    list: [
        { id: 'bullet-list', name: 'قائمة نقطية', desc: 'قائمة عناصر غير مرتبة', icon: 'list' },
        { id: 'numbered-list', name: 'قائمة مرقمة', desc: 'قائمة مرتبة متسلسلة', icon: 'list-ordered' },
        { id: 'definition-list', name: 'قائمة تعريفات', desc: 'قائمة مصطلحات وتعاريفها', icon: 'book-open' }
    ],
    media: [
        { id: 'image', name: 'صورة', desc: 'رفع صورة أو وضع رابط', icon: 'image' },
        { id: 'video', name: 'فيديو', desc: 'تضمين فيديو', icon: 'video' },
        { id: 'audio', name: 'صوت', desc: 'تضمين ملف صوتي', icon: 'music' },
        { id: 'figure', name: 'شكل', desc: 'صورة/فيديو مع تعليق', icon: 'component' },
        { id: 'file', name: 'ملف', desc: 'ملف للتحميل', icon: 'file-down' }
    ],
    advanced: [
        { id: 'code', name: 'كود', desc: 'إدراج كود برمجي', icon: 'code' },
        { id: 'table', name: 'جدول', desc: 'إضافة جدول بيانات', icon: 'table' },
        { id: 'divider', name: 'فاصل', desc: 'فاصل مرئي بين البلوكات', icon: 'minus' },
        { id: 'details', name: 'محتوى قابل للطي', desc: 'قسم يمكن إخفاء محتواه', icon: 'folder-open' },
        { id: 'time-block', name: 'تاريخ/وقت', desc: 'عرض التاريخ أو الوقت', icon: 'calendar' },
        { id: 'abbr-block', name: 'اختصار', desc: 'تعريف اختصار', icon: 'type' },
        { id: 'meta', name: 'بيانات وصفية', desc: 'حقول معلومات المادة', icon: 'clipboard-list' },
        { id: 'link-block', name: 'رابط', desc: 'رابط كعنصر مستقل', icon: 'link' },
        { id: 'custom', name: 'بلوك مخصص', desc: 'عنصر معرف من قبل المستخدم', icon: 'puzzle' }
    ]
};

const contentArea = document.getElementById('contentArea');

// Category Mapping with Icons
const categories = {
    text: { title: 'أساسي (نصوص)', icon: 'type' },
    list: { title: 'قوائم', icon: 'list-tree' },
    media: { title: 'وسائط', icon: 'image' },
    advanced: { title: 'وحدات متقدمة', icon: 'blocks' }
};

const globalSubmenu = document.getElementById('globalSubmenu');
const globalSubmenuInner = document.getElementById('globalSubmenuInner');

// Track currently open category
let activeCategory = null;

// Toggle Function called from HTML onclick
window.toggleCategory = function (catId) {
    if (activeCategory === catId) {
        // Toggle off if clicking the same category
        activeCategory = null;
        globalSubmenu.classList.remove('expanded');
        const row = document.getElementById(`cat-row-${catId}`);
        if (row) row.classList.remove('expanded');
    } else {
        // Close previous category visually
        if (activeCategory) {
            const prevRow = document.getElementById(`cat-row-${activeCategory}`);
            if (prevRow) prevRow.classList.remove('expanded');
        }

        // Open new category
        activeCategory = catId;
        const row = document.getElementById(`cat-row-${catId}`);
        if (row) row.classList.add('expanded');

        // Populate the Global Submenu Panel
        const blocks = blockData[catId];
        let subHtml = '';
        if (blocks) {
            blocks.forEach(block => {
                subHtml += `
                    <div class="block-item" onclick="alert('اخترت: ${block.name}')">
                        <div class="block-icon-box">
                            <i data-lucide="${block.icon}"></i>
                        </div>
                        <div class="block-info">
                            <div class="block-title">${block.name}</div>
                            <div class="block-desc">${block.desc}</div>
                        </div>
                    </div>
                `;
            });
        }

        globalSubmenuInner.innerHTML = subHtml;
        globalSubmenu.classList.add('expanded');

        // Re-initialize icons purely for the injected submenu items
        lucide.createIcons();
    }
}

// Core Render Function: Main Menu & Flat Search List
function renderMenu(searchQuery = '') {
    contentArea.innerHTML = '';
    const query = searchQuery.toLowerCase().trim();
    let hasResults = false;

    // Reset flyout state whenever re-rendering menu
    activeCategory = null;
    globalSubmenu.classList.remove('expanded');

    if (query.length > 0) {
        // Flat List for Search Mode
        const allBlocks = [
            ...blockData.text,
            ...blockData.list,
            ...blockData.media,
            ...blockData.advanced
        ];

        const filtered = allBlocks.filter(b =>
            b.name.toLowerCase().includes(query) ||
            b.desc.toLowerCase().includes(query)
        );

        if (filtered.length > 0) {
            hasResults = true;
            filtered.forEach(block => {
                contentArea.innerHTML += `
                    <div class="block-item" onclick="alert('اخترت: ${block.name}')">
                        <div class="block-icon-box">
                            <i data-lucide="${block.icon}"></i>
                        </div>
                        <div class="block-info">
                            <div class="block-title">${block.name}</div>
                            <div class="block-desc">${block.desc}</div>
                        </div>
                    </div>
                `;
            });
        }
    } else {
        // Clean Category Rows
        hasResults = true;
        Object.keys(blockData).forEach(catId => {
            const blocks = blockData[catId];
            const catInfo = categories[catId];

            // Only render row if category has blocks
            if (blocks.length > 0) {
                let html = `
                    <div class="category-row" id="cat-row-${catId}" onclick="toggleCategory('${catId}')">
                        <div class="category-row-left">
                            <div class="category-icon">
                                <i data-lucide="${catInfo.icon}"></i>
                            </div>
                            <div class="category-title">${catInfo.title}</div>
                        </div>
                        <div class="category-chevron">
                            <i data-lucide="chevron-left"></i> 
                        </div>
                    </div>
                `;
                contentArea.innerHTML += html;
            }
        });
    }

    if (!hasResults) {
        contentArea.innerHTML = `<div style="text-align: center; color: #888; padding: 20px 10px; font-size: 13px;">لا توجد نتائج مطابقة للبحث "${query}"</div>`;
    }

    // Initialize icons main menu
    lucide.createIcons();
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
});

// Search input micro-interaction
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    renderMenu(e.target.value);
});
