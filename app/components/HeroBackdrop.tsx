import Image from "next/image";

export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute" />
     
      <Image
        src="/assets/images/circle_white.png"
        alt=""
        width={800}
        height={800}
        className="absolute top-8 left-1/2 h-[320px] w-[320px] -translate-x-1/2 opacity-45 md:h-[420px] md:w-[420px] [animation:slowSpin_500s_linear_infinite_reverse]"
      />
      <Image
        src="/assets/images/kv_logo_pc.png"
        alt=""
        width={1050}
        height={530}
        className="absolute top-6 left-1/2 hidden w-[460px] -translate-x-1/2 opacity-25 lg:block"
      />
    </div>
  );
}
