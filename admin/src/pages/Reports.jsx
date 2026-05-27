
import { useState, useEffect, useCallback } from "react";
import {
  FiFileText, FiImage, FiFile, FiTrash2, FiDownload,
  FiEye, FiSearch, FiAlertCircle, FiRefreshCw,
  FiFilter, FiBarChart2,
} from "react-icons/fi";
import { adminReportAPI } from "../services/adminApi.js";
import Spinner from "../components/common/Spinner.jsx";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import toast from "react-hot-toast";

const CATEGORIES = [
  "All", "Lab Report", "Radiology", "Prescription", "Discharge Summary", "Other",
];

const CATEGORY_COLORS = {
  "Lab Report":        "bg-blue-100 text-blue-700",
  "Radiology":         "bg-purple-100 text-purple-700",
  "Prescription":      "bg-green-100 text-green-700",
  "Discharge Summary": "bg-orange-100 text-orange-700",
  "Other":             "bg-gray-100 text-gray-600",
};

const FILE_TYPE_CONFIG = {
  "application/pdf": { label: "PDF",  icon: FiFileText, color: "text-red-500",    bg: "bg-red-50"    },
  "image/jpeg":      { label: "JPEG", icon: FiImage,    color: "text-blue-500",   bg: "bg-blue-50"   },
  "image/jpg":       { label: "JPG",  icon: FiImage,    color: "text-blue-500",   bg: "bg-blue-50"   },
  "image/png":       { label: "PNG",  icon: FiImage,    color: "text-green-500",  bg: "bg-green-50"  },
  "image/webp":      { label: "WebP", icon: FiImage,    color: "text-purple-500", bg: "bg-purple-50" },
  "image/gif":       { label: "GIF",  icon: FiImage,    color: "text-pink-500",   bg: "bg-pink-50"   },
};

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const CategoryBadge = ({ category }) => (
  <span className={`badge ${CATEGORY_COLORS[category] || CATEGORY_COLORS.Other}`}>
    {category}
  </span>
);

const FileTypeIcon = ({ mimeType }) => {
  const cfg = FILE_TYPE_CONFIG[mimeType] || { icon: FiFile, color: "text-gray-500", bg: "bg-gray-50" };
  const Icon = cfg.icon;
  return (
    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
      <Icon size={16} className={cfg.color} />
    </div>
  );
};

const StatsBar = ({ stats }) => {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <div className="card p-4 col-span-2 sm:col-span-1 lg:col-span-1">
        <p className="text-xs text-gray-500 dark:text-dark-muted font-medium">Total Reports</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
      </div>
      {stats.byCategory?.map(({ _id, count }) => (
        <div key={_id} className="card p-4">
          <p className="text-xs text-gray-500 dark:text-dark-muted font-medium truncate">{_id}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{count}</p>
        </div>
      ))}
    </div>
  );
};

const Reports = () => {
  const [reports, setReports]       = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [category, setCategory]     = useState("All");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [showStats, setShowStats]   = useState(false);

  const LIMIT = 15;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (category !== "All") params.category = category;
      const { data } = await adminReportAPI.getAll(params);
      setReports(data.reports || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await adminReportAPI.getStats();
      setStats(data.stats);
    } catch {

    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => { setPage(1); }, [category]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminReportAPI.delete(deleteTarget._id);
      toast.success("Report deleted successfully.");
      setDeleteTarget(null);
      fetchReports();
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search.trim()
    ? reports.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.title?.toLowerCase().includes(q) ||
          r.patient?.firstName?.toLowerCase().includes(q) ||
          r.patient?.lastName?.toLowerCase().includes(q) ||
          r.patient?.email?.toLowerCase().includes(q) ||
          r.file?.originalName?.toLowerCase().includes(q)
        );
      })
    : reports;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Reports"
        subtitle={`${total} report${total !== 1 ? "s" : ""} stored securely`}
        action={
          <button
            onClick={() => setShowStats((s) => !s)}
            className="btn-secondary gap-2"
          >
            <FiBarChart2 size={15} />
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>
        }
      />

      { }
      {showStats && <StatsBar stats={stats} />}

      { }
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        { }
        <div className="relative flex-1">
          <FiSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, patient, or filename…"
            className="input-field pl-9 py-2"
          />
        </div>

        { }
        <div className="relative">
          <FiFilter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field pl-9 py-2 pr-8 w-full sm:w-48"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => { fetchReports(); fetchStats(); }}
          className="btn-secondary py-2 px-4"
          title="Refresh"
        >
          <FiRefreshCw size={15} />
        </button>
      </div>

      { }
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <FiAlertCircle size={28} className="mx-auto mb-2 text-red-400" />
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={fetchReports} className="btn-secondary mt-4 text-sm">
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FiFileText size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No reports found.</p>
            {search && (
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your search or filter.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-dark-border">
                <tr>
                  <th className="table-th">Report</th>
                  <th className="table-th">Patient</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">File</th>
                  <th className="table-th">Uploaded</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {filtered.map((report) => (
                  <tr key={report._id} className="table-row">
                    { }
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <FileTypeIcon mimeType={report.file?.mimeType} />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[180px]" title={report.title}>
                            {report.title}
                          </p>
                          {report.description && (
                            <p className="text-xs text-gray-400 dark:text-dark-muted truncate max-w-[180px]">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    { }
                    <td className="table-td">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                          {report.patient?.firstName} {report.patient?.lastName}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-dark-muted">{report.patient?.email}</p>
                      </div>
                    </td>

                    { }
                    <td className="table-td">
                      <CategoryBadge category={report.category} />
                    </td>

                    { }
                    <td className="table-td">
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[140px]" title={report.file?.originalName}>
                        {report.file?.originalName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">{formatBytes(report.file?.size)}</p>
                    </td>

                    { }
                    <td className="table-td whitespace-nowrap text-gray-500 dark:text-dark-muted text-xs">
                      {formatDate(report.createdAt)}
                    </td>

                    { }
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={report.file?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-icon text-primary-600 hover:bg-primary-50"
                          title="View file"
                        >
                          <FiEye size={15} />
                        </a>
                        <a
                          href={report.file?.url}
                          download={report.file?.originalName}
                          className="btn-icon text-accent-600 hover:bg-accent-50"
                          title="Download file"
                        >
                          <FiDownload size={15} />
                        </a>
                        <button
                          onClick={() => setDeleteTarget(report)}
                          className="btn-icon text-red-500 hover:bg-red-50"
                          title="Delete report"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        { }
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-dark-border">
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      { }
      {deleteTarget && (
        <ConfirmModal
          open={!!deleteTarget}
          title="Delete Report"
          message={`Are you sure you want to permanently delete "${deleteTarget.title}"? This will also remove the file from cloud storage.`}
          confirmLabel={deleting ? "Deleting…" : "Delete"}
          danger
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Reports;
