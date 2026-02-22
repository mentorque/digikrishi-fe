import { api } from "@/lib/axios";
import type {
  AnalyticsSummary,
  AnalyticsByKey,
  AnalyticsRationCardStats,
} from "@/types";

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>("/analytics/summary");
  return data;
}

export async function fetchByDistrict(): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-district");
  return data;
}

export async function fetchByState(): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-state");
  return data;
}

export async function fetchByAgent(): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-agent");
  return data;
}

export async function fetchBySocialCategory(): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-social-category");
  return data;
}

export async function fetchByGender(): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-gender");
  return data;
}

export async function fetchByEducation(): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-education");
  return data;
}

export async function fetchByKycStatus(): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-kyc-status");
  return data;
}

export async function fetchByCaste(): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-caste");
  return data;
}

export async function fetchByFpc(): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-fpc");
  return data;
}

export async function fetchRationCardStats(): Promise<AnalyticsRationCardStats> {
  const { data } = await api.get<AnalyticsRationCardStats>("/analytics/ration-card-stats");
  return data;
}

export async function fetchByVillage(limit = 15): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-village", {
    params: { limit },
  });
  return data;
}

export async function fetchByTaluka(limit = 15): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-taluka", {
    params: { limit },
  });
  return data;
}

export async function fetchByMonth(): Promise<AnalyticsByKey[]> {
  const { data } = await api.get<AnalyticsByKey[]>("/analytics/by-month");
  return data;
}
