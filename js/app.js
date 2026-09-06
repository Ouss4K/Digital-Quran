(() => {
    "use strict";

    const API_BASE = "https://api.alquran.cloud/v1";
    const AUDIO_SURAH = "https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy";
    const AUDIO_AYAH = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";
    const ALADHAN = "https://api.aladhan.com/v1";
    const TAFSIR_API = "https://api.quran.com/api/v4";

    const TAFSIRS = {
        169: { name: "Ibn Kathir (English, abridged)", rtl: false },
        168: { name: "Ma'arif al-Qur'an (English)", rtl: false },
        16: { name: "Al-Muyassar (Arabic)", rtl: true },
        91: { name: "Al-Sa'di (Arabic)", rtl: true }
    };

    const LANGUAGES = {
        "en.sahih": { name: "English (Sahih International)", short: "English" },
        "fr.hamidullah": { name: "Français (Hamidullah)", short: "Français" },
        "es.cortes": { name: "Español (Julio Cortés)", short: "Español" },
        "de.bubenheim": { name: "Deutsch (Bubenheim)", short: "Deutsch" },
        "tr.diyanet": { name: "Türkçe (Diyanet)", short: "Türkçe" },
        "ur.junagarhi": { name: "اردو (Junagarhi)", short: "اردو" },
        "id.indonesian": { name: "Bahasa Indonesia", short: "Indonesia" },
        "ru.kuliev": { name: "Русский (Kuliev)", short: "Русский" },
        "zh.jian": { name: "中文 (Simplified)", short: "中文" },
        "hi.hindi": { name: "हिंदी (Hindi)", short: "हिंदी" }
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
        fontScale: Number(localStorage.getItem("quranFontScale") || 1),
        tafsirId: Number(localStorage.getItem("quranTafsir") || 169),
        tafsirCache: new Map(),
        prayer: loadJson("quranPrayerPrefs", { method: "3", city: "", country: "", lat: null, lng: null }),
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
            "hijriToday", "holidaysList", "useLocationBtn", "cityInput", "countryInput",
            "lookupCityBtn", "methodSelect", "prayerStatus", "prayerGrid", "qiblaInfo",
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

    function applyFontScale() {
        const scale = Math.min(1.4, Math.max(0.85, state.fontScale));
        state.fontScale = scale;
        document.documentElement.style.setProperty("--arabic-size", `${1.8 * scale}rem`);
        document.documentElement.style.setProperty("--translation-size", `${1.1 * scale}rem`);
        localStorage.setItem("quranFontScale", String(scale));
    }

    function fillLanguages() {
        els.languageSelector.innerHTML = Object.entries(LANGUAGES)
            .map(([id, lang]) => `<option value="${id}">${escapeHtml(lang.short)}</option>`)
            .join("");
        els.languageSelector.value = state.language;
    }

    function showView(name) {
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
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (name === "bookmarks") renderBookmarks();
        if (name === "calendar") renderCalendar();
        if (name === "prayer") renderPrayer();
        if (name === "dhikr") renderDhikr();
        if (name === "home") renderContinue();
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

    function renderSurahs() {
        const grid = els.surahsGrid;
        grid.innerHTML = "";
        if (!state.filtered.length) {
            grid.innerHTML = '<div class="error-message">No surahs match that search.</div>';
            return;
        }
        const fragment = document.createDocumentFragment();
        state.filtered.forEach((surah) => {
            const type = surah.revelationType.toLowerCase();
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
                    <button class="btn-play" type="button" data-action="play" data-surah="${surah.number}" aria-label="Play recitation">▶</button>
                </div>
            `;
            fragment.appendChild(card);
        });
        grid.appendChild(fragment);
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
        state.verseMap.clear();
        const langName = LANGUAGES[state.language]?.name || state.language;
        const prevDisabled = arabicSurah.number <= 1 ? "disabled" : "";
        const nextDisabled = arabicSurah.number >= 114 ? "disabled" : "";
        const stripFirstAyahBismillah = arabicSurah.number !== 1 && arabicSurah.number !== 9;
        const verses = arabicSurah.ayahs.map((ayah, index) => {
            let arabic = ayah.text;
            let translation = translationSurah.ayahs[index]?.text || "Translation not available";
            if (stripFirstAyahBismillah && ayah.numberInSurah === 1) {
                arabic = stripLeadingBismillah(arabic);
                translation = stripLeadingBismillahTranslation(translation);
            }
            state.verseMap.set(ayah.number, {
                arabic,
                translation,
                verseNumber: ayah.numberInSurah,
                surahNumber: arabicSurah.number,
                surahName: arabicSurah.englishName
            });
            if (arabicSurah.number === 1 && ayah.numberInSurah === 1) return "";
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
                    <div class="verse-translation">${escapeHtml(translation)}</div>
                    <div class="tafsir-panel" data-tafsir-panel="${arabicSurah.number}:${ayah.numberInSurah}" hidden></div>
                </article>
            `;
        }).join("");

        const bismillah = arabicSurah.number !== 9 ? `
            <div class="bismillah">
                <div class="bismillah-arabic" lang="ar" dir="rtl">${BISMILLAH_ARABIC}</div>
                <div class="bismillah-translation">In the name of Allah, the Most Gracious, the Most Merciful</div>
                ${arabicSurah.number === 1 ? `
                    <button class="verse-action-btn" type="button" data-action="tafsir" data-verse-key="1:1" aria-expanded="false">Tafsir</button>
                    <div class="tafsir-panel" data-tafsir-panel="1:1" hidden></div>
                ` : ""}
            </div>
        ` : "";

        els.surahReading.innerHTML = `
            <div class="reading-toolbar">
                <div class="toolbar-group">
                    <button class="back-btn" type="button" data-nav="home">← Surahs</button>
                    <button class="btn secondary" type="button" data-action="prev-surah" ${prevDisabled}>Previous</button>
                    <button class="btn secondary" type="button" data-action="next-surah" ${nextDisabled}>Next</button>
                </div>
                <div class="toolbar-group">
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

    function tafsirOptions() {
        if (!TAFSIRS[state.tafsirId]) state.tafsirId = 169;
        return Object.entries(TAFSIRS).map(([id, tafsir]) =>
            `<option value="${id}" ${Number(id) === Number(state.tafsirId) ? "selected" : ""}>${escapeHtml(tafsir.name)}</option>`
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
        if (sourceInfo?.rtl) {
            body.lang = "ar";
            body.dir = "rtl";
        }
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
            const data = await fetchJson(`${TAFSIR_API}/tafsirs/${state.tafsirId}/by_ayah/${verseKey}`);
            const text = tafsirPlainText(data.tafsir?.text);
            if (!text) throw new Error("empty");
            const payload = {
                text,
                source: data.tafsir?.resource_name || TAFSIRS[state.tafsirId].name
            };
            state.tafsirCache.set(cacheKey, payload);
            renderTafsirPanel(panel, payload);
        } catch (error) {
            console.error(error);
            renderTafsirPanel(panel, { error: "Could not load tafsir for this verse." });
        }
    }

    async function readSurah(number, scrollToVerse) {
        stopAudio();
        showView("reading");
        els.surahReading.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading Surah…</p></div>';
        try {
            const [arabic, translation] = await Promise.all([
                fetchJson(`${API_BASE}/surah/${number}`),
                fetchJson(`${API_BASE}/surah/${number}/${state.language}`)
            ]);
            if (arabic.code !== 200 || translation.code !== 200) throw new Error("Bad API response");
            displaySurah(arabic.data, translation.data, scrollToVerse);
        } catch (error) {
            console.error(error);
            els.surahReading.innerHTML = '<div class="error-message">Could not load this surah. Please try again.</div>';
            notify("Failed to load surah.", "error");
        }
    }

    async function copyVerse(ayahNumber) {
        const verse = state.verseMap.get(ayahNumber) || state.bookmarks.find((item) => item.ayahNumber === ayahNumber);
        if (!verse) return;
        const text = `${verse.arabic || verse.arabicText}\n\n"${verse.translation}"\n\n— Surah ${verse.surahName}, ${verse.verseNumber}`;
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
        const text = `${verse.arabic}\n\n"${verse.translation}"\n\n— Surah ${verse.surahName}, ${verse.verseNumber}`;
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
        return { Fajr: "Fajr", Sunrise: "Sunrise", Dhuhr: "Dhuhr", Asr: "Asr", Maghrib: "Maghrib", Isha: "Isha" }[name];
    }

    function nextPrayer(timings) {
        const order = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const now = new Date();
        for (const name of order) {
            const [h, m] = timings[name].slice(0, 5).split(":").map(Number);
            const when = new Date();
            when.setHours(h, m, 0, 0);
            if (when > now) return name;
        }
        return "Fajr";
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
            const next = nextPrayer(timings);
            els.prayerStatus.textContent = `${data.data.meta.timezone} · ${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
            els.prayerGrid.innerHTML = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].map((name) => `
                <article class="prayer-card${name === next ? " next" : ""}">
                    <div class="prayer-name">${prayerLabel(name)}${name === next ? " · next" : ""}</div>
                    <div class="prayer-time">${timings[name].slice(0, 5)}</div>
                </article>
            `).join("");

            if (lat != null && lng != null) {
                const qibla = await fetchJson(`${ALADHAN}/qibla/${lat}/${lng}`);
                els.qiblaInfo.textContent = `Qibla direction: ${qibla.data.direction.toFixed(1)}° from true north.`;
            } else {
                els.qiblaInfo.textContent = "";
            }

            state.prayer = { method, city: city || "", country: country || "", lat: lat ?? null, lng: lng ?? null };
            saveJson("quranPrayerPrefs", state.prayer);
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
            const [arabic, translation] = await Promise.all([
                fetchJson(`${API_BASE}/ayah/${ayahNumber}`),
                fetchJson(`${API_BASE}/ayah/${ayahNumber}/${state.language}`)
            ]);
            state.dailyAyah = {
                surah: arabic.data.surah.number,
                verse: arabic.data.numberInSurah,
                name: arabic.data.surah.englishName,
                arabic: arabic.data.text,
                translation: translation.data.text
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
            const translation = await fetchJson(`${API_BASE}/ayah/${ayah.number}/${state.language}`);
            openModal(`
                <h3 id="modalTitle">Random verse</h3>
                <div class="arabic-verse" lang="ar" dir="rtl">${escapeHtml(ayah.text)}</div>
                <p class="verse-translation">${escapeHtml(translation.data.text)}</p>
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
            readSurah(surah, Number(actionEl.dataset.verse) || undefined);
        } else if (action === "play") {
            event.stopPropagation();
            playSurahAudio(surah, actionEl);
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
            const nextId = Number(event.target.value);
            if (!TAFSIRS[nextId]) return;
            state.tafsirId = nextId;
            localStorage.setItem("quranTafsir", String(nextId));
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
            if (card) readSurah(Number(card.dataset.surah));
        });
        els.surahsGrid.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                const card = event.target.closest(".surah-card");
                if (card) {
                    event.preventDefault();
                    readSurah(Number(card.dataset.surah));
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
            notify(`Translation: ${LANGUAGES[state.language].name}`, "info");
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
            if (state.prayer.lat != null) loadPrayerTimes({ lat: state.prayer.lat, lng: state.prayer.lng });
            else if (state.prayer.city) loadPrayerTimes({ city: state.prayer.city, country: state.prayer.country });
        });
        els.resetDhikrBtn.addEventListener("click", () => {
            state.dhikr = { date: todayKey(), counts: Object.fromEntries(DHIKR_ITEMS.map((item) => [item.id, 0])) };
            saveJson("quranDhikr", state.dhikr);
            renderDhikr();
        });

        els.appModal.addEventListener("click", (event) => {
            if (event.target === els.appModal) closeModal();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                if (els.appModal.classList.contains("open")) closeModal();
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
        setTheme(state.theme);
        applyFontScale();
        updateBookmarkCount();
        renderContinue();
        setupEvents();
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
