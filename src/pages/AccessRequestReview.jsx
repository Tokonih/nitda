import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText, CheckCircle, XCircle, List, Send, Calendar, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../Slices/Utils/axiosInstance';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { DataPagination } from '@/components/ui/data-pagination';

const AccessRequestReview = () => {
  const [reviewerComment, setReviewerComment] = useState('');
  const [accessRequests, setAccessRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [resending, setResending] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => { },
    confirmVariant: "default",
    confirmText: "Confirm"
  });
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [perPage] = useState(15);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch access requests from API
  useEffect(() => {
    setCurrentPage(1);
    fetchAccessRequests(1);
  }, [selectedStatus, searchQuery]);

  const fetchAccessRequests = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        per_page: perPage,
        page,
      };

      if (selectedStatus && selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await axiosInstance.get('/dashboard-access-requests', { params });
      const data = response.data?.data || [];
      setPagination(response.data?.meta?.pagination || null);
      setCurrentPage(page);

      if (data.length > 0) {
        setAccessRequests(data);
        setSelectedRequest(data[0]);
      } else {
        setAccessRequests([]);
        setSelectedRequest(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      setAccessRequests([]);
      setSelectedRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    
    setConfirmModal({
      isOpen: true,
      title: "Approve Access Request",
      description: `Are you sure you want to approve the access request for ${selectedRequest.firstname} ${selectedRequest.lastname}? Login credentials will be sent to their email.`,
      confirmText: "Approve",
      confirmVariant: "default",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setApproving(true);
        try {
          const payload = {
            comment: reviewerComment.trim(),
          };

          await axiosInstance.post(`/dashboard-access-requests/${selectedRequest.id}/approve`, payload);
          toast.success(`Access request approved successfully. Login credentials sent to ${selectedRequest.email}`);

          await fetchAccessRequests(currentPage);
          setReviewerComment('');
        } catch (error) {
          toast.error(getErrorMessage(error));
        } finally {
          setApproving(false);
        }
      }
    });
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setConfirmModal({
      isOpen: true,
      title: "Reject Access Request",
      description: `Are you sure you want to reject the access request for ${selectedRequest.firstname} ${selectedRequest.lastname}?`,
      confirmText: "Reject",
      confirmVariant: "destructive",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setRejecting(true);
        try {
          const payload = {
            comment: reviewerComment.trim(),
          };

          await axiosInstance.post(`/dashboard-access-requests/${selectedRequest.id}/reject`, payload);
          toast.success(`Access request rejected successfully`);

          await fetchAccessRequests(currentPage);
          setReviewerComment('');
        } catch (error) {
          toast.error(getErrorMessage(error));
        } finally {
          setRejecting(false);
        }
      }
    });
  };

  const handleResendLoginDetails = async () => {
    if (!selectedRequest) return;

    setConfirmModal({
      isOpen: true,
      title: "Resend Login Details",
      description: `Are you sure you want to resend login details to ${selectedRequest.email}?`,
      confirmText: "Resend",
      confirmVariant: "default",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setResending(true);
        try {
          const payload = {
            comment: reviewerComment.trim(),
          };

          await axiosInstance.post(`/dashboard-access-requests/${selectedRequest.id}/resend-login-details`, payload);
          toast.success(`Login details resent successfully to ${selectedRequest.email}`);

          setReviewerComment('');
        } catch (error) {
          toast.error(getErrorMessage(error));
        } finally {
          setResending(false);
        }
      }
    });
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
    setReviewerComment('');
  };

  const handleBackToList = () => {
    setShowDetails(false);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Disapproved' },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const pendingCount = accessRequests.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Filters */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="p-0 text-gray-600 hover:text-green-700 hover:bg-transparent -ml-1 mb-4 flex items-center gap-2 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          Go Back to Dashboard
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {showDetails && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 -ml-2"
                onClick={handleBackToList}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Access Request Review</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Review and manage dashboard access requests</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-initial sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-white px-2 sm:px-8">
        {/* Sidebar */}
        <div
          className={`w-full lg:w-[380px] bg-white border-r border-gray-100 flex flex-col h-full overflow-hidden transition-all duration-300 ${showDetails ? 'hidden lg:flex' : 'flex'}`}
        >
          <div className="flex-1 flex flex-col min-h-0">
            {/* Queue Header */}
            <div className="px-6 py-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shadow-sm border border-green-100/50">
                  <List className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Request Queue</h2>
                </div>
                <span className="ml-auto bg-green-700 text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center shadow-sm">
                  {pendingCount}
                </span>
              </div>
            </div>

            {/* Queue List - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">Fetching requests...</p>
                </div>
              ) : accessRequests.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">No access requests found</p>
                </div>
              ) : (
                <div className="space-y-3 pb-8">
                  {accessRequests.map((request) => (
                    <div
                      key={request.id}
                      onClick={() => handleSelectRequest(request)}
                      className={`cursor-pointer border rounded-lg p-4 transition-all ${selectedRequest?.id === request.id
                        ? 'bg-green-50 border-green-600'
                        : 'bg-white border-gray-200 hover:border-green-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getStatusBadge(request.status)}`}>
                          {request.status?.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                        {request.firstname} {request.lastname}
                      </h3>
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-gray-500 truncate">{request.email}</span>
                        <span className="text-gray-400 truncate">{request.organisation_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                <DataPagination
                  currentPage={currentPage}
                  totalPages={pagination.last_page}
                  onPageChange={(page) => fetchAccessRequests(page)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-8 custom-scrollbar ${showDetails ? 'block' : 'hidden lg:block'}`}>
          {!selectedRequest ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a request from the sidebar to review</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>Submitted: {new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {selectedRequest.firstname} {selectedRequest.lastname}
                  </h1>
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold w-fit ${getStatusBadge(selectedRequest.status)}`}>
                    {selectedRequest.status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs sm:text-sm text-gray-500">ID: #{selectedRequest.id}</span>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-gray-900" />
                  <h2 className="font-semibold text-gray-900">Request Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Email Address</div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-900">{selectedRequest.email}</p>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-2">Gender</div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-900 capitalize">{selectedRequest.gender}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500 mb-2">Organisation</div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-900">{selectedRequest.organisation_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Decision */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-semibold text-gray-900">Admin Action</h2>
                </div>

                <div className="mb-2">
                  <label className="text-sm text-gray-500">
                    Comment <span className="text-xs text-gray-400">(optional)</span>
                  </label>
                </div>
                <textarea
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                  placeholder="Enter your comment here..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={handleReject}
                      disabled={rejecting || approving}
                      className="flex-1 bg-white border border-gray-200 text-red-600 py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {rejecting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      {rejecting ? 'Processing...' : 'Reject Request'}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={approving || rejecting}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      {approving ? 'Processing...' : 'Approve Request'}
                    </button>
                  </>
                )}
                {selectedRequest.status === 'approved' && (
                  <button
                    onClick={handleResendLoginDetails}
                    disabled={resending}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {resending ? 'Sending...' : 'Resend Login Details'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={confirmModal.onConfirm}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
      />
    </div>
  );
};

export default AccessRequestReview;
