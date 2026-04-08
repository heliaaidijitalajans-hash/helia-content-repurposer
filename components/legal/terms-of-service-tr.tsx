import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";

export function TermsOfServiceTr() {
  return (
    <article>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        KULLANIM ŞARTLARI
      </h1>

      <div className="mt-10 space-y-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Taraflar ve Kabul</h2>
          <p className={pClass}>
            İşbu Kullanım Şartları (“Şartlar”), Aysel Nur Akıncı (1160825918)
            (“Hizmet Sağlayıcı”) ile Helia AI platformuna erişen kullanıcı
            (“Kullanıcı”) arasında akdedilmiştir.
          </p>
          <p className={pClass}>
            Platforma erişim, hesap oluşturma veya ödeme yapılması halinde işbu
            Şartlar Kullanıcı tarafından kabul edilmiş sayılır.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Hizmet Tanımı</h2>
          <p className={pClass}>
            Helia AI, internet üzerinden sunulan bulut tabanlı bir yazılım
            hizmetidir (SaaS).
          </p>
          <p className={`${pClass} font-medium text-gray-800`}>Platform;</p>
          <ul className={ulClass}>
            <li>Yapay zeka destekli içerik üretimi</li>
            <li>Metin, video ve ses içeriklerinin dönüştürülmesi</li>
            <li>Viral içerik (thread, carousel, hook vb.) oluşturma</li>
            <li>Abonelik planına bağlı kullanım limitleri</li>
          </ul>
          <p className={pClass}>
            sunmaktadır. Hizmet fiziksel ürün içermez.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Hesap Oluşturma ve Güvenlik</h2>
          <ul className={ulClass}>
            <li>Kullanıcı doğru ve güncel bilgi vermekle yükümlüdür.</li>
            <li>Hesap güvenliği kullanıcı sorumluluğundadır.</li>
            <li>Hesap paylaşımı yasaktır.</li>
            <li>Birden fazla kişinin tek hesap kullanması yasaktır.</li>
            <li>Şüpheli kullanım halinde hesap askıya alınabilir.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Abonelik ve Ödeme Koşulları</h2>
          <ul className={ulClass}>
            <li>Hizmet ücretlidir.</li>
            <li>Fiyatlar Amerikan Doları (USD) cinsinden belirlenebilir.</li>
            <li>Abonelikler otomatik yenilemelidir.</li>
            <li>
              Kullanıcı iptal etmediği sürece dönem sonunda ücret tahsil edilir.
            </li>
            <li>
              Vergi, banka komisyonu ve döviz farklarından kullanıcı
              sorumludur.
            </li>
            <li>
              Hizmet Sağlayıcı fiyat değişikliği yapma hakkını saklı tutar.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. İade ve Chargeback Politikası</h2>
          <ul className={ulClass}>
            <li>Dijital hizmet aktif edildikten sonra iade yapılmaz.</li>
            <li>Kullanıcı hizmetin anında ifasına başlandığını kabul eder.</li>
            <li>
              Haksız ödeme itirazı (chargeback) halinde hesap kalıcı olarak
              kapatılabilir.
            </li>
            <li>Fraud tespiti halinde hizmet sonlandırılır.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Kullanım Kısıtlamaları</h2>
          <p className={pClass}>
            Kullanıcı aşağıdaki fiilleri gerçekleştiremez:
          </p>
          <ul className={ulClass}>
            <li>Hukuka aykırı içerik üretmek</li>
            <li>Telif hakkı ihlali yapmak</li>
            <li>Nefret, şiddet veya yasa dışı içerik üretmek</li>
            <li>Spam, bot veya otomasyon suistimali yapmak</li>
            <li>Sistem açıklarını istismar etmek</li>
            <li>API limitlerini manipüle etmek</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Yapay Zeka Çıktıları ve Sorumluluk</h2>
          <ul className={ulClass}>
            <li>Üretilen içeriklerin doğruluğu garanti edilmez.</li>
            <li>Hukuki sorumluluk kullanıcıya aittir.</li>
            <li>Üçüncü taraf hak ihlali riski kullanıcıya aittir.</li>
            <li>Kullanıcı içerikleri kullanmadan önce kontrol etmelidir.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>8. Hizmet Sürekliliği</h2>
          <ul className={ulClass}>
            <li>Hizmet kesintisiz garanti edilmez.</li>
            <li>Teknik bakım ve kesintiler olabilir.</li>
            <li>Bu durum iade sebebi değildir.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>9. Fikri Mülkiyet</h2>
          <p className={pClass}>
            Platform yazılımı, tasarım ve marka hakları Hizmet Sağlayıcı’ya
            aittir.
          </p>
          <p className={pClass}>
            Kullanıcıya sınırlı kullanım hakkı verilir.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>10. Sorumluluğun Sınırlandırılması</h2>
          <p className={pClass}>
            Toplam sorumluluk, kullanıcının ödediği ücret ile sınırlıdır.
          </p>
          <p className={pClass}>Dolaylı zararlar kabul edilmez.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>11. Hesap Askıya Alma</h2>
          <ul className={ulClass}>
            <li>Şart ihlali</li>
            <li>Fraud</li>
            <li>Chargeback</li>
            <li>Hukuka aykırı kullanım</li>
          </ul>
          <p className={pClass}>durumlarında hesap kapatılabilir.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>12. Uluslararası Kullanım</h2>
          <p className={pClass}>
            Kullanıcı kendi ülkesinin yasalarına uymakla yükümlüdür.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>13. Değişiklik Hakkı</h2>
          <p className={pClass}>
            Şartlar güncellenebilir ve yayınlandığı anda yürürlüğe girer.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>14. Uygulanacak Hukuk</h2>
          <p className={pClass}>Türkiye Cumhuriyeti hukuku geçerlidir.</p>
          <p className={pClass}>İstanbul Mahkemeleri yetkilidir.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>15. İletişim</h2>
          <p className={pClass}>
            <Link
              href="/support"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              Destek sayfası
            </Link>{" "}
            üzerinden iletişime geçilebilir.
          </p>
        </section>
      </div>
    </article>
  );
}
