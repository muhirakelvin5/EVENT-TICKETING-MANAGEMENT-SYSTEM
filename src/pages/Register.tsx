import { useForm } from 'react-hook-form';
import { Navbar } from '../components/Navbar';
import { userApi } from '../features/APIS/UserApi';
import { toast, Toaster } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, ShieldCheck, Sparkles, User, Mail, Lock, Phone, Fingerprint } from 'lucide-react';

interface RegisterDetails {
  nationalId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactPhone: string;
}

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&#]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-error', percent: '33%' };
  if (score === 3 || score === 4) return { label: 'Medium', color: 'bg-warning', percent: '66%' };
  return { label: 'Strong', color: 'bg-success', percent: '100%' };
};

const Register = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterDetails>();
  const [registerUser, { isLoading }] = userApi.useRegisterUserMutation();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auto-generate 8-digit National ID on load
  useEffect(() => {
    const randomId = Math.floor(10000000 + Math.random() * 90000000);
    setValue('nationalId', randomId);
  }, [setValue]);

  const onSubmit = async (data: RegisterDetails) => {
    try {
      const loadingToastId = toast.loading('🚀 Initializing Account...');
      const res = await registerUser(data).unwrap();
      toast.success('✅ Account Initialized', { id: loadingToastId });
      navigate("/email-verification", {
        state: { email: data.email, message: res?.message }
      });
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.error || '❌ System Error.';
      toast.error(errorMessage);
    }
  };

  return (
    /* Changed h-screen to min-h-screen and removed overflow-hidden to allow scrolling */
    /* Added pb-24 to ensure content clears the floating bottom navbar */
    <div className="min-h-screen w-screen bg-base-100 font-sans selection:bg-primary selection:text-primary-content flex flex-col pb-24">
      <Toaster richColors position="top-right" />
      <Navbar />

      {/* pt-16 accounts for the top navbar, flex-grow allows content to fill space */}
      <div className="pt-16 flex-grow grid grid-cols-1 lg:grid-cols-2">
        
        {/* --- Left Side: Hero (Desktop Only) --- */}
        <div className="hidden lg:block relative group overflow-hidden bg-neutral h-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-accent/20 z-10" />
          <div className="absolute inset-0 bg-black/50 z-20" />
          
          <img
            src="https://images.unsplash.com/photo-1514525253361-b5508019ff7a?q=80&w=1974&auto=format&fit=crop"
            alt="Experience"
            className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110"
          />
          
          <div className="absolute inset-0 z-30 flex flex-col justify-end p-16 space-y-4">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl w-fit">
              <Sparkles size={16} className="text-primary animate-pulse" />
              Join the Movement
            </div>
            <h1 className="text-7xl font-black italic text-white tracking-tighter leading-[0.85] drop-shadow-2xl uppercase">
              Start Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Legacy.</span>
            </h1>
          </div>
        </div>

        {/* --- Right Side: Register Portal --- */}
        <div className="flex items-center justify-center p-4 sm:p-8 relative bg-base-100">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25rem] h-[25rem] bg-primary/10 blur-[120px] rounded-full -z-0 opacity-40" />
          
          <div className="w-full max-w-lg z-10 animate-fadeIn">
            <div className="bg-base-200/70 backdrop-blur-3xl rounded-[2.5rem] p-6 sm:p-10 border border-base-content/10 shadow-2xl">
              
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-base-content">
                  Create <span className="text-primary">Account</span>
                </h2>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Initialize your Madollar Tickets profile</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Names Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-60 ml-2">
                      <User size={12} className="text-primary" /> First Name
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full h-12 bg-base-100/50 rounded-xl font-bold text-sm focus:border-primary"
                      placeholder="Jane"
                      {...register('firstName', { required: true })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-60 ml-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full h-12 bg-base-100/50 rounded-xl font-bold text-sm focus:border-primary"
                      placeholder="Doe"
                      {...register('lastName', { required: true })}
                    />
                  </div>
                </div>

                {/* Info Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-60 ml-2">
                      <Fingerprint size={12} className="text-primary" /> Digital ID
                    </label>
                    <input
                      type="number"
                      readOnly
                      className="input input-bordered w-full h-12 bg-base-300/50 rounded-xl font-mono font-bold text-sm cursor-not-allowed opacity-70"
                      {...register('nationalId')}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-60 ml-2">
                      <Phone size={12} className="text-primary" /> Contact
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full h-12 bg-base-100/50 rounded-xl font-bold text-sm focus:border-primary"
                      placeholder="+254..."
                      {...register('contactPhone', { required: true })}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-60 ml-2">
                    <Mail size={12} className="text-primary" /> Email Address
                  </label>
                  <input
                    type="email"
                    className="input input-bordered w-full h-12 bg-base-100/50 rounded-xl font-bold text-sm focus:border-primary"
                    placeholder="name@university.com"
                    {...register('email', { required: true })}
                  />
                </div>

                {/* Password with Strength Meter */}
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-60 ml-2">
                    <Lock size={12} className="text-primary" /> Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input input-bordered w-full h-12 bg-base-100/50 rounded-xl font-bold text-sm pr-10 focus:border-primary"
                      placeholder="••••••••"
                      {...register('password', { required: true })}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-all"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
                    <div className="px-2 mt-1">
                      <div className="h-1 w-full rounded bg-base-300 overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${getPasswordStrength(password).color}`} style={{ width: getPasswordStrength(password).percent }} />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full h-12 rounded-xl border-none font-black uppercase text-[10px] tracking-[0.4em] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <span className="flex items-center gap-2">Initialize Profile <ShieldCheck size={16} /></span>}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-base-content/5 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">Already have an account?</p>
                <Link to="/login" className="inline-block mt-1 text-primary hover:text-secondary font-black uppercase tracking-[0.3em] text-[10px] transition-all">
                  Sign In
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;