import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
// Firestore için gerekli fonksiyonları import ediyoruz:
// doc ve getDoc tek bir belgeyi çekmek için,
// collection, query ve getDocs koleksiyonlardaki belgeleri çekmek için.
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase'; // Firebase bağlantı dosyanızın yolu

import styles from './menu.module.css'; // menu.module.css dosyasının yolu

// Font Awesome ikonları için gerekli import'lar
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faCocktail,
  faCoffee,
  faBreadSlice,
  faDrumstickBite,
  faFish,
  faIceCream,
  faCandyCane,
  faLeaf,
  faWineGlass,
  faCookieBite,
  faPizzaSlice,
  faCheese,
  faAppleAlt,
  faLemon,
  faBirthdayCake,
  faHotdog,
  faHamburger,
  faCarrot,
  faMugHot,
  faGlassMartiniAlt,
  faBlender,
  faSeedling,
  faShoppingBasket,
  faChampagneGlasses,
  faLemonade,
  faCroissant,
  faCakeCandles,
  faIceCreamBowl,
  faGlassWater,
  faShrimp,
  faDrumstick,
  faFishFins
} from '@fortawesome/free-solid-svg-icons';

// Kategori Metinleri ve İkonları
// NOT: Firebase'deki "category" alanındaki değerlerle BİREBİR EŞLEŞMELİDİR.
// Büyük/küçük harf ve özel karakterler dahil.
// Kategori Metinleri ve İkonları
const categoryConfig = {
  // Firebase'deki "category" alanındaki değerlerle BİREBİR EŞLEŞMELİDİR.
  // Büyük/küçük harf ve özel karakterler dahil.
  "Appetizers & Light Bites": { // Firebase'den gelen kategori adı
    text: 'Başlangıçlar & Hafif Atıştırmalıklar', // Gösterilecek Türkçe metin
    description: 'Hafif ve iştah açıcı lezzetlerle yemeğinize keyifli bir başlangıç yapın.',
    icon: faBreadSlice,
  },
  "Signature Mains": { // Firebase'den gelen kategori adı
    text: 'Ana Yemekler & İmza Yemekleri', // Gösterilecek Türkçe metin
    description: 'Şeflerimizin özenle hazırladığı, unutulmaz ana yemeklerimizi deneyimleyin.',
    icon: faDrumstickBite,
  },
  "Beverages & Refreshments": { // Firebase'den gelen kategori adı
    text: 'İçecekler & Ferahlatıcılar', // Gösterilecek Türkçe metin
    description: 'Serinletici ve ferahlatıcı içeceklerimizle anın tadını çıkarın.',
    icon: faGlassMartiniAlt, // Daha uygun bir ikon seçebilirsiniz
  },
  // Eğer Firebase'de başka kategori isimleri varsa, onları da buraya eklemelisiniz.
  // Örneğin: "Deniz Ürünleri" için Firebase'de ne yazıyorsa onu anahtar olarak kullanın.
  // Sadece örnekler, Firebase'deki tam karşılıklarını kullanmalısınız:
  // "Seafood": { text: 'Deniz Ürünleri', description: 'En taze deniz mahsullerinden hazırlanan özel lezzetler.', icon: faFish, },
  // "Salads": { text: 'Salatalar', description: 'Sağlıklı ve ferahlatıcı salata çeşitlerimizle öğününüzü hafifletin.', icon: faLeaf, },
  // "Desserts & Pastries": { text: 'Tatlılar & Pastalar', description: 'Yemeğinizin ardından damaklarınızı şenlendirecek tatlı kaçamaklar.', icon: faBirthdayCake, },
  // "Hot Drinks": { text: 'Sıcak İçecekler', description: 'Sıcak sohbetlerinize eşlik edecek, özenle demlenmiş içecekler.', icon: faMugHot, },
};

const MenuPage = () => {
  const router = useRouter();
  const { uid } = router.query;
  const [menuItems, setMenuItems] = useState([]);
  const [restaurantName, setRestaurantName] = useState('Yükleniyor...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("router.query.uid:", uid); // UID'nin doğru geldiğini kontrol etmek için

  useEffect(() => {
    if (!uid) {
      console.log("UID bulunamadı, menü çekilemiyor.");
      return;
    }

    const fetchMenu = async () => {
      setLoading(true);
      setError(null);
      try {
        // Restoran adını getirme (opsiyonel, eğer restoran adını da göstermek istiyorsanız)
        // KOLEKSİYON ADI DÜZELTİLDİ: 'restaurants' -> 'RestaurantMenu'
        const restaurantDocRef = doc(db, 'RestaurantMenu', uid);
        const restaurantDocSnap = await getDoc(restaurantDocRef);

        let currentRestaurantName = `Menü (${uid})`;
        if (restaurantDocSnap.exists()) {
          currentRestaurantName = restaurantDocSnap.data().name || `Menü (${uid})`;
        }
        setRestaurantName(currentRestaurantName);

        // Menü öğelerini getirme
        let items = [];
        // KOLEKSİYON ADI DÜZELTİLDİ: 'restaurants' -> 'RestaurantMenu'
        const menuCollectionRef = collection(db, `RestaurantMenu/${uid}/Turkey`); // Turkey'i alt koleksiyon olarak deniyoruz
        const q = query(menuCollectionRef);
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) { // Eğer alt koleksiyonda veri varsa
          querySnapshot.forEach((docItem) => {
            items.push({ id: docItem.id, ...docItem.data() });
          });
          console.log("Turkey alt koleksiyon olarak çekildi:", items);
        } else {
          // Eğer Turkey bir alt koleksiyon değil de, restoran belgesinin içinde bir map (harita) ise
          // (Bu senaryo Firebase yapınıza göre geçerli değil, ama güvenlik için önceki kontrolü tutuyoruz)
          if (restaurantDocSnap.exists()) {
            const data = restaurantDocSnap.data();
            if (data.Turkey && typeof data.Turkey === 'object') {
              // Turkey içindeki her öğeyi alıp diziye dönüştür
              items = Object.keys(data.Turkey).map(key => ({
                id: key, // Harita anahtarını ID olarak kullan
                ...data.Turkey[key] // Tüm alt alanları yay
              }));
              console.log("Turkey bir field/map olarak çekildi (Bu durum beklenmiyor):", items);
            }
          }
        }

        console.log("Çekilen Menü Öğeleri (Son Kontrol):", items);

        // dateOfCreation'a göre sıralama (eskiden yeniye)
        items.sort((a, b) => {
          // dateOfCreation alanı Firestore Timestamp ise toDate() metodu kullanılır.
          // Değilse doğrudan yeni bir Date objesi oluşturulur.
          const dateA = a.dateOfCreation ? (a.dateOfCreation.toDate ? a.dateOfCreation.toDate() : new Date(a.dateOfCreation)) : new Date(0);
          const dateB = b.dateOfCreation ? (b.dateOfCreation.toDate ? b.dateOfCreation.toDate() : new Date(b.dateOfCreation)) : new Date(0);
          return dateA - dateB;
        });

        setMenuItems(items);
      } catch (err) {
        console.error("Menü yüklenirken hata oluştu: ", err);
        setError("Menü yüklenirken bir hata oluştu: " + err.message); // Hata mesajını daha açıklayıcı yapalım
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [uid]); // uid değiştiğinde useEffect'in tekrar çalışmasını sağla

  if (loading) {
    return <div className={styles.container}>Yükleniyor...</div>;
  }

  if (error) {
    return <div className={styles.container}>{error}</div>;
  }

  // Menü öğeleri yoksa mesaj göster
  if (menuItems.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{restaurantName}</h1>
          <p>Şu anda menüde hiç öğe bulunmuyor.</p>
        </div>
      </div>
    );
  }

  // Kategorilere göre gruplama
  const groupedByCategory = menuItems.reduce((acc, item) => {
    const category = item.category || 'Diger'; // Kategori yoksa 'Diger' altında topla
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Kategori sıralamasını belirleme (Opsiyonel: İsterseniz elle sıralayabilirsiniz)
  const sortedCategories = Object.keys(groupedByCategory).sort((a, b) => {
    const configA = categoryConfig[a] || { order: 999 };
    const configB = categoryConfig[b] || { order: 999 };
    return configA.order - configB.order;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{restaurantName}</h1>
        <p>Restoranımızın lezzetli menüsünü keşfedin.</p>
      </div>

      {sortedCategories.map((categoryKey) => {
        const categoryInfo = categoryConfig[categoryKey] || {
          text: categoryKey,
          description: '',
          icon: faUtensils, // Varsayılan ikon
        };
        const itemsInCategory = groupedByCategory[categoryKey];

        if (itemsInCategory.length === 0) return null; // Kategori boşsa gösterme

        return (
          <section key={categoryKey} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>
              {categoryInfo.icon && (
                <FontAwesomeIcon icon={categoryInfo.icon} className={styles.categoryIcon} />
              )}
              {categoryInfo.text}
            </h2>
            {categoryInfo.description && (
              <p className={styles.categoryDescription}>
                {categoryInfo.description}
              </p>
            )}
            <div className={styles.menuGrid}>
              {itemsInCategory.map((item) => (
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
          </section>
        );
      })}
    </div>
  );
};

export default MenuPage;