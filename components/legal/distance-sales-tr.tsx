import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";
const addressClass = "mt-3 space-y-1 text-sm leading-relaxed text-gray-700";

export function DistanceSalesTr() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        MESAFELİ SATIŞ SÖZLEŞMESİ (Dijital Hizmet – SaaS Abonelik Modeli)
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Son güncelleme: 2026
      </p>

      <div className="mt-10 space-y-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Taraflar</h2>
          <p className={pClass}>
            İşbu Mesafeli Satış Sözleşmesi (&quot;Sözleşme&quot;);
          </p>
          <div className={addressClass}>
            <p>
              <span className="font-semibold text-gray-800">
                Hizmet Sağlayıcı:
              </span>{" "}
              Aysel Nur Akıncı
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
          <p className={pClass}>
            ile Helia AI platformuna üye olan gerçek veya tüzel kişi
            (&quot;Kullanıcı&quot;) arasında elektronik ortamda kurulmuştur.
          </p>
          <p className={pClass}>
            Kullanıcı, platform üzerinden ödeme yaparak işbu sözleşmeyi kabul
            etmiş sayılır.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Sözleşmenin Konusu</h2>
          <p className={pClass}>
            İşbu sözleşmenin konusu, Hizmet Sağlayıcı tarafından sunulan Helia AI
            bulut tabanlı yazılım platformuna (SaaS) abonelik erişiminin
            sağlanmasına ilişkin tarafların hak ve yükümlülüklerinin
            belirlenmesidir.
          </p>
          <p className={pClass}>
            Sunulan hizmet fiziksel ürün değil, tamamen dijital ortamda sağlanan
            yazılım erişim hizmetidir.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Hizmetin Niteliği</h2>
          <p className={`${pClass} font-medium text-gray-800`}>
            Helia AI platformu;
          </p>
          <ul className={ulClass}>
            <li>Yapay zeka destekli içerik üretimi</li>
            <li>Metin, video ve ses içeriklerinin dönüştürülmesi</li>
            <li>Viral içerik (thread, carousel, hook vb.) oluşturma</li>
            <li>Abonelik planına göre belirlenen kullanım limitleri</li>
          </ul>
          <p className={pClass}>sunmaktadır.</p>
          <p className={pClass}>
            Hizmet internet üzerinden anlık olarak sağlanır ve fiziksel teslimat
            içermez.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Sözleşmenin Kurulması</h2>
          <p className={pClass}>
            Sözleşme, kullanıcının ödeme işlemini tamamlaması ve elektronik onay
            vermesi ile kurulmuş sayılır.
          </p>
          <p className={pClass}>
            Kullanıcı, sözleşme şartlarını okuyup anladığını kabul eder.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Ücret ve Ödeme Koşulları</h2>
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
            <li>
              Banka komisyonları, vergi yükümlülükleri ve döviz farklarından
              kullanıcı sorumludur.
            </li>
            <li>
              Hizmet Sağlayıcı fiyat değişikliği yapma hakkını saklı tutar.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Abonelik Süresi ve Yenileme</h2>
          <ul className={ulClass}>
            <li>Abonelik aylık veya yıllık olabilir.</li>
            <li>Süre sonunda otomatik olarak yenilenir.</li>
            <li>
              Kullanıcı yenileme tarihinden önce hesabı üzerinden iptal edebilir.
            </li>
            <li>
              İptal işlemi mevcut fatura dönemi sonunda yürürlüğe girer.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Cayma Hakkı ve İstisnası</h2>
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
              Kullanıcı, ödeme sonrası hizmetin derhal aktif edildiğini ve bu
              nedenle cayma hakkından feragat ettiğini kabul eder.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>8. İptal ve İade Koşulları</h2>
          <ul className={ulClass}>
            <li>Hizmet aktif edildikten sonra ücret iadesi yapılmaz.</li>
            <li>
              Teknik arıza veya sistemsel hata durumunda inceleme sonrası iade
              kararı verilebilir.
            </li>
            <li>
              Kullanıcının haksız ödeme itirazı (chargeback) başlatması halinde
              hesap askıya alınabilir veya kalıcı olarak kapatılabilir.
            </li>
            <li>
              Sahtecilik, kötüye kullanım veya sözleşme ihlali halinde hizmet
              sonlandırılabilir.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>9. Kullanıcının Yükümlülükleri</h2>
          <p className={pClass}>Kullanıcı:</p>
          <ul className={ulClass}>
            <li>Hesap bilgilerini doğru beyan etmekle</li>
            <li>Hesap güvenliğini sağlamakla</li>
            <li>Platformu hukuka uygun kullanmakla</li>
            <li>Telif hakkı ve üçüncü kişi haklarını ihlal etmemekle</li>
          </ul>
          <p className={pClass}>yükümlüdür.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>10. Sorumluluk Sınırı</h2>
          <ul className={ulClass}>
            <li>Yapay zeka tarafından üretilen içeriklerin doğruluğu garanti edilmez.</li>
            <li>
              İçeriklerin kullanımından doğan hukuki sorumluluk kullanıcıya
              aittir.
            </li>
            <li>
              Hizmet Sağlayıcının toplam sorumluluğu, kullanıcının ilgili abonelik
              döneminde ödediği ücret ile sınırlıdır.
            </li>
            <li>
              Dolaylı zararlar, veri kaybı, kar kaybı veya iş kesintisinden
              sorumluluk kabul edilmez.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>11. Mücbir Sebep</h2>
          <p className={pClass}>
            Doğal afet, savaş, teknik altyapı arızası, internet kesintisi gibi
            tarafların kontrolü dışındaki durumlarda sorumluluk doğmaz.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>12. Uyuşmazlıkların Çözümü</h2>
          <p className={pClass}>
            İşbu sözleşme Türkiye Cumhuriyeti hukukuna tabidir.
          </p>
          <p className={pClass}>
            Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>13. İletişim</h2>
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
