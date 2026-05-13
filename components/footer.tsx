export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">HTK</h3>
            <p className="text-slate-400">Harbiy-Tibbiy Komissiya - Yuqori sifatli tibbiy xizmatlar</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Tezkor Havolalar</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="/" className="hover:text-white transition">
                  Bosh sahifa
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-white transition">
                  Xizmatlar
                </a>
              </li>
              <li>
                <a href="/process" className="hover:text-white transition">
                  Bosqichlar
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition">
                  Aloqa
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Aloqa Malumotlari</h4>
            <p className="text-slate-400 mb-2">📞 +998 (71) 123-45-67</p>
            <p className="text-slate-400">✉️ info@htk.uz</p>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
          <p>&copy; 2025 HTK - Harbiy-Tibbiy Komissiya. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  )
}
