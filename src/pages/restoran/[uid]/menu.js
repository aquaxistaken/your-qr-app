// src/pages/restoran/[uid]/menu.js
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase'; // Firebase yapılandırma dosyanızın doğru yolu
import styles from './menu.module.css'; // <<-- CSS modülünü import ettik

export async function getServerSideProps(context) {
  const { uid } = context.params; // URL'den gelen restoran UID'si
  const countryName = 'Turkey'; // Firebase yapınıza göre sabit ülke adı

  let menuler = [];
  let notFound = false;

  try {
    // Menü öğelerini doğrudan çekme
    // Yol: RestaurantMenu/{restaurantUID}/Turkey/{menuItemID}
    const menuCollectionRef = collection(db, 'RestaurantMenu', uid, countryName);
    const querySnapshot = await getDocs(query(menuCollectionRef));

    if (querySnapshot.empty) {
      // Belirli bir UID ve ülke alt koleksiyonu altında menü öğesi bulunamadıysa
      console.log(`Menü öğesi bulunamadı: Restaurant UID: ${uid}, Ülke: ${countryName}`);
      notFound = true;
    } else {
      menuler = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // dateOfCreation alanını JSON serileştirilebilir bir formata dönüştürüyoruz
          // Firebase Timestamp objesini JavaScript Date objesine dönüştürüp, sonra ISO string'e çeviriyoruz
          dateOfCreation: data.dateOfCreation ? data.dateOfCreation.toDate().toISOString() : null,
        };
      });
    }

  } catch (error) {
    console.error('Menü verisi çekilirken hata oluştu:', error);
    notFound = true; // Hata durumunda da bulunamadı olarak işaretle
  }

  if (notFound) {
    return {
      notFound: true, // Next.js 404 sayfasına yönlendirir
    };
  }

  return {
    props: {
      restaurantUID: uid, // Restoran UID'sini de prop olarak geçirebiliriz
      menuler,
    },
  };
}

function MenuSayfasi({ restaurantUID, menuler }) {
  // getServerSideProps tarafından 'notFound: true' döndürüldüğünde bu bileşen çalışmaz
  // ancak yine de bir fallback kontrolü iyi olabilir.
  if (!menuler) {
    return <div className={styles.noMenuMessage}>Menü yüklenemedi veya bir hata oluştu.</div>;
  }

  return (
    <div className={styles.container}> {/* Ana kapsayıcı */}
      <header className={styles.header}> {/* Başlık alanı */}
        <h1>Restoran Menüsü</h1>
        <p>
          <span>UID:</span> {restaurantUID}
        </p>
      </header>

      {menuler.length === 0 ? (
        <div className={styles.noMenuMessage}> {/* Menü yok mesajı */}
          <p>Bu restorana ait menü bulunmamaktadır.</p>
        </div>
      ) : (
        <div className={styles.menuGrid}> {/* Menü kartları gridi */}
          {menuler.map(item => (
            <div
              key={item.id}
              className={styles.menuCard} /* Her bir menü kartı */
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
                {item.category && (
                    <p>
                        <span>Kategori:</span> {item.category}
                    </p>
                )}
                {item.description && (
                    <p className={styles.description}>
                        {item.description}
                    </p>
                )}
                {item.rating !== undefined && (
                    <p>
                        <span>Puan:</span> {item.rating} / 5
                    </p>
                )}
                {item.dateOfCreation && (
                  <p className={styles.date}>
                    <span>Oluşturulma:</span> {new Date(item.dateOfCreation).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MenuSayfasi;