import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiUploadCloud, FiFile, FiTrash2, FiDownload,
  FiEye, FiX, FiPlusCircle, FiFileText, FiImage,
  FiAlertCircle, FiCheckCircle, FiClock,
} from "react-icons/fi";
import axios from "axios";
import { reportAPI } from "../../services/api.js";
import Spinner from "../../components/common/Spinner.jsx";
import toast from "react-hot-toast";

const CATEGORIES = [
  "All", "Lab Report", "Radiology", "Prescription", "Discharge Summary", "Other",
];

const ALLOWED_TYPES = {
  "application/pdf": { label: "PDF",  icon: FiFileText, color: "text-red-500",    bg: "bg-red-50"    },
  "image/jpeg":      { label: "JPEG", icon: FiImage,    color: "text-blue-500",   bg: "bg-blue-50"   },
  "image/jpg":       { label: "JPG",  icon: FiImage,    color: "text-blue-500",   bg: "bg-blue-50"   },
  "image/png":       { label: "PNG",  icon: FiImage,    color: "text-green-500",  bg: "bg-green-50"  },
  "image/webp":      { label: "WebP", icon: FiImage,    color: "text-purple-500", bg: "bg-purple-50" },
  "image/gif":       { label: "GIF",  icon: FiImage,    color: "text-pink-500",   bg: "bg-pink-50"   },
};

const MAX_SIZE = 10 * 1024 * 1024; 

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

const CATEGORY_COLORS = {
  "Lab Report":        "bg-blue-100 text-blue-700",
  "Radiology":         "bg-purple-100 text-purple-700",
  "Prescription":      "bg-green-100 text-green-700",
  "Discharge Summary": "bg-orange-100 text-orange-700",
  "Other":             "bg-gray-100 text-gray-600",
};

const CategoryBadge = ({ category }) => (
  <span className={`badge ${CATEGORY_COLORS[category] || CATEGORY_COLORS.Other}`}>
    {category}
  </span>
);

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
    <div
      className="h-full bg-primary-600 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

const FileTypeIcon = ({ mimeType, size = 20 }) => {
  const cfg = ALLOWED_TYPES[mimeType] || { icon: FiFile, color: "text-gray-500", bg: "bg-gray-50" };
  const Icon = cfg.icon;
  return (
    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
      <Icon size={size} className={cfg.color} />
    </div>
  );
};

const ReportCard = ({ report, onDelete, deleting }) => {
  const isImage = report.file?.resourceType === "image";

  return (
    <div className="card group hover:shadow-card-md transition-all duration-200 flex flex-col gap-4 animate-in">
      { }
      {isImage && (
        <div className="overflow-hidden rounded-xl bg-gray-50 h-36">
          <img
            src={report.file.url}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      { }
      <div className="flex items-start gap-3">
        {!isImage && <FileTypeIcon mimeType={report.file?.mimeType} />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate" title={report.title}>
            {report.title}
          </p>
          {report.description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{report.description}</p>
          )}
        </div>
      </div>

      { }
      <div className="flex items-center justify-between flex-wrap gap-2">
        <CategoryBadge category={report.category} />
        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <FiClock size={11} />
          {formatDate(report.createdAt)}
        </span>
      </div>

      { }
      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 truncate">
        <FiFile size={11} className="shrink-0" />
        {report.file?.originalName} · {formatBytes(report.file?.size)}
      </p>

      { }
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <a
          href={report.file?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium
                     text-primary-600 border border-primary-200 hover:bg-primary-50
                     py-2 rounded-xl transition-all"
        >
          <FiEye size={12} /> View
        </a>
        <a
          href={report.file?.url}
          download={report.file?.originalName}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium
                     text-accent-600 border border-accent-200 hover:bg-accent-50
                     py-2 rounded-xl transition-all"
        >
          <FiDownload size={12} /> Download
        </a>
        <button
          onClick={() => onDelete(report._id)}
          disabled={deleting === report._id}
          title="Delete report"
          className="flex items-center justify-center gap-1 text-xs font-medium
                     text-red-500 border border-red-200 hover:bg-red-50
                     py-2 px-3 rounded-xl transition-all disabled:opacity-50"
        >
          {deleting === report._id
            ? <span className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin" />
            : <FiTrash2 size={12} />}
        </button>
      </div>
    </div>
  );
};

const UploadModal = ({ onClose, onSuccess }) => {
  const inputRef = useRef(null);

  const [dragging, setDragging]   = useState(false);
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [fileError, setFileError] = useState("");
  const [progress, setProgress]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Other" });

  const validateAndSet = useCallback((f) => {
    setFileError("");
    if (!ALLOWED_TYPES[f.type]) {
      setFileError("Unsupported file type. Allowed: PDF, JPEG, PNG, WebP, GIF.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setFileError("File exceeds the 10 MB limit.");
      return;
    }
    setFile(f);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
    setForm((p) => ({ ...p, title: p.title || f.name.replace(/\.[^.]+$/, "") }));
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file.");
    if (!form.title.trim()) return toast.error("Please enter a title.");

    setUploading(true);
    setProgress(0);

    const fd = new FormData();
    fd.append("report", file);
    fd.append("title", form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("category", form.category);

    try {
      await reportAPI.upload(fd, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      toast.success("Report uploaded successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        { }
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload Medical Report</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">PDF, JPEG, PNG, WebP · Max 10 MB</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <FiX size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          { }
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
                        transition-all duration-200 select-none ${
              dragging
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]"
                : file
                ? "border-accent-400 bg-accent-50 dark:bg-accent-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
              className="hidden"
              onChange={(e) => e.target.files[0] && validateAndSet(e.target.files[0])}
            />

            {file ? (
              <div className="flex flex-col items-center gap-3">
                {preview
                  ? <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
                  : <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                      <FiFileText size={28} className="text-red-500" />
                    </div>
                }
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatBytes(file.size)}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-accent-600 font-medium">
                  <FiCheckCircle size={13} /> File ready to upload
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                  <FiUploadCloud size={26} className="text-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Drag & drop your file here</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-gray-300 dark:text-gray-600">PDF · JPEG · PNG · WebP · GIF</p>
              </div>
            )}
          </div>

          { }
          {fileError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2.5">
              <FiAlertCircle size={13} className="shrink-0" />
              {fileError}
            </div>
          )}

          { }
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Uploading to secure storage…</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <ProgressBar progress={progress} />
            </div>
          )}

          { }
          <div>
            <label className="input-label">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="input-field"
              placeholder="e.g. Blood Test Results – June 2025"
              maxLength={150}
              required
            />
          </div>

          { }
          <div>
            <label className="input-label">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="input-field"
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          { }
          <div>
            <label className="input-label">
              Description{" "}
              <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              maxLength={500}
              className="input-field resize-none"
              placeholder="Brief notes about this report…"
            />
          </div>

          { }
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !!fileError}
              className="btn-primary flex-1"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading {progress}%
                </>
              ) : (
                <>
                  <FiUploadCloud size={15} />
                  Upload Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyReports = () => {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [category, setCategory]     = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting]     = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = category !== "All" ? { category } : {};
      const { data } = await axios.get("/api/v1/reports/my", {
        params,
        withCredentials: true,
      });
      setReports(data.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c] = c === "All" ? reports.length : reports.filter((r) => r.category === c).length;
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await reportAPI.delete(id);
      toast.success("Report deleted.");
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      { }
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Medical Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {reports.length} report{reports.length !== 1 ? "s" : ""} stored securely
          </p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary text-sm">
          <FiPlusCircle size={15} />
          Upload Report
        </button>
      </div>

      { }
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              category === c
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600"
            }`}
          >
            {c}
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                category === c ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              {counts[c] || 0}
            </span>
          </button>
        ))}
      </div>

      { }
      {loading && <Spinner />}

      {error && !loading && (
        <div className="card text-center py-10">
          <FiAlertCircle size={28} className="mx-auto mb-2 text-red-400" />
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={fetchReports} className="btn-outline mt-4 text-sm">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiUploadCloud size={28} className="text-primary-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold">
            {category === "All" ? "No reports uploaded yet." : `No ${category} reports.`}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Upload your medical reports to keep them safe and accessible.
          </p>
          {category === "All" && (
            <button onClick={() => setShowUpload(true)} className="btn-primary mt-5 inline-flex text-sm">
              <FiPlusCircle size={15} />
              Upload Your First Report
            </button>
          )}
        </div>
      )}

      { }
      {!loading && !error && reports.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      { }
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={fetchReports}
        />
      )}
    </div>
  );
};

export default MyReports;
