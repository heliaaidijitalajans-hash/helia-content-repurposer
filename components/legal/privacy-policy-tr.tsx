import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const h3Class =
  "mt-6 text-base font-bold tracking-tight text-gray-900 first:mt-0";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";
const noteClass = "mt-2 text-sm leading-relaxed text-gray-600 italic";
const dividerClass = "my-10 border-0 border-t border-gray-200";

export function PrivacyPolicyTr() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        GİZLİLİK POLİTİKASI
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Son güncelleme: 2026
      </p>

      <div className="mt-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Veri Sorumlusu</h2>
          <p className={pClass}>
            Bu Gizlilik Politikası, Aysel Nur Akıncı tarafından işletilen Helia
            AI platformuna ilişkin kişisel verilerin işlenmesine dair esasları
            düzenler.
          </p>
          <p className={`${pClass} font-medium text-gray-800`}>İletişim:</p>
          <div className="mt-2 space-y-1 text-sm leading-relaxed text-gray-700">
            <p>
              <span className="font-semibold text-gray-800">E-posta:</span>{" "}
              <a
                href="mailto:helia.destek@gmail.com"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                helia.destek@gmail.com
              </a>
            </p>
            <p>
              <span className="font-semibold text-gray-800">Adres:</span>{" "}
              Istanbul/Silivri Mimar Sinan Mah. Fatih Sultan Mehmet Cad.
              No:38-R Daire:14
            </p>
          </div>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Toplanan Veriler</h2>
          <p className={pClass}>
            Platform kullanımı sırasında aşağıdaki veriler toplanabilir:
          </p>

          <h3 className={h3Class}>2.1 Kimlik ve İletişim Bilgileri</h3>
          <ul className={ulClass}>
            <li>Ad soyad</li>
            <li>E-posta adresi</li>
          </ul>

          <h3 className={h3Class}>2.2 Finansal Bilgiler</h3>
          <ul className={ulClass}>
            <li>Ödeme işlem bilgileri</li>
          </ul>
          <p className={noteClass}>
            (Not: Kart bilgileri ödeme kuruluşu tarafından işlenir, sistemimizde
            saklanmaz.)
          </p>

          <h3 className={h3Class}>2.3 Teknik Veriler</h3>
          <ul className={ulClass}>
            <li>IP adresi</li>
            <li>Cihaz bilgisi</li>
            <li>Tarayıcı bilgisi</li>
            <li>Log kayıtları</li>
            <li>Çerez verileri</li>
          </ul>

          <h3 className={h3Class}>2.4 Kullanım Verileri</h3>
          <ul className={ulClass}>
            <li>Platform içi işlem geçmişi</li>
            <li>AI üretim girdileri (prompt)</li>
            <li>Üretilen içerikler</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Verilerin İşlenme Amaçları</h2>
          <p className={pClass}>Toplanan veriler aşağıdaki amaçlarla işlenir:</p>
          <ul className={ulClass}>
            <li>Hizmetin sunulması ve sürdürülmesi</li>
            <li>Abonelik işlemlerinin yürütülmesi</li>
            <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
            <li>Güvenlik ve fraud önleme</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Sistem performansının iyileştirilmesi</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Hukuki Sebepler</h2>
          <p className={pClass}>
            Kişisel veriler aşağıdaki hukuki sebeplere dayanarak işlenir:
          </p>
          <ul className={ulClass}>
            <li>Sözleşmenin ifası</li>
            <li>Meşru menfaat</li>
            <li>Açık rıza (gerektiğinde)</li>
            <li>Yasal yükümlülük</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Verilerin Saklanma Süresi</h2>
          <p className={pClass}>Kişisel veriler;</p>
          <ul className={ulClass}>
            <li>Abonelik süresi boyunca</li>
            <li>Yasal saklama yükümlülükleri süresince</li>
            <li>Olası uyuşmazlık süreçleri boyunca</li>
          </ul>
          <p className={pClass}>
            saklanabilir. Süre sonunda veriler silinir, yok edilir veya anonim
            hale getirilir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Veri Aktarımı</h2>
          <p className={pClass}>
            Veriler aşağıdaki üçüncü taraflarla paylaşılabilir:
          </p>
          <ul className={ulClass}>
            <li>Ödeme kuruluşları</li>
            <li>Hosting ve altyapı sağlayıcıları</li>
            <li>Bulut hizmet sağlayıcıları</li>
            <li>Yasal merciler (talep halinde)</li>
          </ul>
          <p className={pClass}>
            Uluslararası kullanıcılar açısından veriler, Türkiye veya farklı
            ülkelerde bulunan sunucularda işlenebilir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Yapay Zeka Verileri</h2>
          <p className={pClass}>
            Kullanıcı tarafından platforma girilen içerikler (prompt) ve üretilen
            çıktılar, hizmetin sağlanması amacıyla işlenir.
          </p>
          <p className={pClass}>Bu veriler:</p>
          <ul className={ulClass}>
            <li>Sistem performansını geliştirmek</li>
            <li>Güvenlik kontrolleri yapmak</li>
            <li>Teknik iyileştirmeler sağlamak</li>
          </ul>
          <p className={pClass}>
            amacıyla anonim veya toplu şekilde analiz edilebilir.
          </p>
          <p className={pClass}>
            Hizmet Sağlayıcı, kullanıcı içeriklerini üçüncü kişilere ticari
            amaçla satmaz.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>8. Veri Güvenliği</h2>
          <p className={pClass}>Hizmet Sağlayıcı;</p>
          <ul className={ulClass}>
            <li>Teknik güvenlik önlemleri</li>
            <li>Şifreleme yöntemleri</li>
            <li>Yetki sınırlamaları</li>
            <li>Güvenlik protokolleri</li>
          </ul>
          <p className={pClass}>
            kullanarak kişisel verileri korumayı amaçlar.
          </p>
          <p className={pClass}>
            Ancak internet üzerinden veri aktarımının tamamen güvenli olduğu
            garanti edilemez.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>9. Kullanıcının Hakları (KVKK &amp; GDPR Kapsamında)</h2>
          <p className={pClass}>Kullanıcı;</p>
          <ul className={ulClass}>
            <li>Verilerine erişme</li>
            <li>Düzeltme talep etme</li>
            <li>Silinmesini isteme</li>
            <li>İşlemeye itiraz etme</li>
            <li>Veri taşınabilirliği talep etme</li>
          </ul>
          <p className={pClass}>haklarına sahiptir.</p>
          <p className={pClass}>Talepler e-posta yoluyla iletilebilir.</p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>10. Çerez Kullanımı</h2>
          <p className={pClass}>
            Platformda çerezler kullanılmaktadır. Detaylı bilgi için{" "}
            <Link
              href="/cookie-policy"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              Çerez Politikası
            </Link>{" "}
            incelenmelidir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>11. Politika Değişiklikleri</h2>
          <p className={pClass}>
            Bu Gizlilik Politikası güncellenebilir.
          </p>
          <p className={pClass}>
            Güncel versiyon platformda yayınlandığı tarihte yürürlüğe girer.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>12. İletişim</h2>
          <p className={pClass}>
            Gizlilik ile ilgili sorularınız için{" "}
            <Link
              href="/support"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              destek sayfamızdan
            </Link>{" "}
            bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </article>
  );
}
