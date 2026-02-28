import type { CategoryId } from "../types";

export const QUESTION_PROMPTS: Record<CategoryId, string> = {
  math: `צור {n} שאלות חשבון לילד בכיתה ב׳ (גיל 7-8) בסגנון מבחן מחוננים.
סוגי שאלות: בעיות מילוליות (חיבור, חיסור, כפל, חילוק), אי-שוויונות, השלמת מספרים.
רמת קושי: בינונית-גבוהה, דורש חשיבה של 2-3 צעדים.`,

  symbols: `צור {n} חידות סמלים/משוואות עם אימוג׳י לילד בכיתה ב׳ בסגנון מבחן מחוננים.
כל שאלה מכילה 2 משוואות עם סמלים (אימוג׳י) והילד צריך למצוא ערך של סמל מסוים.
דוגמה: "🔵 + 🔵 = 16, 🔵 + 🟢 = 19. מה 🟢?"
השתמש באימוג׳ים צבעוניים ומגוונים.`,

  words: `צור {n} שאלות יחסי מילים (אנלוגיות) לילד בכיתה ב׳ בסגנון מבחן מחוננים.
פורמט: "מילה1 : מילה2 = ? : מילה3"
סוגי קשרים: הפכים, חפץ ושימושו, בעל מקצוע וכלי, חלק ושלם, פעולה אופיינית.
המילים צריכות להיות מאוצר מילים של ילד בכיתה ב׳.`,

  patterns: `צור {n} שאלות סדרות וחוקיות מספריות לילד בכיתה ב׳ בסגנון מבחן מחוננים.
סוגים: סדרות מספרים (הכפלה, חיבור עולה), מספרים בצורות (עיגולים, משולשים, ריבועים עם חוקיות), מציאת חוקיות בין שורות.
תאר את הצורות במילים.`,

  inequalities: `צור {n} שאלות אי-שוויון לילד בכיתה ב׳ (גיל 7-8) בסגנון מבחן מחוננים.
סוגי שאלות: השלם את הסימן (>, <, =) בין שני ביטויים חשבוניים, מצא מספר שמשלים אי-שוויון, סדר מספרים מהגדול לקטן.
דוגמה: "איזה סימן מתאים? 15 + 3 __ 20 - 1"
המספרים עד 100, הביטויים כוללים חיבור וחיסור.`,

  reading: `צור {n} שאלות הבנת הנקרא לילד בכיתה ב׳ (גיל 7-8) בסגנון מבחן מחוננים.
כל שאלה חייבת לכלול שדה "passage" עם קטע קריאה קצר (2-4 משפטים) בעברית פשוטה, ושאלה על הקטע.
הקטע צריך להיות מותאם לגיל - על בעלי חיים, טבע, ילדים, או חיי יום-יום.
השאלה בודקת הבנה: מי, מה, למה, מתי, או הסקת מסקנה פשוטה.`,

  sentences: `צור {n} שאלות השלמת משפטים לילד בכיתה ב׳ (גיל 7-8) בסגנון מבחן מחוננים.
כל שאלה מציגה משפט עם מקום ריק (___) והילד בוחר את המילה או הביטוי שמשלים נכון.
סוגי שאלות: מילות קישור (כי, אבל, לכן, למרות), אוצר מילים (בחירת מילה מתאימה בהקשר), דקדוק (זמן פועל, יחיד/רבים).
המשפטים בעברית פשוטה ומותאמת לגיל.`,

  oddOneOut: `צור {n} שאלות "יוצא דופן" לילד בכיתה ב׳ (גיל 7-8) בסגנון מבחן מחוננים.
בכל שאלה מוצגות 4 מילים, והילד צריך למצוא את המילה שלא שייכת לקבוצה.
סוגי קבוצות: בעלי חיים, פירות, כלי תחבורה, חלקי גוף, צבעים, רהיטים, חפצי בית, מקצועות.
הקשר בין 3 המילים צריך להיות ברור, והמילה הרביעית שונה בבירור.
פורמט השאלה: "איזו מילה לא שייכת לקבוצה?"
4 אפשרויות התשובה הן 4 המילים עצמן.`,

  shapes: `צור {n} שאלות השלמת תבניות חזותיות לילד בכיתה ב׳ (גיל 7-8) בסגנון מבחן מחוננים.
כל שאלה מציגה טבלה 3×3 של אימוג׳ים או סמלים עם דפוס מסוים (כל שורה ועמודה עוקבות אחר חוק).
התא בפינה הימנית-תחתונה חסר וסומן ב-?.
הילד צריך לזהות את הדפוס ולבחור את האימוג׳י/סמל הנכון מ-4 אפשרויות.
הציגו את הטבלה בפורמט טקסט ברור עם שורות מופרדות.
סוגי דפוסים: סיבוב צבעים, שילוב צורות, דפוס לטיני (כל סמל פעם אחת בכל שורה ועמודה).
השתמשו באימוג׳ים ברורים ושונים זה מזה.`,

  numberFigures: `צור {n} שאלות מספרים בצורות גיאומטריות לילד בכיתה ב׳ (גיל 7-8) בסגנון מבחן מחוננים.
כל שאלה מציגה שתי צורות גיאומטריות (משולשים, עיגולים, או ריבועים) עם מספרים.
בצורה הראשונה כל המספרים ידועים, בצורה השנייה יש סימן שאלה.
הילד צריך לגלות את הקשר המתמטי (חיבור, חיסור, כפל, חילוק) בין המספרים בצורה הראשונה ולהחיל אותו על השנייה.
דוגמה: "בשני משולשים, המספר למעלה שווה לסכום שני המספרים בבסיס. משולש ראשון: 15 למעלה, 8 ו-7 בבסיס. משולש שני: ? למעלה, 9 ו-6 בבסיס."
המספרים צריכים להיות מותאמים לגיל (עד 100), והקשר צריך להיות ברור אחרי שמגלים אותו.`,
};

export const QUESTION_SYSTEM_PROMPT = `אתה יוצר שאלות למבחן מחוננים לילדי כיתה ב׳ בישראל. 
החזר JSON בלבד, ללא markdown, ללא backticks, ללא טקסט נוסף.
הפורמט:
[
  {
    "q": "טקסט השאלה בעברית",
    "opts": ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
    "ans": 0,
    "hint": "רמז קצר שעוזר לחשוב על הבעיה"
  }
]
כללים חשובים:
- ans הוא אינדקס (0-3) של התשובה הנכונה
- ודא שהתשובה הנכונה אכן נכונה מתמטית/לוגית
- כתוב בעברית תקנית, ללא שגיאות כתיב
- הרמז צריך לכוון לדרך הפתרון בלי לגלות את התשובה
- ערבב את מיקום התשובה הנכונה (לא תמיד באותו מקום)
- כל 4 התשובות צריכות להיות סבירות (מסיחים טובים)
- לשאלות הבנת הנקרא הוסף שדה "passage" עם קטע הקריאה`;

export const SCENE_SYSTEM_PROMPT = `You are a 3D scene generator for a children's educational game.
Given a scene description, return a JSON array of 3D objects to place in the scene.
Return ONLY valid JSON, no markdown, no backticks.

The format:
{
  "objects": [
    {
      "type": "tree" | "rock" | "crystal" | "book" | "tower" | "orb" | "mushroom" | "pillar" | "arch",
      "position": [x, y, z],
      "scale": 1.0,
      "color": "#hex",
      "emissive": "#hex or null",
      "animation": "float" | "rotate" | "pulse" | "sway" | null
    }
  ],
  "ambientColor": "#hex",
  "fogColor": "#hex",
  "groundColor": "#hex",
  "description": "brief atmosphere description"
}

Rules:
- Position x: -8 to 8, y: 0 to 5, z: -8 to 8
- Scale: 0.3 to 3.0
- Generate 8-15 objects per scene
- Make it magical and kid-friendly
- Use vibrant colors matching the scene mood
- Add emissive colors for magical glowing objects
- Distribute objects naturally, not in a grid`;
