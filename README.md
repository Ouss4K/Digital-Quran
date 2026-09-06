# Digital Quran

A calm, modern Quran companion for reading, listening, bookmarking, prayer times, and dhikr — all in the browser.

**Live:** [ouss4k.github.io/Digital-Quran](https://github.com/Ouss4K/Digital-Quran)

## Features

- Full Quran in Arabic with 10 translation languages
- Recitation by Mishary Rashid Alafasy (full surah or verse)
- Tafsir on demand: Ibn Kathir, Ma'arif al-Qur'an, Al-Muyassar, and Al-Sa'di
- Bookmarks with categories, JSON export/import
- Continue reading from your last verse
- Ayah of the day
- Islamic calendar with upcoming Hijri dates
- Prayer times by GPS or city, plus qibla direction
- Daily dhikr counter
- Dark mode, font size controls, keyboard shortcuts
- Works as a lightweight PWA (installable, app shell cached)

## How to run

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Keyboard

- `/` focus search
- `Esc` back / close modal
- `←` `→` previous / next surah while reading
- `Ctrl/Cmd + B` bookmarks

## Tech

- HTML, CSS, JavaScript
- [AlQuran.cloud](https://alquran.cloud) for Quran text, translations, and audio
- [Quran.com API](https://api-docs.quran.com) for tafsir (Ibn Kathir, Ma'arif al-Qur'an, Al-Muyassar, Al-Sa'di)
- [AlAdhan](https://aladhan.com/rest-api) for Hijri dates, prayer times, and qibla

## Report an issue

[Open an issue](https://github.com/Ouss4K/Digital-Quran/issues/new)
