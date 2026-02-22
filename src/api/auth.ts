import { api } from "@/lib/axios";
import type { User } from "@/types";

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface AuthMeResponse {
  user: User;
}

export interface LoginResponse {
  message: string;
  user: { id: string; email: string; role: string; tenant_id: string | null };
}

export async function login(body: LoginBody): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", body);
  return data;
}

export async function register(body: RegisterBody): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/register", body);
  return data;
}

export async function logout(): Promise<{ message: string }> {
  const { data } = await api.post("/auth/logout");
  return data;
}

export async function fetchMe(): Promise<AuthMeResponse> {
  const { data } = await api.get<AuthMeResponse>("/auth/me");
  return data;
}

export interface FieldOfficer {
  id: string;
  email: string | null;
  mobile: string | null;
  is_active: boolean;
  created_at: string;
}

export async function fetchFieldOfficers(): Promise<FieldOfficer[]> {
  const { data } = await api.get<FieldOfficer[]>("/auth/field-officers");
  return data;
}

export interface CreateFieldOfficerBody {
  email: string;
  password: string;
}

export async function createFieldOfficer(body: CreateFieldOfficerBody): Promise<{ message: string; user: FieldOfficer & { role: string; tenant_id: string } }> {
  const { data } = await api.post("/auth/field-officers", body);
  return data;
}
