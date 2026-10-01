# ZENO Web Ready

نسخة Web MVP مرتبة للرفع على GitHub Pages.

## الملفات
- `index.html` — واجهة ZENO
- `styles.css` — التصميم
- `app.js` — تسجيل الدخول عبر Supabase OTP
- `assets/logo/zeno-logo.svg` — الشعار
- `.nojekyll` — لتفادي معالجة Jekyll

## النشر على GitHub Pages
1. افتح مستودع `ZENO`.
2. اختر **Add file → Upload files**.
3. ارفع محتويات هذا المجلد كما هي، وليس ملف ZIP نفسه.
4. Commit changes.
5. من **Settings → Pages** اختر:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`

## Supabase
الموقع يستخدم Publishable Key فقط. لا يوجد Service Role Key أو Secret Key داخل الملفات.
يلزم تفعيل Phone Auth / SMS في مشروع Supabase حتى يعمل OTP الحقيقي.

> هذه نسخة Web MVP للتجربة وليست بديلاً عن نسخة Android الأصلية.
