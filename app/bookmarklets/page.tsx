"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";

function makeBookmarklet(code: string) {
  const encoded = encodeURIComponent(code).replace(/'/g, "%27");
  return `javascript:${encoded}`;
}

export default function BookmarkletsPage() {
  const [copied, setCopied] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState(false);
  const dragLinkRef = useRef<HTMLAnchorElement | null>(null);
  const dragMobileLinkRef = useRef<HTMLAnchorElement | null>(null);

  const bookmarkletHref = useMemo(() => {
    const receiverUrl = process.env.NEXT_PUBLIC_MY_SCORE_URL ?? "http://localhost:3000/my-score";
    const code = `(()=>{const SCHEMA="dmmc/maimai-dxnet-export@1";const ORIGIN=location.origin;const isIntl=ORIGIN.includes("maimaidx-eng.com");if(!isIntl){alert("Open this on maimaidx-eng.com while logged in.");return;}const receiver=${JSON.stringify(receiverUrl)};const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const parseText=(el)=>el?String(el.textContent||"").trim():"";const mkOverlay=()=>{const old=document.getElementById("dmmc-mai-export-overlay");if(old)old.remove();const wrap=document.createElement("div");wrap.id="dmmc-mai-export-overlay";wrap.style.position="fixed";wrap.style.inset="0";wrap.style.zIndex="2147483647";wrap.style.background="rgba(0,0,0,0.72)";wrap.style.display="flex";wrap.style.alignItems="center";wrap.style.justifyContent="center";wrap.style.padding="16px";const card=document.createElement("div");card.style.maxWidth="520px";card.style.width="100%";card.style.borderRadius="18px";card.style.border="1px solid rgba(255,255,255,0.12)";card.style.background="rgba(0,0,0,0.65)";card.style.boxShadow="0 0 0 1px rgba(255,255,255,0.08), 0 0 28px rgba(255,79,216,0.25)";card.style.padding="16px";card.style.color="#fff";card.style.fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";const title=document.createElement("div");title.textContent="DMMC Export";title.style.fontWeight="800";title.style.letterSpacing="0.08em";title.style.fontSize="12px";title.style.opacity="0.75";const msg=document.createElement("div");msg.textContent="Starting…";msg.style.marginTop="8px";msg.style.fontWeight="800";msg.style.fontSize="18px";const sub=document.createElement("div");sub.textContent="Please keep this tab open.";sub.style.marginTop="8px";sub.style.opacity="0.8";sub.style.fontSize="13px";const barOuter=document.createElement("div");barOuter.style.marginTop="14px";barOuter.style.height="10px";barOuter.style.borderRadius="999px";barOuter.style.background="rgba(255,255,255,0.12)";barOuter.style.overflow="hidden";const barInner=document.createElement("div");barInner.style.height="100%";barInner.style.width="0%";barInner.style.background="linear-gradient(90deg,#ff4fd8,#39b7ff)";barInner.style.boxShadow="0 0 18px rgba(255,79,216,0.35)";barOuter.appendChild(barInner);const hint=document.createElement("div");hint.textContent="Do not close this tab.";hint.style.marginTop="12px";hint.style.opacity="0.6";hint.style.fontSize="12px";const btn=document.createElement("button");btn.type="button";btn.textContent="Hide";btn.style.marginTop="14px";btn.style.borderRadius="999px";btn.style.border="1px solid rgba(255,255,255,0.16)";btn.style.background="rgba(255,255,255,0.06)";btn.style.color="#fff";btn.style.padding="8px 12px";btn.style.cursor="pointer";btn.onclick=()=>wrap.remove();card.appendChild(title);card.appendChild(msg);card.appendChild(sub);card.appendChild(barOuter);card.appendChild(hint);card.appendChild(btn);wrap.appendChild(card);document.body.appendChild(wrap);return{wrap,msg,barInner};};const setOverlay=(o,text,pct)=>{if(!o)return;try{o.msg.textContent=text;if(typeof pct==="number"&&isFinite(pct)){o.barInner.style.width=Math.max(0,Math.min(1,pct))*100+"%";}}catch{}};const detectChartType=(row)=>{if(row.querySelector(".playlog_music_kind_icon_utage"))return"UTAGE";const img=row.querySelector(".music_kind_icon_dx, img.music_kind_icon_dx")||row.querySelector("img.music_kind_icon")||row.querySelector("img:nth-child(2)");if(img&&img.src&&img.src.includes("_dx"))return"DX";if(img&&img.src&&img.src.includes("_standard"))return"STD";if(row.id&&row.id.includes("sta_"))return"STD";return"UNKNOWN";};const detectDifficulty=(row)=>{const m=String(row.className||"").match(/music_([a-z]+)_score_back/);if(m&&m[1]){const k=m[1].toLowerCase();if(k==="basic")return"BASIC";if(k==="advanced")return"ADVANCED";if(k==="expert")return"EXPERT";if(k==="master")return"MASTER";if(k==="remaster")return"REMASTER";}const img=row.querySelector("img.playlog_diff")||row.querySelector("img.music_lv_back");if(img&&img.src){const s=img.src.toLowerCase();if(s.includes("basic"))return"BASIC";if(s.includes("advanced"))return"ADVANCED";if(s.includes("expert"))return"EXPERT";if(s.includes("master"))return"MASTER";if(s.includes("remaster"))return"REMASTER";}return"UNKNOWN";};const parseApFc=(row)=>{const imgs=Array.from(row.querySelectorAll("img"));const hit=imgs.map(i=>i.src||"").find(s=>/icon_(ap|applus|fc|fcplus)/.test(s));if(!hit)return null;const f=hit.substring(hit.lastIndexOf("_")+1,hit.lastIndexOf("."));if(f==="ap")return"AP";if(f==="applus")return"AP+";if(f==="fc")return"FC";if(f==="fcplus")return"FC+";return null;};const parseSync=(row)=>{const imgs=Array.from(row.querySelectorAll("img"));const hit=imgs.map(i=>i.src||"").find(s=>/icon_(fsdplus|fsd|fsplus|fs|sync)/.test(s));if(!hit)return null;const f=hit.substring(hit.lastIndexOf("_")+1,hit.lastIndexOf("."));if(f==="sync")return"SYNC";if(f==="fs")return"FS";if(f==="fsplus")return"FS+";if(f==="fsd")return"FSD";if(f==="fsdplus")return"FSD+";return null;};const rankFromAchv=(a)=>{if(a==null||!isFinite(a))return null;const x=a; if(x>=100.5)return"SSS+"; if(x>=100)return"SSS"; if(x>=99.5)return"SS+"; if(x>=99)return"SS"; if(x>=98)return"S+"; if(x>=97)return"S"; if(x>=94)return"AAA"; if(x>=90)return"AA"; if(x>=80)return"A"; if(x>=75)return"BBB"; if(x>=70)return"BB"; if(x>=60)return"B"; if(x>=50)return"C"; return"D";};const dxStarFromRatio=(r)=>{const t=[0,.85,.9,.93,.95,.97,.99,1];for(let i=t.length-1;i>0;i--){if(r>=t[i])return i;}return 0;};const parseDxScore=(row)=>{const blocks=Array.from(row.querySelectorAll(".music_score_block"));if(blocks.length<2)return null;const raw=parseText(blocks[1]);const parts=raw.split("/").map(s=>s.replace(/,/g,"").trim());if(parts.length!==2)return null;const player=parseInt(parts[0],10);const max=parseInt(parts[1],10);if(!isFinite(player)||!isFinite(max)||max<=0)return null;const ratio=player/max;return{player,max,ratio,star:dxStarFromRatio(ratio)};};const parseAchievement=(row)=>{const blocks=Array.from(row.querySelectorAll(".music_score_block"));const raw=blocks.length?parseText(blocks[0]):parseText(row.querySelector("td:last-child"));const num=parseFloat(String(raw).replace("%","").trim());return isFinite(num)&&num>0?num:null;};const parseLevelText=(row)=>{const lv=row.querySelector(".music_lv_block")||row.querySelector(".music_lv_back")||row.querySelector(".music_lv");const t=parseText(lv);return t||null;};const parseSongName=(row)=>{const el=row.querySelector(".music_name_block")||row.querySelector(".basic_block.break")||row.querySelector(".black_block");let t=parseText(el);if(t.includes("\\n"))t=t.split("\\n").map(x=>x.trim()).filter(Boolean).pop()||t;return t;};const fetchDoc=async(url)=>{const res=await fetch(url,{credentials:"include"});if(!res.ok)throw new Error("Failed to fetch "+url+" ("+res.status+")");const html=await res.text();return new DOMParser().parseFromString(html,"text/html");};const extractFromDoc=(doc)=>{const items=[];let genre=null;const blocks=Array.from(doc.querySelectorAll(".main_wrapper.t_c .m_15"));for(const b of blocks){if(b.classList.contains("screw_block")) {genre=parseText(b)||genre;continue;}const isRow=b.classList.contains("w_450")&&b.classList.contains("m_15")&&b.classList.contains("f_0");if(!isRow)continue;const songName=parseSongName(b);if(!songName)continue;const chartType=detectChartType(b);const difficulty=detectDifficulty(b);const levelText=parseLevelText(b);const achievement=parseAchievement(b);const dxScore=parseDxScore(b);const fcap=parseApFc(b);const sync=parseSync(b);const rank=rankFromAchv(achievement);items.push({songName,genre,chartType,difficulty,levelText,internalLevel:null,achievement,rank,fcap,sync,dxScore});}return items;};(async()=>{const overlay=mkOverlay();try{setOverlay(overlay,"Fetching scores…",0);const all=[];const totalDiff=5;for(let diff=0;diff<=4;diff++){setOverlay(overlay,"Fetching difficulty "+(diff+1)+"/"+totalDiff+"…",diff/totalDiff);const url="/maimai-mobile/record/musicGenre/search/?genre=99&diff="+diff;const doc=await fetchDoc(url);all.push(...extractFromDoc(doc));await sleep(250);}setOverlay(overlay,"Preparing import…",0.92);const payload={schema:SCHEMA,origin:ORIGIN,exportedAt:Date.now(),scores:all};try{window.name="DMMC_MAIMAI_IMPORT:"+JSON.stringify(payload);}catch(e){alert("DMMC Export: failed to store payload in window.name.");return;}setOverlay(overlay,"Redirecting…",1);location.href=receiver;}catch(e){console.error(e);try{setOverlay(overlay,"Export failed: "+(e&&e.message?e.message:String(e)),1);}catch{}setTimeout(()=>{try{overlay.wrap.remove();}catch{}},6000);}})();})();`;

    return makeBookmarklet(code);
  }, []);

  const mobileBookmarkletHref = useMemo(() => {
    const receiverUrl = process.env.NEXT_PUBLIC_MY_SCORE_URL ?? "http://localhost:3000/my-score";
    const scriptOrigin = (() => {
      try {
        return new URL(receiverUrl).origin;
      } catch {
        return "http://localhost:3000";
      }
    })();

    const code = `((d)=>{try{if(d.location.origin!=="https://maimaidx-eng.com"){alert("Open this on maimaidx-eng.com while logged in.");return;}var receiver=${JSON.stringify(
      receiverUrl,
    )};var s=d.createElement("script");s.src=${JSON.stringify(
      scriptOrigin,
    )}+"/bookmarklet-maimai-export.v2.js?receiver="+encodeURIComponent(receiver)+"&t="+Math.floor(Date.now()/60000);s.async=true;s.onerror=function(){alert("DMMC Export: failed to load exporter script.");};d.body.append(s);}catch(e){alert("DMMC Export failed: "+(e&&e.message?e.message:String(e)));}})(document);`;

    return makeBookmarklet(code);
  }, []);

  useEffect(() => {
    if (!dragLinkRef.current) return;
    dragLinkRef.current.setAttribute("href", bookmarkletHref);
  }, [bookmarkletHref]);

  useEffect(() => {
    if (!dragMobileLinkRef.current) return;
    dragMobileLinkRef.current.setAttribute("href", mobileBookmarkletHref);
  }, [mobileBookmarkletHref]);

  return (
    <PageWrapper>
      <PageCard color="blue">
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#39b7ff]/30 bg-[#39b7ff]/10 px-4 py-2 text-xs font-semibold tracking-wider text-[#2f2461]/70">
            <span className="h-2 w-2 rounded-full bg-[#39b7ff] shadow-[0_0_16px_rgba(57,183,255,0.55)]" />
            BOOKMARKLETS
          </div>
        </div>

        <SectionHeader color="blue">Export maimai DX NET (Intl)</SectionHeader>

        <p className="mb-8 text-center text-sm font-medium leading-6 text-[#2f2461]/70 max-w-3xl mx-auto">
          Use this bookmarklet on maimaidx-eng.com while logged in. It will export your scores, then redirect you to{" "}
          <span className="font-semibold text-[#2f2461]">/my-score</span> with the results.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-5">
            <div className="text-xs font-bold tracking-widest text-[#2f2461]/50">MOBILE (RECOMMENDED)</div>
            <div className="mt-3">
              <a
                href="#"
                ref={dragMobileLinkRef}
                className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#39b7ff,#1a93ff)] px-6 py-3 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(57,183,255,0.55),0_0_24px_rgba(57,183,255,0.25)] hover:shadow-[0_0_0_1px_rgba(57,183,255,0.75),0_0_34px_rgba(57,183,255,0.45)]"
                onClick={(e) => e.preventDefault()}
              >
                DMMC Export (Mobile)
              </a>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#2f2461]/65">
              Short bookmarklet that loads the exporter script from DMMC. Works better on mobile browsers.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-5">
            <div className="text-xs font-bold tracking-widest text-[#2f2461]/50">COPY (MOBILE)</div>
            <textarea
              readOnly
              value={mobileBookmarkletHref}
              className="mt-4 h-40 w-full resize-none rounded-2xl border border-[#2f2461]/20 bg-[#17061f] p-4 font-mono text-xs text-white/80 outline-none"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(mobileBookmarkletHref);
                  setCopiedMobile(true);
                  window.setTimeout(() => setCopiedMobile(false), 1500);
                } catch {
                  setCopiedMobile(false);
                }
              }}
              className="mt-4 w-full rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-6 py-3 text-sm font-semibold text-[#2f2461]/75 hover:bg-[#2f2461]/10 hover:text-[#2f2461]"
            >
              {copiedMobile ? "Copied" : "Copy mobile bookmarklet"}
            </button>
          </div>

          <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-5">
            <div className="text-xs font-bold tracking-widest text-[#2f2461]/50">DESKTOP (INLINE)</div>
            <div className="mt-3">
              <a
                href="#"
                ref={dragLinkRef}
                className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#ff4fd8,#ff2fb1)] px-6 py-3 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(255,79,216,0.55),0_0_24px_rgba(255,79,216,0.25)] hover:shadow-[0_0_0_1px_rgba(255,79,216,0.75),0_0_34px_rgba(255,79,216,0.45)]"
                onClick={(e) => e.preventDefault()}
              >
                DMMC Export (Desktop)
              </a>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#2f2461]/65">
              Full exporter embedded inside the bookmarklet. Works on desktop, but can be too long for some mobile browsers.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-5">
            <div className="text-xs font-bold tracking-widest text-[#2f2461]/50">COPY (DESKTOP)</div>
            <textarea
              readOnly
              value={bookmarkletHref}
              className="mt-4 h-40 w-full resize-none rounded-2xl border border-[#2f2461]/20 bg-[#17061f] p-4 font-mono text-xs text-white/80 outline-none"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(bookmarkletHref);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                } catch {
                  setCopied(false);
                }
              }}
              className="mt-4 w-full rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-6 py-3 text-sm font-semibold text-[#2f2461]/75 hover:bg-[#2f2461]/10 hover:text-[#2f2461]"
            >
              {copied ? "Copied" : "Copy desktop bookmarklet"}
            </button>
          </div>
        </div>
      </PageCard>
    </PageWrapper>
  );
}
