import { handleError, sleep } from "../common/util";

(function main() {
  try {
    if (location.origin !== "https://maimaidx-eng.com") {
      handleError("Open this on maimaidx-eng.com while logged in.");
      return;
    }

    const receiver = (() => {
      try {
        const el = document.currentScript as HTMLScriptElement | null;
        const src = el?.src ? new URL(el.src) : null;
        return src?.searchParams.get("receiver") ?? null;
      } catch {
        return null;
      }
    })();

    (async () => {
      await sleep(50);
      const payload = {
        schema: "dmmc/maimai-dxnet-export@1",
        exportedAt: new Date().toISOString(),
        scores: [],
      };

      try {
        (window as unknown as { name: string }).name = `DMMC_MAIMAI_IMPORT:${JSON.stringify(payload)}`;
      } catch {
        handleError("DMMC Export failed: could not store payload.");
        return;
      }

      if (receiver) {
        location.href = receiver;
      } else {
        handleError("DMMC Export finished (v3 build pipeline OK). Missing receiver URL.");
      }
    })().catch((e) => {
      handleError(`DMMC Export failed: ${e && (e as Error).message ? (e as Error).message : String(e)}`);
    });
  } catch (e) {
    handleError(`DMMC Export failed: ${e && (e as Error).message ? (e as Error).message : String(e)}`);
  }
})();
