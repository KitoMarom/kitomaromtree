# מערכת קישורי הרשמה לקייטנות וצהרונים - קיטו מרום 🚀

מערכת ניהול מודרנית, מהירה ורספונסיבית המיועדת להצגת קישורי רישום להורים לפי אזורים וערים בארץ (עבור חברת קיטו מרום), הכוללת ממשק ניהול פנימי מאובטח לצוות המשרד.

פרויקט זה נבנה באמצעות **Vite + React** בצד הלקוח, **Supabase** כבסיס נתונים ומערכת אימות, וחלקי קוד רגישים מאובטחים המבוצעים באמצעות **Netlify Functions**.

---

## 📂 מבנה תיעוד הפרויקט (Documentation)

המערכת מתועדת במלואה בכל שלבי האפיון והפיתוח שלה. מומלץ לקרוא את קבצי התיעוד לפי הסדר הבא:

1. **שלב 0**: [אפיון גישות והרשאות בסיס](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/docs/00-access-audit.md) – ריכוז מוכנות הגישה ל-GitHub, Supabase ו-Netlify.
2. **שלב 1**: [אפיון ארכיטקטורה ומוצר](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/docs/01-architecture-plan.md) – אפיון נתיבים (Routes), סכמת בסיס הנתונים ומבנה התיקיות.
3. **שלב 2**: [מבנה בסיס הנתונים ו-RLS](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/docs/02-supabase-schema.md) – פירוט הטבלאות, חוקי אבטחה, טריגרים ואופן הפעלת ה-SQL המקומית.
4. **שלב 3**: [פונקציות שרת Netlify](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/docs/03-netlify-functions.md) – פירוט הפעולות המאובטחות (הזמנת משתמשים, שינוי תפקידים, חסימת גישה).
5. **שלב 4**: [ממשק הניהול של הצוות](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/docs/04-admin-ui.md) – חווית המשתמש של העורכים והמנהלים וניהול הקישורים.
6. **שלב 5**: [העמוד הציבורי להורים](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/docs/05-public-page.md) – עיצוב, מיתוג, RTL עברית ותמיכה מלאה במסכים שונים.
7. **שלב 6**: [בקרת איכות עיצוב ונראות](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/docs/06-design-qa.md) – תצוגה מותאמת לטלפונים ניידים, טאבלטים ומחשבים.
8. **שלב 7**: [מדריך פריסה והתקנה (Handoff)](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/docs/07-qa-and-deployment.md) – הוראות מלאות להפעלת המערכת והגדרת משתנה הסביבה הראשון.

---

## 🛠️ הפעלה מקומית (Local Development)

1. שכפלו את קובץ `.env.example` ושנו את שמו ל-`.env`.
2. מלאו את הכתובת הציבורית ואת מפתח ה-Anon של פרויקט ה-Supabase שלכם:
   ```env
   VITE_PUBLIC_SUPABASE_URL=https://rzpnbfvqqtzskkksnpsu.supabase.co
   VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
3. התקינו את התלויות הנדרשות:
   ```bash
   npm install
   ```
4. הפעילו את שרת הפיתוח המקומי:
   ```bash
   npm run dev
   ```
5. פתחו את הדפדפן בכתובת המקומית המופיעה במסך (לרוב `http://localhost:5173`).

---

## ⚡ הרצה ופריסה בייצור (Netlify Production Deployment)

* המערכת מוכנה לפריסה מלאה ב-Netlify באמצעות קישור ה-GitHub שלכם `jobskitomarom/kitomaromtree`.
* פקודת הבנייה הנדרשת: `npm run build`
* תיקיית המוצא לפרסום: `dist`
* יש להגדיר את משתני הסביבה (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) בממשק הניהול של Netlify.
