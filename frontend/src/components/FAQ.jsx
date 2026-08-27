import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import faqImg from '../assets/faq.png';

const faqs = [
  {
    question: "How do I verify a property listing?",
    answer: "Every property on HousyNest goes through a rigorous verification process. Look for the 'Verified' badge on listings, which means our team has physically or digitally verified the property details and photos."
  },
  {
    question: "Is there any brokerage fee when booking through HousyNest?",
    answer: "No! We believe in a zero-brokerage model. You connect directly with owners and managers, saving you the typical 1-2 months of rent that brokers charge."
  },
  {
    question: "What is the process to list my property?",
    answer: "Listing your property is simple and free. Just click on 'Add New Property' in your dashboard, fill in the details, upload clear photos, and submit. Our team will review and approve it within 24 hours."
  },
  {
    question: "How secure are the payments made on the platform?",
    answer: "We use bank-grade encryption for all transactions. Your token amounts and rent payments are processed through secure payment gateways, ensuring 100% safety of your funds."
  }
];

const FAQ = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="max-w-340 3xl:max-w-420 mx-auto px-4 sm:px-6 xl:px-0 pt-16">
      <div className="flex flex-col lg:flex-row gap-10 items-center">

        {/* FAQ Image */}
        <div className="w-full lg:w-[32%] flex justify-center relative">
          {/* Background Blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] lg:w-[380px] lg:h-[380px] bg-brand-teal/30 z-0 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] lg:w-[320px] lg:h-[320px] bg-[#062F26]/15 z-0 blur-2xl rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] animate-pulse duration-[4000ms]"></div>

          <img src={faqImg} alt="Frequently Asked Questions" className="w-full max-w-[320px] lg:max-w-[400px] h-auto object-contain drop-shadow-sm relative z-10 opacity-88" />
        </div>

        {/* FAQ Content */}
        <div className="w-full lg:w-[68%]">
          <div className="mb-8 text-left">
            <h3 className="text-brand-teal font-bold text-xs tracking-[0.15em] uppercase mb-3">Questions?</h3>
            <h2 className="text-3xl lg:text-[34px] font-serif font-bold text-[#062F26] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Find answers to common questions about HousyNest. Need more help? Our support team is available 24/7.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`bg-white border rounded-xl overflow-hidden transition-all duration-500 ${openFaq === index ? 'border-brand-teal shadow-[0_10px_30px_rgba(10,168,125,0.1)]' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}
              >
                <button
                  className="w-full flex items-center justify-between p-5 lg:p-6 text-left cursor-pointer focus:outline-none bg-transparent"
                  onClick={() => toggleFaq(index)}
                >
                  <h4 className={`text-base font-bold transition-colors ${openFaq === index ? 'text-brand-teal' : 'text-[#062F26]'}`}>
                    {faq.question}
                  </h4>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${openFaq === index ? 'bg-[#EAF5F2] text-brand-teal rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                    <Icon icon="lucide:chevron-down" className="w-5 h-5" />
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="pb-5 lg:pb-6 pt-0 text-slate-600 text-sm font-medium leading-relaxed border-t border-slate-50 mt-2 pt-4 mx-5 lg:mx-6">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
