export type UserRole = "TENANT" | "FIELD_OFFICER" | "FARMER";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type CsvJobStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface Tenant {
  id: string;
  name: string;
  email: string;
}

export interface User {
  id: string;
  email: string | null;
  mobile: string | null;
  role: UserRole;
  tenant_id: string | null;
  is_active: boolean;
  Tenant?: Tenant;
}

export interface FarmerAddress {
  id?: string;
  farmer_id?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export interface FarmerProfileDetails {
  id?: string;
  farmer_id?: string;
  fpc?: string;
  shg?: string;
  caste?: string;
  social_category?: string;
  ration_card?: boolean;
}

export interface FarmerLand {
  id?: string;
  farmer_id?: string;
  land_size?: number | string;
  crop_type?: string;
  irrigation_type?: string;
}

export interface FarmerDoc {
  id?: string;
  farmer_id?: string;
  pan_url?: string | null;
  aadhaar_url?: string | null;
}

export interface Farmer {
  id: string;
  farmer_code: string;
  user_id: string | null;
  tenant_id: string;
  name: string;
  gender: Gender | null;
  dob: string | null;
  education: string | null;
  kyc_status: KycStatus;
  is_activated: boolean;
  created_by_agent_id: string | null;
  profile_pic_url?: string | null;
  created_at: string;
  updated_at: string;
  FarmerAddress?: FarmerAddress | null;
  FarmerProfileDetails?: FarmerProfileDetails | null;
  FarmerDoc?: FarmerDoc | null;
  FarmerLands?: FarmerLand[];
  FarmerAgentMaps?: Array<{ Agent?: { id: string; email: string | null; mobile: string | null } }>;
  User?: User | null;
}

export interface FarmerCreatePayload {
  farmer_code: string;
  name: string;
  gender?: Gender | null;
  dob?: string | null;
  education?: string | null;
  kyc_status?: KycStatus;
  is_activated?: boolean;
  profile_pic_url?: string | null;
  address?: FarmerAddress | null;
  profileDetails?: FarmerProfileDetails | null;
  docs?: FarmerDoc | null;
  lands?: FarmerLand[];
}

export interface CsvUploadJob {
  id: string;
  tenant_id: string;
  file_name: string;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  status: CsvJobStatus;
  created_at: string;
}

export interface AnalyticsSummary {
  total_farmers: number;
  activated_percent: number;
  kyc_completion_percent: number;
  with_profile_pic_count?: number;
  with_profile_pic_percent?: number;
}

export interface AnalyticsByKey {
  district?: string;
  state?: string;
  social_category?: string;
  agent_id?: string;
  gender?: string;
  education?: string;
  kyc_status?: string;
  caste?: string;
  fpc?: string;
  village?: string;
  taluka?: string;
  month?: string;
  count: number;
}

export interface AnalyticsRationCardStats {
  with_ration_card: number;
  without_ration_card: number;
}

export interface PaginationState {
  page: number;
  limit: number;
}

export interface FarmerFilters {
  district?: string;
  state?: string;
  fpc?: string;
}
