import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFarmer } from "@/api/farmers";
import type { Gender, KycStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileDown } from "lucide-react";
import { Link } from "react-router-dom";
import { getSampleFarmerData } from "@/constants/sampleFarmer";

const farmerSchema = z.object({
  farmer_code: z.string().min(1, "Farmer code is required"),
  name: z.string().min(1, "Name is required"),
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

export function FarmerNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createFarmer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      navigate(`/farmers/${data.id}`);
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
    defaultValues: {
      farmer_code: "",
      name: "",
      kyc_status: "PENDING",
      is_activated: false,
    },
  });

  const kycStatus = watch("kyc_status");
  const gender = watch("gender");

  function loadSampleData() {
    reset(getSampleFarmerData() as FarmerForm);
  }

  function onSubmit(values: FarmerForm) {
    mutation.mutate({
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
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/farmers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">New farmer</h2>
            <p className="text-muted-foreground">Add a new farmer record</p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={loadSampleData}>
          <FileDown className="mr-2 h-4 w-4" />
          Load sample data
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Basic details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="farmer_code">Farmer code *</Label>
                <Input id="farmer_code" {...register("farmer_code")} />
                {errors.farmer_code && (
                  <p className="text-sm text-destructive">{errors.farmer_code.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
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
            <CardTitle>Profile (FPC / SHG / Caste)</CardTitle>
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

        <div className="mt-6 flex justify-end gap-2">
          <Link to="/farmers">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create farmer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
