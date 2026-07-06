"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Autoplay, EffectFade, Pagination, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { HERO_BACKGROUND_SLIDES } from "@/lib/hero-data";
import { onReducedMotionChange, prefersReducedMotion } from "@/lib/motion/reduced-motion";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export function HeroBackgroundCarousel() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
    return onReducedMotionChange(setReduceMotion);
  }, []);

  if (HERO_BACKGROUND_SLIDES.length === 0) return null;

  const singleSlide = HERO_BACKGROUND_SLIDES.length === 1;

  return (
    <div className="hero-bg-carousel absolute inset-0 z-0" aria-hidden>
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, A11y]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={!singleSlide}
        speed={900}
        autoplay={
          singleSlide || reduceMotion
            ? false
            : {
                delay: 5500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
        }
        pagination={
          singleSlide
            ? false
            : {
                clickable: true,
                bulletClass: "hero-bg-bullet",
                bulletActiveClass: "hero-bg-bullet-active",
              }
        }
        className="hero-bg-swiper h-full w-full"
        data-hero-bg-swiper
      >
        {HERO_BACKGROUND_SLIDES.map((slide, index) => (
          <SwiperSlide key={slide.src} className="hero-bg-slide">
            <div className="relative h-full min-h-screen w-full">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover lg:object-right"
                style={{
                  objectPosition: slide.position ?? "center",
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
