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
