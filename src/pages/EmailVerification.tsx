import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { Navbar } from '../components/Navbar';
import { userApi } from '../features/APIS/UserApi';
import { Mail, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the email passed from the registration page
  const userEmail = location.state?.email || '';
  const [code, setCode] = useState('');

  const [verifyEmail, { isLoading }] = userApi.useVerifyEmailMutation();

  // Automatically submit when the user enters 6 digits
  useEffect(() => {
    if (code.length === 6 && !isLoading) {
      handleVerify();
    }
  }, [code]);

  // If no email is found, send user back to register
  useEffect(() => {
    if (!userEmail) {
      toast.error("Please sign up first.");
      navigate("/register");
    }
  }, [userEmail, navigate]);

  const handleVerify = async () => {
    const toastId = toast.loading("Checking code...");
    try {
      const response = await verifyEmail({ email: userEmail, confirmationCode: code }).unwrap();
      toast.success(response.message || "Email verified!", { id: toastId });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const errorMessage = err?.data?.error || 'Invalid code. Please try again.';
      toast.error(errorMessage, { id: toastId });
      setCode(''); // Clear code so user can retry
    }
  };

  return (
    <div className="h-screen w-screen bg-base-100 font-sans overflow-hidden flex flex-col">
      <Toaster richColors position="top-right" />
      <Navbar />

      <div className="pt-16 flex-grow flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18rem] h-[18rem] sm:w-[30rem] sm:h-[30rem] bg-primary/20 blur-[100px] rounded-full -z-0 opacity-40" />

        <div className="w-full max-w-md z-10 animate-fadeIn">
          {/* Main Card */}
          <div className="bg-base-200/80 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 border border-base-content/10 shadow-2xl relative overflow-hidden">
            
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  {isLoading ? (
                    <Loader2 size={32} className="text-primary animate-spin" />
                  ) : (
                    <ShieldCheck size={32} className="text-primary" />
                  )}
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-base-content">
                Verify Your <span className="text-primary">Email</span>
              </h2>
              <p className="mt-2 text-xs font-medium opacity-50">
                {isLoading ? 'Verifying...' : 'Enter the 6-digit code we sent you'}
              </p>
            </div>

            <div className="space-y-6">
              {/* Email Display */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-60 ml-2">
                  <Mail size={12} className="text-primary" /> Sent To
                </label>
                <div className="w-full h-12 bg-base-100/50 rounded-xl border border-base-content/5 flex items-center px-4 font-semibold text-sm text-base-content/70">
                  {userEmail}
                </div>
              </div>

              {/* Code Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-60 ml-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  disabled={isLoading}
                  autoFocus
                  className="input w-full h-16 bg-base-100 rounded-2xl border-2 border-base-content/10 focus:border-primary transition-all text-center text-3xl tracking-[0.3em] font-bold text-base-content"
                />
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-3">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${i < code.length ? 'bg-primary scale-125' : 'bg-base-content/10'}`}
                  />
                ))}
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-8 pt-6 border-t border-base-content/5 text-center">
              <button 
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 mx-auto text-primary hover:opacity-80 font-bold text-sm transition-all"
              >
                <ArrowLeft size={16} /> 
                Go back to Sign Up
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;