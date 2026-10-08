import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Eye, Star,
  MessageSquare, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { getFeedbackList, getFeedbackById, updateFeedbackStatus } from '@/Slices/Utils/Api/feedback';
import { useToast } from '@/hooks/use-toast';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '',         label: 'All Status' },
  { value: 'new',      label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'archived', label: 'Archived' },
];

const CATEGORY_OPTIONS = [
  { value: '',           label: 'All Categories' },
  { value: 'general',    label: 'General' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'complaint',  label: 'Complaint' },
  { value: 'technical',  label: 'Technical' },
  { value: 'other',      label: 'Other' },
];

const STATUS_BADGE = {
  new:      'bg-blue-100 text-blue-700',
  reviewed: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-600',
};

const CATEGORY_BADGE = {
  general:    'bg-purple-100 text-purple-700',
  suggestion: 'bg-teal-100 text-teal-700',
  complaint:  'bg-red-100 text-red-700',
  technical:  'bg-orange-100 text-orange-700',
  other:      'bg-gray-100 text-gray-600',
};

const StarRow = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
      />
    ))}
  </div>
);

const Badge = ({ text, colorMap }) => {
  const cls = colorMap[text?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${cls}`}>
      {text || '—'}
    </span>
  );
};

// ── Detail Modal ──────────────────────────────────────────────────────────────

const DetailModal = ({ id, onClose, onStatusChanged }) => {
  const { toast } = useToast();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getFeedbackById(id);
        if (!cancelled) setData(res?.data || res);
      } catch {
        if (!cancelled) toast({ title: 'Failed to load feedback', variant: 'destructive' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateFeedbackStatus(id, newStatus);
      setData((p) => ({ ...p, status: newStatus }));
      onStatusChanged?.();
      toast({ title: 'Status updated', description: `Marked as ${newStatus}` });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">Feedback Detail</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00663B]" />
          </div>
        ) : !data ? (
          <div className="flex-1 flex items-center justify-center p-8 text-gray-500">
            Feedback not found.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 text-lg">{data.name}</p>
                <a href={`mailto:${data.email}`} className="text-sm text-blue-600 hover:underline">{data.email}</a>
                {data.phone_number && (
                  <p className="text-sm text-gray-500 mt-0.5">{data.phone_number}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge text={data.status} colorMap={STATUS_BADGE} />
                <Badge text={data.category} colorMap={CATEGORY_BADGE} />
              </div>
            </div>

            {/* Rating */}
            {data.rating > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Rating</p>
                <StarRow rating={data.rating} />
              </div>
            )}

            {/* Subject */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subject</p>
              <p className="text-sm font-semibold text-gray-800">{data.subject}</p>
            </div>

            {/* Message */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Message</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100">
                {data.message}
              </p>
            </div>

            {/* Date */}
            {data.created_at && (
              <p className="text-xs text-gray-400">
                Received: {new Date(data.created_at).toLocaleString()}
              </p>
            )}

            {/* Change status */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {['new', 'reviewed', 'archived'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updating || data.status === s}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed capitalize
                      ${data.status === s
                        ? `${STATUS_BADGE[s]} border-transparent`
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const FeedbackManagement = () => {
  const { toast } = useToast();

  const [filters, setFilters] = useState({ status: '', category: '', search: '', per_page: 15 });
  const [page, setPage]           = useState(1);
  const [data, setData]           = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading]     = useState(true);
  const [detailId, setDetailId]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFeedbackList({ ...filters, page });
      // Handle both { data: { items, total, pages } } and { data: [] } shapes
      const raw = res?.data;
      if (Array.isArray(raw)) {
        setData({ items: raw, total: raw.length, pages: 1 });
      } else {
        setData({
          items: raw?.items || raw?.data || [],
          total: raw?.total || 0,
          pages: raw?.pages || raw?.last_page || 1,
        });
      }
    } catch {
      toast({ title: 'Failed to load feedback', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedback Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Messages submitted through the public SRAP 2.0 portal
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-end gap-3">
        {/* Status */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#00663B]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#00663B]"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Per page */}
        <div className="flex flex-col gap-1 min-w-[100px]">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Per Page</label>
          <select
            value={filters.per_page}
            onChange={(e) => handleFilterChange('per_page', Number(e.target.value))}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#00663B]"
          >
            {[10, 15, 25, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              onKeyDown={handleSearch}
              placeholder="Name, email, subject… (Enter)"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#00663B] placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="text-sm text-muted-foreground">
        {loading ? 'Loading…' : `${data.total} record${data.total !== 1 ? 's' : ''} found`}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap hidden sm:table-cell">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">Subject</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">Category</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">Rating</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">Date</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <MessageSquare className="w-10 h-10 opacity-30" />
                      <p className="font-medium">No feedback found</p>
                      <p className="text-sm">Try adjusting the filters above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-foreground whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground hidden sm:table-cell">
                      <a href={`mailto:${item.email}`} className="hover:text-foreground transition-colors">
                        {item.email}
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-foreground max-w-[200px]">
                      <p className="truncate" title={item.subject}>{item.subject}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge text={item.category} colorMap={CATEGORY_BADGE} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.rating > 0 ? <StarRow rating={item.rating} /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge text={item.status} colorMap={STATUS_BADGE} />
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground text-xs whitespace-nowrap hidden md:table-cell">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setDetailId(item.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="View detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Page {page} of {data.pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailId && (
        <DetailModal
          id={detailId}
          onClose={() => setDetailId(null)}
          onStatusChanged={fetchData}
        />
      )}
    </div>
  );
};

export default FeedbackManagement;
