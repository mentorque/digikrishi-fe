import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useFarmer } from "@/hooks/useFarmer";
import { useFarmerDocuments } from "@/hooks/useFarmerDocuments";
import {
  updateFarmer,
  deleteFarmer,
  getProfileDownloadUrl,
  getDocumentDownloadUrl,
  deleteProfile,
  deleteDocument,
  uploadProfileImage,
  uploadDocument,
} from "@/api/farmers";
import type { Gender, KycStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/ui/loader";
import { DotLoader } from "@/components/ui/dot-loader";
import { getErrorMessage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileImage, FileText, CreditCard, Trash2, Download, Upload } from "lucide-react";

type TabId = "details" | "documents";

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
});

type FarmerForm = z.infer<typeof farmerSchema>;

function getInitials(name: string | null | undefined): string {
  const n = (name ?? "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return n.slice(0, 2).toUpperCase();
}

export function FarmerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [previewState, setPreviewState] = useState<{ docType: string; url: string } | null>(null);
  const [previewUseIframe, setPreviewUseIframe] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<string | null>(null);
  const [profileUploading, setProfileUploading] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const documentFileInputRef = useRef<HTMLInputElement>(null);
  const { data: farmer, isLoading, error } = useFarmer(id, activeTab === "details");
  const { data: documents, isLoading: documentsLoading } = useFarmerDocuments(id, activeTab === "documents");
  const mutation = useMutation({
    mutationFn: ({ id: farmerId, payload }: { id: string; payload: Parameters<typeof updateFarmer>[1] }) =>
      updateFarmer(farmerId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["farmer", id] });
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      toast.success((data as { message?: string })?.message ?? "Farmer updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const deleteMutation = useMutation({
    mutationFn: (farmerId: string) => deleteFarmer(farmerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      toast.success(data?.message ?? "Farmer deactivated");
      navigate("/farmers");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
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
    });
  }, [farmer, reset]);

  const kycStatus = watch("kyc_status");
  const gender = watch("gender");
  const profilePicUrl = watch("profile_pic_url");
  const hasProfileKey = (profilePicUrl?.trim() || farmer?.profile_pic_url) || null;
  const { data: profileUrlData } = useQuery({
    queryKey: ["farmer", id, "profile-download-url"],
    queryFn: () => getProfileDownloadUrl(id!),
    enabled: !!id && !!hasProfileKey,
  });
  const rawProfileUrl = profileUrlData?.url ?? null;
  const displayPicUrl =
    rawProfileUrl && !rawProfileUrl.includes("PutObject") && !rawProfileUrl.includes("x-id=PutObject")
      ? rawProfileUrl
      : null;

  const doc = activeTab === "documents" ? documents : farmer?.FarmerDoc;
  const docTypes: { key: keyof NonNullable<typeof doc>; label: string; docType: string }[] = [
    { key: "shg_byelaws_url", label: "SHG Bye-laws", docType: "shg_byelaws" },
    { key: "extract_7_12_url", label: "7/12 Extract", docType: "extract_7_12" },
    { key: "consent_letter_url", label: "Consent Letter", docType: "consent_letter" },
    { key: "aadhaar_url", label: "Aadhaar", docType: "aadhaar" },
    { key: "pan_url", label: "PAN", docType: "pan" },
    { key: "bank_doc_url", label: "Bank", docType: "bank_doc" },
    { key: "other_doc_url", label: "Other", docType: "other" },
  ];

  const deleteProfileMutation = useMutation({
    mutationFn: (farmerId: string) => deleteProfile(farmerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["farmer", id] });
      toast.success(data?.message ?? "Profile picture removed");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const deleteDocumentMutation = useMutation({
    mutationFn: ({ farmerId, docType }: { farmerId: string; docType: string }) =>
      deleteDocument(farmerId, docType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer", id, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["farmer", id] });
      setPreviewState(null);
      toast.success("Document removed");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  async function openDocumentPreview(docType: string) {
    if (!id) return;
    try {
      const { url } = await getDocumentDownloadUrl(id, docType);
      setPreviewUseIframe(false);
      setPreviewState({ docType, url });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function handleProfileReupload(file: File) {
    if (!id) return;
    setProfileUploading(true);
    try {
      const overwrite = !!hasProfileKey;
      await uploadProfileImage(id, file, overwrite);
      await queryClient.invalidateQueries({ queryKey: ["farmer", id] });
      const { url: downloadUrl } = await getProfileDownloadUrl(id);
      queryClient.setQueryData(["farmer", id, "profile-download-url"], { url: downloadUrl });
      toast.success(overwrite ? "Profile picture updated" : "Profile picture added");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setProfileUploading(false);
    }
  }

  async function handleDocumentReupload(file: File, docType: string) {
    if (!id) return;
    setDocumentUploading(true);
    try {
      await uploadDocument(id, file, docType);
      queryClient.invalidateQueries({ queryKey: ["farmer", id, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["farmer", id] });
      setPreviewState(null);
      toast.success("Document updated");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDocumentUploading(false);
    }
  }

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
      },
    });
  }

  if (activeTab === "details" && (isLoading || !farmer)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        {error ? (
          <p className="text-destructive">Failed to load farmer.</p>
        ) : (
          <PageLoader />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/farmers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <input
          type="file"
          ref={profileFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && id) handleProfileReupload(f);
            e.target.value = "";
          }}
        />
        <div className="relative group h-28 w-28 shrink-0 sm:h-32 sm:w-32">
          <div className="h-full w-full overflow-hidden rounded-full bg-muted flex items-center justify-center">
            {displayPicUrl ? (
              <img
                src={displayPicUrl}
                alt={`${farmer?.name ?? "Farmer"} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground sm:text-4xl"
                aria-hidden
              >
                {getInitials(farmer?.name)}
              </span>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <Tooltip content={hasProfileKey ? "Re-upload" : "Add photo"}>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                loading={profileUploading}
                onClick={() => profileFileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </Tooltip>
            {hasProfileKey && (
              <Tooltip content="Delete">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  disabled={deleteProfileMutation.isPending}
                  onClick={() => id && deleteProfileMutation.mutate(id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold tracking-tight">{farmer?.name ?? "Farmer"}</h2>
          <p className="text-muted-foreground">{farmer?.farmer_code ?? id}</p>
        </div>
        {farmer && (
          <>
            <Tooltip content={farmer.is_activated ? "Farmer account is active" : "Farmer account is inactive (deactivated)"}>
              <Badge
                className={farmer.is_activated ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600/90" : "border-muted-foreground/30 bg-muted text-muted-foreground"}
              >
                {farmer.is_activated ? "Active" : "Inactive"}
              </Badge>
            </Tooltip>
            <Tooltip
              content={
                farmer.kyc_status === "VERIFIED"
                  ? "KYC verified"
                  : farmer.kyc_status === "REJECTED"
                    ? "KYC rejected"
                    : "KYC pending verification"
              }
            >
              <Badge
                className={
                  farmer.kyc_status === "VERIFIED"
                    ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600/90"
                    : farmer.kyc_status === "REJECTED"
                      ? "border-red-600 bg-red-600 text-white hover:bg-red-600/90"
                      : "border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-600"
                }
              >
                {farmer.kyc_status}
              </Badge>
            </Tooltip>
          </>
        )}
        {activeTab === "details" && farmer && (
          <div className="flex items-center gap-2 ml-auto">
            <Link to="/farmers">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              form="farmer-detail-form"
              loading={mutation.isPending}
              disabled={!isDirty}
            >
              Save changes
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => setDeleteConfirmOpen(true)}
              title="Deactivate farmer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-3 border-b border-border pb-3">
        <Button
          type="button"
          variant={activeTab === "details" ? "default" : "ghost"}
          size="lg"
          className="px-6 py-6 text-base gap-2"
          onClick={() => setActiveTab("details")}
        >
          <FileText className="h-6 w-6" />
          Details
        </Button>
        <Button
          type="button"
          variant={activeTab === "documents" ? "default" : "ghost"}
          size="lg"
          className="px-6 py-6 text-base gap-2"
          onClick={() => setActiveTab("documents")}
        >
          <CreditCard className="h-6 w-6" />
          Documents
        </Button>
      </div>

      {activeTab === "details" && farmer && (
      <form id="farmer-detail-form" onSubmit={handleSubmit(onSubmit)}>
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
      </form>
      )}

      {activeTab === "documents" && (
        <Card className="w-full max-w-6xl">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <p className="text-sm text-muted-foreground">Click a card to preview</p>
          </CardHeader>
          <CardContent className="relative flex flex-wrap gap-4">
            {documentUploading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
                <DotLoader className="h-8 w-8 text-primary" />
              </div>
            )}
            {documentsLoading ? (
              <PageLoader message="Loading documents…" />
            ) : (
              docTypes.map(({ key, label, docType }) => {
                const hasUrl = !!(doc && key in doc && (doc[key] as string | null | undefined)?.trim());
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (hasUrl) openDocumentPreview(docType);
                      else {
                        setUploadDocType(docType);
                        documentFileInputRef.current?.click();
                      }
                    }}
                    className={`group/doc flex flex-col items-center justify-center gap-2 rounded-lg border p-6 min-w-[140px] transition-colors ${
                      hasUrl
                        ? "border-border bg-muted/50 hover:bg-muted cursor-pointer"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/30 cursor-pointer"
                    }`}
                  >
                    <FileImage className={`h-10 w-10 ${hasUrl ? "text-muted-foreground" : "text-muted-foreground/70 group-hover/doc:text-primary"}`} />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px] group-hover/doc:text-foreground">
                      {hasUrl ? "View" : "Upload"}
                    </span>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      <input
        type="file"
        ref={documentFileInputRef}
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          const docType = previewState?.docType ?? uploadDocType;
          if (f && docType && id) {
            handleDocumentReupload(f, docType);
            setUploadDocType(null);
          }
          e.target.value = "";
        }}
      />
      <Dialog
        open={!!previewState}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewState(null);
            setPreviewUseIframe(false);
          }
        }}
      >
        <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0 gap-0 w-fit max-w-[95vw]">
          {previewState && (
            <>
              <div className="flex-1 min-h-0 overflow-auto flex justify-center items-start bg-muted/20">
                {previewUseIframe ? (
                  <iframe
                    src={previewState.url}
                    title="Document preview"
                    className="w-full min-h-[70vh] border-0 max-h-[85vh]"
                  />
                ) : (
                  <img
                    src={previewState.url}
                    alt="Document preview"
                    className="max-w-[85vw] max-h-[85vh] w-auto h-auto object-contain block"
                    onError={() => setPreviewUseIframe(true)}
                  />
                )}
              </div>
              <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-muted/30">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    id && deleteDocumentMutation.mutate({ farmerId: id, docType: previewState.docType })
                  }
                  disabled={deleteDocumentMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(previewState.url, "_blank")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  type="button"
                  size="sm"
                  loading={documentUploading}
                  onClick={() => {
                    documentFileInputRef.current?.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Re-upload
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Deactivate farmer"
        description="Are you sure you want to deactivate this farmer? They can be reactivated later."
        confirmLabel="Deactivate"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => (id ? deleteMutation.mutateAsync(id).then(() => {}) : Promise.resolve())}
      />
    </div>
  );
}
