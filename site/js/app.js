(function () {
  "use strict";

  var config = window.FOAM_CONFIG || {};
  var i18n = window.FoamI18n;
  var t = i18n.t;
  var TABS = ["about", "watch", "play"];
  var currentTab = null;

  var tabLinks = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = {};
  TABS.forEach(function (name) {
    panels[name] = document.querySelector('[data-panel="' + name + '"]');
  });

  function tabFromHash() {
    var name = (window.location.hash || "").replace(/^#/, "").toLowerCase();
    return TABS.indexOf(name) >= 0 ? name : "about";
  }

  function showTab(name, moveFocus) {
    if (name === currentTab) {
      return;
    }
    var previous = currentTab;
    currentTab = name;

    TABS.forEach(function (tab) {
      panels[tab].hidden = tab !== name;
    });
    tabLinks.forEach(function (link) {
      if (link.getAttribute("data-tab") === name) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    updateTitle();

    if (previous === "watch") {
      video.leave();
    }
    if (previous === "play") {
      game.leave();
    }
    if (name === "watch") {
      video.enter();
    }
    if (name === "play") {
      game.enter();
    }

    if (previous !== null) {
      window.scrollTo(0, 0);
    }
    if (moveFocus) {
      var heading = panels[name].querySelector("h1");
      if (heading) {
        heading.focus({ preventScroll: true });
      }
    }
  }

  function updateTitle() {
    var keys = { about: "titleAbout", watch: "titleWatch", play: "titlePlay" };
    document.title = t(keys[currentTab || "about"]);
  }

  var video = (function () {
    var el = document.getElementById("gameplay-video");
    var errorBox = document.getElementById("video-error");
    var retry = document.getElementById("video-retry");
    var attached = false;
    var media = config.video || null;

    function attach() {
      errorBox.hidden = true;
      if (!media || !media.src) {
        errorBox.hidden = false;
        retry.hidden = true;
        return;
      }
      if (media.poster) {
        el.poster = media.poster;
      }
      el.preload = "metadata";
      el.src = media.src;
      el.load();
      attached = true;
    }

    el.addEventListener("error", function () {
      errorBox.hidden = false;
    });

    var stage = document.getElementById("video-stage");
    var big = document.getElementById("vid-big");
    var toggle = document.getElementById("vid-toggle");
    var full = document.getElementById("vid-full");
    var seek = document.getElementById("vid-seek");
    var time = document.getElementById("vid-time");
    var seeking = false;

    function clock(value) {
      if (!isFinite(value)) {
        return "0:00";
      }
      var total = Math.floor(value);
      var seconds = total % 60;
      return Math.floor(total / 60) + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    function render() {
      var playing = !el.paused && !el.ended;
      stage.setAttribute("data-playing", playing ? "true" : "false");
      var label = t(playing ? "vidPause" : "vidPlay");
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("data-i18n-aria", playing ? "vidPause" : "vidPlay");
      time.textContent = clock(el.currentTime) + " / " + clock(el.duration);
      if (!seeking && el.duration) {
        seek.value = String(Math.round((el.currentTime / el.duration) * 1000));
      }
      seek.style.setProperty("--progress", (Number(seek.value) / 10) + "%");
    }

    function playPause() {
      if (!attached) {
        attach();
      }
      if (el.paused || el.ended) {
        el.play().catch(function (error) {
          console.warn("[foam] Video play failed", error);
        });
      } else {
        el.pause();
      }
    }

    ["play", "pause", "ended", "timeupdate", "loadedmetadata", "durationchange"].forEach(function (name) {
      el.addEventListener(name, render);
    });
    big.addEventListener("click", playPause);
    toggle.addEventListener("click", playPause);
    el.addEventListener("click", playPause);
    seek.addEventListener("input", function () {
      seeking = true;
      if (el.duration) {
        el.currentTime = (Number(seek.value) / 1000) * el.duration;
      }
      render();
    });
    seek.addEventListener("change", function () {
      seeking = false;
    });
    full.addEventListener("click", function () {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(function () {});
      } else if (stage.requestFullscreen) {
        stage.requestFullscreen().catch(function (error) {
          console.warn("[foam] Fullscreen refused", error);
        });
      }
    });
    if (!document.fullscreenEnabled) {
      full.hidden = true;
    }
    if (window.FoamI18n) {
      window.FoamI18n.onChange(render);
    }

    retry.addEventListener("click", function () {
      attached = false;
      attach();
    });

    return {
      enter: function () {
        if (!attached) {
          attach();
        }
      },
      leave: function () {
        if (!el.paused) {
          el.pause();
        }
        if (document.fullscreenElement === stage && document.exitFullscreen) {
          document.exitFullscreen().catch(function () {});
        }
      }
    };
  })();

  var game = (function () {
    var stage = document.getElementById("game-stage");
    var host = document.getElementById("game-canvas-host");
    var startButton = document.getElementById("game-start");
    var retryButton = document.getElementById("game-retry");
    var fullscreenButton = document.getElementById("game-fullscreen");
    var stoppedText = document.getElementById("game-stopped-text");
    var touchHint = document.getElementById("game-touch-hint");
    var progress = document.getElementById("game-progress");
    var progressBar = document.getElementById("game-progress-bar");
    var progressText = document.getElementById("game-progress-text");
    var errorText = document.getElementById("game-error-text");
    var build = config.game || null;

    var state = "idle";
    var lastProgress = 0;
    var lastErrorDetail = "";
    var generation = 0;
    var instance = null;
    var activeCanvas = null;
    var queue = Promise.resolve();
    var loaderPromise = null;

    var touchOnly = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    touchHint.hidden = !touchOnly;

    function setState(next) {
      state = next;
      stage.setAttribute("data-state", next);
      stoppedText.hidden = next !== "stopped";
    }

    function setProgress(value) {
      lastProgress = value;
      var pct = Math.max(0, Math.min(100, Math.round(value * 100)));
      progress.setAttribute("aria-valuenow", String(pct));
      progressBar.style.width = pct + "%";
      progressText.textContent = pct < 100 ? t("loading", { pct: pct }) : t("starting");
    }

    function renderTexts() {
      setProgress(lastProgress);
      errorText.textContent = lastErrorDetail ? t("gameErrorDetail", { detail: lastErrorDetail }) : "";
    }

    function loadLoader() {
      if (loaderPromise) {
        return loaderPromise;
      }
      loaderPromise = new Promise(function (resolve, reject) {
        if (typeof window.createUnityInstance === "function") {
          resolve();
          return;
        }
        var script = document.createElement("script");
        script.src = build.loaderUrl;
        script.async = true;
        script.onload = function () {
          if (typeof window.createUnityInstance === "function") {
            resolve();
          } else {
            reject(new Error("The Unity loader did not define createUnityInstance."));
          }
        };
        script.onerror = function () {
          reject(new Error("Could not download " + build.loaderUrl + "."));
        };
        document.body.appendChild(script);
      });
      loaderPromise.catch(function () {
        loaderPromise = null;
      });
      return loaderPromise;
    }

    function releasePointer() {
      if (document.pointerLockElement && document.exitPointerLock) {
        document.exitPointerLock();
      }
    }

    function quitInstance(target, canvas) {
      var done = Promise.resolve();
      if (target && typeof target.Quit === "function") {
        done = target.Quit().catch(function (error) {
          console.warn("[foam] Unity Quit failed", error);
        });
      }
      return done.then(function () {
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      });
    }

    function fail(token, message) {
      if (token !== generation) {
        return;
      }
      lastErrorDetail = message || "";
      renderTexts();
      setState("error");
      retryButton.focus({ preventScroll: true });
    }

    function launch(token) {
      if (token !== generation) {
        return Promise.resolve();
      }
      return loadLoader().then(function () {
        if (token !== generation) {
          return null;
        }
        var canvas = document.createElement("canvas");
        canvas.id = "unity-canvas";
        canvas.tabIndex = -1;
        canvas.setAttribute("aria-label", "Foam & Slip");
        host.appendChild(canvas);

        var unityConfig = {
          dataUrl: build.dataUrl,
          frameworkUrl: build.frameworkUrl,
          codeUrl: build.codeUrl,
          streamingAssetsUrl: build.streamingAssetsUrl,
          companyName: build.companyName,
          productName: build.productName,
          productVersion: build.productVersion,
          showBanner: function (message, type) {
            if (type === "error") {
              console.error("[foam] Unity:", message);
            } else {
              console.warn("[foam] Unity:", message);
            }
          }
        };

        return window.createUnityInstance(canvas, unityConfig, function (value) {
          if (token === generation) {
            setProgress(value);
          }
        }).then(function (created) {
          if (token !== generation) {
            return quitInstance(created, canvas);
          }
          instance = created;
          activeCanvas = canvas;
          setState("running");
          canvas.focus({ preventScroll: true });
          return null;
        }, function (error) {
          if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
          fail(token, String((error && error.message) || error).trim());
          return null;
        });
      }, function (error) {
        fail(token, error.message);
      });
    }

    function start() {
      if (!build || !build.loaderUrl) {
        setState("unavailable");
        return;
      }
      if (state === "loading" || state === "running") {
        return;
      }
      generation += 1;
      var token = generation;
      setProgress(0);
      setState("loading");
      queue = queue.then(function () {
        return launch(token);
      }).catch(function (error) {
        fail(token, String(error));
      });
    }

    function leave() {
      releasePointer();
      if (document.fullscreenElement === stage && document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
      if (state === "loading") {
        generation += 1;
        setState("stopped");
        return;
      }
      if (state === "running") {
        generation += 1;
        var target = instance;
        var canvas = activeCanvas;
        instance = null;
        activeCanvas = null;
        queue = queue.then(function () {
          return quitInstance(target, canvas);
        });
        setState("stopped");
      }
    }

    function enter() {
      if (!build || !build.loaderUrl) {
        setState("unavailable");
      }
    }

    function toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(function () {});
        return;
      }
      if (stage.requestFullscreen) {
        stage.requestFullscreen().then(function () {
          if (activeCanvas) {
            activeCanvas.focus({ preventScroll: true });
          }
        }).catch(function (error) {
          console.warn("[foam] Fullscreen refused", error);
        });
      }
    }

    startButton.addEventListener("click", start);
    retryButton.addEventListener("click", start);
    fullscreenButton.addEventListener("click", toggleFullscreen);

    if (!document.fullscreenEnabled) {
      fullscreenButton.hidden = true;
    }

    return {
      enter: enter,
      leave: leave,
      renderTexts: renderTexts,
      state: function () {
        return state;
      }
    };
  })();

  window.addEventListener("hashchange", function () {
    showTab(tabFromHash(), true);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && currentTab === "watch") {
      video.leave();
    }
  });

  Array.prototype.forEach.call(document.querySelectorAll(".lang-btn"), function (button) {
    button.addEventListener("click", function () {
      i18n.set(button.getAttribute("data-lang"));
    });
  });

  i18n.onChange(function () {
    updateTitle();
    game.renderTexts();
  });

  window.foamSite = { game: game, i18n: i18n };

  i18n.apply();
  showTab(tabFromHash(), false);
  updateTitle();
})();
