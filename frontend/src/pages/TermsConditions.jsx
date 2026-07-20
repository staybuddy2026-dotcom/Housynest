import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import aboutmain from '../assets/aboutmain.png';

const termsData = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <>
        <p className="mb-4">These Terms & Conditions ("Terms") govern your use of the Housynest website and platform ("Site") and all related services ("Services"). By accessing or using Housynest, you agree to be bound by these Terms.</p>
        <p className="mb-4">Housynest is an online platform that connects tenants looking for PG accommodations and rental properties with property owners and landlords. We act solely as an intermediary and are not a party to any rental agreement between users.</p>
        <p>Housynest reserves the right to update these Terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised Terms.</p>
      </>
    )
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: (
      <>
        <p className="mb-4">You must be at least 18 years of age to use Housynest. By using the platform, you confirm that you are legally competent to enter into a binding agreement.</p>
        <p>You agree to provide accurate, complete, and up-to-date information during registration and to keep your account details current at all times.</p>
      </>
    )
  },
  {
    id: "use-of-platform",
    title: "3. Use of the Platform",
    content: (
      <>
        <p className="mb-4">Housynest provides the following services:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Searching and browsing PG accommodations and rental properties.</li>
          <li>Posting property listings (for landlords and property owners).</li>
          <li>Contacting property owners or tenants directly through the platform.</li>
          <li>Saving favourite properties and managing your account.</li>
        </ul>
        <p>You agree to use the platform only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use of the platform.</p>
      </>
    )
  },
  {
    id: "property-listings",
    title: "4. Property Listings",
    content: (
      <>
        <p className="mb-4">Property owners are solely responsible for the accuracy, completeness, and legality of their listings. Housynest does not verify every listing and makes no guarantees regarding the accuracy of property descriptions, photos, pricing, or availability.</p>
        <p className="mb-4">Tenants are advised to conduct their own due diligence, including physical inspection of the property and direct communication with the owner, before entering into any rental agreement.</p>
        <p>Housynest reserves the right to remove any listing that violates these terms or is found to be fraudulent, misleading, or inappropriate.</p>
      </>
    )
  },
  {
    id: "user-obligations",
    title: "5. User Obligations",
    content: (
      <>
        <p className="mb-4">All users agree to:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Provide accurate and truthful information on the platform.</li>
          <li>Not post false, misleading, or fraudulent listings or inquiries.</li>
          <li>Not use the platform to harass, threaten, or harm other users.</li>
          <li>Not attempt to scrape, copy, or extract data from the platform without written permission.</li>
          <li>Not impersonate any person or misrepresent their identity or affiliation.</li>
          <li>Maintain the confidentiality of their login credentials and notify Housynest immediately of any unauthorized account access.</li>
        </ul>
        <p>Violation of these obligations may result in suspension or permanent removal of your account.</p>
      </>
    )
  },
  {
    id: "intellectual-property",
    title: "6. Intellectual Property",
    content: (
      <>
        <p className="mb-4">All content on the Housynest platform — including text, images, logos, design, and software — is the property of Housynest or its licensors. You may not reproduce, distribute, or create derivative works from any content on the platform without prior written consent.</p>
        <p>By submitting content (such as property photos or descriptions) to the platform, you grant Housynest a non-exclusive, royalty-free license to use, display, and distribute that content in connection with the Services.</p>
      </>
    )
  },
  {
    id: "privacy",
    title: "7. Privacy",
    content: (
      <>
        <p>Your use of Housynest is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information. By using the platform, you consent to the data practices described in our Privacy Policy.</p>
      </>
    )
  },
  {
    id: "disclaimer",
    title: "8. Disclaimer",
    content: (
      <>
        <p className="mb-4">Housynest is a listing and discovery platform. We do not own, manage, or control any of the properties listed on the platform. We are not responsible for the conduct of any user, the accuracy of any listing, or the outcome of any rental transaction.</p>
        <p>The platform is provided "as is" without warranties of any kind. Housynest does not guarantee uninterrupted, error-free access to the platform.</p>
      </>
    )
  },
  {
    id: "limitation-of-liability",
    title: "9. Limitation of Liability",
    content: (
      <>
        <p className="mb-4">To the fullest extent permitted by law, Housynest shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to loss of data, loss of rental opportunity, or disputes between tenants and landlords.</p>
        <p>Housynest's total liability in any matter shall not exceed the amount, if any, paid by you to Housynest in the 12 months preceding the claim.</p>
      </>
    )
  },
  {
    id: "account-termination",
    title: "10. Account Termination",
    content: (
      <>
        <p className="mb-4">Housynest reserves the right to suspend or terminate your account at any time if you violate these terms, engage in fraudulent activity, or act in a manner harmful to other users or the platform.</p>
        <p>You may delete your account at any time by contacting us. Upon termination, your access to the platform will cease, though certain data may be retained as required by law.</p>
      </>
    )
  },
  {
    id: "governing-law",
    title: "11. Governing Law",
    content: (
      <>
        <p className="mb-4">These Terms are governed by the laws of India. Any disputes arising from your use of Housynest shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.</p>
        <p>If you are accessing the platform from another jurisdiction, local laws may also apply to the extent required.</p>
      </>
    )
  },
  {
    id: "contact",
    title: "12. Contact",
    content: (
      <>
        <p className="mb-4">For any questions or concerns regarding these Terms, please contact us:</p>
        <div className="font-medium text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p>Housynest Support</p>
          <p>Email: <a href="mailto:support@housynest.com" className="text-brand-teal hover:underline">support@housynest.com</a></p>
          <p>Address: HSR Layout Sector 2, Bangalore, Karnataka, India</p>
        </div>
      </>
    )
  }
];

const TermsConditions = () => {
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
              <span className="text-slate-600">Terms & Conditions</span>
            </div>
            <h1 className="text-3xl lg:text-[40px] font-serif font-bold text-[#062F26] leading-tight mb-2">Terms & Conditions</h1>
            <p className="text-slate-600 text-[15px] font-medium">Please read these terms carefully before using our platform</p>
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
            {termsData.map((section) => (
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
          {termsData.map((section) => (
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
            <h3 className="text-2xl font-bold mb-3">Have questions?</h3>
            <p className="text-[#a1b8b2] mb-8 font-medium">Contact our team for any questions regarding these terms.</p>
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

export default TermsConditions;
