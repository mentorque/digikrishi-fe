import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFarmer } from "@/hooks/useFarmer";
import { updateFarmer } from "@/api/farmers";
import type { Gender, KycStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileImage } from "lucide-react";

const farmerSchema = z.object({
  farmer_code: z.string().min(1),
  name: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  dob: z.string().optional(),
  education: z.string().optional(),
  kyc_status: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  is_activated: z.boolean().optional(),
  profile_pic_url: z.string().optional(),
  village: z.string().optional(),
  taluka: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  landmark: z.string().optional(),
  fpc: z.string().optional(),
  shg: z.string().optional(),
  caste: z.string().optional(),
  social_category: z.string().optional(),
  ration_card: z.boolean().optional(),
  pan_url: z.string().optional(),
  aadhaar_url: z.string().optional(),
});

type FarmerForm = z.infer<typeof farmerSchema>;

export function FarmerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: farmer, isLoading, error } = useFarmer(id);
  const mutation = useMutation({
    mutationFn: ({ id: farmerId, payload }: { id: string; payload: Parameters<typeof updateFarmer>[1] }) =>
      updateFarmer(farmerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer", id] });
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FarmerForm>({
    resolver: zodResolver(farmerSchema),
  });

  useEffect(() => {
    if (!farmer) return;
    reset({
      farmer_code: farmer.farmer_code,
      name: farmer.name,
      gender: farmer.gender,
      dob: farmer.dob ?? undefined,
      education: farmer.education ?? undefined,
      kyc_status: farmer.kyc_status,
      is_activated: farmer.is_activated,
      profile_pic_url: farmer.profile_pic_url ?? "",
      village: farmer.FarmerAddress?.village,
      taluka: farmer.FarmerAddress?.taluka,
      district: farmer.FarmerAddress?.district,
      state: farmer.FarmerAddress?.state,
      pincode: farmer.FarmerAddress?.pincode,
      landmark: farmer.FarmerAddress?.landmark,
      fpc: farmer.FarmerProfileDetails?.fpc,
      shg: farmer.FarmerProfileDetails?.shg,
      caste: farmer.FarmerProfileDetails?.caste,
      social_category: farmer.FarmerProfileDetails?.social_category,
      ration_card: farmer.FarmerProfileDetails?.ration_card,
      pan_url: farmer.FarmerDoc?.pan_url ?? "",
      aadhaar_url: farmer.FarmerDoc?.aadhaar_url ?? "",
    });
  }, [farmer, reset]);

  const kycStatus = watch("kyc_status");
  const gender = watch("gender");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function onSubmit(values: FarmerForm) {
    if (!id) return;
    mutation.mutate({
      id,
      payload: {
        farmer_code: values.farmer_code,
        name: values.name,
        gender: (values.gender as Gender) ?? null,
        dob: values.dob || null,
        education: values.education || null,
        kyc_status: (values.kyc_status as KycStatus) ?? "PENDING",
        is_activated: values.is_activated ?? false,
        profile_pic_url: values.profile_pic_url?.trim() || null,
        address: {
          village: values.village,
          taluka: values.taluka,
          district: values.district,
          state: values.state,
          pincode: values.pincode,
          landmark: values.landmark,
        },
        profileDetails: {
          fpc: values.fpc,
          shg: values.shg,
          caste: values.caste,
          social_category: values.social_category,
          ration_card: values.ration_card,
        },
        docs: {
          pan_url: values.pan_url?.trim() || null,
          aadhaar_url: values.aadhaar_url?.trim() || null,
        },
      },
    });
  }

  if (isLoading || !farmer) {
    return (
      <div className="flex items-center justify-center py-12">
        {error ? (
          <p className="text-destructive">Failed to load farmer.</p>
        ) : (
          <p className="text-muted-foreground">Loading…</p>
        )}
      </div>
    );
  }

  const profilePicUrl = watch("profile_pic_url");
  const displayPicUrl = (profilePicUrl?.trim() || farmer.profile_pic_url) || null;
  const panUrl = watch("pan_url")?.trim() || farmer.FarmerDoc?.pan_url || null;
  const aadhaarUrl = watch("aadhaar_url")?.trim() || farmer.FarmerDoc?.aadhaar_url || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/farmers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
          {displayPicUrl ? (
            <img
              src={displayPicUrl}
              alt={`${farmer.name} profile`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl font-semibold text-muted-foreground">
              {farmer.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{farmer.name}</h2>
          <p className="text-muted-foreground">{farmer.farmer_code}</p>
        </div>
        <Badge variant={farmer.is_activated ? "default" : "outline"}>
          {farmer.is_activated ? "Active" : "Inactive"}
        </Badge>
        <Badge variant="secondary">{farmer.kyc_status}</Badge>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Basic details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="farmer_code">Farmer code</Label>
                <Input id="farmer_code" {...register("farmer_code")} />
                {errors.farmer_code && (
                  <p className="text-sm text-destructive">{errors.farmer_code.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={gender ?? ""}
                  onValueChange={(v) => setValue("gender", v === "" ? null : (v as Gender))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" {...register("dob")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input id="education" {...register("education")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_pic_url">Profile picture (CDN URL)</Label>
              <Input
                id="profile_pic_url"
                type="url"
                placeholder="https://..."
                {...register("profile_pic_url")}
              />
              {errors.profile_pic_url && (
                <p className="text-sm text-destructive">{errors.profile_pic_url.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pan_url">PAN (CDN URL)</Label>
                <Input
                  id="pan_url"
                  type="url"
                  placeholder="https://..."
                  {...register("pan_url")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaar_url">Aadhaar (CDN URL)</Label>
                <Input
                  id="aadhaar_url"
                  type="url"
                  placeholder="https://..."
                  {...register("aadhaar_url")}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>KYC status</Label>
                <Select
                  value={kycStatus ?? "PENDING"}
                  onValueChange={(v) => setValue("kyc_status", v as KycStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input id="village" {...register("village")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taluka">Taluka</Label>
                <Input id="taluka" {...register("taluka")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input id="district" {...register("district")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" {...register("pincode")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input id="landmark" {...register("landmark")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fpc">FPC</Label>
                <Input id="fpc" {...register("fpc")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shg">SHG</Label>
                <Input id="shg" {...register("shg")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caste">Caste</Label>
                <Input id="caste" {...register("caste")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_category">Social category</Label>
                <Input id="social_category" {...register("social_category")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <p className="text-sm text-muted-foreground">Click a card to preview</p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => panUrl && setPreviewUrl(panUrl)}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 p-6 min-w-[140px] hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
              disabled={!panUrl}
            >
              <FileImage className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm font-medium">PAN</span>
              {panUrl ? (
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">View</span>
              ) : (
                <span className="text-xs text-muted-foreground">No URL</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => aadhaarUrl && setPreviewUrl(aadhaarUrl)}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 p-6 min-w-[140px] hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
              disabled={!aadhaarUrl}
            >
              <FileImage className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm font-medium">Aadhaar</span>
              {aadhaarUrl ? (
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">View</span>
              ) : (
                <span className="text-xs text-muted-foreground">No URL</span>
              )}
            </button>
          </CardContent>
        </Card>

        <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto p-0">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Document preview"
                className="w-full h-auto object-contain"
              />
            )}
          </DialogContent>
        </Dialog>

        <div className="mt-6 flex justify-end gap-2">
          <Link to="/farmers">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
