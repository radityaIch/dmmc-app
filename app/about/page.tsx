export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
        About DMMC
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">
        We are a passionate collective of rhythm game enthusiasts based right here in Denpasar, Bali.
        Brought together by the flashing lights and high-BPM beats of maimai, DMMC was created to
        connect local players of all skill levels. We are an independent community with no official
        partnership. We know that grinding for that SSS+ rank is always better with friends cheering
        you on.
      </p>

      <div className="mt-10 rounded-xl border border-white/15 bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/90">Notice & Terms</h2>
        <p className="mt-3 text-sm leading-6 text-white/70">
          DMMC is an unofficial, fan-made community project and is not affiliated with or endorsed by
          SEGA.
        </p>
        <p className="mt-2 text-sm leading-6 text-white/70">
          All rights to maimai logos, official artwork, and related assets belong to SEGA and their
          respective owners. We do not claim ownership of official assets used on this site (I do not
          own / credit to official art).
        </p>
        <p className="mt-2 text-sm leading-6 text-white/70">
          If any rights holder requests edits or takedown, we will comply as soon as possible.
        </p>
        <p className="mt-2 text-sm leading-6 text-white/70">
          Takedown contact: <a href="mailto:ichinomiya.mori@gmail.com" className="font-medium text-white/90 hover:text-[#ff4fd8]">ichinomiya.mori@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
