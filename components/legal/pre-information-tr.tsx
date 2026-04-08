import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";
const addressClass = "mt-3 space-y-1 text-sm leading-relaxed text-gray-700";

export function PreInformationTr() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        ÖN BİLGİLENDİRME FORMU (Dijital Hizmet – SaaS Abonelik Modeli)
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Son güncelleme: 2026
      </p>

      <div className="mt-10 space-y-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Hizmet Sağlayıcı Bilgileri</h2>
          <div className={addressClass}>
            <p>
              <span className="font-semibold text-gray-800">Unvan:</span> Aysel
              Nur Akıncı
            </p>
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
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Hizmetin Temel Özellikleri</h2>
          <p className={pClass}>
            Helia AI, internet üzerinden sunulan bulut tabanlı bir yazılım
            hizmetidir (SaaS). Platform;
          </p>
          <ul className={ulClass}>
            <li>Yapay zeka destekli içerik üretimi</li>
            <li>Metin, video ve ses içeriklerinin dönüştürülmesi</li>
            <li>Viral içerik (thread, carousel, hook vb.) oluşturma</li>
            <li>Abonelik planına bağlı kullanım limitleri</li>
          </ul>
          <p className={pClass}>sunmaktadır.</p>
          <p className={pClass}>
            Hizmet fiziksel bir ürün değildir ve tamamen dijital ortamda
            sağlanır.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Fiyatlandırma ve Ödeme</h2>
          <ul className={ulClass}>
            <li>Hizmet bedelleri Amerikan Doları (USD) cinsinden belirlenebilir.</li>
            <li>
              Ödeme, platformda sunulan elektronik ödeme yöntemleri aracılığıyla
              tahsil edilir.
            </li>
            <li>Abonelikler otomatik yenilemelidir.</li>
            <li>
              Kullanıcı iptal etmediği sürece abonelik süresi sonunda ücret tahsil
              edilir.
            </li>
            <li>Banka komisyonları ve döviz kur farkları kullanıcıya aittir.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Abonelik Süresi ve İptal</h2>
          <ul className={ulClass}>
            <li>Abonelik aylık veya yıllık olabilir.</li>
            <li>
              Kullanıcı, yenileme tarihinden önce hesabı üzerinden iptal edebilir.
            </li>
            <li>
              İptal işlemi mevcut fatura dönemi sonunda yürürlüğe girer.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Cayma Hakkı Hakkında Bilgilendirme</h2>
          <p className={pClass}>
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili
            yönetmelikler uyarınca;
          </p>
          <ul className={ulClass}>
            <li>
              Elektronik ortamda anında ifasına başlanan dijital içerik ve
              yazılım hizmetlerinde cayma hakkı kullanılamaz.
            </li>
            <li>
              Kullanıcı, ödeme işlemi tamamlandığında hizmetin derhal aktif
              edileceğini ve bu nedenle cayma hakkının bulunmadığını kabul eder.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. İade Politikası</h2>
          <ul className={ulClass}>
            <li>Hizmet aktif edildikten sonra ücret iadesi yapılmaz.</li>
            <li>
              Teknik arıza veya sistemsel hata durumunda inceleme sonrası iade
              kararı verilebilir.
            </li>
            <li>
              Haksız ödeme itirazı (chargeback) durumunda hesap askıya alınabilir
              veya kapatılabilir.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Kullanım Sorumluluğu</h2>
          <ul className={ulClass}>
            <li>
              Yapay zeka tarafından üretilen içeriklerin kullanımından doğan hukuki
              sorumluluk kullanıcıya aittir.
            </li>
            <li>
              Hizmet kesintisiz veya hatasız olacağı garanti edilmez.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>8. Şikayet ve İletişim</h2>
          <p className={pClass}>Her türlü soru ve talep için:</p>
          <p className={pClass}>
            <span className="font-semibold text-gray-800">E-posta:</span>{" "}
            <a
              href="mailto:helia.destek@gmail.com"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              helia.destek@gmail.com
            </a>
          </p>
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
