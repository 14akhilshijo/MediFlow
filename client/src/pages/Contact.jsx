import { useState } from "react";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { messageAPI } from "../services/api.js";
import toast from "react-hot-toast";

const Contact = () => {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", subject: "", message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await messageAPI.send(form);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="section-title">Contact Us</h1>
        <p className="section-subtitle">We're here to help. Reach out anytime.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Info */}
        <div className="space-y-6">
          {[
            { icon: FiPhone, title: "Phone", detail: "+91 8137864105" },
            { icon: FiMail, title: "Email", detail: "mrakhilshijo@gmail.com" },
            { icon: FiMapPin, title: "Address", detail: "Kerala, India" },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="card flex items-start gap-4">
              <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-lg">
                <Icon size={20} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2 card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  className="input-field" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea name="message" value={form.message} onChange={handleChange}
                rows={5} className="input-field resize-none" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
