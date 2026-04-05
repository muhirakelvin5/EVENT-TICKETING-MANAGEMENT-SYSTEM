import { useForm } from 'react-hook-form';
import { Navbar } from '../components/Navbar';
import { toast, Toaster } from 'sonner';
import { userApi } from '../features/APIS/UserApi';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/Auth/AuthSlice';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, PartyPopper } from 'lucide-react';

interface LoginDetails {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDetails>();
  const [LoginUser, { isLoading }] = userApi.useLoginUserMutation();
  const navigate = useNavigate();
  const Dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginDetails) => {
    const loadingToastId = toast.loading("Logging in...");
    try {
      const res = await LoginUser(data).unwrap();
      toast.success('✅ Welcome back!', { id: loadingToastId });
      Dispatch(setCredentials(res));
      navigate(res.role === 'admin' ? '/AdminDashboard/analytics' : '/');
    } catch (error: any) {
      const ErrorMessage = error?.data?.error?.error || error?.data?.error || error?.error || '❌ Login failed.';

      if (ErrorMessage.toLowerCase().includes('verify your email')) {
        toast.error('❌ Please verify your email', { id: loadingToastId });
        navigate('/email-verification', { state: { email: data.email } });
        return;
      }

      toast.error(ErrorMessage, { id: loadingToastId });
    }
  };

  return (
    <div className="h-screen w-screen bg-base-100 font-sans selection:bg-primary selection:text-primary-content overflow-hidden flex flex-col">
      <Toaster richColors position="top-right" />
      <Navbar />
      
      {/* Main Grid - pt-16 for fixed navbar, overflow-hidden to prevent Y-scroll */}
      <div className="pt-16 flex-grow grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        
        {/* --- Left Side: Hero (Desktop Only) --- */}
        <div className="hidden lg:block relative group overflow-hidden bg-neutral h-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-accent/20 z-10" />
          <div className="absolute inset-0 bg-black/40 z-20" />
          
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
            alt="Event Experience"
            className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110"
          />
          
          <div className="absolute inset-0 z-30 flex flex-col justify-end p-16 space-y-4">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl w-fit">
              <Sparkles size={16} className="text-primary animate-pulse" />
              Pulse of the Campus
            </div>
            <h1 className="text-7xl font-black italic text-white tracking-tighter leading-[0.85] drop-shadow-2xl">
              JOIN THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">SCENE.</span>
            </h1>
            <p className="max-w-xs text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] border-l-2 border-primary pl-6">
              Access the ultimate campus event stream.
            </p>
          </div>
        </div>

        {/* --- Right Side: Login Portal (Fully Theme-Adaptive & Responsive) --- */}
        <div className="flex items-center justify-center p-4 sm:p-10 relative overflow-hidden bg-base-100">
          
          {/* Theme-based glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18rem] h-[18rem] sm:w-[35rem] sm:h-[35rem] bg-primary/20 blur-[80px] sm:blur-[150px] rounded-full -z-0 opacity-40" />
          
          <div className="w-full max-w-md z-10 animate-fadeIn">
            {/* Card uses adaptive theme colors (base-200) */}
            <div className="bg-base-200/70 backdrop-blur-3xl rounded-[2.5rem] p-6 sm:p-10 border border-base-content/10 shadow-2xl relative overflow-hidden group">
              
              {/* Header - Compact for Mobile */}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg">
                    <PartyPopper size={28} className="text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-base-content leading-none">
                  Welcome <span className="text-primary">Back</span>
                </h2>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Login to your account</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                
                {/* Email */}
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-60 ml-3 text-base-content">
                    <Mail size={12} className="text-primary" /> Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@university.com"
                    className={`input w-full h-14 bg-base-100/50 rounded-xl border-2 transition-all duration-300 focus:outline-none font-bold text-base-content text-sm ${errors.email ? 'border-error/50' : 'border-base-content/10 focus:border-primary'}`}
                    {...register('email', { required: 'Email is required' })}
                  />
                  {errors.email && (
                    <span className="text-[8px] font-bold text-error ml-3 italic uppercase tracking-widest leading-none">
                      {errors.email.message as string}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-60 ml-3 text-base-content">
                    <Lock size={12} className="text-primary" /> Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`input w-full h-14 bg-base-100/50 rounded-xl border-2 pr-12 transition-all duration-300 focus:outline-none font-bold text-base-content text-sm ${errors.password ? 'border-error/50' : 'border-base-content/10 focus:border-primary'}`}
                      {...register('password', { required: 'Password is required' })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 text-base-content transition-all"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-[8px] font-bold text-error ml-3 italic uppercase tracking-widest leading-none">
                      {errors.password.message as string}
                    </span>
                  )}
                </div>

                <div className="flex justify-end pr-1">
                  <Link 
                    to="/forgot-password" 
                    className="text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full h-14 rounded-xl border-none font-black uppercase text-[10px] tracking-[0.4em] shadow-xl shadow-primary/30 hover:shadow-primary/50 active:scale-[0.97] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Login Now <ShieldCheck size={16} />
                    </span>
                  )}
                </button>
              </form>

              {/* Registration Section */}
              <div className="mt-6 pt-5 border-t border-base-content/5 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 text-base-content">
                  Don't have an account?
                </p>
                <Link 
                  to="/register" 
                  className="inline-block mt-1 text-primary hover:text-secondary font-black uppercase tracking-[0.3em] text-[10px] transition-all"
                >
                  Create Account
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;