import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import aboutmain from '../assets/aboutmain.png';

const privacyData = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <>
        <p className="mb-4">This Privacy Policy explains how Housynest ("Housynest / We / Us") collects, uses, and protects your personal information when you use our website and platform ("Site") and related services ("Services").</p>
        <p className="mb-4">By using Housynest, you consent to the data practices described in this Policy. We are committed to protecting your privacy and handling your information responsibly.</p>
        <p>This Policy may be updated from time to time. We will notify you of significant changes by posting the updated Policy on the Site. Continued use of the platform after changes are posted constitutes your acceptance.</p>
      </>
    )
  },
  {
    id: "information-we-collect",
    title: "2. Information We Collect",
    content: (
      <>
        <p className="mb-4">We collect the following types of information:</p>
        <p className="font-bold text-[#062F26] mb-1">Account Information</p>
        <p className="mb-4">When you register, we collect your name, email address, phone number, and any other details you provide during sign-up.</p>
        <p className="font-bold text-[#062F26] mb-1">Property Listings</p>
        <p className="mb-4">If you are a landlord or property owner, we collect property details, including address, photos, pricing, and availability that you submit to the platform.</p>
        <p className="font-bold text-[#062F26] mb-1">Usage Data</p>
        <p className="mb-4">We automatically collect information about how you use the platform, including pages visited, search queries, and interactions with listings. This helps us improve the platform experience.</p>
        <p className="font-bold text-[#062F26] mb-1">Device & Technical Data</p>
        <p className="mb-4">We may collect your IP address, browser type, device type, and operating system to ensure the platform functions correctly and securely.</p>
        <p className="font-bold text-[#062F26] mb-1">Communications</p>
        <p>If you contact us or use our messaging features to communicate with property owners or tenants, we may store those communications to provide the service and resolve disputes.</p>
      </>
    )
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    content: (
      <>
        <p className="mb-4">We use your information to:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Create and manage your account.</li>
          <li>Display property listings and connect tenants with landlords.</li>
          <li>Send you notifications about inquiries, messages, and account activity.</li>
          <li>Improve and personalize your experience on the platform.</li>
          <li>Respond to your support requests and resolve disputes.</li>
          <li>Send service-related communications (e.g., account verification, password reset).</li>
          <li>Comply with legal obligations.</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>
      </>
    )
  },
  {
    id: "information-sharing",
    title: "4. Information Sharing",
    content: (
      <>
        <p className="mb-4">We share your information only in the following circumstances:</p>
        <p className="font-bold text-[#062F26] mb-1">Between Users:</p>
        <p className="mb-4">When a tenant contacts a landlord (or vice versa), relevant contact and listing information is shared to facilitate the connection.</p>
        <p className="font-bold text-[#062F26] mb-1">Service Providers:</p>
        <p className="mb-4">We may share data with trusted third-party service providers (e.g., email delivery, cloud hosting, analytics) who assist us in operating the platform. These providers are bound by confidentiality obligations.</p>
        <p className="font-bold text-[#062F26] mb-1">Legal Requirements:</p>
        <p className="mb-4">We may disclose your information if required by law, court order, or to protect the rights and safety of Housynest, its users, or the public.</p>
        <p>We do not share your personal information with advertisers or unrelated third parties without your consent.</p>
      </>
    )
  },
  {
    id: "data-security",
    title: "5. Data Security",
    content: (
      <>
        <p className="mb-4">We take reasonable technical and organizational measures to protect your personal information from unauthorized access, loss, or misuse. These include secure servers, encrypted connections (HTTPS), and access controls.</p>
        <p className="mb-4">However, no system is completely secure. We cannot guarantee absolute security of data transmitted over the internet. You are responsible for keeping your account credentials confidential.</p>
        <p>If you suspect any unauthorized access to your account, please contact us immediately at support@housynest.com.</p>
      </>
    )
  },
  {
    id: "cookies",
    title: "6. Cookies",
    content: (
      <>
        <p className="mb-4">We use cookies and similar technologies to improve your experience on the platform. Cookies help us remember your preferences, keep you logged in, and understand how users interact with the site.</p>
        <p>You can control cookie settings through your browser. Disabling cookies may affect some features of the platform.</p>
      </>
    )
  },
  {
    id: "data-retention",
    title: "7. Data Retention",
    content: (
      <>
        <p>We retain your personal information for as long as your account is active or as needed to provide the Services. If you delete your account, we will remove your personal data within a reasonable period, except where retention is required by law or for legitimate business purposes (e.g., resolving disputes, preventing fraud).</p>
      </>
    )
  },
  {
    id: "your-rights",
    title: "8. Your Rights",
    content: (
      <>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Access the personal information we hold about you.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>Request deletion of your account and associated data.</li>
          <li>Opt out of non-essential communications at any time.</li>
        </ul>
        <p>To exercise any of these rights, please contact us at support@housynest.com. We will respond within a reasonable timeframe.</p>
      </>
    )
  },
  {
    id: "third-party-links",
    title: "9. Third-Party Links",
    content: (
      <>
        <p>The platform may contain links to third-party websites (e.g., Google Maps). These sites have their own privacy policies, and we are not responsible for their practices. We encourage you to review the privacy policies of any third-party sites you visit.</p>
      </>
    )
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: (
      <>
        <p className="mb-4">If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
        <div className="font-medium text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p>Housynest Support</p>
          <p>Email: <a href="mailto:support@housynest.com" className="text-brand-teal hover:underline">support@housynest.com</a></p>
          <p>Address: HSR Layout Sector 2, Bangalore, Karnataka, India</p>
        </div>
      </>
    )
  }
];

const PrivacyPolicy = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans pb-24">
      {/* Hero Section */}
      <div className="relative w-full h-60 lg:h-70">
        <img src={aboutmain} alt="Hero" className="w-full h-full object-cover brightness-[0.85] opacity-90" />
        <div className="absolute inset-0 bg-linear-to-b from-[#F8F9FA]/5 via-[#F8F9FA]/10 to-[#FAF6F0]"></div>

        <div className="absolute inset-0 pt-10 px-4 xl:px-20">
          <div className="max-w-340 3xl:max-w-420 mx-auto ml-1 xl:ml-3">
            <div className="flex items-center text-xs font-semibold text-brand-teal mb-4">
              <Link to="/" className="hover:underline cursor-pointer">Home</Link>
              <Icon icon="lucide:chevron-right" className="mx-1 w-3 h-3 text-slate-400" />
              <span className="text-slate-600">Privacy Policy</span>
            </div>
            <h1 className="text-3xl lg:text-[40px] font-serif font-bold text-[#062F26] leading-tight mb-2">Privacy Policy</h1>
            <p className="text-slate-600 text-[15px] font-medium">Learn how we collect, use, and protect your data</p>
          </div>
        </div>
      </div>

      <div className="max-w-340 3xl:max-w-420 mx-auto px-4 -mt-10 lg:-mt-16 relative z-10">
        
        {/* Table of Contents */}
        <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-[#062F26] mb-6 flex items-center gap-2">
            <Icon icon="lucide:list" className="text-brand-teal" />
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {privacyData.map((section) => (
              <button 
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-left text-sm font-semibold text-slate-600 hover:text-brand-teal transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-brand-teal transition-colors"></span>
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="flex flex-col gap-6">
          {privacyData.map((section) => (
            <div 
              key={section.id} 
              id={section.id}
              className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-100 p-8 transition-all duration-300 hover:shadow-md hover:border-brand-teal/20"
            >
              <h3 className="text-lg font-bold text-[#062F26] mb-4 pb-4 border-b border-slate-100">
                {section.title}
              </h3>
              <div className="text-sm text-slate-600 leading-relaxed font-medium">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Banner */}
        <div className="mt-8 bg-linear-to-r from-[#062F26] to-[#0A4A3C] rounded-2xl p-8 lg:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-3">Questions about your privacy?</h3>
            <p className="text-[#a1b8b2] mb-8 font-medium">Contact our team for any questions regarding this policy.</p>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 bg-brand-teal text-white px-8 py-3.5 rounded-xl font-bold text-[15px] hover:bg-white hover:text-[#062F26] transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-lg shadow-brand-teal/30"
            >
              <Icon icon="lucide:mail" width="18" />
              Contact Us
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
