import type { UploadedImage } from "@/lib/gym-images-form";
import type { GymBranchStatusValue } from "@/lib/gym-branch-rules";

export type GymBranchFormState = {
  name: string;
  slug: string;
  address: string;
  area: string;
  city: string;
  latitude: string;
  longitude: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  openingHours: string;
  ladiesHours: string;
  status: GymBranchStatusValue;
  isPrimary: boolean;
  description: string;
  priceMin: string;
  priceMax: string;
  ladiesStatus: string;
  sizeCategory: string;
  establishedYear: string;
  memberCount: string;
  coachInfo: string;
  equipment: string;
  transformations: string;
  useCommonAmenities: boolean;
  useCommonDisciplines: boolean;
  useCommonHours: boolean;
  disciplineIds: string[];
  customDisciplineNames: string[];
  amenityIds: string[];
  customAmenityNames: string[];
  coverImage: UploadedImage | null;
  galleryImages: UploadedImage[];
};

export const EMPTY_BRANCH_FORM: GymBranchFormState = {
  name: "",
  slug: "",
  address: "",
  area: "",
  city: "Islamabad",
  latitude: "",
  longitude: "",
  phone: "",
  whatsappNumber: "",
  email: "",
  openingHours: "",
  ladiesHours: "",
  status: "ACTIVE",
  isPrimary: false,
  description: "",
  priceMin: "",
  priceMax: "",
  ladiesStatus: "",
  sizeCategory: "",
  establishedYear: "",
  memberCount: "",
  coachInfo: "",
  equipment: "",
  transformations: "",
  useCommonAmenities: true,
  useCommonDisciplines: true,
  useCommonHours: true,
  disciplineIds: [],
  customDisciplineNames: [],
  amenityIds: [],
  customAmenityNames: [],
  coverImage: null,
  galleryImages: [],
};

export function branchToForm(
  branch: {
    name: string;
    slug: string;
    address: string;
    area: string;
    city: string;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string | null;
    whatsappNumber?: string | null;
    email?: string | null;
    openingHours?: string | null;
    ladiesHours?: string | null;
    status: GymBranchStatusValue;
    isPrimary: boolean;
    description?: string | null;
    priceMin?: number | null;
    priceMax?: number | null;
    ladiesStatus?: string | null;
    sizeCategory?: string | null;
    establishedYear?: number | null;
    memberCount?: number | null;
    coachInfo?: string | null;
    equipment?: string | null;
    transformations?: string | null;
    useCommonAmenities?: boolean;
    useCommonDisciplines?: boolean;
    useCommonHours?: boolean;
  },
  extras?: {
    coverImage?: UploadedImage | null;
    galleryImages?: UploadedImage[];
    disciplineIds?: string[];
    customDisciplineNames?: string[];
    amenityIds?: string[];
    customAmenityNames?: string[];
  }
): GymBranchFormState {
  return {
    name: branch.name,
    slug: branch.slug,
    address: branch.address,
    area: branch.area,
    city: branch.city,
    latitude: branch.latitude?.toString() ?? "",
    longitude: branch.longitude?.toString() ?? "",
    phone: branch.phone ?? "",
    whatsappNumber: branch.whatsappNumber ?? "",
    email: branch.email ?? "",
    openingHours: branch.openingHours ?? "",
    ladiesHours: branch.ladiesHours ?? "",
    status: branch.status,
    isPrimary: branch.isPrimary,
    description: branch.description ?? "",
    priceMin: branch.priceMin?.toString() ?? "",
    priceMax: branch.priceMax?.toString() ?? "",
    ladiesStatus: branch.ladiesStatus ?? "",
    sizeCategory: branch.sizeCategory ?? "",
    establishedYear: branch.establishedYear?.toString() ?? "",
    memberCount: branch.memberCount?.toString() ?? "",
    coachInfo: branch.coachInfo ?? "",
    equipment: branch.equipment ?? "",
    transformations: branch.transformations ?? "",
    useCommonAmenities: branch.useCommonAmenities ?? true,
    useCommonDisciplines: branch.useCommonDisciplines ?? true,
    useCommonHours: branch.useCommonHours ?? true,
    disciplineIds: extras?.disciplineIds ?? [],
    customDisciplineNames: extras?.customDisciplineNames ?? [],
    amenityIds: extras?.amenityIds ?? [],
    customAmenityNames: extras?.customAmenityNames ?? [],
    coverImage: extras?.coverImage ?? null,
    galleryImages: extras?.galleryImages ?? [],
  };
}
