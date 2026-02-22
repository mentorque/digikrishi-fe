import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFieldOfficers, createFieldOfficer, type CreateFieldOfficerBody } from "@/api/auth";

export function useFieldOfficers() {
  return useQuery({
    queryKey: ["field-officers"],
    queryFn: fetchFieldOfficers,
  });
}

export function useCreateFieldOfficer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFieldOfficerBody) => createFieldOfficer(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["field-officers"] });
    },
  });
}
