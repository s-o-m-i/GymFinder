import type { Gym, GymImage, GymDiscipline, GymAmenity, Discipline, Amenity, Review, MembershipPlan, StaffMember } from "@prisma/client";

export type GymWithRelations = Gym & {
  galleryImages: GymImage[];
  disciplines: (GymDiscipline & { discipline: Discipline })[];
  amenities: (GymAmenity & { amenity: Amenity })[];
  reviews: Review[];
  membershipPlans?: MembershipPlan[];
  staffMembers?: StaffMember[];
};

export type GymCardData = Pick<
  Gym,
  | "id"
  | "name"
  | "slug"
  | "type"
  | "customTypeLabel"
  | "area"
  | "city"
  | "priceMin"
  | "priceMax"
  | "ladiesStatus"
  | "sizeCategory"
  | "whatsappNumber"
  | "rating"
  | "featured"
  | "openingHours"
  | "coverImage"
> & {
  galleryImages: Pick<GymImage, "imageUrl" | "alt">[];
  disciplines: { discipline: Pick<Discipline, "name"> }[];
};

export type GymCardDataWithDistance = GymCardData & {
  distanceKm: number;
  latitude?: number | null;
  longitude?: number | null;
};

export interface NearbyResponse {
  gyms: GymCardDataWithDistance[];
  total: number;
  userLat: number;
  userLng: number;
  radius: number;
}

export interface GymFilters {
  city?: string;
  area?: string;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  ladiesStatus?: string;
  discipline?: string;
  amenity?: string;
  rating?: string;
  search?: string;
  sort?: "featured" | "price_asc" | "price_desc" | "rating";
  page?: number;
  limit?: number;
}

export interface PaginatedGyms {
  gyms: GymCardData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
