import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

import styles from './menu.module.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils, faCocktail, faCoffee, faBreadSlice, faDrumstickBite, faFish, faIceCream,
  faCandyCane, faLeaf, faWineGlass, faCookieBite, faPizzaSlice, faCheese, faAppleAlt,
  faLemon, faBirthdayCake, faHotdog, faHamburger, faCarrot, faMugHot, faGlassMartiniAlt,
  faBlender, faSeedling, faShoppingBasket, faChampagneGlasses, faLemonade, faCroissant,
  faCakeCandles, faIceCreamBowl, faGlassWater, faShrimp, faDrumstick, faFishFins
} from '@fortawesome/free-solid-svg-icons';

// Kategori Metinleri ve İkonları (Bu kısmı Firebase'deki tüm olası kategori adlarına göre genişletmelisiniz)
const categoryConfig = {
  "Appetizers & Light Bites": {
    text: 'Başlangıçlar & Hafif Atıştırmalıklar',
    description: 'Hafif ve iştah açıcı lezzetlerle yemeğinize keyifli bir başlangıç yapın.',
    icon: faBreadSlice,
  },
  "Signature Mains": {
    text: 'Ana Yemekler & İmza Yemekleri',
    description: 'Şeflerimizin özenle hazırladığı, unutulmaz ana yemeklerimizi deneyimleyin.',
    icon: faDrumstickBite,
  },
  "Beverages & Refreshments": {
    text: 'İçecekler & Ferahlatıcılar',
    description: 'Serinletici ve ferahlatıcı içeceklerimizle anın tadını çıkarın.',
    icon: faGlassMartiniAlt,
  },
  // Yeni eklenen kategori: "Elegant Desserts" (image_306219.png'den görüldüğü gibi)
  "Elegant Desserts": {
    text: 'Tatlı Denemeler', // Türkçesini buraya yazın
    description: 'Şık ve lezzetli tatlılarımızla öğününüzü sonlandırın.',
    icon: faCakeCandles, // Uygun bir ikon seçin
  },
  // Firebase'de olabilecek diğer kategori adlarını buraya eklemeyi unutmayın
  // Örn: "Salads", "Seafood", "Hot Drinks" vb.
};

const MenuPage = () => {
  const router = useRouter();
  const { uid } = router.query;
  const [menuItems, setMenuItems] = useState([]);
  const [restaurantName, setRestaurantName] = useState('Yükleniyor...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("router.query.uid:", uid);

  useEffect(() => {
    if (!uid) {
      console.log("UID bulunamadı, menü çekilemiyor.");
      return;
    }

    const fetchMenu = async () => {
      setLoading(true);
      setError(null);
      try {
        // Restoran belgesini getirme
        const restaurantDocRef = doc(db, 'RestaurantMenu', uid);
        const restaurantDocSnap = await getDoc(restaurantDocRef);

        let currentRestaurantName = `Menü (${uid})`;
        let menuCollectionName = 'Turkey'; // Varsayılan menü koleksiyonu adı

        if (restaurantDocSnap.exists()) {
          const data = restaurantDocSnap.data();
          currentRestaurantName = data.name || `Menü (${uid})`;
          // Eğer defaultCountry alanı varsa, onu kullan
          if (data.defaultCountry) {
            menuCollectionName = data.defaultCountry;
            console.log(`Restoran ${uid} için menü koleksiyonu: ${menuCollectionName}`);
          }
        }
        setRestaurantName(currentRestaurantName);

        // Menü öğelerini getirme - Dinamik olarak belirlenen koleksiyon adını kullan
        let items = [];
        const menuCollectionRef = collection(db, `RestaurantMenu/${uid}/${menuCollectionName}`);
        const q = query(menuCollectionRef);
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((docItem) => {
            items.push({ id: docItem.id, ...docItem.data() });
          });
          console.log(`${menuCollectionName} alt koleksiyonu olarak çekildi:`, items);
        } else {
          console.log(`Uyarı: ${menuCollectionName} alt koleksiyonunda öğe bulunamadı veya başka bir yapı var.`);
          // Bu kısım, alt koleksiyon yerine belgenin içinde map olarak veri tutuluyorsa devreye girer
          // Mevcut Firebase yapınızda (Turkey/German gibi alt koleksiyonlar) bu kısım muhtemelen çalışmayacaktır.
          // Yine de eski kodu koruyoruz.
          if (restaurantDocSnap.exists()) {
            const data = restaurantDocSnap.data();
            if (data[menuCollectionName] && typeof data[menuCollectionName] === 'object') {
              items = Object.keys(data[menuCollectionName]).map(key => ({
                id: key,
                ...data[menuCollectionName][key]
              }));
              console.log(`${menuCollectionName} bir field/map olarak çekildi (Beklenmiyor):`, items);
            }
          }
        }

        console.log("Çekilen Menü Öğeleri (Son Kontrol):", items);

        items.sort((a, b) => {
          const dateA = a.dateOfCreation ? (a.dateOfCreation.toDate ? a.dateOfCreation.toDate() : new Date(a.dateOfCreation)) : new Date(0);
          const dateB = b.dateOfCreation ? (b.dateOfCreation.toDate ? b.dateOfCreation.toDate() : new Date(b.dateOfCreation)) : new Date(0);
          return dateA - dateB;
        });

        setMenuItems(items);
      } catch (err) {
        console.error("Menü yüklenirken hata oluştu: ", err);
        setError("Menü yüklenirken bir hata oluştu: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [uid]);

  if (loading) {
    return <div className={styles.container}>Yükleniyor...</div>;
  }

  if (error) {
    return <div className={styles.container}>{error}</div>;
  }

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

  const groupedByCategory = menuItems.reduce((acc, item) => {
    const category = item.category || 'Diger';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

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
          icon: faUtensils,
        };
        const itemsInCategory = groupedByCategory[categoryKey];

        if (itemsInCategory.length === 0) return null;

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