import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import loginImg from '../assets/loginimg.png';

const contactInfoData = [
  {
    id: 'call',
    icon: 'lucide:phone-call',
    title: 'Call Us',
    content: (
      <>
        <p className="font-bold text-[#062F26] text-xs sm:text-sm mb-0.5">+91 98765 43210</p>
        <p className="text-xs sm:text-xs text-slate-500 font-medium">Mon - Sat, 9:00 AM - 7:00 PM</p>
      </>
    )
  },
  {
    id: 'email',
    icon: 'lucide:mail',
    title: 'Email Us',
    content: (
      <>
        <p className="font-bold text-[#062F26] text-xs sm:text-sm mb-0.5">hello@housynest.com</p>
        <p className="text-xs sm:text-xs text-slate-500 font-medium">We reply within 24 hours</p>
      </>
    )
  },
  {
    id: 'visit',
    icon: 'lucide:map-pin',
    title: 'Visit Us',
    content: (
      <p className="text-xs sm:text-xs text-slate-600 font-medium leading-relaxed">
        HousyNest Technologies Pvt. Ltd.<br />
        Koramangala, Bengaluru,<br />
        Karnataka 560034, India
      </p>
    )
  },
  {
    id: 'hours',
    icon: 'lucide:clock',
    title: 'Support Hours',
    content: (
      <>
        <p className="text-xs sm:text-xs text-slate-600 font-medium leading-relaxed mb-0.5">Mon - Sat: 9:00 AM - 7:00 PM</p>
        <p className="text-xs sm:text-xs text-slate-600 font-medium leading-relaxed">Sunday: 10:00 AM - 5:00 PM</p>
      </>
    )
  }
];

const Contact = () => {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id.replace('contact', '').toLowerCase()]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ loading: false, success: true, error: null });
        setFormData({ name: '', email: '', phone: '', topic: '', message: '' });
        // Reset success message after 5 seconds
        setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
      } else {
        setStatus({ loading: false, success: false, error: data.message || 'Something went wrong' });
      }
    } catch (error) {
      setStatus({ loading: false, success: false, error: 'Failed to send message. Please try again later.' });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans pb-8">

      {/* Top Hero Section */}
      <div className="relative w-full pb-24 sm:pb-32 pt-8 sm:pt-12 lg:pb-40">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src={loginImg}
            alt="Background"
            className="w-full h-full object-cover object-center lg:object-left brightness-90 opacity-90"
          />
        </div>

        <div className="relative z-10 max-w-[1360px] mx-auto flex flex-col lg:flex-row gap-8 items-center justify-between">

          {/* Left Content Area */}
          <div className={`w-full px-4 sm:px-8 lg:px-0 lg:pl-12 xl:pl-24 flex flex-col items-center lg:items-start text-center lg:text-left transform transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h4 className="text-brand-teal font-bold uppercase tracking-wider text-xs sm:text-sm mb-3">Contact Us</h4>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-[1.15] mb-3 sm:mb-4">
              We're Here to <br className="hidden sm:block" />
              <span className="text-[#062F26]"> Help You!</span>
            </h1>
            <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed mb-8 sm:mb-10 max-w-md">
              Have questions or need assistance? Reach out to us and our team will get back to you as soon as possible.
            </p>

            {/* Features list */}
            <div className="space-y-4 sm:space-y-5 bg-white/80 p-4 rounded-xl border border-slate-200 w-full max-w-[280px] sm:max-w-xs text-left mx-auto lg:mx-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-teal-100">
                  <Icon icon="lucide:clock" className="text-brand-teal w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-slate-900 mb-0.5">Quick Response</h4>
                  <p className="text-xs font-medium text-slate-500">We reply within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-teal-100">
                  <Icon icon="lucide:shield-check" className="text-brand-teal w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-slate-900 mb-0.5">Trusted Support</h4>
                  <p className="text-xs font-medium text-slate-500">From our verified HousyNest team</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-teal-100">
                  <Icon icon="lucide:map-pin" className="text-brand-teal w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-slate-900 mb-0.5">Here for You</h4>
                  <p className="text-xs font-medium text-slate-500">Every step of your journey</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Area */}
          <div className="w-full relative z-10 flex justify-center lg:justify-end px-4 sm:px-8 lg:px-0 lg:pr-12 xl:pr-24 mt-0">
            <div className={`w-full max-w-[580px] bg-white rounded-2xl p-5 sm:p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border-2 border-[#062F26]/10 flex flex-col justify-center transform transition-all duration-[1200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>

              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 border border-teal-100">
                  <Icon icon="lucide:send" className="text-brand-teal w-4 h-4 sm:w-5 sm:h-5 transform -translate-y-0.5 translate-x-0.5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#062F26]">Send Us a Message</h3>
                  <p className="text-xs sm:text-xs text-slate-500 font-medium mt-1">Fill out the form below and we'll get back to you.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {status.success && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 border border-green-200">
                    Your message has been sent successfully! We will get back to you soon.
                  </div>
                )}
                {status.error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200">
                    {status.error}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Full Name */}
                  <div className="relative flex items-center group">
                    <Icon icon="lucide:user" className="absolute left-3.5 w-4 h-4 text-slate-400 group-focus-within:text-[#062F26] group-focus-within:scale-110 transition-all duration-300 z-10" />
                    <input type="text" id="contactName" required value={formData.name} onChange={handleChange} placeholder=" " className="peer w-full bg-slate-50 border border-slate-200 rounded-lg py-3.5 pr-4 pl-10 text-sm outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white hover:bg-white transition-all duration-300 text-slate-700 font-medium shadow-sm" />
                    <label htmlFor="contactName" className="absolute left-10 px-1 transition-all duration-300 pointer-events-none z-10 text-slate-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white peer-focus:text-[#062F26] top-0 -translate-y-1/2 text-xs bg-white rounded-sm">
                      Full Name
                    </label>
                  </div>
                  {/* Email */}
                  <div className="relative flex items-center group">
                    <Icon icon="lucide:mail" className="absolute left-3.5 w-4 h-4 text-slate-400 group-focus-within:text-[#062F26] group-focus-within:scale-110 transition-all duration-300 z-10" />
                    <input type="email" id="contactEmail" required value={formData.email} onChange={handleChange} placeholder=" " className="peer w-full bg-slate-50 border border-slate-200 rounded-lg py-3.5 pr-4 pl-10 text-sm outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white hover:bg-white transition-all duration-300 text-slate-700 font-medium shadow-sm" />
                    <label htmlFor="contactEmail" className="absolute left-10 px-1 transition-all duration-300 pointer-events-none z-10 text-slate-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white peer-focus:text-[#062F26] top-0 -translate-y-1/2 text-xs bg-white rounded-sm">
                      Email Address
                    </label>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="relative flex items-center group">
                  <Icon icon="lucide:phone" className="absolute left-3.5 w-4 h-4 text-slate-400 group-focus-within:text-[#062F26] group-focus-within:scale-110 transition-all duration-300 z-10" />
                  <input type="tel" id="contactPhone" value={formData.phone} onChange={handleChange} placeholder=" " className="peer w-full bg-slate-50 border border-slate-200 rounded-lg py-3.5 pr-4 pl-10 text-sm outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white hover:bg-white transition-all duration-300 text-slate-700 font-medium shadow-sm" />
                  <label htmlFor="contactPhone" className="absolute left-10 px-1 transition-all duration-300 pointer-events-none z-10 text-slate-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white peer-focus:text-[#062F26] top-0 -translate-y-1/2 text-xs bg-white rounded-sm">
                    Phone Number
                  </label>
                </div>

                {/* Select */}
                <div className="relative flex items-center group">
                  <Icon icon="lucide:help-circle" className="absolute left-3.5 w-4 h-4 text-slate-400 group-focus-within:text-[#062F26] group-focus-within:scale-110 transition-all duration-300 z-10" />
                  <select id="contactTopic" value={formData.topic} onChange={handleChange} className="peer w-full bg-slate-50 border border-slate-200 rounded-lg py-3.5 pr-10 pl-10 text-sm outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white hover:bg-white transition-all duration-300 text-slate-700 font-medium shadow-sm appearance-none cursor-pointer">
                    <option value="" disabled hidden></option>
                    <option value="rent">I want to rent a property</option>
                    <option value="list">I want to list my property</option>
                    <option value="support">General Support</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                  <label htmlFor="contactTopic" className="absolute left-10 px-1 transition-all duration-300 pointer-events-none z-10 text-slate-400 peer-focus:text-[#062F26] top-0 -translate-y-1/2 text-xs bg-white rounded-sm">
                    How can we help you?
                  </label>
                  <Icon icon="lucide:chevron-down" className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Message */}
                <div className="relative flex items-start group">
                  <Icon icon="lucide:message-square" className="absolute left-3.5 top-4 w-4 h-4 text-slate-400 group-focus-within:text-[#062F26] group-focus-within:scale-110 transition-all duration-300 z-10" />
                  <textarea rows="4" id="contactMessage" required value={formData.message} onChange={handleChange} placeholder=" " className="peer w-full bg-slate-50 border border-slate-200 rounded-lg py-3.5 pr-4 pl-10 text-sm outline-none focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white hover:bg-white transition-all duration-300 text-slate-700 font-medium shadow-sm resize-none"></textarea>
                  <label htmlFor="contactMessage" className="absolute left-10 px-1 transition-all duration-300 pointer-events-none z-10 text-slate-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white peer-focus:text-[#062F26] top-0 -translate-y-1/2 text-xs bg-white rounded-sm">
                    Your Message
                  </label>
                </div>

                {/* Submit Button */}
                <button disabled={status.loading} type="submit" className="w-full bg-[#062F26] hover:bg-[#04201a] text-white font-semibold py-3 sm:py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  <span>{status.loading ? 'Sending...' : 'Send Message'}</span>
                  {!status.loading && <Icon icon="lucide:arrow-right" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>

      {/* Info Bar overlapping the map and hero */}
      <div className="relative z-20 max-w-[1360px] mx-auto w-full -mt-12 sm:-mt-16 lg:-mt-24 mb-6 px-4 sm:px-6 xl:px-8">
        <div className="bg-white rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.06)] border border-slate-100 p-5 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {contactInfoData.map((info) => (
            <div key={info.id} className="flex gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#062F26]/5 flex items-center justify-center flex-shrink-0">
                <Icon icon={info.icon} className="text-[#062F26] w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm sm:text-[15px] mb-0.5 sm:mb-1">{info.title}</h5>
                {info.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div className="w-full px-4 sm:px-6 xl:px-8 mb-8 lg:mb-12">
        <div className="relative w-full h-[300px] sm:h-[400px] bg-slate-200 max-w-[1360px] mx-auto rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          <iframe
            src="https://maps.google.com/maps?q=Koramangala,%20Bengaluru&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-2xl"
          ></iframe>

          <div className="absolute bottom-4 sm:bottom-8 lg:bottom-12 left-4 right-4 sm:right-auto sm:left-8 lg:left-[calc(50%-680px)] z-10">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-100 w-full sm:max-w-[320px] ml-0 lg:ml-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#062F26] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Icon icon="lucide:map-pin" className="text-white w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Our Office</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    HousyNest Technologies Pvt. Ltd.<br />
                    Koramangala, Bengaluru,<br />
                    Karnataka 560034, India
                  </p>
                </div>
              </div>
              <a href="#" className="inline-flex items-center gap-2 text-brand-teal font-semibold text-xs hover:text-[#062F26] transition-colors group">
                Get Directions
                <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Contact;
