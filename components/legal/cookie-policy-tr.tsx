import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const h3Class =
  "mt-6 text-base font-bold tracking-tight text-gray-900 first:mt-0";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";
const dividerClass = "my-10 border-0 border-t border-gray-200";
const examplesLabelClass = "mt-3 text-sm font-medium text-gray-800";

export function CookiePolicyTr() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        ÇEREZ POLİTİKASI
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Son güncelleme: 2026
      </p>

      <div className="mt-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Amaç</h2>
          <p className={pClass}>
            Bu Çerez Politikası, Helia AI platformu (&quot;Platform&quot;)
            tarafından kullanılan çerezlere ilişkin olarak kullanıcıların
            bilgilendirilmesi amacıyla hazırlanmıştır.
          </p>
          <p className={pClass}>
            Platform, kullanıcı deneyimini geliştirmek, hizmetleri güvenli şekilde
            sunmak ve performansı artırmak amacıyla çerezler kullanmaktadır.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Çerez Nedir?</h2>
          <p className={pClass}>
            Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcınız
            aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır.
          </p>
          <p className={pClass}>
            Bu dosyalar sayesinde site tercihleri hatırlanabilir ve kullanıcı
            deneyimi iyileştirilebilir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Kullanılan Çerez Türleri</h2>

          <h3 className={h3Class}>3.1 Zorunlu Çerezler</h3>
          <p className={pClass}>
            Bu çerezler platformun düzgün çalışması için gereklidir.
          </p>
          <p className={examplesLabelClass}>Örnekler:</p>
          <ul className={ulClass}>
            <li>Oturum yönetimi</li>
            <li>Güvenlik doğrulama</li>
            <li>Abonelik kontrolü</li>
          </ul>
          <p className={pClass}>Bu çerezler devre dışı bırakılamaz.</p>

          <hr className={dividerClass} />

          <h3 className={h3Class}>3.2 Performans ve Analitik Çerezler</h3>
          <p className={`${pClass} font-medium text-gray-800`}>Bu çerezler;</p>
          <ul className={ulClass}>
            <li>Ziyaretçi sayısını analiz etmek</li>
            <li>Platform performansını ölçmek</li>
            <li>Hata tespiti yapmak</li>
          </ul>
          <p className={pClass}>amacıyla kullanılır.</p>
          <p className={pClass}>Bu çerezler anonim veriler üretir.</p>

          <hr className={dividerClass} />

          <h3 className={h3Class}>3.3 Fonksiyonel Çerezler</h3>
          <ul className={ulClass}>
            <li>Dil tercihi</li>
            <li>Kullanıcı ayarları</li>
            <li>Hesap tercihlerinin hatırlanması</li>
          </ul>
          <p className={pClass}>amacıyla kullanılır.</p>

          <hr className={dividerClass} />

          <h3 className={h3Class}>3.4 Pazarlama ve Reklam Çerezleri (Varsa)</h3>
          <p className={pClass}>
            Platformda üçüncü taraf reklam hizmetleri kullanılması halinde,
            kullanıcı davranışlarına dayalı içerik sunmak amacıyla çerezler
            kullanılabilir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Çerezlerin Hukuki Dayanağı</h2>
          <p className={`${pClass} font-medium text-gray-800`}>Çerezler;</p>
          <ul className={ulClass}>
            <li>KVKK kapsamında meşru menfaat</li>
            <li>Sözleşmenin ifası</li>
            <li>Açık rıza (zorunlu olmayan çerezler için)</li>
          </ul>
          <p className={pClass}>hukuki sebeplerine dayanarak işlenmektedir.</p>
          <p className={pClass}>
            Zorunlu olmayan çerezler için kullanıcı onayı alınır.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Çerezlerin Saklanma Süresi</h2>
          <p className={`${pClass} font-medium text-gray-800`}>Çerezler;</p>
          <ul className={ulClass}>
            <li>Oturum süresince (session cookies)</li>
            <li>Belirli süre boyunca (persistent cookies)</li>
          </ul>
          <p className={pClass}>cihazda saklanabilir.</p>
          <p className={pClass}>
            Saklama süresi çerez türüne göre değişiklik gösterir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Çerezlerin Kontrolü</h2>
          <p className={`${pClass} font-medium text-gray-800`}>Kullanıcılar;</p>
          <ul className={ulClass}>
            <li>Tarayıcı ayarlarından çerezleri silebilir</li>
            <li>Çerez kullanımını engelleyebilir</li>
            <li>Çerez tercihlerini değiştirebilir</li>
          </ul>
          <p className={pClass}>
            Ancak bazı çerezlerin devre dışı bırakılması platformun düzgün
            çalışmasını engelleyebilir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Üçüncü Taraf Çerezler</h2>
          <p className={`${pClass} font-medium text-gray-800`}>Platform;</p>
          <ul className={ulClass}>
            <li>Analitik hizmet sağlayıcılar</li>
            <li>Ödeme altyapısı sağlayıcıları</li>
            <li>Bulut ve güvenlik hizmetleri</li>
          </ul>
          <p className={pClass}>
            tarafından yerleştirilen çerezler kullanabilir.
          </p>
          <p className={pClass}>
            Bu çerezler ilgili üçüncü tarafların gizlilik politikalarına tabidir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>8. Uluslararası Veri Aktarımı</h2>
          <p className={pClass}>
            Çerezler aracılığıyla toplanan veriler, Türkiye veya yurt dışında
            bulunan sunucularda işlenebilir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>9. Politika Güncellemeleri</h2>
          <p className={pClass}>Bu Çerez Politikası güncellenebilir.</p>
          <p className={pClass}>
            Güncel versiyon platformda yayınlandığı tarihte yürürlüğe girer.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>10. İletişim</h2>
          <p className={pClass}>
            Sorularınız için{" "}
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
