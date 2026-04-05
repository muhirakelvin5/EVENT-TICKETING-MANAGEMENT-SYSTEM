import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { Navbar } from "../components/Navbar";
import { userApi } from "../features/APIS/UserApi";
import { Lock, Eye, EyeOff, ShieldCheck, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

// Simple helper to check password strength
const checkStrength = (pass: string) => {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-error', width: '33%' };
  if (score === 3) return { label: 'Good', color: 'bg-warning', width: '66%' };
  return { label: 'Strong', color: 'bg-success', width: '100%' };
};

export const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [updatePassword, { isLoading }] = userApi.useUpdateUserMutation();

  useEffect(() => {
    if (!token) {
      toast.error("Link is missing.");
      navigate("/login");
    }
  }, [token, navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    const toastId = toast.loading("Saving new password...");
    
    try {
      await updatePassword({ token, password }).unwrap();
      toast.success("Done! You can now log in.", { id: toastId });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      toast.error("Failed to save. Try again.", { id: toastId });
    }
  };

  return (
    <div className="h-screen w-screen bg-base-100 font-sans overflow-hidden flex flex-col">
      <Toaster richColors position="top-right" />
      <Navbar />

      <div className="pt-16 flex-grow flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Soft Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] bg-primary/10 blur-[120px] rounded-full -z-0" />

        <div className="w-full max-w-md z-10 animate-fadeIn">
          {/* Glass Card */}
          <div className="bg-base-200/80 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 border border-base-content/10 shadow-2xl relative">
            
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                  {isLoading ? (
                    <Loader2 size={32} className="text-primary animate-spin" />
                  ) : (
                    <Lock size={32} className="text-primary" />
                  )}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-base-content">
                New <span className="text-primary">Password</span>
              </h2>
              <p className="mt-1 text-xs opacity-50">Choose a safe password below</p>
            </div>

            <form onSubmit={handleReset} className="space-y-5">
              
              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-2">
                  Enter Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input w-full h-14 bg-base-100 rounded-xl border-2 border-base-content/5 focus:border-primary transition-all font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength Meter */}
                {password && (
                  <div className="px-1 mt-2">
                    <div className="h-1 w-full bg-base-300 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${checkStrength(password).color}`} 
                        style={{ width: checkStrength(password).width }}
                      />
                    </div>
                    <p className="text-[9px] mt-1 font-bold opacity-40 uppercase">
                      Strength: {checkStrength(password).label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-2">
                  Repeat Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input w-full h-14 bg-base-100 rounded-xl border-2 border-base-content/5 focus:border-primary transition-all font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full h-14 rounded-xl border-none font-bold uppercase text-xs tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <span className="flex items-center gap-2">
                    Save Changes <CheckCircle2 size={18} />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-base-content/5 text-center">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-300/30">
                 <Sparkles size={12} className="text-primary" />
                 <span className="text-[10px] font-bold uppercase opacity-50">Secure Update Mode</span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;