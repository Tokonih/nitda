import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axiosInstance from '@/Slices/Utils/axiosInstance';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [markingAll, setMarkingAll] = useState(false);

  // Map notification type → dashboard route
  const getNotificationRoute = (n) => {
    const type = n?.data?.type || n?.type || '';
    switch (type) {
      case 'kpi_value_month_approved':
      case 'kpi_value_month_disapproved':
        return '/dashboard/create-kpi';
      case 'kpi_approved':
      case 'kpi_disapproved':
        return '/dashboard/kpi-data';
      case 'dashboard_access_request_submitted_for_approval':
        return '/dashboard/access-request-review';
      case 'stakeholder_activity_approved':
      case 'stakeholder_activity_disapproved':
        return '/dashboard/activity-data';
      default:
        return null;
    }
  };

  const fetchNotifications = async (pageNum = 1, filterType = filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('per_page', '20');
      params.append('page', pageNum.toString());
      if (filterType === 'unread') params.append('unread', '1');
      if (filterType === 'read') params.append('read', '1');

      const res = await axiosInstance.get(`/notifications?${params.toString()}`);
      setNotifications(res.data?.data || []);
      setPagination(res.data?.meta?.pagination || null);
      setPage(pageNum);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, filter);
  }, [filter]);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await axiosInstance.post('/notifications/read-all');
      toast.success('All notifications marked as read');
      fetchNotifications(page, filter);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read_at) markAsRead(n.id);
    const route = getNotificationRoute(n);
    if (route) navigate(route);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-0 text-gray-600 hover:text-green-700 hover:bg-transparent -ml-1 mb-4 flex items-center gap-2 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          Go Back
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <Bell className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                disabled={markingAll}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                {markingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-sm text-gray-500">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                ? 'No read notifications yet.'
                : 'You have no notifications at this time.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const route = getNotificationRoute(n);
              const isClickable = !!route;

              return (
                <div
                  key={n.id}
                  onClick={() => isClickable && handleNotificationClick(n)}
                  className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${
                    isClickable ? 'cursor-pointer hover:border-green-300 hover:shadow-sm' : ''
                  } ${!n.read_at ? 'bg-green-50/30 border-green-200' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                        !n.read_at ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {n.data?.message || 'New notification'}
                        </p>
                        {!n.read_at && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatTime(n.created_at)}</span>
                        {n.data?.type && (
                          <>
                            <span>•</span>
                            <span className="capitalize">
                              {n.data.type.replace(/_/g, ' ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => fetchNotifications(page - 1, filter)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.last_page || loading}
              onClick={() => fetchNotifications(page + 1, filter)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
