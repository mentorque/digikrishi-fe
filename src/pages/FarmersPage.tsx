import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAtom } from "jotai";
import { searchQueryAtom, paginationAtom } from "@/atoms";
import { useFarmers } from "@/hooks/useFarmers";
import { useSearchFarmers } from "@/hooks/useSearchFarmers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loader";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

export function FarmersPage() {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);

  const hasSearch = searchQuery.trim().length > 0;
  const listQuery = useFarmers();
  const searchQueryResult = useSearchFarmers();

  // Reset to page 1 when search query changes so results aren't empty (e.g. 1 hit but was on page 5)
  useEffect(() => {
    setPagination((p) => (p.page === 1 ? p : { ...p, page: 1 }));
  }, [searchQuery, setPagination]);

  const { data: listData, isLoading: listLoading } = listQuery;
  const { data: searchData, isLoading: searchLoading } = searchQueryResult;

  const farmers = hasSearch ? searchData?.results ?? [] : listData?.farmers ?? [];
  const total = hasSearch ? searchData?.total ?? 0 : listData?.total ?? 0;
  const isLoading = hasSearch ? searchLoading : listLoading;
  const totalPages = Math.ceil(total / pagination.limit) || 1;
  const canPrev = pagination.page > 1;
  const canNext = pagination.page < totalPages;

  function goPrev() {
    setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }));
  }
  function goNext() {
    setPagination((p) => ({ ...p, page: Math.min(totalPages, p.page + 1) }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Farmers</h2>
        <Link to="/farmers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add farmer
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, farmer code, ID, or village (fuzzy)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <PageLoader />
          ) : farmers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No farmers found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Village / District</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.farmer_code}</TableCell>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>
                        {f.FarmerAddress
                          ? [f.FarmerAddress.village, f.FarmerAddress.district]
                              .filter(Boolean)
                              .join(" / ") || "—"
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={f.kyc_status === "VERIFIED" ? "default" : "secondary"}>
                          {f.kyc_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={f.is_activated ? "default" : "outline"}>
                          {f.is_activated ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link to={`/farmers/${f.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={goPrev} disabled={!canPrev}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goNext} disabled={!canNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
