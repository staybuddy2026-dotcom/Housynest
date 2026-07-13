import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const signupSchema = z.object({
  role: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  terms: z.boolean().refine(val => val === true, 'You must agree to terms & conditions'),
  barCouncilNumber: z.string().optional(),
  experience: z.string().optional(),
  aadharNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: "Passwords don't match"
}).superRefine((data, ctx) => {
  if (data.role === 'lawyer') {
    if (!data.barCouncilNumber || data.barCouncilNumber.trim() === '') {
      ctx.addIssue({ path: ['barCouncilNumber'], code: z.ZodIssueCode.custom, message: 'Required' });
    }
    if (!data.experience || data.experience.trim() === '') {
      ctx.addIssue({ path: ['experience'], code: z.ZodIssueCode.custom, message: 'Required' });
    }
    if (!data.aadharNumber || data.aadharNumber.trim() === '') {
      ctx.addIssue({ path: ['aadharNumber'], code: z.ZodIssueCode.custom, message: 'Required' });
    }
  }
});

const AuthSignupForm = ({ onOtpSent }) => {
  const [role, setRole] = useState('tenant');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [certificate, setCertificate] = useState(null);

  const roles = [
    { id: 'owner', title: 'Owner', subtitle: 'List & Manage', icon: 'lucide:home' },
    { id: 'tenant', title: 'Tenant', subtitle: 'Find Homes', icon: 'lucide:user' },
    { id: 'lawyer', title: 'Lawyer', subtitle: 'Legal Help', icon: 'lucide:scale' }
  ];

  const { register, handleSubmit, setValue, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'tenant', terms: false }
  });

  useEffect(() => {
    setValue('role', role);
    if (role !== 'lawyer') {
      setStep(1);
    }
  }, [role, setValue]);

  const onSubmit = async (data) => {
    console.log("Submitting form data:", data);
    setIsLoading(true);
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      };

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || 'Failed to send OTP', { duration: 3000 });
        return;
      }
      toast.success(result.message || 'OTP sent to your email!', { duration: 3000 });
      if (onOtpSent) {
        onOtpSent({ ...data, certificateFile: certificate });
      }
    } catch (error) {
      console.error("Signup fetch error:", error);
      toast.error('An error occurred during registration', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-4 lg:mb-5">
        <h2 className="text-2xl lg:text-[28px] tracking-[-0.01em] font-serif font-bold text-[#062F26] mb-1.5">Create Your Account</h2>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-3 gap-2 mb-4 lg:mb-6">
          {roles.map((r) => (
            <button key={r.id} onClick={() => setRole(r.id)} type="button" className={`group relative flex flex-col cursor-pointer items-center justify-center gap-1.5 p-2 rounded-lg border-[1.5px] transition-all duration-300 ${role === r.id ? 'border-[#062F26] bg-[#062F26]/[0.03] shadow-sm transform -translate-y-0.5 ring-1 ring-[#062F26]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm hover:-translate-y-0.5'}`}>
              <Icon icon={r.icon} className={`w-5.5 h-5.5 transition-colors duration-300 ${role === r.id ? 'text-[#062F26]' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <div className="text-center">
                <div className={`text-sm font-semibold transition-colors duration-300 ${role === r.id ? 'text-[#062F26]' : 'text-slate-700 group-hover:text-slate-900'}`}>{r.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">{r.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit(onSubmit, (errors) => console.log("Validation errors:", errors))}>

          <div>
            <div className="relative flex items-center group">
              <Icon icon="lucide:user" className={`absolute left-3.5 w-4 h-4 z-10 transition-all ${errors.fullName ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#062F26]'}`} />
              <input type="text" id="fullName" placeholder=" " {...register('fullName')} className={`peer w-full bg-slate-50 border rounded-md py-2.5 lg:py-3 pr-4 pl-9 text-sm lg:text-sm outline-none transition-all shadow-sm ${errors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white'}`} />
              <label htmlFor="fullName" className={`absolute left-8 px-1 transition-all pointer-events-none z-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white top-0 -translate-y-1/2 text-xs bg-white rounded-sm ${errors.fullName ? 'text-red-500 peer-focus:text-red-500' : 'text-slate-400 peer-focus:text-[#062F26]'}`}>Full Name</label>
            </div>
            {errors.fullName && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="relative flex items-center group">
                <Icon icon="lucide:mail" className={`absolute left-3.5 w-4 h-4 z-10 transition-all ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#062F26]'}`} />
                <input type="email" id="signupEmail" placeholder=" " {...register('email')} className={`peer w-full bg-slate-50 border rounded-md py-2.5 lg:py-3 pr-4 pl-9 text-sm lg:text-sm outline-none transition-all shadow-sm ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white'}`} />
                <label htmlFor="signupEmail" className={`absolute left-8 px-1 transition-all pointer-events-none z-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white top-0 -translate-y-1/2 text-xs bg-white rounded-sm ${errors.email ? 'text-red-500 peer-focus:text-red-500' : 'text-slate-400 peer-focus:text-[#062F26]'}`}>Email</label>
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email.message}</p>}
            </div>
            <div>
              <div className="relative flex items-center group">
                <Icon icon="lucide:phone" className={`absolute left-3.5 w-4 h-4 z-10 transition-all ${errors.phone ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#062F26]'}`} />
                <input type="tel" id="phone" placeholder=" " {...register('phone')} className={`peer w-full bg-slate-50 border rounded-md py-2.5 lg:py-3 pr-4 pl-9 text-sm lg:text-sm outline-none transition-all shadow-sm ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white'}`} />
                <label htmlFor="phone" className={`absolute left-8 px-1 transition-all pointer-events-none z-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:bg-white top-0 -translate-y-1/2 text-xs bg-white rounded-sm ${errors.phone ? 'text-red-500 peer-focus:text-red-500' : 'text-slate-400 peer-focus:text-[#062F26]'}`}>Phone</label>
              </div>
              {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <div className="relative flex items-center group">
                <Icon icon="lucide:lock" className={`absolute left-3.5 w-4 h-4 z-10 transition-all ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#062F26]'}`} />
                <input type={showSignupPassword ? 'text' : 'password'} id="signupPassword" placeholder=" " {...register('password')} className={`peer w-full bg-slate-50 border rounded-md py-2.5 lg:py-3 pr-8 pl-9 text-sm lg:text-sm outline-none transition-all shadow-sm ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white'}`} />
                <label htmlFor="signupPassword" className={`absolute left-8 px-1 transition-all pointer-events-none z-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:bg-white top-0 -translate-y-1/2 text-[10px] sm:text-xs bg-white rounded-sm ${errors.password ? 'text-red-500 peer-focus:text-red-500' : 'text-slate-400 peer-focus:text-[#062F26]'}`}>Password</label>
                <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-2 text-slate-400 hover:text-[#062F26] z-10 cursor-pointer">
                  <Icon icon={showSignupPassword ? 'lucide:eye' : 'lucide:eye-off'} className="w-4 h-4" />
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.password.message}</p>}
            </div>
            <div>
              <div className="relative flex items-center group">
                <Icon icon="lucide:lock" className={`absolute left-3.5 w-4 h-4 z-10 transition-all ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#062F26]'}`} />
                <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" placeholder=" " {...register('confirmPassword')} className={`peer w-full bg-slate-50 border rounded-md py-2.5 lg:py-3 pr-8 pl-9 text-sm lg:text-sm outline-none transition-all shadow-sm ${errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-4 focus:ring-[#062F26]/10 focus:bg-white'}`} />
                <label htmlFor="confirmPassword" className={`absolute left-8 px-1 transition-all pointer-events-none z-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:bg-white top-0 -translate-y-1/2 text-[10px] sm:text-xs bg-white rounded-sm ${errors.confirmPassword ? 'text-red-500 peer-focus:text-red-500' : 'text-slate-400 peer-focus:text-[#062F26]'}`}>Confirm</label>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 text-slate-400 hover:text-[#062F26] z-10 cursor-pointer">
                  <Icon icon={showConfirmPassword ? 'lucide:eye' : 'lucide:eye-off'} className="w-4 h-4" />
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <div className="pt-1.5 pb-2.5 flex items-start gap-2.5">
              <div className="flex items-center h-4 mt-0.5 relative">
                <input id="terms" type="checkbox" {...register('terms')} className={`w-3.5 h-3.5 rounded border-slate-300 text-[#062F26] cursor-pointer ${errors.terms ? 'outline outline-1 outline-red-500' : ''}`} />
              </div>
              <label htmlFor="terms" className="text-xs text-slate-500 leading-snug cursor-pointer group">
                I agree to the <a href="#" className="font-semibold text-[#062F26] hover:underline">Terms & Conditions</a> and <a href="#" className="font-semibold text-[#062F26] hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-[10px] ml-1">{errors.terms.message}</p>}
          </div>

          {role === 'lawyer' ? (
            <button type="button" onClick={async () => {
              const isValid = await trigger(['fullName', 'email', 'phone', 'password', 'confirmPassword', 'terms']);
              if (isValid) setStep(2);
            }} className="w-full bg-[#062F26] hover:bg-[#04201a] text-white font-semibold py-2.5 lg:py-3 rounded-md shadow-[0_4px_15px_rgba(6,47,38,0.15)] transition-all flex items-center justify-center text-sm cursor-pointer mt-2">
              Next: Professional Details
            </button>
          ) : (
            <button type="submit" disabled={isLoading} className="w-full bg-[#062F26] hover:bg-[#04201a] text-white font-semibold py-2.5 lg:py-3 rounded-md shadow-[0_4px_15px_rgba(6,47,38,0.15)] transition-all flex items-center justify-center text-sm cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? <Icon icon="eos-icons:loading" className="w-5 h-5 mr-2" /> : null}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          )}
        </form>
      )}

      {step === 2 && role === 'lawyer' && (
        <form className="space-y-4 sm:space-y-5" onSubmit={(e) => {
          e.preventDefault();
          if (!certificate) {
            toast.error("Please upload your Bar Council Certificate");
            return;
          }
          handleSubmit(onSubmit)();
        }}>
          <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-200">
            <div className="flex items-start gap-2.5">
              <Icon icon="lucide:scale" className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-sm font-bold text-amber-900">Professional Verification Required</h4>
                <p className="text-xs text-amber-700 mt-0.5 leading-snug">Your account will be reviewed by an admin before you can log in. All fields are required.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bar Council Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <Icon icon="lucide:scale" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" {...register('barCouncilNumber')} placeholder="e.g. BCI/123/2020" className={`w-full bg-white border rounded-md py-2.5 pr-4 pl-9 text-sm outline-none transition-all shadow-sm ${errors.barCouncilNumber ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-2 focus:ring-[#062F26]/10'}`} />
              </div>
              {errors.barCouncilNumber && <p className="text-red-500 text-[10px] mt-1">{errors.barCouncilNumber.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Experience (Years) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" {...register('experience')} placeholder="e.g. 5" className={`w-full bg-white border rounded-md py-2.5 px-4 text-sm outline-none transition-all shadow-sm ${errors.experience ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-2 focus:ring-[#062F26]/10'}`} />
              </div>
              {errors.experience && <p className="text-red-500 text-[10px] mt-1">{errors.experience.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Aadhar Number <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="text" {...register('aadharNumber')} placeholder="12-digit Aadhar number" className={`w-full bg-white border rounded-md py-2.5 px-4 text-sm outline-none transition-all shadow-sm ${errors.aadharNumber ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#062F26] focus:ring-2 focus:ring-[#062F26]/10'}`} />
            </div>
            {errors.aadharNumber && <p className="text-red-500 text-[10px] mt-1">{errors.aadharNumber.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bar Council Certificate <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="file" accept=".pdf,image/*" onChange={(e) => setCertificate(e.target.files[0])} className="hidden" id="certificate-upload" />
              <label htmlFor="certificate-upload" className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 cursor-pointer transition-all">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <Icon icon={certificate ? "lucide:file-check" : "lucide:upload-cloud"} className={`w-6 h-6 ${certificate ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-600">
                    {certificate ? certificate.name : 'Upload certificate (image or PDF, max 5MB)'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button type="button" onClick={() => setStep(1)} className="px-4 py-2.5 lg:py-3 border border-slate-200 rounded-md text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
              <Icon icon="lucide:arrow-left" className="w-4 h-4" />
              Back
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-[#062F26] hover:bg-[#04201a] text-white font-semibold py-2.5 lg:py-3 rounded-md shadow-[0_4px_15px_rgba(6,47,38,0.15)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? <Icon icon="eos-icons:loading" className="w-5 h-5" /> : <Icon icon="lucide:scale" className="w-4 h-4" />}
              {isLoading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default AuthSignupForm;
