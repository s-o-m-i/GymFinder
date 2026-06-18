import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DISCIPLINES = [
  "Weightlifting",
  "Cardio",
  "CrossFit",
  "Boxing",
  "MMA",
  "Muay Thai",
  "Kickboxing",
  "BJJ",
  "Judo",
  "Karate",
  "Wrestling",
  "Functional Training",
  "Yoga",
  "Zumba",
  "Spinning",
];

const AMENITIES = [
  "Parking Available",
  "Changing Rooms",
  "Lockers",
  "Showers",
  "Air Conditioning",
  "Protein Bar",
  "Personal Training",
  "Group Classes",
  "Sauna",
  "Swimming Pool",
  "Steam Room",
  "WiFi",
  "CCTV",
  "24/7 Access",
  "Juice Bar",
];

const GYMS = [
  {
    name: "Iron Will Fitness Club",
    slug: "iron-will-fitness-club-f7-islamabad",
    type: "gym" as const,
    description:
      "Iron Will Fitness Club is Islamabad's premier training facility located in the heart of F-7. Featuring state-of-the-art equipment, professional coaches, and a motivating atmosphere for all fitness levels. Whether you're a beginner or an advanced athlete, Iron Will has the tools and expertise to help you achieve your goals.",
    address: "Plot 14, Markaz F-7/2, Islamabad",
    area: "F-7",
    city: "Islamabad",
    latitude: 33.7293,
    longitude: 73.0432,
    priceMin: 4000,
    priceMax: 8000,
    ladiesStatus: "ladies_timings" as const,
    sizeCategory: "large" as const,
    whatsappNumber: "03001234567",
    openingHours: "Mon–Sat 6AM–10PM, Sun 8AM–6PM",
    rating: 4.7,
    featured: true,
    coachInfo:
      "Led by Coach Asad Khan (NSCA Certified) with 10+ years of experience. Specializes in strength training and body composition.",
    disciplines: ["Weightlifting", "Cardio", "CrossFit", "Functional Training"],
    amenities: [
      "Parking Available",
      "Changing Rooms",
      "Lockers",
      "Showers",
      "Air Conditioning",
      "Personal Training",
      "Group Classes",
      "WiFi",
    ],
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80",
    ],
    reviews: [
      { rating: 5, text: "Best gym in Islamabad! Equipment is top notch.", author: "Bilal A." },
      { rating: 4, text: "Good coaches and clean environment.", author: "Sara M." },
    ],
  },
  {
    name: "KO Boxing Academy",
    slug: "ko-boxing-academy-f10-islamabad",
    type: "boxing" as const,
    description:
      "KO Boxing Academy is Islamabad's most dedicated boxing training center. We train fighters at all levels — from complete beginners learning the basics to competitive amateur and professional boxers. Our head coach has produced multiple national champions. The academy features proper boxing rings, heavy bags, speed bags, and full sparring facilities.",
    address: "F-10 Markaz, Near McDonald's, Islamabad",
    area: "F-10",
    city: "Islamabad",
    latitude: 33.7006,
    longitude: 73.0087,
    priceMin: 5000,
    priceMax: 9000,
    ladiesStatus: "mixed" as const,
    sizeCategory: "medium" as const,
    whatsappNumber: "03119876543",
    openingHours: "Mon–Fri 5PM–9PM, Sat 10AM–2PM",
    rating: 4.9,
    featured: true,
    coachInfo:
      "Head Coach: Usman Ali — Former national boxing champion, 3x gold medalist at National Games. Produces competitive boxers at regional and national level.",
    disciplines: ["Boxing", "Kickboxing"],
    amenities: [
      "Changing Rooms",
      "Showers",
      "Air Conditioning",
      "Personal Training",
      "Group Classes",
      "CCTV",
    ],
    images: [
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80",
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80",
    ],
    reviews: [
      { rating: 5, text: "Coach Usman is world class. I've been here 2 years and improved massively.", author: "Ahmed K." },
      { rating: 5, text: "Proper boxing gym, not just fitness.", author: "Hamza T." },
    ],
  },
  {
    name: "Rawalpindi Fight Club",
    slug: "rawalpindi-fight-club-saddar",
    type: "mma" as const,
    description:
      "Rawalpindi's #1 MMA and combat sports gym. We offer comprehensive training in MMA, Brazilian Jiu-Jitsu, Muay Thai, and Wrestling. Located in Saddar, easily accessible from all parts of Rawalpindi. Our fighters compete at provincial and national levels. Beginners are always welcome — our curriculum starts from zero.",
    address: "2nd Floor, Haider Complex, Saddar, Rawalpindi",
    area: "Saddar",
    city: "Rawalpindi",
    latitude: 33.5986,
    longitude: 73.0435,
    priceMin: 3500,
    priceMax: 7000,
    ladiesStatus: "men_only" as const,
    sizeCategory: "medium" as const,
    whatsappNumber: "03215551234",
    openingHours: "Mon–Sat 6AM–8AM, 5PM–10PM",
    rating: 4.6,
    featured: true,
    coachInfo:
      "Coach Faraz Ahmed — BJJ Purple Belt, Muay Thai coach. Trained under international instructors in Thailand and UAE.",
    disciplines: ["MMA", "BJJ", "Muay Thai", "Wrestling"],
    amenities: [
      "Changing Rooms",
      "Lockers",
      "Air Conditioning",
      "Personal Training",
      "Group Classes",
    ],
    images: [
      "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&q=80",
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80",
    ],
    reviews: [
      { rating: 5, text: "Serious training environment. Real fighters come here.", author: "Raza M." },
      { rating: 4, text: "Great BJJ program.", author: "Tariq H." },
    ],
  },
  {
    name: "Bahria Wellness Center",
    slug: "bahria-wellness-center-bahria-town-rawalpindi",
    type: "gym" as const,
    description:
      "Bahria Wellness Center is a premium fitness destination inside Bahria Town Rawalpindi. We cater to families and professionals looking for a complete wellness experience. The center features a large gym floor, dedicated ladies section, group classes, swimming pool, and steam rooms. Perfect for those who want luxury fitness facilities.",
    address: "Commercial Block, Phase 4, Bahria Town, Rawalpindi",
    area: "Bahria Town",
    city: "Rawalpindi",
    latitude: 33.5208,
    longitude: 72.9967,
    priceMin: 6000,
    priceMax: 12000,
    ladiesStatus: "ladies_only" as const,
    sizeCategory: "large" as const,
    whatsappNumber: "03331112233",
    openingHours: "Daily 6AM–11PM",
    rating: 4.5,
    featured: true,
    coachInfo:
      "Team of 5 certified trainers covering all fitness disciplines. Ladies-only sessions available every morning.",
    disciplines: ["Weightlifting", "Cardio", "Yoga", "Zumba", "Spinning"],
    amenities: [
      "Parking Available",
      "Changing Rooms",
      "Lockers",
      "Showers",
      "Air Conditioning",
      "Swimming Pool",
      "Sauna",
      "Steam Room",
      "Personal Training",
      "Group Classes",
      "Juice Bar",
      "WiFi",
    ],
    images: [
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
      "https://images.unsplash.com/photo-1577221084712-45b0445d2b00?w=800&q=80",
    ],
    reviews: [
      { rating: 5, text: "The ladies section is amazing. Very professional staff.", author: "Nadia S." },
      { rating: 4, text: "Best facility in Bahria. Worth the price.", author: "Kamran B." },
    ],
  },
  {
    name: "Capital Muay Thai",
    slug: "capital-muay-thai-g9-islamabad",
    type: "muay_thai" as const,
    description:
      "Capital Muay Thai brings authentic Muay Thai training to Islamabad. Our head instructor trained in Thailand for 3 years at a professional camp in Pattaya. We teach everything from beginner basics to advanced clinch work and ring strategy. Ideal for fitness, self-defense, or serious competition. Thai pads, heavy bags, and sparring gloves provided.",
    address: "G-9/4, Near Shifa Hospital, Islamabad",
    area: "G-9",
    city: "Islamabad",
    latitude: 33.6882,
    longitude: 73.0533,
    priceMin: 4500,
    priceMax: 7500,
    ladiesStatus: "mixed" as const,
    sizeCategory: "small" as const,
    whatsappNumber: "03004449988",
    openingHours: "Mon–Fri 6PM–9PM, Sat 11AM–2PM",
    rating: 4.8,
    featured: false,
    coachInfo:
      "Instructor Zeeshan Butt — Trained at Tiger Muay Thai, Pattaya, Thailand (2019–2022). Certified WMF Muay Thai instructor.",
    disciplines: ["Muay Thai", "Kickboxing"],
    amenities: [
      "Changing Rooms",
      "Air Conditioning",
      "Group Classes",
      "Personal Training",
    ],
    images: [
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80",
    ],
    reviews: [
      { rating: 5, text: "Authentic Muay Thai. Coach Zeeshan is excellent.", author: "Zain A." },
    ],
  },
  {
    name: "DHA Power Gym",
    slug: "dha-power-gym-dha-phase-2-islamabad",
    type: "gym" as const,
    description:
      "DHA Power Gym serves the DHA Phase 2 community with premium equipment and a no-nonsense approach to fitness. Equipped with Olympic lifting platforms, powerlifting gear, and all major cardio machines. Night sessions available. Personal training by appointment. Parking for 50+ vehicles.",
    address: "Block G, DHA Phase 2, Islamabad",
    area: "DHA Phase 2",
    city: "Islamabad",
    latitude: 33.5295,
    longitude: 73.1273,
    priceMin: 3500,
    priceMax: 6500,
    ladiesStatus: "ladies_timings" as const,
    sizeCategory: "large" as const,
    whatsappNumber: "03127773344",
    openingHours: "Mon–Sun 5AM–11PM",
    rating: 4.4,
    featured: false,
    coachInfo: null,
    disciplines: ["Weightlifting", "Cardio", "Functional Training", "CrossFit"],
    amenities: [
      "Parking Available",
      "Changing Rooms",
      "Lockers",
      "Showers",
      "Air Conditioning",
      "Personal Training",
      "24/7 Access",
      "CCTV",
    ],
    images: [
      "https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?w=800&q=80",
    ],
    reviews: [
      { rating: 4, text: "Good equipment, clean, parking is easy.", author: "Imran D." },
    ],
  },
  {
    name: "Westridge Kickboxing Gym",
    slug: "westridge-kickboxing-gym-rawalpindi",
    type: "kickboxing" as const,
    description:
      "Westridge Kickboxing Gym specializes in kickboxing and K-1 style training. Located in Westridge, Rawalpindi, we welcome all ages including juniors from age 10. Monthly competitions are organized to help students gain ring experience. Our gym has produced multiple Rawalpindi and Punjab championship winners.",
    address: "Street 12, Westridge 1, Rawalpindi",
    area: "Westridge",
    city: "Rawalpindi",
    latitude: 33.5651,
    longitude: 73.0382,
    priceMin: 2500,
    priceMax: 5000,
    ladiesStatus: "mixed" as const,
    sizeCategory: "small" as const,
    whatsappNumber: "03365556677",
    openingHours: "Mon–Sat 4PM–9PM",
    rating: 4.3,
    featured: false,
    coachInfo:
      "Head Coach: Khalid Mehmood — K-1 style kickboxing specialist with 15 years of coaching experience.",
    disciplines: ["Kickboxing", "Boxing"],
    amenities: [
      "Changing Rooms",
      "Group Classes",
      "Personal Training",
    ],
    images: [
      "https://images.unsplash.com/photo-1591258370814-01609b341790?w=800&q=80",
    ],
    reviews: [
      { rating: 4, text: "Great for kickboxing. Affordable and competitive environment.", author: "Adnan R." },
      { rating: 5, text: "My kid trains here. Coach Khalid is amazing with juniors.", author: "Parent" },
    ],
  },
  {
    name: "Islamabad Martial Arts Academy",
    slug: "islamabad-martial-arts-academy-f11",
    type: "martial_arts" as const,
    description:
      "The Islamabad Martial Arts Academy is a multi-discipline martial arts school offering Karate, Judo, and BJJ under one roof. Affiliated with national and international bodies. We run structured belt programs for both kids and adults. Weekend open mat sessions available for all BJJ practitioners.",
    address: "F-11 Markaz, Block C, Islamabad",
    area: "F-11",
    city: "Islamabad",
    latitude: 33.7107,
    longitude: 72.9987,
    priceMin: 3000,
    priceMax: 6000,
    ladiesStatus: "ladies_timings" as const,
    sizeCategory: "medium" as const,
    whatsappNumber: "03451239090",
    openingHours: "Mon–Fri 4PM–8PM, Sat 10AM–1PM",
    rating: 4.6,
    featured: false,
    coachInfo:
      "Master Saleem Shah (3rd Dan Black Belt Karate) and Coach Ali Hassan (BJJ Blue Belt) lead the program.",
    disciplines: ["Karate", "Judo", "BJJ"],
    amenities: [
      "Changing Rooms",
      "Air Conditioning",
      "Group Classes",
      "Personal Training",
      "Parking Available",
    ],
    images: [
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80",
    ],
    reviews: [
      { rating: 5, text: "Structured program, great for kids.", author: "Tariq A." },
      { rating: 4, text: "Good BJJ classes on weekends.", author: "Omar S." },
    ],
  },
  {
    name: "Galaxy Fitness Gulraiz",
    slug: "galaxy-fitness-gulraiz-rawalpindi",
    type: "gym" as const,
    description:
      "Galaxy Fitness is a modern gym serving the Gulraiz and Askari areas of Rawalpindi. Great equipment, experienced trainers, and a friendly atmosphere. Budget-friendly membership plans for students and military personnel available. Full ladies section with dedicated timings.",
    address: "Gulraiz Housing Scheme, Phase 2, Rawalpindi",
    area: "Gulraiz",
    city: "Rawalpindi",
    latitude: 33.5793,
    longitude: 72.9877,
    priceMin: 2000,
    priceMax: 4500,
    ladiesStatus: "ladies_timings" as const,
    sizeCategory: "medium" as const,
    whatsappNumber: "03018889900",
    openingHours: "Mon–Sat 6AM–10PM",
    rating: 4.2,
    featured: false,
    coachInfo: null,
    disciplines: ["Weightlifting", "Cardio"],
    amenities: [
      "Changing Rooms",
      "Lockers",
      "Showers",
      "Air Conditioning",
      "Personal Training",
    ],
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    ],
    reviews: [
      { rating: 4, text: "Affordable and clean. Good for daily training.", author: "Shoaib G." },
    ],
  },
  {
    name: "Fight Zone MMA Academy",
    slug: "fight-zone-mma-academy-g11-islamabad",
    type: "mma" as const,
    description:
      "Fight Zone is Islamabad's fastest growing MMA gym, established in 2021. We focus on practical, street-effective martial arts combined with sport fighting techniques. Our open mat policy every Friday allows practitioners of all gyms to come train together. Weekend seminars with international coaches are held quarterly.",
    address: "G-11/3, Near Centaurus, Islamabad",
    area: "G-11",
    city: "Islamabad",
    latitude: 33.7014,
    longitude: 73.0013,
    priceMin: 5000,
    priceMax: 10000,
    ladiesStatus: "ladies_timings" as const,
    sizeCategory: "large" as const,
    whatsappNumber: "03006667788",
    openingHours: "Mon–Fri 6AM–9AM, 5PM–10PM, Sat 9AM–1PM",
    rating: 4.7,
    featured: true,
    coachInfo:
      "Coach Hasan Mirza — IMMAF certified MMA coach, BJJ Purple Belt, 8 years coaching experience. Guest seminars by international coaches quarterly.",
    disciplines: ["MMA", "BJJ", "Muay Thai", "Wrestling", "Boxing"],
    amenities: [
      "Parking Available",
      "Changing Rooms",
      "Lockers",
      "Showers",
      "Air Conditioning",
      "Personal Training",
      "Group Classes",
      "WiFi",
      "CCTV",
    ],
    images: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
      "https://images.unsplash.com/photo-1598971639058-a622d7ee5b78?w=800&q=80",
    ],
    reviews: [
      { rating: 5, text: "The best MMA gym in Islamabad, period.", author: "Shahzad K." },
      { rating: 5, text: "Coach Hasan is world class. Great facility.", author: "Ali F." },
      { rating: 4, text: "Open mat Fridays are a highlight.", author: "Umar B." },
    ],
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.gymImage.deleteMany();
  await prisma.gymAmenity.deleteMany();
  await prisma.gymDiscipline.deleteMany();
  await prisma.gym.deleteMany();
  await prisma.discipline.deleteMany();
  await prisma.amenity.deleteMany();

  console.log("✓ Cleared existing data");

  // Seed disciplines
  const disciplineMap: Record<string, string> = {};
  for (const name of DISCIPLINES) {
    const d = await prisma.discipline.create({ data: { name } });
    disciplineMap[name] = d.id;
  }
  console.log(`✓ Created ${DISCIPLINES.length} disciplines`);

  // Seed amenities
  const amenityMap: Record<string, string> = {};
  for (const name of AMENITIES) {
    const a = await prisma.amenity.create({ data: { name } });
    amenityMap[name] = a.id;
  }
  console.log(`✓ Created ${AMENITIES.length} amenities`);

  // Seed gyms
  for (const gymData of GYMS) {
    const { disciplines, amenities, images, reviews, coachInfo, ...gymCore } = gymData;
    const [cover, ...gallery] = images;

    const gym = await prisma.gym.create({
      data: {
        ...gymCore,
        coachInfo: coachInfo ?? null,
        coverImage: cover ?? null,
        disciplines: {
          create: disciplines
            .filter((d) => disciplineMap[d])
            .map((d) => ({
              discipline: { connect: { id: disciplineMap[d] } },
            })),
        },
        amenities: {
          create: amenities
            .filter((a) => amenityMap[a])
            .map((a) => ({
              amenity: { connect: { id: amenityMap[a] } },
            })),
        },
        galleryImages: {
          create: gallery.map((imageUrl) => ({ imageUrl })),
        },
        reviews: {
          create: reviews.map((r) => ({
            rating: r.rating,
            text: r.text,
            author: r.author,
          })),
        },
      },
    });

    console.log(`✓ Created: ${gym.name}`);
  }

  console.log("\n✅ Seed complete!");
  console.log(`   Gyms: ${GYMS.length}`);
  console.log(`   Disciplines: ${DISCIPLINES.length}`);
  console.log(`   Amenities: ${AMENITIES.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
