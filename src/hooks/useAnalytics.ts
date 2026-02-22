import { useQuery } from "@tanstack/react-query";
import {
  fetchAnalyticsSummary,
  fetchByDistrict,
  fetchByState,
  fetchByAgent,
  fetchBySocialCategory,
  fetchByGender,
  fetchByEducation,
  fetchByKycStatus,
  fetchByCaste,
  fetchByFpc,
  fetchRationCardStats,
  fetchByVillage,
  fetchByTaluka,
  fetchByMonth,
} from "@/api/analytics";

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: fetchAnalyticsSummary,
  });
}

export function useAnalyticsByDistrict() {
  return useQuery({
    queryKey: ["analytics", "by-district"],
    queryFn: fetchByDistrict,
  });
}

export function useAnalyticsByState() {
  return useQuery({
    queryKey: ["analytics", "by-state"],
    queryFn: fetchByState,
  });
}

export function useAnalyticsByAgent() {
  return useQuery({
    queryKey: ["analytics", "by-agent"],
    queryFn: fetchByAgent,
  });
}

export function useAnalyticsBySocialCategory() {
  return useQuery({
    queryKey: ["analytics", "by-social-category"],
    queryFn: fetchBySocialCategory,
  });
}

export function useAnalyticsByGender() {
  return useQuery({
    queryKey: ["analytics", "by-gender"],
    queryFn: fetchByGender,
  });
}

export function useAnalyticsByEducation() {
  return useQuery({
    queryKey: ["analytics", "by-education"],
    queryFn: fetchByEducation,
  });
}

export function useAnalyticsByKycStatus() {
  return useQuery({
    queryKey: ["analytics", "by-kyc-status"],
    queryFn: fetchByKycStatus,
  });
}

export function useAnalyticsByCaste() {
  return useQuery({
    queryKey: ["analytics", "by-caste"],
    queryFn: fetchByCaste,
  });
}

export function useAnalyticsByFpc() {
  return useQuery({
    queryKey: ["analytics", "by-fpc"],
    queryFn: fetchByFpc,
  });
}

export function useAnalyticsRationCardStats() {
  return useQuery({
    queryKey: ["analytics", "ration-card-stats"],
    queryFn: fetchRationCardStats,
  });
}

export function useAnalyticsByVillage(limit = 15) {
  return useQuery({
    queryKey: ["analytics", "by-village", limit],
    queryFn: () => fetchByVillage(limit),
  });
}

export function useAnalyticsByTaluka(limit = 15) {
  return useQuery({
    queryKey: ["analytics", "by-taluka", limit],
    queryFn: () => fetchByTaluka(limit),
  });
}

export function useAnalyticsByMonth() {
  return useQuery({
    queryKey: ["analytics", "by-month"],
    queryFn: fetchByMonth,
  });
}
