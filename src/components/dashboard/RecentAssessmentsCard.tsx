
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ChevronLeft, FileText, LockOpen, Search } from "lucide-react";
import { isPurchased } from "@/utils/purchaseStatus";
import { formatDistanceToNow } from "date-fns";
import { QuizResult } from "@/types/quiz";
import { Input } from "@/components/ui/input";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RecentAssessmentsCardProps {
  assessments: QuizResult[];
  onUnlockReport: (reportId: string) => void;
  purchaseLoading: string | null;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  itemsPerPage: number;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export const RecentAssessmentsCard = ({ 
  assessments,
  onUnlockReport,
  purchaseLoading,
  currentPage,
  totalPages,
  searchQuery,
  itemsPerPage,
  onSearch,
  onPageChange,
  onItemsPerPageChange
}: RecentAssessmentsCardProps) => {
  const navigate = useNavigate();
  
  const handleViewReport = (id: string) => {
    navigate(`/assessment/${id}`);
  };

  if (!assessments.length && !searchQuery) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-2">Recent Assessments</h3>
        <div className="py-10 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            You haven't taken any assessments yet.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="mt-4"
          >
            Take Assessment Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Recent Assessments</h3>
      
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by date or level..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {assessments.length === 0 && searchQuery ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No assessments match your search.</p>
          <Button 
            variant="outline" 
            onClick={() => onSearch('')} 
            className="mt-2"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <div 
              key={assessment.id} 
              className="border rounded-md p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-base">Moral Hierarchy Assessment</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Taken {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                  </p>
                  {assessment.primary_level && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Level {assessment.primary_level}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-x-2 flex">
                  {isPurchased(assessment) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(assessment.id)}
                    >
                      View Report
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onUnlockReport(assessment.id)}
                      disabled={purchaseLoading === assessment.id}
                    >
                      {purchaseLoading === assessment.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <LockOpen className="mr-2 h-4 w-4" />
                          Unlock Report
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(currentPage - 1)} 
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  pageNumber === 1 || 
                  pageNumber === totalPages || 
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink 
                        isActive={pageNumber === currentPage}
                        onClick={() => onPageChange(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis for skipped pages
                if (
                  (pageNumber === 2 && currentPage > 3) || 
                  (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${pageNumber}`}>
                      <span className="px-4 py-2">&hellip;</span>
                    </PaginationItem>
                  );
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(currentPage + 1)} 
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-center text-sm text-gray-500 mt-2">
            Showing {assessments.length ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, assessments.length)} of {assessments.length} assessments
          </div>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
        >
          Take New Assessment
        </Button>
      </div>
    </Card>
  );
};
