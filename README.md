# ZenFocus - Chrome Extension

Modern bir arayüze sahip, dikkat dağıtan siteleri engelleyen Chrome uzantısı.

## Teknolojiler

- React 18
- Vite
- Tailwind CSS
- Chrome Extension Manifest V3

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Projeyi build edin:
```bash
npm run build
```

3. Chrome'da uzantıyı yükleyin:
   - Chrome'da `chrome://extensions/` adresine gidin
   - Sağ üstten "Geliştirici modu"nu aktif edin
   - "Paketlenmemiş öğe yükle" butonuna tıklayın
   - `dist` klasörünü seçin

## Geliştirme

Development modunda çalıştırmak için:
```bash
npm run dev
```

Her değişiklikten sonra `npm run build` komutunu çalıştırıp Chrome'da uzantıyı yenilemeniz gerekir.

## Özellikler

- ✅ Modern ve kullanıcı dostu arayüz
- ✅ Site ekleme/çıkarma
- ✅ Engellenen sitelere özel blok sayfası
- ✅ Chrome Storage API ile veri saklama
- ✅ Tailwind CSS ile responsive tasarım

## Kullanım

1. Uzantı ikonuna tıklayın
2. Engellemek istediğiniz site adresini girin (örn: facebook.com)
3. "Ekle" butonuna tıklayın
4. Artık o siteye girmeye çalıştığınızda engelleneceksiniz!
