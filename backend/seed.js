const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const https = require('https');
const Activity = require('./models/Activity');

dotenv.config();

// ודא שתיקיית uploads קיימת
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// פונקציית עזר להורדת תמונה ושמירתה פיזית בתיקיית uploads
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    // אם הקובץ כבר קיים בתיקייה, אין צורך להוריד שוב
    if (fs.existsSync(filepath)) {
      return resolve();
    }
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      // טיפול בהפניות (Redirects) במידה ויש
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

const rawActivities = [
  {
    title: 'חדר בריחה: מעבדת המסתורין',
    description: 'אתגר חדר בריחה מותח ומלא אדרנלין של 60 דקות! פיצוח רמזים, קודים ומנגנונים מכניים כדי לגלות את הנוסחה ולברוח בזמן.',
    category: 'משחקים',
    location: 'תל אביב',
    fileName: 'escape_room.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    tags: ['אקשן', 'חידות', 'חדר בריחה']
  },
  {
    title: 'ערב קוקטיילים על הגג (Rooftop Lounge)',
    description: 'אווירה אקסקלוסיבית על גג מעוצב מול הנוף הפנורמי של קו החוף. מוזיקת לאונג׳ נעימה ותפריט קוקטיילים ייחודיים.',
    category: 'חיי לילה',
    location: 'הרצליה פיתוח',
    fileName: 'cocktails.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    tags: ['קוקטיילים', 'בר', 'נוף']
  },
  {
    title: 'טורניר באולינג ופיצה',
    description: 'קרב באולינג חברי על המסלולים המשודרגים, בליווי פיצות חמות, בירות מהחבית ומוזיקה מקפיצה.',
    category: 'משחקים',
    location: 'ראשון לציון',
    fileName: 'bowling.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1538510116832-7368537cad46?auto=format&fit=crop&w=800&q=80',
    tags: ['באולינג', 'תחרותי', 'פיצה']
  },
  {
    title: 'סיור טעימות המבורגר בוטיק',
    description: 'חוויה קולינרית מושחתת לחובבי בשר אמיתיים: נתחי פרימיום מיושנים, גבינות מותכות, רטבים מיוחדים וצ׳יפס קריספי.',
    category: 'אוכל',
    location: 'ירושלים',
    fileName: 'burger.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    tags: ['המבורגר', 'בשר', 'אוכל']
  },
  {
    title: 'סדנת ציור ויין (Paint & Sip)',
    description: 'קנבס, צבעי אקריליק וכוסות יין משובח ליצירת ציור מודרך באווירה חברתית קלילה, יצירתית ומשחררת.',
    category: 'אמנות',
    location: 'רמת גן',
    fileName: 'paint_and_sip.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
    tags: ['אמנות', 'יין', 'סדנה']
  },
  {
    title: 'לייזר טאג במתחם זוהר',
    description: 'קרב אקשן טקטי עם חיישנים ורובי לייזר בתוך מבוך רב-מפלסי ענק המואר בתאורת אולטרה-סגול ואפקטים מיוחדים.',
    category: 'משחקים',
    location: 'חולון',
    fileName: 'laser_tag.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    tags: ['לייזר טאג', 'אקשן', 'קבוצתי']
  },
  {
    title: 'הקרנת VIP בקולנוע',
    description: 'צפייה בסרט שובר קופות בכורסאות עור מתכווננות, עם מזנון חופשי עשיר הכולל מנות חמות, פופקורן וקינוחים.',
    category: 'תרבות',
    location: 'גלילות',
    fileName: 'movie_vip.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    tags: ['קולנוע', 'VIP', 'סרט']
  },
  {
    title: 'שייט קיאקים בירקון',
    description: 'חתירה רגועה של שעה וחצי במי הירקון בין פינות ירוקות, עופות מים ואוויר פתוח בלב העיר.',
    category: 'טבע',
    location: 'תל אביב',
    fileName: 'kayak.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    tags: ['טבע', 'קיאקים', 'ספורט']
  },
  {
    title: 'ערב מעשנת בשרים אמריקאית (Texas BBQ)',
    description: 'פלטת אסאדו, בריסקט וצלעות ששהו שעות ארוכות במעשנת עץ אלון, מוגשות עם קולסלאו, תפוחי אדמה ובירה צוננת.',
    category: 'אוכל',
    location: 'פתח תקווה',
    fileName: 'texas_bbq.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['בשר', 'ברביקיו', 'מעשנת']
  },
  {
    title: 'מועדון ביליארד וסנוקר',
    description: 'שולחנות פול מקצועיים, מוזיקת רוק קלאסית, שתייה קרה ואווירה תחרותית אך רגועה לשעות הערב.',
    category: 'משחקים',
    location: 'גבעתיים',
    fileName: 'billiards.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1588731234159-8b9963143fca?auto=format&fit=crop&w=800&q=80',
    tags: ['ביליארד', 'פול', 'משחקים']
  },
  {
    title: 'פיקניק שקיעה ופוצ׳יוולי בחוף',
    description: 'בריזה של ים, מחצלת גדולה, רמקול נייד עם פלייליסט מרים, כדורעף חופים ומשקאות קרים מול השקיעה.',
    category: 'טבע',
    location: 'חוף פלמחים',
    fileName: 'beach_sunset.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    tags: ['ים', 'שקיעה', 'ספורט']
  },
  {
    title: 'ערב משחקי קופסה וקטאן (Board Games Night)',
    description: 'סשן משחקי אסטרטגיה חברתיים: Settlers of Catan, Secret Hitler ועוד, מלווים בנשנושים, פיצוחים וצחוקים ללא הפסקה.',
    category: 'משחקים',
    location: 'תל אביב',
    fileName: 'board_games.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80',
    tags: ['קטאן', 'משחקי קופסה', 'חברים']
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tfriends';
    await mongoose.connect(mongoUri);
    console.log('🌱 Connected to MongoDB for seeding...');

    console.log('📥 Downloading images to uploads folder...');
    const activitiesToInsert = [];

    for (const item of rawActivities) {
      const filePath = path.join(uploadsDir, item.fileName);
      await downloadImage(item.sourceUrl, filePath);

      activitiesToInsert.push({
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        image: item.fileName,       // שמור רק את שם הקובץ (למשל: escape_room.jpg)
        imageUrl: item.fileName,    // לגיבוי בהתאם לסכמה שלכם
        tags: item.tags
      });
    }

    await Activity.deleteMany({});
    console.log('🗑️ Cleaned old activities.');

    await Activity.insertMany(activitiesToInsert);
    console.log(`✅ Successfully saved images to /uploads and added ${activitiesToInsert.length} activities to the DB!`);

    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();