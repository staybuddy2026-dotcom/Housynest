import { useState } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import newsletterImg from '../assets/newsletter2.png';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;
    if (!email) return;

    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        toast.success(data.message || 'Successfully subscribed to newsletter!', {
          style: {
            background: '#062F26',
            color: '#fff',
            border: '1px solid rgba(255,184,0,0.3)',
          },
          iconTheme: {
            primary: '#FFB800',
            secondary: '#062F26',
          },
        });
        setEmail('');

        setTimeout(() => {
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('idle');
        toast.error(data.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
      toast.error('An error occurred. Please try again later.');
    }
  };

  return (
    <section className="w-full relative z-20 -mb-24 px-4">
      <div className="max-w-340 3xl:max-w-420 mx-auto">
        <div className="bg-gradient-to-r from-[#105E4C] to-[#1C8D7D] rounded-2xl px-6 py-1 md:px-8 lg:px-12 shadow-2xl relative flex flex-col md:flex-row items-center justify-between gap-0 md:gap-6 lg:gap-8 group">

          {/* Backgrounds Container (with overflow-hidden) */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
            {/* Decorative Elements */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-yellow/20 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-yellow/30 transition-colors duration-700"></div>
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-colors duration-700"></div>

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          </div>

          {/* Left Content (Text + Input) */}
          <div className="relative z-10 w-full md:w-[60%] lg:w-[70%] flex flex-col gap-4 sm:gap-3 md:gap-2 items-start text-left py-6 md:py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-md shadow-sm">
              <Icon icon="lucide:bell-ring" className="text-brand-yellow" width="14" />
              Stay Updated
            </div>

            <h3 className="text-[26px] sm:text-2xl md:text-[32px] font-serif font-bold text-white leading-[1.2]">
              Get the latest updates straight to your inbox
            </h3>

            <p className="text-teal-50 text-sm leading-relaxed opacity-90 max-w-3xl">
              Join thousands of users! Subscribe to our newsletter and be the first to know about exclusive deals, new premium properties, and expert renting tips.
            </p>

            <div className="w-full relative flex flex-col gap-1.5 mt-1 max-w-3xl">
              <form onSubmit={handleSubscribe} className="bg-white/10 p-2 sm:py-1 sm:px-2 rounded-xl sm:rounded-lg border border-white/20 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center gap-3 sm:gap-0 group/input hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <div className="hidden sm:block pl-4 pr-2 text-white/50 group-focus-within/input:text-brand-yellow transition-colors">
                  <Icon icon="lucide:mail" width="20" />
                </div>
                <div className="relative flex-1 w-full sm:w-auto">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="newsletter-email-new"
                    placeholder=" "
                    className="peer w-full bg-transparent text-white placeholder-transparent px-2 py-3 sm:py-2 outline-none font-medium text-sm"
                  />
                  <label
                    htmlFor="newsletter-email-new"
                    className="absolute left-2 transition-all duration-300 ease-in-out peer-placeholder-shown:top-3.5 sm:peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-white/60 peer-focus:-top-3.5 sm:peer-focus:-top-3.5 peer-focus:text-xs peer-focus:font-bold peer-focus:text-brand-yellow peer-focus:bg-[#157160] peer-focus:px-1.5 peer-focus:rounded cursor-text pointer-events-none -top-3.5 text-xs font-bold text-brand-yellow bg-[#157160] px-1.5 rounded whitespace-nowrap"
                  >
                    Enter your email address
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-brand-yellow hover:bg-brand-yellow-hover text-slate-900 w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-lg font-bold text-sm transition-all transform hover:scale-105 shadow-[0_4px_15px_rgba(255,184,0,0.2)] flex items-center gap-2 cursor-pointer whitespace-nowrap sm:ml-2 overflow-hidden min-w-[130px] justify-center"
                >
                  <span className={`transition-all duration-300 ${status === 'loading' ? 'opacity-50' : 'opacity-100'}`}>
                    {status === 'success' ? 'Subscribed!' : status === 'loading' ? 'Sending...' : 'Subscribe'}
                  </span>

                  <div className="relative flex items-center justify-center w-4 h-4">
                    {/* Send Icon - Flies away to top right */}
                    <Icon
                      icon="lucide:send"
                      width="14"
                      className={`absolute transition-all duration-500 ease-out ${status !== 'idle' ? 'translate-x-6 -translate-y-6 opacity-0' : 'translate-x-0 translate-y-0 opacity-100'
                        }`}
                    />

                    {/* Loading Spinner - Scales in */}
                    <Icon
                      icon="lucide:loader-2"
                      width="14"
                      className={`absolute animate-spin transition-all duration-300 ${status === 'loading' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                        }`}
                    />

                    {/* Check Icon - Pops in */}
                    <Icon
                      icon="lucide:check"
                      width="16"
                      className={`absolute transition-all duration-500 delay-100 ease-out ${status === 'success' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-45'
                        }`}
                    />
                  </div>
                </button>
              </form>
              <p className="text-white/50 text-xs ml-1 flex items-center justify-start gap-1.5">
                <Icon icon="lucide:shield-check" width="12" className="text-brand-yellow" />
                We respect your privacy. No spam ever.
              </p>
            </div>
          </div>

          {/* Right Image Area */}
          <div className="w-full md:w-[40%] lg:w-auto relative z-20 flex justify-center -mt-11  md:mt-0 -mb-6 md:-mb-0 lg:-mb-[23px] overflow-hidden">
            <div className="relative w-full max-w-[280px] md:max-w-[300px] lg:max-w-[330px]">
              {/* Optional glowing effect behind image */}
              <div className="absolute inset-0 bg-brand-yellow/10 rounded-full blur-3xl scale-90"></div>
              <img
                src={newsletterImg}
                alt="Newsletter Subscription"
                className="w-full h-auto object-contain relative z-20 hover:-translate-y-2 transition-transform duration-600"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Newsletter;
