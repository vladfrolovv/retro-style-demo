(function () {
  "use strict";

  var STORAGE_KEY = "foam-lang";

  var strings = {
    en: {
      skip: "Skip to content",
      navLabel: "Sections",
      langLabel: "Language",
      tabAbout: "About",
      tabWatch: "Watch",
      tabPlay: "Play",
      heroTitle: "The floor is the problem.",
      heroLead: "Put out the fires. Save the plant.<br> Mind your step.",
      actionWatch: "Watch gameplay",
      actionPlay: "Play demo",
      builtTitle: "How I built it",
      builtAi: "AI agents for the code, the Blender scripts and the art.",
      builtBlender: "vibe modeling: models, rigs and animation.",
      builtUnity: "gameplay, physics and light; MVC with dependency injection.",
      builtUi: "the HUD, the menus and the rest of the UI.",
      watchTitle: "Watch the mess.",
      videoLabel: "Foam & Slip gameplay recording",
      videoError: "The gameplay video could not be loaded.",
      retry: "Try again",
      vidPlay: "Play",
      vidPause: "Pause",
      vidSeek: "Seek",
      watchNote: "A full run: fires out, a slip on the foam, the flower saved. No sound in this recording.",
      playTitle: "Your turn.",
      gameStopped: "The game stopped when you left this tab.",
      startGame: "Start game",
      touchHint: "This game needs a keyboard and a mouse. <a href=\"#watch\">Watch the video</a> instead.",
      loading: "Loading the game… {pct}%",
      starting: "Starting…",
      gameError: "The game could not start.",
      gameErrorDetail: "Part of the game did not download or could not be read. Details: {detail}",
      gameUnavailable: "The browser build is not connected yet.",
      gameUnavailableHint: "Watch the gameplay video in the meantime.",
      controlsLabel: "Controls",
      ctrlMove: "Move",
      ctrlLook: "Mouse Look",
      keyLmb: "LMB",
      ctrlFoam: "Foam",
      ctrlInteract: "Interact",
      ctrlRestart: "Restart",
      ctrlPause: "Pause",
      fullscreen: "Fullscreen",
      ideaEyebrow: "The idea",
      ideaTitle: "The foam that saves you also knocks you down.",
      ideaLead: "A one-room first-person game. You carry a heavy foam gun and put out the fires. But every spray makes the floor slippery: for you, the furniture and your partner.",
      ideaArtAlt: "First concept: a firefighter slipping on foam in a burning living room",
      ideaGunTitle: "Heavy foam gun",
      ideaGunText: "Two hands, a kick when the pressure builds, and a tank you have to refill.",
      ideaSlipTitle: "Foam is slippery",
      ideaSlipText: "Foam on the floor kills your grip. Brake late and you slide. Your partner slips too, and blames you.",
      ideaFireTitle: "Fire that spreads",
      ideaFireText: "Heat jumps to anything that burns. Foam cools a fire and keeps it out for a while.",
      ideaPlantTitle: "Save the plant",
      ideaPlantText: "Put out every fire, then carry the flower pot out of the room.",
      linkedin: "LinkedIn",
      authorName: "Vlad Frolov",
      titleAbout: "Foam & Slip — Vlad Frolov test task",
      titleWatch: "Watch — Foam & Slip",
      titlePlay: "Play — Foam & Slip"
    },
    uk: {
      skip: "Перейти до змісту",
      navLabel: "Розділи",
      langLabel: "Мова",
      tabAbout: "Про гру",
      tabWatch: "Відео",
      tabPlay: "Грати",
      heroTitle: "Проблема\u00a0— підлога.",
      heroLead: "Загаси пожежі. Врятуй квітку.<br> Дивись під ноги.",
      actionWatch: "Дивитися відео",
      actionPlay: "Грати демо",
      builtTitle: "Як я це зробив",
      builtAi: "ШІ-агенти: код, скрипти для Blender і арт.",
      builtBlender: "вайб-моделінг: моделі, риги й анімація.",
      builtUnity: "геймплей, фізика і світло; MVC і DI.",
      builtUi: "HUD, меню та решта інтерфейсу.",
      watchTitle: "Дивись, який безлад.",
      videoLabel: "Запис геймплею Foam & Slip",
      videoError: "Не вдалося завантажити відео.",
      retry: "Спробувати ще",
      vidPlay: "Відтворити",
      vidPause: "Пауза",
      vidSeek: "Перемотати",
      watchNote: "Повне проходження: пожежі загашено, підсковзнувся на піні, квітку врятовано. Відео без звуку.",
      playTitle: "Твоя черга.",
      gameStopped: "Гра зупинилася, коли ти перейшов на іншу вкладку.",
      startGame: "Почати гру",
      touchHint: "Для гри потрібні клавіатура й миша. <a href=\"#watch\">Подивись відео</a>.",
      loading: "Завантажуємо гру… {pct}%",
      starting: "Запускаємо…",
      gameError: "Гра не запустилася.",
      gameErrorDetail: "Частина гри не завантажилася або пошкоджена. Деталі: {detail}",
      gameUnavailable: "Браузерну версію ще не підключено.",
      gameUnavailableHint: "Поки що подивись відео.",
      controlsLabel: "Керування",
      ctrlMove: "Рух",
      ctrlLook: "Огляд мишею",
      keyLmb: "ЛКМ",
      ctrlFoam: "Піна",
      ctrlInteract: "Дія",
      ctrlRestart: "Рестарт",
      ctrlPause: "Пауза",
      fullscreen: "На весь екран",
      ideaEyebrow: "Ідея",
      ideaTitle: "Піна, яка рятує, сама ж і збиває з ніг.",
      ideaLead: "Гра від першої особи в одній кімнаті. У тебе важка пінна пушка, і ти гасиш пожежі. Але кожен постріл робить підлогу слизькою: для тебе, для меблів і для напарника.",
      ideaArtAlt: "Перший концепт: пожежник посковзується на піні у вітальні, що горить",
      ideaGunTitle: "Важка пінна пушка",
      ideaGunText: "Тримаєш двома руками, вона штовхає, коли росте тиск, а бак треба доливати.",
      ideaSlipTitle: "Піна слизька",
      ideaSlipText: "На піні ноги не тримають. Пізно загальмуєш, і тебе понесе. Напарник теж падає і звинувачує тебе.",
      ideaFireTitle: "Вогонь розповзається",
      ideaFireText: "Жар перекидається на все, що горить. Піна остуджує вогонь і якийсь час не дає йому спалахнути знову.",
      ideaPlantTitle: "Врятуй квітку",
      ideaPlantText: "Загаси всі пожежі й винеси горщик із квіткою з кімнати.",
      linkedin: "LinkedIn",
      authorName: "Влад Фролов",
      titleAbout: "Foam & Slip — тестове завдання Влада Фролова",
      titleWatch: "Відео — Foam & Slip",
      titlePlay: "Грати — Foam & Slip"
    }
  };

  function readSaved() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function save(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      return;
    }
  }

  function initialLang() {
    var param = new URLSearchParams(window.location.search).get("lang");
    if (param && strings[param]) {
      return param;
    }
    var saved = readSaved();
    if (saved && strings[saved]) {
      return saved;
    }
    var browser = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    return /^(uk|ua)/i.test(browser) ? "uk" : "en";
  }

  var current = initialLang();
  var listeners = [];

  function t(key, values) {
    var text = (strings[current] && strings[current][key]) || strings.en[key] || key;
    if (values) {
      Object.keys(values).forEach(function (name) {
        text = text.replace("{" + name + "}", values[name]);
      });
    }
    return text;
  }

  function apply(root) {
    var scope = root || document;
    document.documentElement.lang = current;
    Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n]"), function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n-html]"), function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n-alt]"), function (el) {
      el.setAttribute("alt", t(el.getAttribute("data-i18n-alt")));
    });
    Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n-aria]"), function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    Array.prototype.forEach.call(scope.querySelectorAll(".lang-btn"), function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-lang") === current ? "true" : "false");
    });
  }

  function set(lang) {
    if (!strings[lang] || lang === current) {
      return;
    }
    current = lang;
    save(lang);
    try {
      var url = new URL(window.location.href);
      if (url.searchParams.has("lang")) {
        url.searchParams.set("lang", lang);
        window.history.replaceState(window.history.state, "", url.toString());
      }
    } catch (error) {
      console.warn("[foam] Could not update the lang parameter", error);
    }
    apply();
    listeners.forEach(function (listener) {
      listener(lang);
    });
  }

  window.FoamI18n = {
    t: t,
    apply: apply,
    set: set,
    lang: function () {
      return current;
    },
    onChange: function (listener) {
      listeners.push(listener);
    }
  };
})();
