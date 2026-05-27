import { useEffect, useState } from "react";
import { FiTrash2, FiMail, FiMessageSquare, FiSearch, FiInbox } from "react-icons/fi";
import { adminMessageAPI } from "../services/adminApi.js";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import toast from "react-hot-toast";

const Messages = () => {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const fetchMessages = async () => {
    try {
      const { data } = await adminMessageAPI.getAll();
      setMessages(data.messages ?? []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleSelect = async (msg) => {
    setSelected(msg);
    if (!msg.isRead) {
      try {
        await adminMessageAPI.markRead(msg._id);
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
        );
      } catch {   }
    }
  };

  const handleDelete = async () => {
    try {
      await adminMessageAPI.delete(confirmId);
      toast.success("Message deleted.");
      if (selected?._id === confirmId) setSelected(null);
      fetchMessages();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirmId(null);
    }
  };

  const filtered = messages.filter((m) => {
    const text = `${m.firstName} ${m.lastName} ${m.subject} ${m.email}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Messages"
        subtitle={`${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`}
      />

      {loading ? (
        <Spinner />
      ) : messages.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiInbox}
            title="No messages yet"
            description="Patient and visitor inquiries will appear here."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 h-[calc(100vh-220px)] min-h-[500px]">

          { }
          <div className="lg:col-span-2 card p-0 overflow-hidden flex flex-col">
            { }
            <div className="p-3 border-b border-gray-100 dark:border-dark-border">
              <div className="relative">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-9 py-2 text-xs"
                />
              </div>
            </div>

            { }
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-dark-border">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-dark-muted py-10 text-sm">No results.</p>
              ) : (
                filtered.map((msg) => (
                  <div
                    key={msg._id}
                    onClick={() => handleSelect(msg)}
                    className={`p-4 cursor-pointer transition-all duration-150 ${
                      selected?._id === msg._id
                        ? "bg-primary-50 dark:bg-primary-900/20 border-l-[3px] border-primary-600"
                        : "hover:bg-gray-50 dark:hover:bg-dark-border/40 border-l-[3px] border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          msg.isRead
                            ? "bg-gray-100 dark:bg-dark-border"
                            : "bg-primary-100 dark:bg-primary-900/30"
                        }`}>
                          <FiMail
                            size={13}
                            className={msg.isRead ? "text-gray-400" : "text-primary-600 dark:text-primary-400"}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm truncate ${msg.isRead ? "text-gray-600 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-white"}`}>
                            {msg.firstName} {msg.lastName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-dark-muted truncate">{msg.subject}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmId(msg._id); }}
                          className="text-gray-300 dark:text-dark-border hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 size={13} />
                        </button>
                        <span className="text-[10px] text-gray-400 dark:text-dark-muted">
                          {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          { }
          <div className="lg:col-span-3 card overflow-hidden flex flex-col">
            {selected ? (
              <div className="flex flex-col h-full">
                { }
                <div className="pb-4 border-b border-gray-100 dark:border-dark-border mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selected.subject}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-dark-muted">
                    <span>
                      From: <strong className="text-gray-700 dark:text-gray-300">
                        {selected.firstName} {selected.lastName}
                      </strong>
                    </span>
                    <span>{selected.email}</span>
                    <span>{selected.phone}</span>
                  </div>
                </div>

                { }
                <div className="flex-1 overflow-y-auto">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>

                { }
                <div className="pt-4 border-t border-gray-100 dark:border-dark-border mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-400 dark:text-dark-muted">
                    Received {new Date(selected.createdAt).toLocaleString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                  <button
                    onClick={() => setConfirmId(selected._id)}
                    className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-dark-border flex items-center justify-center mb-3">
                  <FiMessageSquare size={24} className="text-gray-400 dark:text-dark-muted" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Select a message to read</p>
                <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">Click any message from the list</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmId}
        title="Delete Message"
        message="This message will be permanently deleted and cannot be recovered."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
};

export default Messages;
