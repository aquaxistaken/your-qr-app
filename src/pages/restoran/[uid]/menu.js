// src/pages/restoran/[uid]/menu.js
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import styles from './menu.module.css';

// Kategori sabitleri (Firebase'den gelen değerlere göre güncellendi)
const ConsRestaurantMenuCategory = {
  APPETIZERS_LIGHT_BITES: "Appetizers & Light Bites", // Firebase ile eşleşmeli
  SIGNATURE_MAINS: "Signature Mains", // Firebase ile eşleşmeli
  ELEGANT_DESSERTS: "Elegant Desserts", // Firebase ile eşleşmeli
  BEVERAGES_REFRESHMENTS: "Beverages & Refreshments", // Firebase ile eşleşmeli
};

const ConsCafeMenuCategory = {
  ARTISAN_BITES: "Artisan Bites", // Firebase ile eşleşmeli
  BREAKFAST_BRUNCH: "Breakfast & Brunch", // Firebase ile eşleşmeli
  LIGHT_PLATES_SALADS: "Light Plates & Salads", // Firebase ile eşleşmeli
  SIGNATURE_PLATES: "Signature Plates", // Firebase ile eşleşmeli
  SPECIALTY_DRINKS: "Specialty Drinks", // Firebase ile eşleşmeli
  HOMEMADE_SWEETS: "Homemade Sweets", // Firebase ile eşleşmeli
};

// Kategori ikonları
const getMenuCategoryStartIcon = (category) => {
  switch (category) {
    // Restaurant kategorileri
    case ConsRestaurantMenuCategory.APPETIZERS_LIGHT_BITES: return "🥂";
    case ConsRestaurantMenuCategory.SIGNATURE_MAINS: return "🍽️";
    case ConsRestaurantMenuCategory.ELEGANT_DESSERTS: return "🎂";
    case ConsRestaurantMenuCategory.BEVERAGES_REFRESHMENTS: return "🍷";
    // Cafe kategorileri
    case ConsCafeMenuCategory.ARTISAN_BITES: return "🥐";
    case ConsCafeMenuCategory.BREAKFAST_BRUNCH: return "🍳";
    case ConsCafeMenuCategory.LIGHT_PLATES_SALADS: return "🥗";
    case ConsCafeMenuCategory.SIGNATURE_PLATES: return "🍽️";
    case ConsCafeMenuCategory.SPECIALTY_DRINKS: return "☕";
    case ConsCafeMenuCategory.HOMEMADE_SWEETS: return "🍰";
    default: return "";
  }
};

// Kategori metinleri (Display için kullanılan kısa isimler)
const categoryTexts = {
  "category": "Category", // Varsayılan veya bilinmeyen kategori
  [ConsRestaurantMenuCategory.APPETIZERS_LIGHT_BITES]: "Başlangıçlar & Hafif Atıştırmalıklar",
  [ConsRestaurantMenuCategory.SIGNATURE_MAINS]: "Ana Yemekler & İmza Yemekleri",
  [ConsRestaurantMenuCategory.ELEGANT_DESSERTS]: "Zarif Tatlılar",
  [ConsRestaurantMenuCategory.BEVERAGES_REFRESHMENTS]: "İçecekler & Serinleticiler",
  [ConsCafeMenuCategory.ARTISAN_BITES]: "El Yapımı Lezzetler",
  [ConsCafeMenuCategory.BREAKFAST_BRUNCH]: "Kahvaltı & Brunch",
  [ConsCafeMenuCategory.LIGHT_PLATES_SALADS]: "Hafif Tabaklar & Salatalar",
  [ConsCafeMenuCategory.SIGNATURE_PLATES]: "Özel Tabaklar",
  [ConsCafeMenuCategory.SPECIALTY_DRINKS]: "Özel İçecekler",
  [ConsCafeMenuCategory.HOMEMADE_SWEETS]: "Ev Yapımı Tatlılar",
};

// Kategori başlıkları (Açıklayıcı metinler)
const categoryTitles = {
  [ConsRestaurantMenuCategory.APPETIZERS_LIGHT_BITES]: "Hafif ve iştah açıcı lezzetlerle yemeğinize zarif bir başlangıç yapın.",
  [ConsRestaurantMenuCategory.SIGNATURE_MAINS]: "Ustalıkla hazırlanmış doyurucu ve özenli ana yemek seçenekleri.",
  [ConsRestaurantMenuCategory.ELEGANT_DESSERTS]: "Yemeğinizi zarif bir şekilde bitirecek tatlı dokunuşlar.",
  [ConsRestaurantMenuCategory.BEVERAGES_REFRESHMENTS]: "Yemeklerinizi tamamlayacak serinletici içecek alternatifleri.",
  [ConsCafeMenuCategory.ARTISAN_BITES]: "Benzersiz ve el yapımı ısırıklık lezzetler.",
  [ConsCafeMenuCategory.BREAKFAST_BRUNCH]: "Gününüz için mükemmel başlangıçlar.",
  [ConsCafeMenuCategory.LIGHT_PLATES_SALADS]: "Sağlıklı bir öğün için taze ve hafif seçenekler.",
  [ConsCafeMenuCategory.SIGNATURE_PLATES]: "Mutfağımızdan özel olarak hazırlanmış yemekler.",
  [ConsCafeMenuCategory.SPECIALTY_DRINKS]: "Benzersiz ve ferahlatıcı içecekler.",
  [ConsCafeMenuCategory.HOMEMADE_SWEETS]: "Anlarınızı tatlandıracak lezzetli ev yapımı tatlılar.",
};


export async function getServerSideProps(context) {
  const { uid } = context.params;
  const countryName = 'Turkey';

  let menuler = [];
  let notFound = false;

  try {
    const menuCollectionRef = collection(db, 'RestaurantMenu', uid, countryName);
    // dateOfCreation alanına göre artan (eskiden yeniye) sıralama
    const q = query(menuCollectionRef, orderBy('dateOfCreation', 'asc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`Menü öğesi bulunamadı: Restaurant UID: ${uid}, Ülke: ${countryName}`);
      notFound = true;
    } else {
      menuler = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Firestore Timestamp objesini JavaScript Date objesine çevirip ISO string olarak saklıyoruz
          dateOfCreation: data.dateOfCreation ? data.dateOfCreation.toDate().toISOString() : null,
        };
      });
    }

  } catch (error) {
    console.error('Menü verisi çekilirken hata oluştu:', error);
    notFound = true;
  }

  if (notFound) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      restaurantUID: uid,
      menuler,
    },
  };
}

function MenuSayfasi({ restaurantUID, menuler }) {
  if (!menuler || menuler.length === 0) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Restoran Menüsü</h1>
          <p>
            <span>UID:</span> {restaurantUID}
          </p>
        </header>
        <div className={styles.noMenuMessage}>
          <p>Bu restorana ait menü bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  // Menü öğelerini kategoriye göre gruplandırma
  const groupedMenus = menuler.reduce((acc, item) => {
    // Firebase'den gelen 'category' alanını doğrudan kullanıyoruz
    const category = item.category || 'Diğer'; // Eğer kategori yoksa 'Diğer' olarak gruplandır
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Kategori sıralaması: Display isimlerine göre manuel bir sıra belirleyelim
  const categoryOrder = [
    ConsRestaurantMenuCategory.APPETIZERS_LIGHT_BITES,
    ConsRestaurantMenuCategory.SIGNATURE_MAINS,
    ConsRestaurantMenuCategory.ELEGANT_DESSERTS,
    ConsRestaurantMenuCategory.BEVERAGES_REFRESHMENTS,
    ConsCafeMenuCategory.ARTISAN_BITES,
    ConsCafeMenuCategory.BREAKFAST_BRUNCH,
    ConsCafeMenuCategory.LIGHT_PLATES_SALADS,
    ConsCafeMenuCategory.SIGNATURE_PLATES,
    ConsCafeMenuCategory.SPECIALTY_DRINKS,
    ConsCafeMenuCategory.HOMEMADE_SWEETS,
    'Diğer' // Tanımlanmamış kategoriler en sonda
  ];

  const sortedCategories = Object.keys(groupedMenus).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);

    // Eğer kategori listede yoksa, "Diğer" olarak muamele et veya alfabetik sırala
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1; // a listede yoksa b'den sonra gelsin
    if (indexB === -1) return -1; // b listede yoksa a'dan önce gelsin
    return indexA - indexB; // Listede olanları sıraya göre
  });


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Restoran Menüsü</h1>
        <p>
          <span>UID:</span> {restaurantUID}
        </p>
      </header>

      {sortedCategories.map(category => (
        <div key={category} className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>
            {/* İkonu ayrı bir span içine aldık ve stil sınıfı verdik */}
            <span className={styles.categoryIcon}>{getMenuCategoryStartIcon(category)}</span>
            {categoryTexts[category] || category}
          </h2>
          <p className={styles.categoryDescription}>
            {categoryTitles[category] || ""}
          </p>
          <div className={styles.menuGrid}>
            {groupedMenus[category].map(item => (
              <div
                key={item.id}
                className={styles.menuCard}
              >
                {item.photo && (
                  <div className={styles.menuImageContainer}>
                    <img
                      src={item.photo}
                      alt={item.name}
                      className={styles.menuImage}
                    />
                  </div>
                )}
                <div className={styles.cardContent}>
                  <h3>{item.name}</h3>
                  <p className={styles.price}>
                    {item.price ? item.price.toFixed(2) + ' TL' : 'Fiyat Yok'}
                  </p>
                  {/* dateOfCreation ve category bilgileri kaldırıldı */}
                  {item.rating !== undefined && (
                    <p>
                      <span>Puan:</span> {item.rating} / 5
                    </p>
                  )}
                  {item.description && (
                    <p className={styles.description}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MenuSayfasi;