import Image from "next/image";

export function ArcadeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden ">
      <Image
        src="/assets/images/tile_green.png"
        alt=""
        width={216}
        height={1156}
        className="absolute top-16 right-0 hidden h-[50vh] w-auto opacity-55 lg:block [animation:driftY_30s_ease-in-out_infinite]"
      />
      <Image
        src="/assets/images/tile_purple_left.png"
        alt=""
        width={416}
        height={1156}
        className="absolute top-24 left-0 hidden h-[52vh] w-auto opacity-50 lg:block [animation:driftY_30s_ease-in-out_infinite_reverse]"
      />
      <Image
        src="/assets/images/tile_purple_right.png"
        alt=""
        width={384}
        height={1072}
        className="absolute top-32 right-[8%] hidden h-[44vh] w-auto opacity-40 xl:block [animation:driftY_30s_ease-in-out_infinite]"
      />
      <Image
        src="/assets/images/circle_yellow.png"
        alt=""
        width={844}
        height={768}
        className="absolute top-24 left-1/2 h-[420px] w-[560px] -translate-x-1/2 opacity-60 md:h-[520px] md:w-[690px]"
      />
      <Image
        src="/assets/images/circle_white.png"
        alt=""
        width={800}
        height={800}
        className="absolute top-0 left-1/2 h-[720px] w-[720px] -translate-x-1/2 opacity-24 [animation:slowSpin_500s_linear_infinite]"
      />
      <Image
        src="/assets/images/bg_pattern.png"
        alt=""
        width={800}
        height={800}
        className="absolute top-0 left-1/2 h-[100vh] w-[150vw] -translate-x-1/2 opacity-24 "
      />
      <Image
        src="/assets/images/3d_cube.png"
        alt=""
        width={128}
        height={128}
        className="absolute top-30 right-[8%] h-14 w-14 animate-[floaty_7s_ease-in-out_infinite] opacity-85"
      />
      <Image
        src="/assets/images/3d_star_small.png"
        alt=""
        width={56}
        height={56}
        className="absolute top-46 right-[15%] h-8 w-8 animate-[floaty_6.5s_ease-in-out_infinite] opacity-90"
      />
      <Image
        src="/assets/images/3d_glove_pink.png"
        alt=""
        width={128}
        height={128}
        className="absolute top-72 left-[4%] hidden h-18 w-18 animate-[floaty_7.2s_ease-in-out_infinite] opacity-90 md:block"
      />
      <Image
        src="/assets/images/3d_glove_blue.png"
        alt=""
        width={128}
        height={128}
        className="absolute top-[38rem] right-[4%] hidden h-18 w-18 animate-[floaty_7.8s_ease-in-out_infinite] opacity-90 md:block"
      />

    </div>
  );
}
