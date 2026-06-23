import { CategoryCard } from "@/components/home/CategoryCard";
import { HOME_CATEGORIES } from "@/lib/home-data";

export function CategoryDiscoverySection() {
  return (
    <section id="explore-categories" className="bg-[var(--bg)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
            Gyms in Pakistan
          </p>
          <h2 className="font-heading mb-4 text-2xl font-bold text-[var(--text)] sm:text-3xl">
            Explore Fitness Centers Across Pakistan
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            Browse gyms, boxing clubs, MMA academies, and fitness trainers in Lahore, Karachi,
            Islamabad, and cities nationwide.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_CATEGORIES.map((category) => (
            <CategoryCard key={category.href} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
