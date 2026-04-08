import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const h3Class =
  "mt-6 text-base font-bold tracking-tight text-gray-900 first:mt-0";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";
const dividerClass = "my-10 border-0 border-t border-gray-200";
const noteClass = "mt-2 text-sm leading-relaxed text-gray-600 italic";
const addressClass = "mt-3 space-y-1 text-sm leading-relaxed text-gray-700";

export function KvkkNoticeTr() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        KVKK AYDINLATMA METNİ (6698 Sayılı Kişisel Verilerin Korunması Kanunu
        Kapsamında)
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Son güncelleme: 2026
      </p>

      <div className="mt-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Veri Sorumlusu</h2>
          <p className={pClass}>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
            uyarınca kişisel verileriniz;
          </p>
          <div className={addressClass}>
            <p className="font-semibold text-gray-800">Aysel Nur Akıncı</p>
            <p>
              <span className="font-semibold text-gray-800">Vergi No:</span>{" "}
              1160825918
            </p>
            <p>
              <span className="font-semibold text-gray-800">Adres:</span>{" "}
              Istanbul/Silivri Mimar Sinan Mah. Fatih Sultan Mehmet Cad.
              No:38-R Daire:14
            </p>
            <p>
              <span className="font-semibold text-gray-800">E-posta:</span>{" "}
              <a
                href="mailto:helia.destek@gmail.com"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                helia.destek@gmail.com
              </a>
            </p>
          </div>
          <p className={pClass}>
            tarafından veri sorumlusu sıfatıyla işlenmektedir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>2. İşlenen Kişisel Veriler</h2>
          <p className={pClass}>
            Helia AI platformu kapsamında aşağıdaki kişisel veriler
            işlenebilmektedir:
          </p>

          <h3 className={h3Class}>Kimlik ve İletişim Bilgileri</h3>
          <ul className={ulClass}>
            <li>Ad soyad</li>
            <li>E-posta adresi</li>
          </ul>

          <h3 className={h3Class}>Finansal Bilgiler</h3>
          <ul className={ulClass}>
            <li>Ödeme işlem bilgileri</li>
          </ul>
          <p className={noteClass}>
            (Not: Kart bilgileriniz ödeme kuruluşu tarafından işlenmekte olup
            sistemlerimizde saklanmamaktadır.)
          </p>

          <h3 className={h3Class}>İşlem Güvenliği Bilgileri</h3>
          <ul className={ulClass}>
            <li>IP adresi</li>
            <li>Cihaz ve tarayıcı bilgileri</li>
            <li>Log kayıtları</li>
          </ul>

          <h3 className={h3Class}>Kullanım Verileri</h3>
          <ul className={ulClass}>
            <li>Platform kullanım geçmişi</li>
            <li>AI üretim girdileri (prompt)</li>
            <li>Üretilen dijital içerikler</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Kişisel Verilerin İşlenme Amaçları</h2>
          <p className={`${pClass} font-medium text-gray-800`}>
            Kişisel verileriniz;
          </p>
          <ul className={ulClass}>
            <li>Hizmetin sunulması ve sözleşmenin ifası</li>
            <li>Abonelik ve ödeme işlemlerinin yürütülmesi</li>
            <li>Sistem güvenliğinin sağlanması</li>
            <li>Kötüye kullanım ve fraud önleme</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Hizmet kalitesinin artırılması</li>
          </ul>
          <p className={pClass}>amaçlarıyla işlenmektedir.</p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Kişisel Verilerin Aktarımı</h2>
          <p className={`${pClass} font-medium text-gray-800`}>
            Kişisel verileriniz;
          </p>
          <ul className={ulClass}>
            <li>Ödeme kuruluşlarına</li>
            <li>Hosting ve altyapı sağlayıcılarına</li>
            <li>Bulut hizmet sağlayıcılarına</li>
            <li>Hukuken yetkili kamu kurum ve kuruluşlarına</li>
          </ul>
          <p className={pClass}>
            KVKK&apos;nın 8. ve 9. maddelerine uygun olarak aktarılabilir.
          </p>
          <p className={pClass}>
            Uluslararası kullanıcılar bakımından veriler, yurt dışında bulunan
            sunucularda işlenebilir.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>
            5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi
          </h2>
          <p className={`${pClass} font-medium text-gray-800`}>Kişisel veriler;</p>
          <ul className={ulClass}>
            <li>Web sitesi ve uygulama arayüzü üzerinden elektronik ortamda</li>
            <li>Üyelik ve ödeme işlemleri sırasında</li>
            <li>Çerezler ve log kayıtları aracılığıyla</li>
          </ul>
          <p className={pClass}>toplanmaktadır.</p>
          <p className={`${pClass} mt-4 font-medium text-gray-800`}>Veriler;</p>
          <ul className={ulClass}>
            <li>Sözleşmenin kurulması ve ifası</li>
            <li>Veri sorumlusunun meşru menfaati</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Açık rıza (gerektiğinde)</li>
          </ul>
          <p className={pClass}>hukuki sebeplerine dayanılarak işlenmektedir.</p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>6. İlgili Kişinin Hakları</h2>
          <p className={pClass}>
            KVKK&apos;nın 11. maddesi uyarınca ilgili kişi olarak;
          </p>
          <ul className={ulClass}>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>
              İşlenme amacını öğrenme ve amacına uygun kullanılıp kullanılmadığını
              öğrenme
            </li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme</li>
            <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme</li>
            <li>
              KVKK&apos;da öngörülen şartlar çerçevesinde silinmesini veya yok
              edilmesini isteme
            </li>
            <li>İşlemeye itiraz etme</li>
            <li>Kanun kapsamında yasal başvuru haklarını kullanma</li>
          </ul>
          <p className={pClass}>haklarına sahipsiniz.</p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Başvuru Yöntemi</h2>
          <p className={pClass}>KVKK kapsamındaki taleplerinizi;</p>
          <p className={pClass}>
            <span className="font-semibold text-gray-800">E-posta:</span>{" "}
            <a
              href="mailto:helia.destek@gmail.com"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              helia.destek@gmail.com
            </a>
          </p>
          <p className={pClass}>adresine yazılı olarak iletebilirsiniz.</p>
          <p className={pClass}>
            Başvurular mevzuatta öngörülen süre içerisinde sonuçlandırılacaktır.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>8. İletişim</h2>
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
