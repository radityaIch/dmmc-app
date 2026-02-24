(()=>{
  try {
    const ORIGIN = location.origin;
    if (!ORIGIN.includes("maimaidx-eng.com")) {
      alert("Open this on maimaidx-eng.com while logged in.");
      return;
    }

    const current = document.currentScript;
    const src = current && current instanceof HTMLScriptElement ? current.src : "";
    const receiver = (() => {
      try {
        if (!src) return "";
        return new URL(src).searchParams.get("receiver") || "";
      } catch {
        return "";
      }
    })();

    if (!receiver) {
      alert("DMMC Export: missing receiver URL.");
      return;
    }

    const SCHEMA = "dmmc/maimai-dxnet-export@1";
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const parseText = (el) => (el ? String(el.textContent || "").trim() : "");

    const mkOverlay = () => {
      const old = document.getElementById("dmmc-mai-export-overlay");
      if (old) old.remove();
      const wrap = document.createElement("div");
      wrap.id = "dmmc-mai-export-overlay";
      wrap.style.position = "fixed";
      wrap.style.inset = "0";
      wrap.style.zIndex = "2147483647";
      wrap.style.background = "rgba(0,0,0,0.72)";
      wrap.style.display = "flex";
      wrap.style.alignItems = "center";
      wrap.style.justifyContent = "center";
      wrap.style.padding = "16px";

      const card = document.createElement("div");
      card.style.maxWidth = "520px";
      card.style.width = "100%";
      card.style.borderRadius = "18px";
      card.style.border = "1px solid rgba(255,255,255,0.12)";
      card.style.background = "rgba(0,0,0,0.65)";
      card.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.08), 0 0 28px rgba(255,79,216,0.25)";
      card.style.padding = "16px";
      card.style.color = "#fff";
      card.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";

      const title = document.createElement("div");
      title.textContent = "DMMC Export";
      title.style.fontWeight = "800";
      title.style.letterSpacing = "0.08em";
      title.style.fontSize = "12px";
      title.style.opacity = "0.75";

      const msg = document.createElement("div");
      msg.textContent = "Starting…";
      msg.style.marginTop = "8px";
      msg.style.fontWeight = "800";
      msg.style.fontSize = "18px";

      const sub = document.createElement("div");
      sub.textContent = "Please keep this tab open.";
      sub.style.marginTop = "8px";
      sub.style.opacity = "0.8";
      sub.style.fontSize = "13px";

      const barOuter = document.createElement("div");
      barOuter.style.marginTop = "14px";
      barOuter.style.height = "10px";
      barOuter.style.borderRadius = "999px";
      barOuter.style.background = "rgba(255,255,255,0.12)";
      barOuter.style.overflow = "hidden";

      const barInner = document.createElement("div");
      barInner.style.height = "100%";
      barInner.style.width = "0%";
      barInner.style.background = "linear-gradient(90deg,#ff4fd8,#39b7ff)";
      barInner.style.boxShadow = "0 0 18px rgba(255,79,216,0.35)";
      barOuter.appendChild(barInner);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Hide";
      btn.style.marginTop = "14px";
      btn.style.borderRadius = "999px";
      btn.style.border = "1px solid rgba(255,255,255,0.16)";
      btn.style.background = "rgba(255,255,255,0.06)";
      btn.style.color = "#fff";
      btn.style.padding = "8px 12px";
      btn.style.cursor = "pointer";
      btn.onclick = () => wrap.remove();

      card.appendChild(title);
      card.appendChild(msg);
      card.appendChild(sub);
      card.appendChild(barOuter);
      card.appendChild(btn);
      wrap.appendChild(card);
      document.body.appendChild(wrap);
      return { wrap, msg, barInner };
    };

    const setOverlay = (o, text, pct) => {
      if (!o) return;
      try {
        o.msg.textContent = text;
        if (typeof pct === "number" && isFinite(pct)) {
          o.barInner.style.width = Math.max(0, Math.min(1, pct)) * 100 + "%";
        }
      } catch {}
    };

    const detectChartType = (row) => {
      if (row.querySelector(".playlog_music_kind_icon_utage")) return "UTAGE";
      const img =
        row.querySelector(".music_kind_icon_dx, img.music_kind_icon_dx") ||
        row.querySelector("img.music_kind_icon") ||
        row.querySelector("img:nth-child(2)");
      if (img && img.src && img.src.includes("_dx")) return "DX";
      if (img && img.src && img.src.includes("_standard")) return "STD";
      if (row.id && row.id.includes("sta_")) return "STD";
      return "UNKNOWN";
    };

    const detectDifficulty = (row) => {
      const m = String(row.className || "").match(/music_([a-z]+)_score_back/);
      if (m && m[1]) {
        const k = m[1].toLowerCase();
        if (k === "basic") return "BASIC";
        if (k === "advanced") return "ADVANCED";
        if (k === "expert") return "EXPERT";
        if (k === "master") return "MASTER";
        if (k === "remaster") return "REMASTER";
      }
      return "UNKNOWN";
    };

    const rankFromAchv = (a) => {
      if (a == null || !isFinite(a)) return null;
      const x = a;
      if (x >= 100.5) return "SSS+";
      if (x >= 100) return "SSS";
      if (x >= 99.5) return "SS+";
      if (x >= 99) return "SS";
      if (x >= 98) return "S+";
      if (x >= 97) return "S";
      if (x >= 94) return "AAA";
      if (x >= 90) return "AA";
      if (x >= 80) return "A";
      if (x >= 75) return "BBB";
      if (x >= 70) return "BB";
      if (x >= 60) return "B";
      if (x >= 50) return "C";
      return "D";
    };

    const dxStarFromRatio = (r) => {
      const t = [0, 0.85, 0.9, 0.93, 0.95, 0.97, 0.99, 1];
      for (let i = t.length - 1; i > 0; i--) {
        if (r >= t[i]) return i;
      }
      return 0;
    };

    const parseDxScore = (row) => {
      const blocks = Array.from(row.querySelectorAll(".music_score_block"));
      if (blocks.length < 2) return null;
      const raw = parseText(blocks[1]);
      const parts = raw.split("/").map((s) => s.replace(/,/g, "").trim());
      if (parts.length !== 2) return null;
      const player = parseInt(parts[0], 10);
      const max = parseInt(parts[1], 10);
      if (!isFinite(player) || !isFinite(max) || max <= 0) return null;
      const ratio = player / max;
      return { player, max, ratio, star: dxStarFromRatio(ratio) };
    };

    const parseAchievement = (row) => {
      const blocks = Array.from(row.querySelectorAll(".music_score_block"));
      const raw = blocks.length ? parseText(blocks[0]) : "";
      const num = parseFloat(String(raw).replace("%", "").trim());
      return isFinite(num) && num > 0 ? num : null;
    };

    const parseLevelText = (row) => {
      const lv = row.querySelector(".music_lv_block") || row.querySelector(".music_lv") || row.querySelector(".music_lv_back");
      const t = parseText(lv);
      return t || null;
    };

    const parseSongName = (row) => {
      const el = row.querySelector(".music_name_block") || row.querySelector(".basic_block.break") || row.querySelector(".black_block");
      return parseText(el);
    };

    const fetchDoc = async (url) => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch " + url + " (" + res.status + ")");
      const html = await res.text();
      return new DOMParser().parseFromString(html, "text/html");
    };

    const extractFromDoc = (doc) => {
      const items = [];
      let genre = null;
      const blocks = Array.from(doc.querySelectorAll(".main_wrapper.t_c .m_15"));
      for (const b of blocks) {
        if (b.classList.contains("screw_block")) {
          genre = parseText(b) || genre;
          continue;
        }
        const isRow = b.classList.contains("w_450") && b.classList.contains("m_15") && b.classList.contains("f_0");
        if (!isRow) continue;
        const songName = parseSongName(b);
        if (!songName) continue;
        const chartType = detectChartType(b);
        const difficulty = detectDifficulty(b);
        const levelText = parseLevelText(b);
        const achievement = parseAchievement(b);
        const dxScore = parseDxScore(b);
        const rank = rankFromAchv(achievement);
        items.push({ songName, genre, chartType, difficulty, levelText, internalLevel: null, achievement, rank, fcap: null, sync: null, dxScore });
      }
      return items;
    };

    (async () => {
      const overlay = mkOverlay();
      try {
        setOverlay(overlay, "Fetching scores…", 0);
        const all = [];
        const totalDiff = 5;
        for (let diff = 0; diff <= 4; diff++) {
          setOverlay(overlay, "Fetching difficulty " + (diff + 1) + "/" + totalDiff + "…", diff / totalDiff);
          const url = "/maimai-mobile/record/musicGenre/search/?genre=99&diff=" + diff;
          const doc = await fetchDoc(url);
          all.push(...extractFromDoc(doc));
          await sleep(250);
        }

        setOverlay(overlay, "Preparing import…", 0.92);
        const payload = { schema: SCHEMA, origin: ORIGIN, exportedAt: Date.now(), scores: all };
        try {
          window.name = "DMMC_MAIMAI_IMPORT:" + JSON.stringify(payload);
        } catch {
          alert("DMMC Export: failed to store payload in window.name.");
          return;
        }

        setOverlay(overlay, "Redirecting…", 1);
        location.href = receiver;
      } catch (e) {
        console.error(e);
        try {
          setOverlay(overlay, "Export failed: " + (e && e.message ? e.message : String(e)), 1);
        } catch {}
        setTimeout(() => {
          try {
            overlay.wrap.remove();
          } catch {}
        }, 6000);
      }
    })();
  } catch (e) {
    alert("DMMC Export failed: " + (e && e.message ? e.message : String(e)));
  }
})();
