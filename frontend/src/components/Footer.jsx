import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

const companyInfo = {
  logo: logo,
  description: "India's trusted platform to find premium PGs, stylish apartments, and comfortable homes across major cities. We make renting simple and secure.",
  socials: [
    { name: "Facebook", icon: "mdi:facebook", url: "#" },
    { name: "Instagram", icon: "mdi:instagram", url: "#" },
    { name: "Twitter", icon: "mdi:twitter", url: "#" }
  ]
};

const footerLinks = [
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Contact Us", href: "/contact" },
    ]
  },
  {
    title: "For Owners",
    links: [
      { name: "List Your Property", href: "/list-property", ownerOnly: true },
      { name: "Owner Login", href: "/login", hideWhenLoggedIn: true },
      { name: "Resources", href: "#" },
    ]
  },
  {
    title: "Popular Cities",
    links: [
      { name: "Ahmedabad", href: "/properties?location=Ahmedabad" },
      { name: "Gandhinagar", href: "/properties?location=Gandhinagar" },
      { name: "Mumbai", href: "/properties?location=Mumbai" },
      { name: "Bangalore", href: "/properties?location=Bangalore" }
    ]
  },
  {
    title: "Contact Us",
    links: [
      { name: "hello@housynest.com", href: "mailto:hello@housynest.com", icon: "lucide:mail" },
      { name: "+91 98765 43210", href: "tel:+919876543210", icon: "lucide:phone" },
      { name: "Bangalore, India", href: "#", icon: "lucide:map-pin" },
    ]
  }
];

const Footer = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <footer className="bg-[#062F26] text-white mt-auto">
      <div className="max-w-340 3xl:max-w-420 mx-auto pt-32 pb-6 px-4 sm:px-6 xl:px-0">

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-12 justify-between">

          {/* 1. Logo & Brand */}
          <div className="w-full lg:w-[35%] space-y-4">
            <div className="bg-white inline-flex px-4 py-2 rounded-md shadow-sm">
              <img src={companyInfo.logo} alt="HousyNest Logo" className="h-11 object-contain" />
            </div>
            <p className="text-[#a1b8b2] text-sm leading-relaxed pr-4">
              {companyInfo.description}
            </p>
            <div className="flex gap-3 items-center">
              {companyInfo.socials.map((social, idx) => (
                <a key={idx} href={social.url} className="group relative w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-yellow hover:border-brand-yellow cursor-pointer transition-all duration-300">
                  <Icon icon={social.icon} className="text-[#cce2dc] group-hover:text-slate-900 w-5 h-5 transition-colors" />
                  <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 flex flex-col items-center pointer-events-none">
                    <div className="w-0 h-0 border-x-[5px] border-x-transparent border-b-[5px] border-b-slate-800 -mb-px"></div>
                    <span className="bg-slate-800 text-white text-xs font-medium px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                      {social.name}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* 2. Links Grid */}
          <div className="w-full lg:w-[60%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8">
            {footerLinks.map((column, idx) => (
              <div key={idx}>
                <h4 className="font-semibold tracking-widest uppercase text-white mb-5 sm:mb-6 text-xs">{column.title}</h4>
                <ul className="space-y-4 sm:space-y-3.5 text-sm text-[#a1b8b2] tracking-wider">
                  {column.links.map((link, linkIdx) => {
                    // Conditional rendering logic
                    if (link.ownerOnly && user?.role !== 'owner') return null;
                    if (link.hideWhenLoggedIn && user) return null;

                    const isInternalLink = link.href.startsWith('/');

                    const linkContent = (
                      <>
                        {link.icon ? (
                          <Icon icon={link.icon} className="text-brand-yellow mt-0.5 w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <span className="w-0 overflow-hidden group-hover/link:w-2 transition-all duration-300">
                            <Icon icon="lucide:chevron-right" className="text-brand-yellow" width="12" />
                          </span>
                        )}
                        <span className="leading-tight">{link.name}</span>
                      </>
                    );

                    return (
                      <li key={linkIdx}>
                        {isInternalLink ? (
                          <Link
                            to={link.href}
                            className={`transition-colors flex items-start gap-2.5 group/link ${link.highlight ? 'font-medium text-white' : 'hover:text-white'}`}
                          >
                            {linkContent}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            className={`transition-colors flex items-start gap-2.5 group/link ${link.highlight ? 'font-medium text-white' : 'hover:text-white'}`}
                          >
                            {linkContent}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#13463a] mt-10 sm:mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#a1b8b2] text-center md:text-left">
          <div>&copy; {new Date().getFullYear()} HousyNest. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
            <Link to="/privacy" className="hover:text-brand-yellow transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-brand-yellow transition-colors">Terms of Service</Link>
            <a href="#" className="hover:text-brand-yellow transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
