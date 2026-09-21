(() => {
    "use strict";

    const API_BASE = "https://api.alquran.cloud/v1";
    const AUDIO_SURAH = "https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy";
    const AUDIO_AYAH = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";
    const ALADHAN = "https://api.aladhan.com/v1";
    const TAFSIR_API = "https://api.quran.com/api/v4";
    const TAFSIR_CDN = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir";
    const MAWAQIT = "https://mawaqit.net/api/2.0";

    const TAFSIRS = {
        "en-ibn-kathir": { name: "Ibn Kathir (abridged)", lang: "en", quranId: 169 },
        "en-maarif": { name: "Ma'arif al-Qur'an", lang: "en", quranId: 168 },
        "ar-muyassar": { name: "Al-Muyassar", lang: "ar", rtl: true, quranId: 16 },
        "ar-sadi": { name: "Al-Sa'di", lang: "ar", rtl: true, quranId: 91 },
        "fr-mukhtasar": { name: "Al-Mukhtasar", lang: "fr", slug: "french-mokhtasar" },
        "es-mukhtasar": { name: "Al-Mukhtasar", lang: "es", slug: "spanish-mokhtasar" },
        "tr-mukhtasar": { name: "Al-Mukhtasar", lang: "tr", slug: "turkish-mokhtasar" },
        "tr-ibn-kathir": { name: "Ibn Kathir", lang: "tr", slug: "tr-tafsir-ibne-kathir" },
        "ur-ibn-kathir": { name: "Ibn Kathir", lang: "ur", rtl: true, quranId: 160 },
        "ur-tazkir": { name: "Tazkirul Quran", lang: "ur", rtl: true, quranId: 818 },
        "id-mukhtasar": { name: "Al-Mukhtasar", lang: "id", slug: "indonesian-mokhtasar" },
        "id-jalalayn": { name: "Jalalayn", lang: "id", slug: "in-tafsir-jalalayn" },
        "ru-sadi": { name: "Al-Sa'di", lang: "ru", quranId: 170 },
        "zh-mukhtasar": { name: "Al-Mukhtasar", lang: "zh", slug: "chinese-mokhtasar" },
        "hi-mukhtasar": { name: "Al-Mukhtasar", lang: "hi", slug: "hindi-mokhtasar" }
    };

    const LEGACY_TAFSIR = {
        169: "en-ibn-kathir",
        168: "en-maarif",
        16: "ar-muyassar",
        91: "ar-sadi"
    };

    const LANGUAGES = {
        "ar": { name: "العربية", short: "العربية", rtl: true, arabicOnly: true, tafsirLang: "ar" },
        "en.sahih": { name: "English (Sahih International)", short: "English", tafsirLang: "en" },
        "fr.hamidullah": { name: "Français (Hamidullah)", short: "Français", tafsirLang: "fr" },
        "es.cortes": { name: "Español (Julio Cortés)", short: "Español", tafsirLang: "es" },
        "de.bubenheim": { name: "Deutsch (Bubenheim)", short: "Deutsch", tafsirLang: "en" },
        "tr.diyanet": { name: "Türkçe (Diyanet)", short: "Türkçe", tafsirLang: "tr" },
        "ur.junagarhi": { name: "اردو (Junagarhi)", short: "اردو", tafsirLang: "ur" },
        "id.indonesian": { name: "Bahasa Indonesia", short: "Indonesia", tafsirLang: "id" },
        "ru.kuliev": { name: "Русский (Kuliev)", short: "Русский", tafsirLang: "ru" },
        "zh.jian": { name: "中文 (Simplified)", short: "中文", tafsirLang: "zh" },
        "hi.hindi": { name: "हिंदी (Hindi)", short: "हिंदी", tafsirLang: "hi" }
    };

    const CATEGORIES = {
        general: "General",
        inspiration: "Inspiration",
        guidance: "Guidance",
        comfort: "Comfort",
        worship: "Worship"
    };

    const DHIKR_ITEMS = [
        { id: "subhanallah", arabic: "سُبْحَانَ ٱللَّٰهِ", translit: "Subḥānallāh", meaning: "Glory be to Allah", target: 33 },
        { id: "alhamdulillah", arabic: "ٱلْحَمْدُ لِلَّٰهِ", translit: "Alḥamdulillāh", meaning: "All praise is for Allah", target: 33 },
        { id: "allahuakbar", arabic: "ٱللَّٰهُ أَكْبَرُ", translit: "Allāhu akbar", meaning: "Allah is the Greatest", target: 33 },
        { id: "tahlil", arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", translit: "Lā ilāha illā Allāh", meaning: "There is no god but Allah", target: 100 },
        { id: "istighfar", arabic: "أَسْتَغْفِرُ ٱللَّٰهَ", translit: "Astaghfirullāh", meaning: "I seek forgiveness from Allah", target: 100 },
        { id: "salawat", arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", translit: "Allāhumma ṣalli ʿalā Muḥammad", meaning: "O Allah, send blessings upon Muhammad", target: 100 }
    ];

    const HIJRI_EVENTS = [
        { month: 1, day: 1, name: "Islamic New Year", description: "First day of Muharram — a time for reflection and new beginnings." },
        { month: 1, day: 10, name: "Day of Ashura", description: "A day of remembrance and recommended fasting." },
        { month: 3, day: 12, name: "Mawlid al-Nabi", description: "Birth of Prophet Muhammad (peace be upon him)." },
        { month: 7, day: 27, name: "Isra and Mi'raj", description: "The Night Journey and Ascension." },
        { month: 8, day: 15, name: "Mid-Sha'ban", description: "A blessed night of prayer and forgiveness in many communities." },
        { month: 9, day: 1, name: "Ramadan begins", description: "The month of fasting, prayer, and the Quran." },
        { month: 9, day: 27, name: "Laylat al-Qadr", description: "Night of Power — commonly observed on the 27th of Ramadan." },
        { month: 10, day: 1, name: "Eid al-Fitr", description: "Festival of breaking the fast at the end of Ramadan." },
        { month: 12, day: 9, name: "Day of Arafah", description: "The most important day of Hajj." },
        { month: 12, day: 10, name: "Eid al-Adha", description: "Festival of Sacrifice." }
    ];

    const state = {
        surahs: [],
        filtered: [],
        language: localStorage.getItem("quranLanguage") || "en.sahih",
        theme: localStorage.getItem("quranTheme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
        bookmarks: loadJson("quranBookmarks", []),
        favoriteSurahs: loadJson("quranFavoriteSurahs", []).map(Number).filter((n) => n >= 1 && n <= 114),
        showFavoritesOnly: false,
        category: "all",
        currentSurah: null,
        currentVerse: 1,
        verseMap: new Map(),
        view: "home",
        audio: null,
        playingSurah: null,
        ayahAudio: null,
        progressHandler: null,
        verseObserver: null,
        lastRead: loadJson("quranLastRead", null),
        listScroll: Number(sessionStorage.getItem("quranListScroll") || 0),
        fontScale: Number(localStorage.getItem("quranFontScale") || 1),
        tafsirId: localStorage.getItem("quranTafsir") || "en-ibn-kathir",
        tafsirByLang: loadJson("quranTafsirByLang", {}),
        tafsirCache: new Map(),
        prayer: loadJson("quranPrayerPrefs", {
            method: "3",
            city: "",
            country: "",
            lat: null,
            lng: null,
            mosque: null,
            alertsEnabled: false,
            alertLead: 10
        }),
        nearbyMosques: [],
        alertedPrayers: new Set(),
        prayerTick: null,
        dhikr: loadDhikr(),
        dailyAyah: null
    };

    const els = {};

    function loadJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function saveJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    function loadDhikr() {
        const saved = loadJson("quranDhikr", null);
        const today = todayKey();
        if (!saved || saved.date !== today) {
            return { date: today, counts: Object.fromEntries(DHIKR_ITEMS.map((item) => [item.id, 0])) };
        }
        return saved;
    }

    function $(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function notify(message, type = "success") {
        document.querySelectorAll(".toast").forEach((node) => node.remove());
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.style.background = type === "error" ? "#dc3545" : type === "info" ? "#17a2b8" : "#28a745";
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(-50%) translateY(-16px)";
            setTimeout(() => toast.remove(), 280);
        }, 2800);
    }

    async function fetchJson(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.json();
    }

    function cacheEls() {
        [
            "languageSelector", "themeToggle", "bookmarkCount", "searchInput", "searchBtn",
            "randomVerseBtn", "continuePanel", "continueMeta", "continueBtn", "dailyAyahPanel",
            "dailyAyahMeta", "dailyAyahArabic", "dailyAyahTranslation", "dailyAyahReadBtn",
            "loadingIndicator", "surahsGrid", "bookmarksList", "bookmarkCategories",
            "importBookmarksBtn", "exportBookmarksBtn", "clearBookmarksBtn", "importBookmarksFile",
            "favoritesFilterBtn", "favoritesPanel", "favoritesList",
            "hijriToday", "holidaysList", "useLocationBtn", "cityInput", "countryInput",
            "lookupCityBtn", "methodSelect", "prayerStatus", "prayerGrid",
            "prayerAlertsToggle", "prayerAlertLead", "prayerAlertHint", "testPrayerAlertBtn",
            "mosqueSearchInput", "mosqueSearchBtn", "mosqueStatus", "mosqueList", "selectedMosque",
            "prayerAlert", "prayerAlertKicker", "prayerAlertTitle", "prayerAlertBody",
            "resetDhikrBtn", "dhikrGrid", "surahReading", "appModal", "modalContent",
            "readingProgress"
        ].forEach((id) => {
            els[id] = $(id);
        });
    }

    function setTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute("data-theme", theme);
        els.themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
        localStorage.setItem("quranTheme", theme);
    }

    function isArabicOnly() {
        return Boolean(LANGUAGES[state.language]?.arabicOnly);
    }

    function applyFontScale() {
        const scale = Math.min(1.8, Math.max(0.85, state.fontScale));
        state.fontScale = Number(scale.toFixed(2));
        const arabicBase = isArabicOnly() ? 2.2 : 1.9;
        document.documentElement.style.setProperty("--arabic-size", `${arabicBase * state.fontScale}rem`);
        document.documentElement.style.setProperty("--arabic-title-size", `${1.4 * state.fontScale}rem`);
        document.documentElement.style.setProperty("--translation-size", `${1.1 * state.fontScale}rem`);
        document.documentElement.classList.toggle("arabic-only", isArabicOnly());
        document.documentElement.lang = isArabicOnly() ? "ar" : "en";
        localStorage.setItem("quranFontScale", String(state.fontScale));
    }

    function fillLanguages() {
        if (!LANGUAGES[state.language]) state.language = "en.sahih";
        els.languageSelector.innerHTML = Object.entries(LANGUAGES)
            .map(([id, lang]) => `<option value="${id}">${escapeHtml(lang.short)}</option>`)
            .join("");
        els.languageSelector.value = state.language;
        applyFontScale();
    }

    function saveListScroll() {
        if (state.view !== "home") return;
        state.listScroll = window.scrollY;
        sessionStorage.setItem("quranListScroll", String(state.listScroll));
    }

    function restoreListScroll() {
        const y = Math.max(0, Number(state.listScroll) || 0);
        const html = document.documentElement;
        const previous = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        window.scrollTo({ top: y, left: 0, behavior: "auto" });
        requestAnimationFrame(() => {
            window.scrollTo({ top: y, left: 0, behavior: "auto" });
            html.style.scrollBehavior = previous;
        });
    }

    function resumeVerseFor(number) {
        const last = state.lastRead;
        if (!last || Number(last.surahNumber) !== Number(number)) return undefined;
        const verse = Number(last.verseNumber);
        return verse > 1 ? verse : undefined;
    }

    function showView(name) {
        if (state.view === "home" && name !== "home") saveListScroll();
        if (state.view === "reading" && name !== "reading") saveLastRead();
        state.view = name;
        document.querySelectorAll("[data-view]").forEach((section) => {
            section.hidden = section.dataset.view !== name;
        });
        document.querySelectorAll("[data-nav]").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.nav === name);
        });
        els.readingProgress.hidden = name !== "reading";
        if (name !== "reading") {
            els.readingProgress.style.width = "0%";
            teardownReading();
        }
        if (name === "bookmarks") renderBookmarks();
        if (name === "calendar") renderCalendar();
        if (name === "prayer") renderPrayer();
        if (name === "dhikr") renderDhikr();
        if (name === "home") {
            renderContinue();
            renderFavoriteSurahs();
            restoreListScroll();
        } else {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    }

    function updateBookmarkCount() {
        const count = state.bookmarks.length;
        els.bookmarkCount.hidden = count === 0;
        els.bookmarkCount.textContent = String(count);
    }

    function saveBookmarks() {
        saveJson("quranBookmarks", state.bookmarks);
        updateBookmarkCount();
    }

    function isFavoriteSurah(number) {
        return state.favoriteSurahs.includes(Number(number));
    }

    function updateFavoriteUI() {
        renderFavoriteSurahs();
        if (els.favoritesFilterBtn) {
            const count = state.favoriteSurahs.length;
            els.favoritesFilterBtn.textContent = count ? `★ Favorites (${count})` : "★ Favorites";
            els.favoritesFilterBtn.classList.toggle("active", state.showFavoritesOnly);
        }
        document.querySelectorAll('[data-action="favorite-surah"]').forEach((btn) => {
            const id = Number(btn.dataset.surah);
            const on = isFavoriteSurah(id);
            btn.classList.toggle("active", on);
            btn.setAttribute("aria-pressed", String(on));
            if (btn.closest(".reading-toolbar")) btn.textContent = on ? "★ Favorited" : "☆ Favorite";
            else if (btn.classList.contains("btn-fav")) btn.textContent = on ? "★" : "☆";
        });
    }

    function saveFavoriteSurahs() {
        saveJson("quranFavoriteSurahs", state.favoriteSurahs);
        updateFavoriteUI();
    }

    function toggleFavoriteSurah(number) {
        const id = Number(number);
        if (isFavoriteSurah(id)) {
            state.favoriteSurahs = state.favoriteSurahs.filter((item) => item !== id);
            notify("Removed from favorites.");
        } else {
            state.favoriteSurahs.push(id);
            notify("Added to favorite surahs.");
        }
        saveFavoriteSurahs();
        renderSurahs();
    }

    function renderFavoriteSurahs() {
        if (!els.favoritesPanel || !els.favoritesList) return;
        if (!state.favoriteSurahs.length) {
            els.favoritesPanel.hidden = true;
            els.favoritesList.innerHTML = "";
            return;
        }
        els.favoritesPanel.hidden = false;
        const items = state.favoriteSurahs
            .map((number) => state.surahs.find((surah) => surah.number === number))
            .filter(Boolean);
        els.favoritesList.innerHTML = items.map((surah) => `
            <button class="favorite-chip" type="button" data-action="read" data-surah="${surah.number}">
                <span>${surah.number}</span>
                ${escapeHtml(surah.englishName)}
                <span lang="ar" dir="rtl">${escapeHtml(surah.name)}</span>
            </button>
        `).join("");
    }

    function visibleSurahs() {
        let list = state.filtered;
        if (state.showFavoritesOnly) {
            list = list.filter((surah) => isFavoriteSurah(surah.number));
        }
        return [...list].sort((a, b) => {
            const favDiff = Number(isFavoriteSurah(b.number)) - Number(isFavoriteSurah(a.number));
            return favDiff || a.number - b.number;
        });
    }

    function renderSurahs() {
        const grid = els.surahsGrid;
        grid.innerHTML = "";
        const list = visibleSurahs();
        if (!list.length) {
            grid.innerHTML = `<div class="error-message">${state.showFavoritesOnly ? "No favorite surahs yet. Tap the star on a surah card." : "No surahs match that search."}</div>`;
            updateFavoriteUI();
            return;
        }
        const fragment = document.createDocumentFragment();
        list.forEach((surah) => {
            const type = surah.revelationType.toLowerCase();
            const fav = isFavoriteSurah(surah.number);
            const card = document.createElement("article");
            card.className = "surah-card";
            card.tabIndex = 0;
            card.dataset.surah = String(surah.number);
            card.innerHTML = `
                <div class="surah-number">${surah.number}</div>
                <div class="surah-title">
                    <h3>${escapeHtml(surah.englishName)}</h3>
                    <div class="arabic-name" lang="ar" dir="rtl">${escapeHtml(surah.name)}</div>
                    <div class="surah-info">${escapeHtml(surah.englishNameTranslation)} · ${surah.numberOfAyahs} verses</div>
                    <div class="revelation-type ${type}">${type === "meccan" ? "Meccan" : "Medinan"}</div>
                </div>
                <div class="surah-actions">
                    <button class="btn-read" type="button" data-action="read" data-surah="${surah.number}">Read</button>
                    <button class="btn-fav${fav ? " active" : ""}" type="button" data-action="favorite-surah" data-surah="${surah.number}" aria-label="${fav ? "Remove from favorites" : "Add to favorites"}" aria-pressed="${fav}">${fav ? "★" : "☆"}</button>
                    <button class="btn-play" type="button" data-action="play" data-surah="${surah.number}" aria-label="Play recitation">▶</button>
                </div>
            `;
            fragment.appendChild(card);
        });
        grid.appendChild(fragment);
        updateFavoriteUI();
    }

    function simplify(value) {
        return String(value).toLowerCase().replace(/aa/g, "a").replace(/[^a-z0-9\u0600-\u06ff]/g, "");
    }

    function performSearch(term) {
        const query = term.trim().toLowerCase();
        if (!query) {
            state.filtered = state.surahs;
        } else {
            const simple = simplify(query);
            state.filtered = state.surahs.filter((surah) =>
                surah.englishName.toLowerCase().includes(query) ||
                surah.englishNameTranslation.toLowerCase().includes(query) ||
                String(surah.number) === query ||
                surah.name.includes(term.trim()) ||
                simplify(surah.englishName).includes(simple) ||
                simplify(surah.englishNameTranslation).includes(simple)
            );
        }
        renderSurahs();
    }

    function stopAudio() {
        if (state.audio) {
            state.audio.pause();
            state.audio = null;
        }
        if (state.ayahAudio) {
            state.ayahAudio.pause();
            state.ayahAudio = null;
        }
        document.querySelectorAll(".btn-play.playing").forEach((btn) => {
            btn.classList.remove("playing");
            btn.textContent = "▶";
        });
        state.playingSurah = null;
    }

    function playSurahAudio(number, button) {
        if (state.playingSurah === number) {
            stopAudio();
            return;
        }
        stopAudio();
        const audio = new Audio(`${AUDIO_SURAH}/${number}.mp3`);
        state.audio = audio;
        state.playingSurah = number;
        audio.play().then(() => {
            if (button) {
                button.classList.add("playing");
                button.textContent = "⏸";
            }
        }).catch(() => {
            stopAudio();
            notify("Audio playback failed.", "error");
        });
        audio.onended = () => stopAudio();
    }

    function playAyahAudio(ayahNumber) {
        if (state.audio) stopAudio();
        if (state.ayahAudio) {
            state.ayahAudio.pause();
            state.ayahAudio = null;
        }
        const audio = new Audio(`${AUDIO_AYAH}/${ayahNumber}.mp3`);
        state.ayahAudio = audio;
        audio.play().catch(() => notify("Verse audio failed.", "error"));
    }

    function saveLastRead() {
        if (!state.currentSurah) return;
        const surah = state.surahs.find((item) => item.number === state.currentSurah) || { englishName: "" };
        state.lastRead = {
            surahNumber: state.currentSurah,
            verseNumber: state.currentVerse || 1,
            surahName: surah.englishName,
            timestamp: Date.now()
        };
        saveJson("quranLastRead", state.lastRead);
        renderContinue();
    }

    function renderContinue() {
        if (!state.lastRead) {
            els.continuePanel.hidden = true;
            return;
        }
        els.continuePanel.hidden = false;
        const when = new Date(state.lastRead.timestamp).toLocaleString();
        els.continueMeta.textContent = `${state.lastRead.surahName} · verse ${state.lastRead.verseNumber} · ${when}`;
    }

    function teardownReading() {
        if (state.progressHandler) {
            window.removeEventListener("scroll", state.progressHandler);
            state.progressHandler = null;
        }
        if (state.verseObserver) {
            state.verseObserver.disconnect();
            state.verseObserver = null;
        }
    }

    function setupReadingProgress() {
        teardownReading();
        const bar = els.readingProgress;
        const handler = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
            bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        };
        state.progressHandler = handler;
        window.addEventListener("scroll", handler, { passive: true });
        handler();

        state.verseObserver = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible) {
                state.currentVerse = Number(visible.target.dataset.verse);
                saveLastRead();
            }
        }, { rootMargin: "-30% 0px -50% 0px", threshold: [0.25, 0.5] });

        document.querySelectorAll(".verse-container").forEach((node) => state.verseObserver.observe(node));
    }

    function isBookmarked(ayahNumber) {
        return state.bookmarks.some((item) => item.ayahNumber === ayahNumber);
    }

    const BISMILLAH_ARABIC = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
    const BISMILLAH_LETTERS = "بسماللهالرحمنالرحيم";

    function stripArabicMarks(text) {
        return text
            .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u08F0-\u08FF\u0640]/g, "")
            .replace(/[ٱأإآ]/g, "ا")
            .replace(/[ىی]/g, "ي");
    }

    function stripLeadingBismillah(text) {
        if (!text) return text;
        let source = text.trim();
        if (source.startsWith("\uFDFD")) source = source.slice(1).trim();

        const compact = stripArabicMarks(source).replace(/\s+/g, "");
        if (!compact.startsWith(BISMILLAH_LETTERS)) return text.trim();

        let letters = 0;
        let index = 0;
        while (index < source.length && letters < BISMILLAH_LETTERS.length) {
            const char = source[index];
            if (/\s/.test(char) || /[\u064B-\u065F\u0670\u06D6-\u06ED\u08F0-\u08FF\u0640]/.test(char)) {
                index += 1;
                continue;
            }
            const normalized = char.replace(/[ٱأإآ]/g, "ا").replace(/[ىی]/g, "ي");
            if (normalized !== BISMILLAH_LETTERS[letters]) return text.trim();
            letters += 1;
            index += 1;
        }
        while (index < source.length && /[\u064B-\u065F\u0670\u06D6-\u06ED\u08F0-\u08FF\u0640]/.test(source[index])) {
            index += 1;
        }
        while (index < source.length && /\s/.test(source[index])) {
            index += 1;
        }
        const remainder = source.slice(index).trim();
        return remainder || text.trim();
    }

    function stripLeadingBismillahTranslation(text) {
        if (!text) return text;
        return text.replace(
            /^\s*in the name of allah,?\s*(the (entirely|most) (merciful|gracious),?\s*(and )?the (especially|most) merciful)\.?\s*/i,
            ""
        ).trim() || text.trim();
    }

    function displaySurah(arabicSurah, translationSurah, scrollToVerse) {
        state.currentSurah = arabicSurah.number;
        state.currentVerse = scrollToVerse || 1;
        state.verseMap.clear();
        const langName = LANGUAGES[state.language]?.name || state.language;
        const prevDisabled = arabicSurah.number <= 1 ? "disabled" : "";
        const nextDisabled = arabicSurah.number >= 114 ? "disabled" : "";
        const stripFirstAyahBismillah = arabicSurah.number !== 1 && arabicSurah.number !== 9;
        const arabicOnly = isArabicOnly();
        const verses = arabicSurah.ayahs.map((ayah, index) => {
            let arabic = ayah.text;
            let translation = "";
            if (!arabicOnly) {
                translation = translationSurah.ayahs[index]?.text || "Translation not available";
            }
            if (stripFirstAyahBismillah && ayah.numberInSurah === 1) {
                arabic = stripLeadingBismillah(arabic);
                if (translation) translation = stripLeadingBismillahTranslation(translation);
            }
            state.verseMap.set(ayah.number, {
                arabic,
                translation,
                verseNumber: ayah.numberInSurah,
                surahNumber: arabicSurah.number,
                surahName: arabicSurah.englishName
            });
            const marked = isBookmarked(ayah.number);
            return `
                <article class="verse-container${marked ? " bookmarked" : ""}" id="verse-${ayah.number}" data-verse="${ayah.numberInSurah}" data-ayah="${ayah.number}">
                    <div class="verse-header">
                        <div class="verse-number-display">${arabicSurah.number}:${ayah.numberInSurah}</div>
                        <div class="verse-actions">
                            <button class="verse-action-btn" type="button" data-action="ayah-audio" data-ayah="${ayah.number}" aria-label="Play verse">▶</button>
                            <button class="verse-action-btn" type="button" data-action="copy" data-ayah="${ayah.number}" aria-label="Copy verse">Copy</button>
                            <button class="verse-action-btn" type="button" data-action="share" data-ayah="${ayah.number}" aria-label="Share verse">Share</button>
                            <button class="verse-action-btn${marked ? " bookmarked" : ""}" type="button" data-action="bookmark" data-ayah="${ayah.number}" aria-label="Bookmark verse">${marked ? "Saved" : "Save"}</button>
                            <button class="verse-action-btn" type="button" data-action="tafsir" data-verse-key="${arabicSurah.number}:${ayah.numberInSurah}" aria-expanded="false">Tafsir</button>
                        </div>
                    </div>
                    <div class="arabic-verse" lang="ar" dir="rtl">${escapeHtml(arabic)}</div>
                    ${translation ? `<div class="verse-translation">${escapeHtml(translation)}</div>` : ""}
                    <div class="tafsir-panel" data-tafsir-panel="${arabicSurah.number}:${ayah.numberInSurah}" hidden></div>
                </article>
            `;
        }).join("");

        const bismillah = arabicSurah.number !== 1 && arabicSurah.number !== 9 ? `
            <div class="bismillah">
                <div class="bismillah-arabic" lang="ar" dir="rtl">${BISMILLAH_ARABIC}</div>
                <div class="bismillah-translation">In the name of Allah, the Most Gracious, the Most Merciful</div>
            </div>
        ` : "";

        const fav = isFavoriteSurah(arabicSurah.number);
        els.surahReading.innerHTML = `
            <div class="reading-toolbar">
                <div class="toolbar-group">
                    <button class="back-btn" type="button" data-nav="home">← Surahs</button>
                    <button class="btn secondary" type="button" data-action="prev-surah" ${prevDisabled}>Previous</button>
                    <button class="btn secondary" type="button" data-action="next-surah" ${nextDisabled}>Next</button>
                </div>
                <div class="toolbar-group">
                    <button class="btn secondary${fav ? " active" : ""}" type="button" data-action="favorite-surah" data-surah="${arabicSurah.number}" aria-pressed="${fav}">${fav ? "★ Favorited" : "☆ Favorite"}</button>
                    <label class="visually-hidden" for="tafsirSelect">Tafsir source</label>
                    <select class="language-selector" id="tafsirSelect" data-action="tafsir-source">${tafsirOptions()}</select>
                    <button class="btn secondary" type="button" data-action="font-down" aria-label="Decrease text size">A−</button>
                    <button class="btn secondary" type="button" data-action="font-up" aria-label="Increase text size">A+</button>
                </div>
            </div>
            <article class="surah-reading">
                <header class="surah-header-reading">
                    <h2>${escapeHtml(arabicSurah.englishName)}</h2>
                    <div class="surah-arabic-title" lang="ar" dir="rtl">${escapeHtml(arabicSurah.name)}</div>
                    <div class="surah-meta">${escapeHtml(arabicSurah.englishNameTranslation)} · ${arabicSurah.numberOfAyahs} verses · ${escapeHtml(arabicSurah.revelationType)} · ${escapeHtml(langName)}</div>
                    <audio class="audio-player" controls src="${AUDIO_SURAH}/${arabicSurah.number}.mp3"></audio>
                </header>
                ${bismillah}
                ${verses}
            </article>
        `;

        showView("reading");
        setupReadingProgress();
        saveLastRead();
        const player = els.surahReading.querySelector(".audio-player");
        player?.addEventListener("play", () => {
            if (state.ayahAudio) {
                state.ayahAudio.pause();
                state.ayahAudio = null;
            }
        });

        if (scrollToVerse) {
            requestAnimationFrame(() => {
                const target = document.querySelector(`[data-verse="${scrollToVerse}"]`);
                if (target) {
                    target.classList.add("highlight");
                    target.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => target.classList.remove("highlight"), 1800);
                }
            });
        }
    }

    function tafsirLangCode() {
        return LANGUAGES[state.language]?.tafsirLang || "en";
    }

    function tafsirEntries() {
        const lang = tafsirLangCode();
        return Object.entries(TAFSIRS).filter(([, item]) => item.lang === lang);
    }

    function resolveTafsirId(preferred) {
        const legacy = LEGACY_TAFSIR[preferred] || LEGACY_TAFSIR[Number(preferred)];
        const candidate = legacy || preferred;
        const lang = tafsirLangCode();
        if (candidate && TAFSIRS[candidate]?.lang === lang) return candidate;
        return tafsirEntries()[0]?.[0] || "en-ibn-kathir";
    }

    function applyTafsirForLanguage({ persist = true } = {}) {
        const preferred = state.tafsirByLang[tafsirLangCode()] || state.tafsirId;
        const nextId = resolveTafsirId(preferred);
        state.tafsirId = nextId;
        if (persist) {
            localStorage.setItem("quranTafsir", nextId);
            state.tafsirByLang[tafsirLangCode()] = nextId;
            saveJson("quranTafsirByLang", state.tafsirByLang);
        }
    }

    function tafsirOptions() {
        applyTafsirForLanguage({ persist: false });
        return tafsirEntries().map(([id, tafsir]) =>
            `<option value="${escapeHtml(id)}" ${id === state.tafsirId ? "selected" : ""}>${escapeHtml(tafsir.name)}</option>`
        ).join("");
    }

    function tafsirPlainText(raw) {
        const parsed = new DOMParser().parseFromString(String(raw || ""), "text/html");
        return (parsed.body.textContent || "").replace(/\u00a0/g, " ").replace(/\s+\n/g, "\n").trim();
    }

    function renderTafsirPanel(panel, { loading, error, text, source }) {
        panel.replaceChildren();
        if (loading) {
            const status = document.createElement("p");
            status.className = "tafsir-status";
            status.textContent = "Loading tafsir…";
            panel.appendChild(status);
            return;
        }
        if (error) {
            const status = document.createElement("p");
            status.className = "tafsir-status";
            status.textContent = error;
            panel.appendChild(status);
            return;
        }
        const meta = document.createElement("p");
        meta.className = "tafsir-source";
        meta.textContent = `${source}. Scholarly commentary — not a substitute for the Quran.`;
        panel.appendChild(meta);
        const body = document.createElement("div");
        body.className = "tafsir-body";
        const sourceInfo = TAFSIRS[state.tafsirId];
        if (sourceInfo?.lang) body.lang = sourceInfo.lang;
        if (sourceInfo?.rtl) body.dir = "rtl";
        text.split(/\n{2,}/).forEach((paragraph) => {
            const p = document.createElement("p");
            p.textContent = paragraph.trim();
            if (p.textContent) body.appendChild(p);
        });
        if (!body.childElementCount) {
            const p = document.createElement("p");
            p.textContent = text;
            body.appendChild(p);
        }
        panel.appendChild(body);
    }

    async function toggleTafsir(verseKey, button) {
        const panel = document.querySelector(`[data-tafsir-panel="${verseKey}"]`);
        if (!panel || !verseKey) return;

        const opening = panel.hidden;
        document.querySelectorAll(".tafsir-panel").forEach((node) => {
            if (node !== panel) node.hidden = true;
        });
        document.querySelectorAll('[data-action="tafsir"]').forEach((node) => {
            node.setAttribute("aria-expanded", node === button && opening ? "true" : "false");
        });

        if (!opening) {
            panel.hidden = true;
            return;
        }

        panel.hidden = false;
        const cacheKey = `${state.tafsirId}:${verseKey}`;
        if (state.tafsirCache.has(cacheKey)) {
            renderTafsirPanel(panel, state.tafsirCache.get(cacheKey));
            return;
        }

        renderTafsirPanel(panel, { loading: true });
        try {
            const payload = await loadTafsirPayload(verseKey);
            state.tafsirCache.set(cacheKey, payload);
            renderTafsirPanel(panel, payload);
        } catch (error) {
            console.error(error);
            renderTafsirPanel(panel, { error: "Could not load tafsir for this verse." });
        }
    }

    async function loadTafsirPayload(verseKey) {
        const tafsir = TAFSIRS[state.tafsirId];
        if (!tafsir) throw new Error("missing tafsir");
        if (tafsir.quranId) {
            const data = await fetchJson(`${TAFSIR_API}/tafsirs/${tafsir.quranId}/by_ayah/${verseKey}`);
            const text = tafsirPlainText(data.tafsir?.text);
            if (!text) throw new Error("empty");
            return { text, source: data.tafsir?.resource_name || tafsir.name };
        }
        const [surah, ayah] = String(verseKey).split(":");
        const data = await fetchJson(`${TAFSIR_CDN}/${encodeURIComponent(tafsir.slug)}/${Number(surah)}/${Number(ayah)}.json`);
        const text = tafsirPlainText(data.text);
        if (!text) throw new Error("empty");
        return { text, source: tafsir.name };
    }

    async function readSurah(number, scrollToVerse) {
        stopAudio();
        showView("reading");
        els.surahReading.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading Surah…</p></div>';
        try {
            const arabic = await fetchJson(`${API_BASE}/surah/${number}`);
            if (arabic.code !== 200) throw new Error("Bad API response");
            let translation = arabic;
            if (!isArabicOnly()) {
                translation = await fetchJson(`${API_BASE}/surah/${number}/${state.language}`);
                if (translation.code !== 200) throw new Error("Bad API response");
            }
            displaySurah(arabic.data, translation.data, scrollToVerse);
        } catch (error) {
            console.error(error);
            els.surahReading.innerHTML = '<div class="error-message">Could not load this surah. Please try again.</div>';
            notify("Failed to load surah.", "error");
        }
    }

    function verseShareText(verse) {
        const arabic = verse.arabic || verse.arabicText || "";
        const translation = verse.translation;
        const ref = `— Surah ${verse.surahName}, ${verse.verseNumber}`;
        return translation ? `${arabic}\n\n"${translation}"\n\n${ref}` : `${arabic}\n\n${ref}`;
    }

    async function copyVerse(ayahNumber) {
        const verse = state.verseMap.get(ayahNumber) || state.bookmarks.find((item) => item.ayahNumber === ayahNumber);
        if (!verse) return;
        const text = verseShareText(verse);
        try {
            await navigator.clipboard.writeText(text);
            notify("Verse copied.");
        } catch {
            notify("Could not copy verse.", "error");
        }
    }

    async function shareVerse(ayahNumber) {
        const verse = state.verseMap.get(ayahNumber);
        if (!verse) return;
        const text = verseShareText(verse);
        if (navigator.share) {
            try {
                await navigator.share({ title: `Surah ${verse.surahName}`, text });
                return;
            } catch (error) {
                if (error.name === "AbortError") return;
            }
        }
        copyVerse(ayahNumber);
    }

    function closeModal() {
        els.appModal.classList.remove("open");
        els.modalContent.innerHTML = "";
    }

    function openModal(html) {
        els.modalContent.innerHTML = html;
        els.appModal.classList.add("open");
        const focusable = els.modalContent.querySelector("button, [href], input, select, textarea");
        focusable?.focus();
    }

    function addBookmark(ayahNumber, category) {
        const verse = state.verseMap.get(ayahNumber);
        if (!verse) return;
        state.bookmarks.push({
            ayahNumber,
            surahName: verse.surahName,
            verseNumber: verse.verseNumber,
            surahNumber: verse.surahNumber,
            arabicText: verse.arabic,
            translation: verse.translation,
            category,
            timestamp: new Date().toISOString()
        });
        saveBookmarks();
        const btn = document.querySelector(`[data-action="bookmark"][data-ayah="${ayahNumber}"]`);
        const card = document.getElementById(`verse-${ayahNumber}`);
        btn?.classList.add("bookmarked");
        if (btn) btn.textContent = "Saved";
        card?.classList.add("bookmarked");
        notify(`Saved in ${CATEGORIES[category]}.`);
        closeModal();
    }

    function promptBookmark(ayahNumber) {
        if (isBookmarked(ayahNumber)) {
            state.bookmarks = state.bookmarks.filter((item) => item.ayahNumber !== ayahNumber);
            saveBookmarks();
            const btn = document.querySelector(`[data-action="bookmark"][data-ayah="${ayahNumber}"]`);
            const card = document.getElementById(`verse-${ayahNumber}`);
            btn?.classList.remove("bookmarked");
            if (btn) btn.textContent = "Save";
            card?.classList.remove("bookmarked");
            notify("Bookmark removed.");
            return;
        }
        const options = Object.entries(CATEGORIES).map(([id, label], index) => `
            <label><input type="radio" name="bookmarkCategory" value="${id}" ${index === 0 ? "checked" : ""}> ${escapeHtml(label)}</label>
        `).join("");
        openModal(`
            <h3 id="modalTitle">Bookmark category</h3>
            <div class="category-options">${options}</div>
            <div class="modal-actions">
                <button class="modal-btn secondary" type="button" data-action="close-modal">Cancel</button>
                <button class="modal-btn primary" type="button" data-action="confirm-bookmark" data-ayah="${ayahNumber}">Save</button>
            </div>
        `);
    }

    function renderCategoryFilters() {
        els.bookmarkCategories.innerHTML = ["all", ...Object.keys(CATEGORIES)].map((id) => `
            <button class="category-filter${state.category === id ? " active" : ""}" type="button" data-category="${id}">
                ${id === "all" ? "All" : CATEGORIES[id]}
            </button>
        `).join("");
    }

    function renderBookmarks() {
        renderCategoryFilters();
        const list = state.category === "all"
            ? state.bookmarks
            : state.bookmarks.filter((item) => item.category === state.category);
        if (!list.length) {
            els.bookmarksList.innerHTML = `
                <div class="empty-state">
                    <h3>No bookmarks yet</h3>
                    <p>${state.category === "all" ? "Save verses while reading and they will appear here." : "Nothing in this category."}</p>
                </div>
            `;
            return;
        }
        els.bookmarksList.innerHTML = list.map((bookmark) => {
            const index = state.bookmarks.indexOf(bookmark);
            const options = Object.entries(CATEGORIES).map(([id, label]) =>
                `<option value="${id}" ${bookmark.category === id ? "selected" : ""}>${escapeHtml(label)}</option>`
            ).join("");
            return `
                <article class="bookmark-item">
                    <div class="bookmark-meta">
                        <span>Surah ${escapeHtml(bookmark.surahName)} · verse ${bookmark.verseNumber}</span>
                        <span>${new Date(bookmark.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div class="bookmark-category-selector">
                        <select data-action="bookmark-category" data-index="${index}">${options}</select>
                    </div>
                    <div class="bookmark-arabic" lang="ar" dir="rtl">${escapeHtml(bookmark.arabicText)}</div>
                    <p>${escapeHtml(bookmark.translation)}</p>
                    <div class="bookmark-actions">
                        <button class="bookmark-action-btn" type="button" data-action="copy-bookmark" data-index="${index}">Copy</button>
                        <button class="bookmark-action-btn" type="button" data-action="goto-bookmark" data-index="${index}">Open</button>
                        <button class="bookmark-action-btn remove" type="button" data-action="remove-bookmark" data-index="${index}">Remove</button>
                    </div>
                </article>
            `;
        }).join("");
    }

    function exportBookmarks() {
        if (!state.bookmarks.length) {
            notify("No bookmarks to export.", "error");
            return;
        }
        const blob = new Blob([JSON.stringify(state.bookmarks, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `quran-bookmarks-${todayKey()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        notify("Bookmarks exported.");
    }

    function importBookmarks(file) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                if (!Array.isArray(parsed)) throw new Error("Invalid file");
                const incoming = parsed.filter((item) => item.ayahNumber && item.arabicText);
                const existing = new Set(state.bookmarks.map((item) => item.ayahNumber));
                incoming.forEach((item) => {
                    if (!existing.has(item.ayahNumber)) state.bookmarks.push(item);
                });
                saveBookmarks();
                renderBookmarks();
                notify("Bookmarks imported.");
            } catch {
                notify("Could not import that file.", "error");
            }
        };
        reader.readAsText(file);
    }

    function parseAladhanDate(value) {
        const [day, month, year] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    function padDatePart(value) {
        return String(value).padStart(2, "0");
    }

    async function mapPool(items, limit, mapper) {
        const results = new Array(items.length);
        let next = 0;
        async function worker() {
            while (next < items.length) {
                const index = next;
                next += 1;
                results[index] = await mapper(items[index], index);
            }
        }
        await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
        return results;
    }

    async function hijriToGregorian(day, month, year) {
        const data = await fetchJson(`${ALADHAN}/hToG/${padDatePart(day)}-${padDatePart(month)}-${year}`);
        const gregorian = data.data.gregorian;
        return {
            date: parseAladhanDate(gregorian.date),
            display: `${gregorian.weekday.en}, ${gregorian.day} ${gregorian.month.en} ${gregorian.year}`
        };
    }

    async function renderCalendar() {
        els.holidaysList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading Islamic dates…</p></div>';
        try {
            const todayData = await fetchJson(`${ALADHAN}/gToH`);
            const hijri = todayData.data.hijri;
            const hijriYear = Number(hijri.year);
            const hijriMonth = Number(hijri.month.number);
            const hijriDay = Number(hijri.day);
            els.hijriToday.textContent = `Today: ${hijri.day} ${hijri.month.en} ${hijri.year} AH`;

            const jobs = [];
            for (const year of [hijriYear, hijriYear + 1]) {
                HIJRI_EVENTS.forEach((event) => {
                    if (year === hijriYear && (event.month < hijriMonth || (event.month === hijriMonth && event.day < hijriDay))) {
                        return;
                    }
                    jobs.push({ ...event, hijriYear: year });
                });
            }

            const converted = (await mapPool(jobs, 3, async (event) => {
                try {
                    const gregorian = await hijriToGregorian(event.day, event.month, event.hijriYear);
                    return { ...event, ...gregorian };
                } catch {
                    return null;
                }
            })).filter(Boolean);

            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const upcoming = converted
                .filter((event) => event.date >= startOfToday)
                .sort((a, b) => a.date - b.date)
                .slice(0, 12);

            if (!upcoming.length) {
                els.holidaysList.innerHTML = '<div class="error-message">No upcoming dates were returned. Please try again shortly.</div>';
                return;
            }

            els.holidaysList.innerHTML = upcoming.map((event) => {
                const diff = Math.round((event.date - startOfToday) / 86400000);
                const today = diff === 0;
                const soon = diff > 0 && diff <= 30;
                return `
                    <article class="holiday-item${today ? " today" : soon ? " upcoming" : ""}">
                        <div class="holiday-name">
                            ${escapeHtml(event.name)}
                            ${today ? '<span class="badge today">Today</span>' : soon ? `<span class="badge">In ${diff} days</span>` : ""}
                        </div>
                        <div class="holiday-date">${escapeHtml(event.display)} · ${event.day}/${event.month}/${event.hijriYear} AH</div>
                        <p>${escapeHtml(event.description)}</p>
                    </article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            els.holidaysList.innerHTML = '<div class="error-message">Could not load the Islamic calendar right now.</div>';
        }
    }

    function prayerLabel(name) {
        return {
            Fajr: "Fajr",
            Sunrise: "Sunrise",
            Dhuhr: "Dhuhr",
            Asr: "Asr",
            Maghrib: "Maghrib",
            Isha: "Isha",
            Jumua: "Jumu'ah",
            Jumua2: "Jumu'ah 2"
        }[name] || name;
    }

    function nextPrayer(timings) {
        const order = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const now = new Date();
        for (const name of order) {
            if (!timings[name]) continue;
            const when = prayerClock(timings[name]);
            if (when && when > now) return name;
        }
        return "Fajr";
    }

    function prayerClock(hhmm, dayOffset = 0) {
        const match = String(hhmm || "").trim().match(/^(\d{1,2}):(\d{2})/);
        if (!match) return null;
        const when = new Date();
        when.setDate(when.getDate() + dayOffset);
        when.setHours(Number(match[1]), Number(match[2]), 0, 0);
        return when;
    }

    function addMinutes(hhmm, offset) {
        const raw = String(offset ?? "").trim();
        if (!raw) return "";
        if (raw.includes(":")) return raw.slice(0, 5);
        const mins = Number(raw.replace("+", ""));
        if (!Number.isFinite(mins)) return "";
        const when = prayerClock(hhmm);
        if (!when) return "";
        when.setMinutes(when.getMinutes() + mins);
        return `${String(when.getHours()).padStart(2, "0")}:${String(when.getMinutes()).padStart(2, "0")}`;
    }

    function haversineKm(lat1, lng1, lat2, lng2) {
        const toRad = (value) => (value * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function mosqueTimings(mosque) {
        const names = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const out = {};
        names.forEach((name, index) => {
            out[name] = String(mosque?.times?.[index] || "").slice(0, 5);
        });
        if (mosque?.jumua) out.Jumua = String(mosque.jumua).slice(0, 5);
        if (mosque?.jumua2) out.Jumua2 = String(mosque.jumua2).slice(0, 5);
        return out;
    }

    function mosqueIqama(mosque, name) {
        const index = { Fajr: 0, Dhuhr: 1, Asr: 2, Maghrib: 3, Isha: 4 }[name];
        if (index == null) return "";
        const adhan = mosqueTimings(mosque)[name];
        return addMinutes(adhan, mosque?.iqama?.[index]);
    }

    function currentAlertTimings() {
        if (state.prayer.mosque?.times) return mosqueTimings(state.prayer.mosque);
        return state.prayer.timings || null;
    }

    function savePrayerPrefs() {
        saveJson("quranPrayerPrefs", {
            method: state.prayer.method,
            city: state.prayer.city || "",
            country: state.prayer.country || "",
            lat: state.prayer.lat ?? null,
            lng: state.prayer.lng ?? null,
            mosque: state.prayer.mosque || null,
            alertsEnabled: Boolean(state.prayer.alertsEnabled),
            alertLead: Number(state.prayer.alertLead) || 10
        });
    }

    function prayerTimeNames(timings) {
        const names = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
        if (timings?.Jumua) names.push("Jumua");
        if (timings?.Jumua2) names.push("Jumua2");
        return names;
    }

    function renderPrayerGrid(timings, mosque) {
        const next = nextPrayer(timings);
        els.prayerGrid.classList.toggle("mawaqit", Boolean(mosque));
        els.prayerGrid.innerHTML = prayerTimeNames(timings).map((name) => {
            const iqama = mosque ? mosqueIqama(mosque, name) : "";
            return `
                <article class="prayer-card${name === next ? " next" : ""}">
                    <div class="prayer-name">${prayerLabel(name)}${name === next ? " · next" : ""}</div>
                    <div class="prayer-time">${escapeHtml(timings[name] || "--:--")}</div>
                    ${iqama && name !== "Sunrise" && name !== "Jumua" && name !== "Jumua2" ? `<div class="prayer-iqama">Iqama ${escapeHtml(iqama)}</div>` : ""}
                </article>
            `;
        }).join("");
    }

    function mosqueCardHtml(mosque, { selected = false, compact = false } = {}) {
        const timings = mosqueTimings(mosque);
        const km = state.prayer.lat != null && mosque.latitude != null
            ? haversineKm(state.prayer.lat, state.prayer.lng, mosque.latitude, mosque.longitude)
            : null;
        const times = prayerTimeNames(timings).map((name) => `
            <div>
                <span>${prayerLabel(name)}</span>
                <strong>${escapeHtml(timings[name] || "--:--")}</strong>
            </div>
        `).join("");
        return `
            <article class="mosque-card${selected ? " active" : ""}">
                <div class="mosque-card-top">
                    <div>
                        <h4>${escapeHtml(mosque.name || mosque.label || "Mosque")}</h4>
                        <p class="mosque-meta">${escapeHtml(mosque.localisation || "")}${km != null ? ` · ${km < 10 ? km.toFixed(1) : Math.round(km)} km` : ""}</p>
                    </div>
                </div>
                ${compact ? "" : `<div class="mosque-times">${times}</div>`}
                <div class="mosque-actions">
                    ${selected
                        ? `<button class="btn secondary" type="button" data-action="clear-mosque">Use calculated times</button>`
                        : `<button class="btn" type="button" data-action="select-mosque" data-uuid="${escapeHtml(mosque.uuid)}">Use this mosque</button>`}
                    ${mosque.slug ? `<a class="btn secondary" href="https://mawaqit.net/en/${encodeURIComponent(mosque.slug)}" target="_blank" rel="noopener noreferrer">Mawaqit</a>` : ""}
                </div>
            </article>
        `;
    }

    function renderMosqueList() {
        if (!els.mosqueList) return;
        const selectedId = state.prayer.mosque?.uuid;
        if (state.prayer.mosque) {
            els.selectedMosque.innerHTML = mosqueCardHtml(state.prayer.mosque, { selected: true, compact: true });
        } else {
            els.selectedMosque.innerHTML = "";
        }
        const others = state.nearbyMosques.filter((mosque) => mosque.uuid !== selectedId).slice(0, 8);
        els.mosqueList.innerHTML = others.map((mosque) => mosqueCardHtml(mosque)).join("");
    }

    function jsonpGet(url, timeoutMs = 12000) {
        return new Promise((resolve, reject) => {
            const callback = `mq_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
            const script = document.createElement("script");
            let done = false;
            const finish = (error, data) => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                delete window[callback];
                script.remove();
                if (error) reject(error);
                else resolve(data);
            };
            const timer = setTimeout(() => finish(new Error("timeout")), timeoutMs);
            window[callback] = (data) => finish(null, data);
            script.onerror = () => finish(new Error("jsonp failed"));
            script.src = url.includes("?") ? `${url}&callback=${callback}` : `${url}?callback=${callback}`;
            document.head.appendChild(script);
        });
    }

    async function fetchMawaqitSearch(params) {
        const url = `${MAWAQIT}/mosque/search?${params}`;
        const parseList = (data) => {
            if (Array.isArray(data)) return data;
            if (typeof data?.contents === "string") {
                const parsed = JSON.parse(data.contents);
                if (Array.isArray(parsed)) return parsed;
            }
            return null;
        };
        try {
            const response = await fetch(url);
            if (response.ok) {
                const list = parseList(await response.json());
                if (list) return list;
            }
        } catch {
            /* CORS is expected from some browsers */
        }
        const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
        ];
        for (const attempt of proxies) {
            try {
                const response = await fetch(attempt);
                if (!response.ok) continue;
                const list = parseList(await response.json());
                if (list) return list;
            } catch {
                /* try next */
            }
        }
        const jsonpSources = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
            `https://jsonp.afeld.me/?url=${encodeURIComponent(url)}`
        ];
        for (const source of jsonpSources) {
            try {
                const wrapped = await jsonpGet(source);
                const list = parseList(wrapped);
                if (list) return list;
            } catch {
                /* try next */
            }
        }
        throw new Error("Mawaqit search failed");
    }

    async function loadNearbyMosques({ lat, lng, word } = {}) {
        if (!els.mosqueStatus) return;
        els.mosqueStatus.textContent = "Loading nearby mosques from Mawaqit…";
        try {
            const params = word
                ? `word=${encodeURIComponent(word)}`
                : `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
            const list = await fetchMawaqitSearch(params);
            state.nearbyMosques = list.filter((item) => item && item.uuid && Array.isArray(item.times));
            if (lat != null && lng != null) {
                state.nearbyMosques.sort((a, b) =>
                    haversineKm(lat, lng, a.latitude, a.longitude) - haversineKm(lat, lng, b.latitude, b.longitude)
                );
            }
            if (state.prayer.mosque?.uuid) {
                const fresh = state.nearbyMosques.find((item) => item.uuid === state.prayer.mosque.uuid);
                if (fresh) {
                    state.prayer.mosque = slimMosque(fresh);
                    savePrayerPrefs();
                    renderPrayerGrid(mosqueTimings(fresh), fresh);
                }
            }
            els.mosqueStatus.textContent = state.nearbyMosques.length
                ? `${state.nearbyMosques.length} mosque${state.nearbyMosques.length === 1 ? "" : "s"} found. Times are from Mawaqit.`
                : "No Mawaqit mosques found for that search.";
            renderMosqueList();
        } catch (error) {
            console.error(error);
            els.mosqueStatus.innerHTML = 'Could not load Mawaqit mosques from the browser. <a href="https://mawaqit.net/en" target="_blank" rel="noopener noreferrer">Open Mawaqit</a>';
        }
    }

    function slimMosque(mosque) {
        return {
            uuid: mosque.uuid,
            name: mosque.name || mosque.label,
            slug: mosque.slug,
            localisation: mosque.localisation,
            latitude: mosque.latitude,
            longitude: mosque.longitude,
            times: mosque.times,
            iqama: mosque.iqama,
            jumua: mosque.jumua,
            jumua2: mosque.jumua2
        };
    }

    function selectMosque(uuid) {
        const mosque = state.nearbyMosques.find((item) => item.uuid === uuid);
        if (!mosque) return;
        state.prayer.mosque = slimMosque(mosque);
        savePrayerPrefs();
        els.prayerStatus.textContent = `${mosque.name || "Mosque"} · Mawaqit`;
        renderPrayerGrid(mosqueTimings(mosque), mosque);
        renderMosqueList();
        notify(`Using ${mosque.name || "this mosque"} prayer times.`);
        schedulePrayerAlerts();
    }

    function clearMosque() {
        state.prayer.mosque = null;
        savePrayerPrefs();
        if (state.prayer.timings) {
            renderPrayerGrid(state.prayer.timings);
            els.prayerStatus.textContent = "Calculated prayer times";
        }
        renderMosqueList();
        notify("Using calculated prayer times.", "info");
        schedulePrayerAlerts();
    }

    function playAlertChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            [0, 0.22].forEach((offset, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.value = index === 0 ? 660 : 880;
                gain.gain.setValueAtTime(0.0001, now + offset);
                gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + offset);
                osc.stop(now + offset + 0.4);
            });
            setTimeout(() => ctx.close().catch(() => {}), 1200);
        } catch {
            /* ignore */
        }
    }

    function showPrayerAlert(name, remainingMs, { test = false } = {}) {
        const minutes = Math.max(0, Math.round(remainingMs / 60000));
        const atTime = remainingMs <= 45000;
        const title = prayerLabel(name);
        const body = atTime
            ? `It is time for ${title}.`
            : `${title} is in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
        const message = test ? `This is a test. ${body}` : body;
        if (els.prayerAlert) {
            els.prayerAlert.hidden = false;
            els.prayerAlertKicker.textContent = test
                ? "Test alert"
                : atTime ? "Prayer time" : "Upcoming prayer";
            els.prayerAlertTitle.textContent = title;
            els.prayerAlertBody.textContent = message;
        }
        playAlertChime();
        sendPrayerNotification(`${test ? "Test · " : ""}${title} prayer`, message, name);
    }

    function sendPrayerNotification(title, body, tag) {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        try {
            const note = new Notification(title, {
                body,
                tag: `digital-quran-${tag || "prayer"}`,
                icon: "favicon.svg"
            });
            note.onclick = () => {
                window.focus();
                note.close();
            };
        } catch {
            /* ignore */
        }
    }

    async function testPrayerAlert() {
        if ("Notification" in window && Notification.permission === "default") {
            try {
                await Notification.requestPermission();
            } catch {
                /* ignore */
            }
        }
        const timings = currentAlertTimings();
        let name = timings ? nextPrayer(timings) : "Maghrib";
        if (name === "Sunrise") name = "Dhuhr";
        const lead = Number(els.prayerAlertLead?.value ?? state.prayer.alertLead) || 0;
        showPrayerAlert(name, lead * 60000, { test: true });
        if (!("Notification" in window)) {
            notify("Popup shown. This browser has no system notifications.", "info");
        } else if (Notification.permission !== "granted") {
            notify("Popup shown. Allow notifications to also get a system alert.", "info");
        }
    }

    function dismissPrayerAlert() {
        if (els.prayerAlert) els.prayerAlert.hidden = true;
    }

    function checkPrayerAlerts() {
        if (!state.prayer.alertsEnabled) return;
        const timings = currentAlertTimings();
        if (!timings) return;
        const lead = Number(state.prayer.alertLead) || 0;
        const names = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
        if (new Date().getDay() === 5 && timings.Jumua) names.push("Jumua");
        names.forEach((name) => {
            const when = prayerClock(timings[name]);
            if (!when) return;
            const remaining = when.getTime() - Date.now();
            const leadMs = lead * 60000;
            if (remaining < -30000 || remaining > leadMs + 25000) return;
            const key = `${todayKey()}:${name}:${lead}`;
            if (state.alertedPrayers.has(key)) return;
            state.alertedPrayers.add(key);
            showPrayerAlert(name, remaining);
        });
    }

    function schedulePrayerAlerts() {
        if (state.prayerTick) clearInterval(state.prayerTick);
        if (!state.prayer.alertsEnabled) return;
        checkPrayerAlerts();
        state.prayerTick = setInterval(checkPrayerAlerts, 20000);
    }

    async function enablePrayerAlerts(enabled) {
        state.prayer.alertsEnabled = enabled;
        savePrayerPrefs();
        if (enabled) {
            if ("Notification" in window && Notification.permission === "default") {
                try {
                    await Notification.requestPermission();
                } catch {
                    /* ignore */
                }
            }
            const granted = "Notification" in window && Notification.permission === "granted";
            els.prayerAlertHint.textContent = granted
                ? "Alerts will pop up here and as a system notification."
                : "Alerts will pop up in the app. Allow notifications in the browser for a system alert too.";
            notify("Prayer alerts on.", "info");
            schedulePrayerAlerts();
        } else {
            if (state.prayerTick) clearInterval(state.prayerTick);
            state.prayerTick = null;
            els.prayerAlertHint.textContent = "Get a popup when the next prayer is near. Allow notifications for a system alert too.";
            notify("Prayer alerts off.", "info");
        }
    }

    async function loadPrayerTimes({ lat, lng, city, country }) {
        els.prayerStatus.textContent = "Loading prayer times…";
        try {
            const method = els.methodSelect.value || state.prayer.method || "3";
            let url;
            if (lat != null && lng != null) {
                url = `${ALADHAN}/timings?latitude=${lat}&longitude=${lng}&method=${method}`;
            } else {
                url = `${ALADHAN}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
            }
            const data = await fetchJson(url);
            const timings = data.data.timings;
            const hijri = data.data.date.hijri;
            const coordsLat = lat ?? data.data.meta.latitude;
            const coordsLng = lng ?? data.data.meta.longitude;
            state.prayer.method = method;
            state.prayer.city = city || state.prayer.city || "";
            state.prayer.country = country || state.prayer.country || "";
            state.prayer.lat = coordsLat ?? null;
            state.prayer.lng = coordsLng ?? null;
            state.prayer.timings = {
                Fajr: timings.Fajr.slice(0, 5),
                Sunrise: timings.Sunrise.slice(0, 5),
                Dhuhr: timings.Dhuhr.slice(0, 5),
                Asr: timings.Asr.slice(0, 5),
                Maghrib: timings.Maghrib.slice(0, 5),
                Isha: timings.Isha.slice(0, 5)
            };
            savePrayerPrefs();
            const mosque = state.prayer.mosque;
            if (mosque?.times) {
                els.prayerStatus.textContent = `${mosque.name} · Mawaqit · ${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
                renderPrayerGrid(mosqueTimings(mosque), mosque);
            } else {
                els.prayerStatus.textContent = `${data.data.meta.timezone} · ${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
                renderPrayerGrid(state.prayer.timings);
            }

            if (coordsLat != null && coordsLng != null) {
                loadNearbyMosques({ lat: coordsLat, lng: coordsLng });
            }
            schedulePrayerAlerts();
        } catch (error) {
            console.error(error);
            els.prayerStatus.textContent = "Could not load prayer times.";
            notify("Prayer times failed to load.", "error");
        }
    }

    function renderPrayer() {
        els.methodSelect.value = state.prayer.method || "3";
        els.cityInput.value = state.prayer.city || "";
        els.countryInput.value = state.prayer.country || "";
        if (els.prayerAlertsToggle) els.prayerAlertsToggle.checked = Boolean(state.prayer.alertsEnabled);
        if (els.prayerAlertLead) els.prayerAlertLead.value = String(state.prayer.alertLead ?? 10);
        renderMosqueList();
        if (state.prayer.mosque?.times) {
            els.prayerStatus.textContent = `${state.prayer.mosque.name || "Mosque"} · Mawaqit`;
            renderPrayerGrid(mosqueTimings(state.prayer.mosque), state.prayer.mosque);
        }
        if (state.prayer.lat != null && state.prayer.lng != null) {
            loadPrayerTimes({ lat: state.prayer.lat, lng: state.prayer.lng });
        } else if (state.prayer.city && state.prayer.country) {
            loadPrayerTimes({ city: state.prayer.city, country: state.prayer.country });
        }
    }

    function renderDhikr() {
        state.dhikr = loadDhikr();
        els.dhikrGrid.innerHTML = DHIKR_ITEMS.map((item) => {
            const count = state.dhikr.counts[item.id] || 0;
            const percent = Math.min(100, (count / item.target) * 100);
            return `
                <button class="dhikr-card" type="button" data-action="dhikr" data-id="${item.id}">
                    <div class="dhikr-arabic" lang="ar" dir="rtl">${item.arabic}</div>
                    <strong>${escapeHtml(item.translit)}</strong>
                    <p>${escapeHtml(item.meaning)}</p>
                    <div class="dhikr-count">${count}</div>
                    <div class="dhikr-progress" aria-hidden="true"><span style="width:${percent}%"></span></div>
                    <small>Target ${item.target}</small>
                </button>
            `;
        }).join("");
    }

    function bumpDhikr(id) {
        state.dhikr = loadDhikr();
        state.dhikr.counts[id] = (state.dhikr.counts[id] || 0) + 1;
        saveJson("quranDhikr", state.dhikr);
        renderDhikr();
    }

    async function loadDailyAyah() {
        const day = Math.floor(Date.now() / 86400000);
        const ayahNumber = (day % 6236) + 1;
        try {
            const arabic = await fetchJson(`${API_BASE}/ayah/${ayahNumber}`);
            let translationText = "";
            if (!isArabicOnly()) {
                const translation = await fetchJson(`${API_BASE}/ayah/${ayahNumber}/${state.language}`);
                translationText = translation.data.text;
            }
            state.dailyAyah = {
                surah: arabic.data.surah.number,
                verse: arabic.data.numberInSurah,
                name: arabic.data.surah.englishName,
                arabic: arabic.data.text,
                translation: translationText
            };
            els.dailyAyahMeta.textContent = `Surah ${state.dailyAyah.name}, verse ${state.dailyAyah.verse}`;
            els.dailyAyahArabic.textContent = state.dailyAyah.arabic;
            els.dailyAyahTranslation.textContent = state.dailyAyah.translation;
        } catch {
            els.dailyAyahMeta.textContent = "Could not load today's ayah.";
        }
    }

    async function showRandomVerse() {
        try {
            const surahNumber = Math.floor(Math.random() * 114) + 1;
            const data = await fetchJson(`${API_BASE}/surah/${surahNumber}`);
            const ayah = data.data.ayahs[Math.floor(Math.random() * data.data.ayahs.length)];
            let translationHtml = "";
            if (!isArabicOnly()) {
                const translation = await fetchJson(`${API_BASE}/ayah/${ayah.number}/${state.language}`);
                translationHtml = `<p class="verse-translation">${escapeHtml(translation.data.text)}</p>`;
            }
            openModal(`
                <h3 id="modalTitle">Random verse</h3>
                <div class="arabic-verse" lang="ar" dir="rtl">${escapeHtml(ayah.text)}</div>
                ${translationHtml}
                <p class="ayah-meta">Surah ${escapeHtml(data.data.englishName)}, verse ${ayah.numberInSurah}</p>
                <div class="modal-actions">
                    <button class="modal-btn secondary" type="button" data-action="close-modal">Close</button>
                    <button class="modal-btn primary" type="button" data-action="read" data-surah="${surahNumber}" data-verse="${ayah.numberInSurah}">Read surah</button>
                </div>
            `);
        } catch {
            notify("Could not load a random verse.", "error");
        }
    }

    function handleClick(event) {
        const nav = event.target.closest("[data-nav]");
        if (nav) {
            event.preventDefault();
            showView(nav.dataset.nav);
            return;
        }

        const categoryBtn = event.target.closest("[data-category]");
        if (categoryBtn && categoryBtn.closest("#bookmarkCategories")) {
            state.category = categoryBtn.dataset.category;
            renderBookmarks();
            return;
        }

        const quick = event.target.closest("[data-quick]");
        if (quick) {
            els.searchInput.value = quick.dataset.quick;
            performSearch(quick.dataset.quick);
            return;
        }

        const actionEl = event.target.closest("[data-action]");
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        const surah = Number(actionEl.dataset.surah);
        const ayah = Number(actionEl.dataset.ayah);
        const index = Number(actionEl.dataset.index);

        if (action === "read") {
            closeModal();
            readSurah(surah, Number(actionEl.dataset.verse) || resumeVerseFor(surah));
        } else if (action === "play") {
            event.stopPropagation();
            playSurahAudio(surah, actionEl);
        } else if (action === "favorite-surah") {
            event.stopPropagation();
            toggleFavoriteSurah(surah);
        } else if (action === "toggle-favorites") {
            state.showFavoritesOnly = !state.showFavoritesOnly;
            renderSurahs();
        } else if (action === "copy") {
            copyVerse(ayah);
        } else if (action === "share") {
            shareVerse(ayah);
        } else if (action === "bookmark") {
            promptBookmark(ayah);
        } else if (action === "ayah-audio") {
            playAyahAudio(ayah);
        } else if (action === "tafsir") {
            toggleTafsir(actionEl.dataset.verseKey, actionEl);
        } else if (action === "confirm-bookmark") {
            const selected = document.querySelector('input[name="bookmarkCategory"]:checked');
            addBookmark(ayah, selected?.value || "general");
        } else if (action === "close-modal") {
            closeModal();
        } else if (action === "prev-surah" && state.currentSurah > 1) {
            readSurah(state.currentSurah - 1);
        } else if (action === "next-surah" && state.currentSurah < 114) {
            readSurah(state.currentSurah + 1);
        } else if (action === "font-up") {
            state.fontScale += 0.1;
            applyFontScale();
        } else if (action === "font-down") {
            state.fontScale -= 0.1;
            applyFontScale();
        } else if (action === "copy-bookmark") {
            const bookmark = state.bookmarks[index];
            if (bookmark) {
                state.verseMap.set(bookmark.ayahNumber, {
                    arabic: bookmark.arabicText,
                    translation: bookmark.translation,
                    verseNumber: bookmark.verseNumber,
                    surahName: bookmark.surahName
                });
                copyVerse(bookmark.ayahNumber);
            }
        } else if (action === "goto-bookmark") {
            const bookmark = state.bookmarks[index];
            if (bookmark) readSurah(bookmark.surahNumber, bookmark.verseNumber);
        } else if (action === "remove-bookmark") {
            state.bookmarks.splice(index, 1);
            saveBookmarks();
            renderBookmarks();
        } else if (action === "dhikr") {
            bumpDhikr(actionEl.dataset.id);
        } else if (action === "select-mosque") {
            selectMosque(actionEl.dataset.uuid);
        } else if (action === "clear-mosque") {
            clearMosque();
        } else if (action === "dismiss-prayer-alert") {
            dismissPrayerAlert();
        }
    }

    function handleChange(event) {
        if (event.target.dataset.action === "bookmark-category") {
            const index = Number(event.target.dataset.index);
            if (state.bookmarks[index]) {
                state.bookmarks[index].category = event.target.value;
                saveBookmarks();
                notify("Category updated.");
            }
        }
        if (event.target.dataset.action === "tafsir-source") {
            const nextId = event.target.value;
            if (!TAFSIRS[nextId]) return;
            state.tafsirId = nextId;
            state.tafsirByLang[tafsirLangCode()] = nextId;
            localStorage.setItem("quranTafsir", nextId);
            saveJson("quranTafsirByLang", state.tafsirByLang);
            document.querySelectorAll(".tafsir-panel").forEach((panel) => {
                panel.hidden = true;
                panel.replaceChildren();
            });
            document.querySelectorAll('[data-action="tafsir"]').forEach((node) => node.setAttribute("aria-expanded", "false"));
            notify(`Tafsir: ${TAFSIRS[nextId].name}`, "info");
        }
    }

    function setupEvents() {
        document.addEventListener("click", handleClick);
        document.addEventListener("change", handleChange);

        els.surahsGrid.addEventListener("click", (event) => {
            if (event.target.closest("[data-action]")) return;
            const card = event.target.closest(".surah-card");
            if (card) readSurah(Number(card.dataset.surah), resumeVerseFor(card.dataset.surah));
        });
        els.surahsGrid.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                if (event.target.closest("[data-action]")) return;
                const card = event.target.closest(".surah-card");
                if (card) {
                    event.preventDefault();
                    readSurah(Number(card.dataset.surah), resumeVerseFor(card.dataset.surah));
                }
            }
        });

        els.searchBtn.addEventListener("click", () => performSearch(els.searchInput.value));
        els.searchInput.addEventListener("input", () => performSearch(els.searchInput.value));
        els.searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") performSearch(els.searchInput.value);
        });
        els.randomVerseBtn.addEventListener("click", showRandomVerse);
        els.continueBtn.addEventListener("click", () => {
            if (state.lastRead) readSurah(state.lastRead.surahNumber, state.lastRead.verseNumber);
        });
        els.dailyAyahReadBtn.addEventListener("click", () => {
            if (state.dailyAyah) readSurah(state.dailyAyah.surah, state.dailyAyah.verse);
        });
        els.themeToggle.addEventListener("click", () => setTheme(state.theme === "dark" ? "light" : "dark"));
        els.languageSelector.addEventListener("change", () => {
            state.language = els.languageSelector.value;
            localStorage.setItem("quranLanguage", state.language);
            applyFontScale();
            applyTafsirForLanguage();
            const lang = LANGUAGES[state.language];
            const tafsir = TAFSIRS[state.tafsirId];
            notify(tafsir
                ? `${lang.arabicOnly ? lang.name : lang.short} · ${tafsir.name}`
                : (lang.arabicOnly ? `Language: ${lang.name}` : `Translation: ${lang.name}`), "info");
            loadDailyAyah();
            if (state.view === "reading" && state.currentSurah) readSurah(state.currentSurah, state.currentVerse);
        });

        els.exportBookmarksBtn.addEventListener("click", exportBookmarks);
        els.importBookmarksBtn.addEventListener("click", () => els.importBookmarksFile.click());
        els.importBookmarksFile.addEventListener("change", () => {
            const file = els.importBookmarksFile.files[0];
            if (file) importBookmarks(file);
            els.importBookmarksFile.value = "";
        });
        els.clearBookmarksBtn.addEventListener("click", () => {
            if (!state.bookmarks.length) return;
            if (confirm(`Clear all ${state.bookmarks.length} bookmarks?`)) {
                state.bookmarks = [];
                saveBookmarks();
                renderBookmarks();
            }
        });

        els.useLocationBtn.addEventListener("click", () => {
            if (!navigator.geolocation) {
                notify("Geolocation is not available.", "error");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => loadPrayerTimes({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => notify("Location permission was denied.", "error")
            );
        });
        els.lookupCityBtn.addEventListener("click", () => {
            const city = els.cityInput.value.trim();
            const country = els.countryInput.value.trim();
            if (!city || !country) {
                notify("Enter both city and country.", "error");
                return;
            }
            loadPrayerTimes({ city, country });
        });
        els.methodSelect.addEventListener("change", () => {
            state.prayer.method = els.methodSelect.value;
            savePrayerPrefs();
            if (state.prayer.lat != null) loadPrayerTimes({ lat: state.prayer.lat, lng: state.prayer.lng });
            else if (state.prayer.city) loadPrayerTimes({ city: state.prayer.city, country: state.prayer.country });
        });
        els.mosqueSearchBtn.addEventListener("click", () => {
            const word = els.mosqueSearchInput.value.trim();
            if (!word) {
                if (state.prayer.lat != null) loadNearbyMosques({ lat: state.prayer.lat, lng: state.prayer.lng });
                else notify("Search a mosque name or city.", "info");
                return;
            }
            loadNearbyMosques({ word });
        });
        els.mosqueSearchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") els.mosqueSearchBtn.click();
        });
        els.prayerAlertsToggle.addEventListener("change", () => {
            enablePrayerAlerts(els.prayerAlertsToggle.checked);
        });
        els.prayerAlertLead.addEventListener("change", () => {
            state.prayer.alertLead = Number(els.prayerAlertLead.value) || 0;
            savePrayerPrefs();
            schedulePrayerAlerts();
        });
        els.testPrayerAlertBtn.addEventListener("click", () => testPrayerAlert());
        els.resetDhikrBtn.addEventListener("click", () => {
            state.dhikr = { date: todayKey(), counts: Object.fromEntries(DHIKR_ITEMS.map((item) => [item.id, 0])) };
            saveJson("quranDhikr", state.dhikr);
            renderDhikr();
        });

        els.appModal.addEventListener("click", (event) => {
            if (event.target === els.appModal) closeModal();
        });
        els.prayerAlert.addEventListener("click", (event) => {
            if (event.target === els.prayerAlert) dismissPrayerAlert();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                if (els.prayerAlert && !els.prayerAlert.hidden) dismissPrayerAlert();
                else if (els.appModal.classList.contains("open")) closeModal();
                else if (state.view !== "home") showView("home");
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
                event.preventDefault();
                showView("bookmarks");
            }
            if (event.key === "/" && document.activeElement !== els.searchInput && state.view === "home") {
                event.preventDefault();
                els.searchInput.focus();
            }
            if (state.view === "reading" && !event.ctrlKey && !event.metaKey) {
                if (event.key === "ArrowLeft" && state.currentSurah > 1) readSurah(state.currentSurah - 1);
                if (event.key === "ArrowRight" && state.currentSurah < 114) readSurah(state.currentSurah + 1);
            }
        });

        window.addEventListener("online", () => notify("Connection restored."));
        window.addEventListener("offline", () => notify("You are offline. Some features may not work.", "error"));
        window.addEventListener("beforeunload", saveLastRead);
    }

    async function loadSurahs() {
        const data = await fetchJson(`${API_BASE}/surah`);
        if (data.code !== 200) throw new Error("Failed to fetch surahs");
        state.surahs = data.data;
        state.filtered = data.data;
        renderSurahs();
        els.loadingIndicator.hidden = true;
    }

    async function init() {
        cacheEls();
        fillLanguages();
        applyTafsirForLanguage();
        setTheme(state.theme);
        applyFontScale();
        updateBookmarkCount();
        renderContinue();
        setupEvents();
        if (els.prayerAlertsToggle) els.prayerAlertsToggle.checked = Boolean(state.prayer.alertsEnabled);
        if (els.prayerAlertLead) els.prayerAlertLead.value = String(state.prayer.alertLead ?? 10);
        if (state.prayer.alertsEnabled) schedulePrayerAlerts();
        if (state.prayer.lat != null && state.prayer.lng != null) {
            loadPrayerTimes({ lat: state.prayer.lat, lng: state.prayer.lng });
        } else if (state.prayer.city && state.prayer.country) {
            loadPrayerTimes({ city: state.prayer.city, country: state.prayer.country });
        }
        try {
            await Promise.all([loadSurahs(), loadDailyAyah()]);
        } catch (error) {
            console.error(error);
            els.loadingIndicator.innerHTML = '<div class="error-message">Failed to load Quran data. Please refresh.</div>';
        }
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js").catch(() => {});
        }
    }

    document.addEventListener("DOMContentLoaded", init);
})();
