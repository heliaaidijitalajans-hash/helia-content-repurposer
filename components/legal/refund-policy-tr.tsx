import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";

export function RefundPolicyTr() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        İPTAL &amp; İADE POLİTİKASI (Dijital Hizmet – SaaS Abonelik Modeli)
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Son güncelleme: 2026
      </p>

      <div className="mt-10 space-y-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Genel Bilgilendirme</h2>
          <p className={pClass}>
            Helia AI, internet üzerinden sunulan bulut tabanlı bir yazılım
            hizmetidir (SaaS).
          </p>
          <p className={pClass}>
            Sunulan hizmet fiziksel bir ürün değildir ve dijital ortamda anında
            sağlanmaktadır.
          </p>
          <p className={pClass}>
            Bu nedenle iade ve iptal koşulları fiziksel ürün satışlarından
            farklılık göstermektedir.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Abonelik İptali</h2>
          <ul className={ulClass}>
            <li>
              Kullanıcı, hesabı üzerinden aboneliğini dilediği zaman iptal
              edebilir.
            </li>
            <li>
              İptal işlemi mevcut fatura döneminin sonunda yürürlüğe girer.
            </li>
            <li>İptal sonrası otomatik yenileme durdurulur.</li>
            <li>Mevcut dönem için tahsil edilmiş ücret iade edilmez.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Cayma Hakkı ve İade Şartları</h2>
          <p className={pClass}>
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
            Sözleşmeler Yönetmeliği uyarınca;
          </p>
          <ul className={ulClass}>
            <li>
              Elektronik ortamda anında ifasına başlanan dijital içerik ve
              yazılım hizmetlerinde cayma hakkı kullanılamaz.
            </li>
            <li>
              Kullanıcı, ödeme işlemi tamamlandığında hizmetin derhal aktif
              edildiğini ve cayma hakkının bulunmadığını kabul eder.
            </li>
          </ul>
          <p className={`${pClass} mt-4 font-medium text-gray-800`}>
            Bu nedenle:
          </p>
          <ul className={ulClass}>
            <li>Hizmet aktif edildikten sonra ücret iadesi yapılmaz.</li>
            <li>Kısmi kullanım durumunda iade yapılmaz.</li>
            <li>Kullanılmış abonelik süreleri için geri ödeme yapılmaz.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. İstisnai İade Durumları</h2>
          <p className={pClass}>
            Aşağıdaki durumlarda inceleme sonrası iade kararı verilebilir:
          </p>
          <ul className={ulClass}>
            <li>Hizmetin teknik olarak hiç sağlanamamış olması</li>
            <li>Sistemsel hata nedeniyle erişimin mümkün olmaması</li>
            <li>Mükerrer (çift) ödeme tespiti</li>
          </ul>
          <p className={pClass}>
            İade talepleri, ödeme tarihinden itibaren 7 gün içinde yazılı olarak
            iletilmelidir.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Ödeme İtirazı (Chargeback) ve Kötüye Kullanım</h2>
          <ul className={ulClass}>
            <li>
              Kullanıcının haksız ödeme itirazı (chargeback) başlatması halinde
              hesap askıya alınabilir veya kalıcı olarak kapatılabilir.
            </li>
            <li>
              Sahtecilik (fraud), kötüye kullanım veya sözleşme ihlali tespit
              edilmesi halinde hizmet derhal sonlandırılabilir.
            </li>
            <li>Bu durumlarda ücret iadesi yapılmaz.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Para İade Süreci</h2>
          <ul className={ulClass}>
            <li>
              İade kararı verilmesi halinde, iade ödemenin yapıldığı yöntem
              üzerinden gerçekleştirilir.
            </li>
            <li>
              İade süresi ilgili finans kuruluşunun işlem süresine bağlıdır.
            </li>
            <li>
              Banka komisyonları ve kur farkları iade kapsamına dahil değildir.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. İletişim</h2>
          <p className={pClass}>İade ve iptal talepleri için:</p>
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
