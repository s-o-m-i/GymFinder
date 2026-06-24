"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { EXPLORE_CENTER_ITEMS } from "@/lib/home-data";
import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const navBtnClass =
  "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#0B2545]/90 text-white shadow-[0_6px_20px_rgba(11,37,69,0.35)] backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-[#0B2545] disabled:pointer-events-none disabled:opacity-35 sm:h-10 sm:w-10 lg:h-11 lg:w-11 cursor-pointer";

function ExploreCenterCard({
  title,
  subtitle,
  href,
  image,
  icon: Icon,
}: (typeof EXPLORE_CENTER_ITEMS)[number]) {
  return (
    <Link
      href={href}
      className="group explore-center-card relative block w-full overflow-hidden rounded-2xl sm:rounded-[18px]"
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 480px) 78vw, (max-width: 768px) 45vw, (max-width: 1024px) 32vw, 260px"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
        <Icon className="mb-2 h-4 w-4 text-white/95 sm:mb-3 sm:h-5 sm:w-5" strokeWidth={1.75} aria-hidden />
        <h3 className="font-heading text-lg font-bold text-white sm:text-xl lg:text-[1.35rem]">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-white/75 sm:mt-1 sm:text-sm">{subtitle}</p>
      </div>
    </Link>
  );
}

export function ExploreCenterSection() {
  const showNavigation = EXPLORE_CENTER_ITEMS.length > 1;
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);

  function syncNavVisibility(swiper: SwiperType) {
    setCanGoPrev(!swiper.isBeginning);
    setCanGoNext(!swiper.isEnd);
  }

  return (
    <section id="explore-center" className="overflow-x-clip bg-[#f3f4f6] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-center text-2xl font-bold text-[#0B2545] sm:text-3xl">
          Explore Center
        </h2>
      </div>

      <div className="relative mx-auto mt-8 max-w-7xl sm:mt-10">
        <div className="relative px-4 sm:px-6 lg:px-8">
          {showNavigation && (
            <>
              <button
                type="button"
                aria-label="Previous category"
                aria-hidden={!canGoPrev}
                tabIndex={canGoPrev ? 0 : -1}
                className={cn(
                  "explore-center-swiper-prev left-1 sm:left-2 lg:left-4",
                  navBtnClass,
                  !canGoPrev && "pointer-events-none opacity-0"
                )}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                aria-label="Next category"
                aria-hidden={!canGoNext}
                tabIndex={canGoNext ? 0 : -1}
                className={cn(
                  "explore-center-swiper-next right-1 sm:right-2 lg:right-4",
                  navBtnClass,
                  !canGoNext && "pointer-events-none opacity-0"
                )}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.25} />
              </button>
            </>
          )}

          <Swiper
            modules={[Navigation, Pagination, A11y]}
            onSwiper={syncNavVisibility}
            onSlideChange={syncNavVisibility}
            onResize={syncNavVisibility}
            navigation={
              showNavigation
                ? {
                    prevEl: ".explore-center-swiper-prev",
                    nextEl: ".explore-center-swiper-next",
                  }
                : false
            }
            pagination={{
              clickable: true,
              bulletClass: "explore-center-bullet",
              bulletActiveClass: "explore-center-bullet-active",
            }}
            slidesPerView="auto"
            spaceBetween={12}
            breakpoints={{
              480: { spaceBetween: 14 },
              640: { spaceBetween: 16 },
              768: { spaceBetween: 18 },
              1024: { spaceBetween: 20 },
              1280: { spaceBetween: 22 },
            }}
            watchOverflow
            className="explore-center-swiper"
          >
            {EXPLORE_CENTER_ITEMS.map((item) => (
              <SwiperSlide key={item.href} className="explore-center-slide">
                <ExploreCenterCard {...item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
