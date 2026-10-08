import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { submitFeedback } from '@/Slices/Utils/Api/feedback';

const CATEGORIES = [
  { value: 'general',    label: 'General' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'complaint',  label: 'Complaint' },
  { value: 'technical',  label: 'Technical' },
  { value: 'other',      label: 'Other' },
];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone_number: '',
  subject: '',
  message: '',
  category: 'general',
  rating: 0,
};

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00663B] focus:border-transparent transition-shadow placeholder:text-gray-400';

const FeedbackModal = ({ isOpen, onClose, defaultCategory = 'general', defaultSubject = '' }) => {
  const [form, setForm]         = useState({ ...EMPTY_FORM, category: defaultCategory, subject: defaultSubject });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitFeedback({
        name:         form.name,
        email:        form.email,
        subject:      form.subject,
        message:      form.message,
        category:     form.category,
        rating:       Number(form.rating) || undefined,
        ...(form.phone_number ? { phone_number: form.phone_number } : {}),
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us at info@nitda.gov.ng.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM, category: defaultCategory, subject: defaultSubject });
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Send Us a Message</h2>
            <p className="text-xs text-gray-500 mt-0.5">We read every message and will respond as soon as possible.</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0 ml-4"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-6 max-w-xs">
              Your message has been received. We'll get back to you at <strong>{form.email}</strong> soon.
            </p>
            <button
              onClick={handleClose}
              className="bg-[#00663B] text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-[#004D2D] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" name="name" required value={form.name}
                    onChange={handleChange} className={inputCls} placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email" name="email" required value={form.email}
                    onChange={handleChange} className={inputCls} placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel" name="phone_number" value={form.phone_number}
                    onChange={handleChange} className={inputCls} placeholder="+2348012345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category" required value={form.category}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="subject" required value={form.subject}
                  onChange={handleChange} className={inputCls}
                  placeholder="Brief description of your message"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message" required value={form.message} onChange={handleChange}
                  rows={4} className={`${inputCls} resize-none`}
                  placeholder="Share your thoughts, suggestions, or questions..."
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-xs text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star} type="button"
                      onClick={() => setForm((p) => ({ ...p, rating: p.rating === star ? 0 : star }))}
                      className="focus:outline-none hover:scale-110 transition-transform"
                      aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= form.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                  {form.rating > 0 && (
                    <span className="ml-2 self-center text-sm text-gray-500">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#00663B] hover:bg-[#004D2D] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                {submitting ? 'Sending…' : 'Submit Message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
