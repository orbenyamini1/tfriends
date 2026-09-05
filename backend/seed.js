const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Activity = require('./models/Activity');

dotenv.config();

const dummyActivities = [
  {
    title: "חדר בריחה פסיכוזה",
    description: "אתגר חדר בריחה מותח ומטורף של 60 דקות! אתם והחברים ננעלים במעבדה של מדען משוגע וחייבים לפצח רמזים, קודים ומנגנונים מכניים כדי לברוח בזמן.",
    category: "משחקים",
    location: "תל אביב",
    image: "default-activity.jpg"
  },
  {
    title: "ערב קוקטיילים על הגג",
    description: "חוויה יוקרתית על גג מעוצב מול הנוף הפנורמי של העיר. מוזיקת האוס קלילה, תאורה מהפנטת ותפריט קוקטיילים ייחודי שנרקח במקום על ידי מיקסולוגים.",
    category: "חיי לילה",
    location: "הרצליה",
    image: "default-activity.jpg"
  },
  {
    title: "פוצ'יוולי ופיקניק בשקיעה",
    description: "תופסים מקום על החול הרך, מארגנים משחק כדורעף חופים סוער, ומקנחים בבירות קרות, אבטיח עם בולגרית, מחצלת ומוזיקה טובה מול השקיעה.",
    category: "ספורט",
    location: "תל אביב",
    image: "default-activity.jpg"
  },
  {
    title: "סיור טעימות המבורגר בוטיק",
    description: "מסע קולינרי מושחת לחובבי בשר אמיתיים! טעימות של נתחים מיושנים, שילוב תוספות מטורפות (כמו ריבת בצל וצ'דר נמסה) וצ'יפס קריספי ללא הגבלה.",
    category: "אוכל",
    location: "ירושלים",
    image: "default-activity.jpg"
  },
  {
    title: 'סדנת ציור ויין (Paint & Sip)',
    category: 'Art',
    location: 'רמת גן',
    description: 'קנבס, צבעי אקריליק וכוס יין ליצירת ציור מודרך באווירה חברתית.',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
    tags: ['אמנות', 'יין']
  },
  {
    title: 'לייזר טאג במתחם זוהר',
    category: 'Games',
    location: 'הרצליה',
    description: 'קרב טקטי עם חיישנים ורובי לייזר בתוך מבוך תלת-ממדי מואר באולטרה-סגול.',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    tags: ['לייזר טאג', 'אקשן']
  },
  {
    title: 'הקרנת VIP בסינמה סיטי',
    category: 'Entertainment',
    location: 'גלילות',
    description: 'סרט חדש בכורסאות נוחות בליווי מזנון פתוח עשיר.',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    tags: ['קולנוע', 'VIP']
  },
  {
    title: 'שייט קיאקים בירקון',
    category: 'Nature',
    location: 'תל אביב',
    description: 'חתירה שקטה של שעה וחצי במי הירקון בין פינות ירוקות בעיר.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    tags: ['טבע', 'קיאקים']
  },
  {
    title: 'מסעדת בשרים מעושנים (BBQ)',
    category: 'Food',
    location: 'חולון',
    description: 'פלטת אסאדו ובריסקט מעושנים שעות ארוכות בעץ אלון עם תוספות.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['בשר', 'ברביקיו']
  },
  {
    title: 'מתחם ביליארד וסנוקר',
    category: 'Games',
    location: 'גבעתיים',
    description: 'שולחנות פול מקצועיים, בירות מהחבית ואווירה רגועה.',
    imageUrl: 'https://images.unsplash.com/photo-1588731234159-8b9963143fca?auto=format&fit=crop&w=800&q=80',
    tags: ['ביליארד', 'ברים']
  },
  {
    title: 'פיקניק שקיעה בחוף',
    category: 'Nature',
    location: 'חוף פלמחים',
    description: 'בריזה של ים, מוזיקה ברמקול נייד ומדורה קטנה בשעות בין הערביים.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    tags: ['ים', 'שקיעה']
  }
];

const seedDatabase = async () => {
  try {
    // התחברות זמנית ל-DB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tfriends');
    console.log('🌱 Connected to MongoDB for seeding...');

    // מחיקת פעילויות ישנות כדי שלא יהיו כפילויות בכל הרצה
    await Activity.deleteMany({});
    console.log('🗑️ Cleaned old activities.');

    // הזרקת המידע החדש
    await Activity.insertMany(dummyActivities);
    console.log('✅ Successfully added 4 awesome activities to the Database!');

    // ניתוק מסודר
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
  
};

seedDatabase();