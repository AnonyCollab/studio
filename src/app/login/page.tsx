
'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { generateAnonymousName } from '../data/pseudonym/pseudonymUtils';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: "Passwords do not match." });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const anonymousName = generateAnonymousName(user.uid);
      await updateProfile(user, { displayName: anonymousName, photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}` });
      
      toast({ title: 'Account Created', description: `Welcome, ${anonymousName}!` });
      router.push('/posts');

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign Up Failed', description: error.message });
    }
    setIsLoading(false);
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Signed In', description: "Welcome back!" });
      router.push('/posts');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign In Failed', description: error.message });
    }
    setIsLoading(false);
  };
  
  const FormInput = ({ icon, type, placeholder, value, onChange, showPasswordToggle = false }: any) => {
    const Icon = icon;
    return (
      <div className="relative">
        <Icon className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5", isDark ? "text-gray-400" : "text-gray-500")} />
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            "pl-11 h-12 text-base",
            isDark
              ? "bg-black/20 border-white/20 text-white placeholder:text-gray-500 focus:bg-black/30 focus:border-cyan-400/50"
              : "bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:bg-white/70 focus:border-cyan-500/50"
          )}
          disabled={isLoading}
        />
        {showPasswordToggle && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
             {showPassword ? <EyeOff className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-500")} /> : <Eye className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-500")} />}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "min-h-screen w-full flex items-center justify-center p-4",
      isDark ? 'bg-gradient-to-br from-[#0a0e1a] to-[#1a1f2e]' : 'bg-gray-100'
    )}>
       {/* Background Orbs */}
      {isDark && (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000" />
        </>
      )}

      <div className={cn(
        "w-full max-w-md p-8 rounded-2xl border transition-all",
        isDark 
          ? "bg-white/5 border-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl"
          : "bg-white/80 border-gray-200 shadow-xl backdrop-blur-lg"
      )}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Shield className={cn("w-8 h-8", isDark ? "text-cyan-400" : "text-cyan-600")} />
            <h1 className={cn("text-3xl", isDark ? "text-white" : "text-gray-900")}>AnonyCollab</h1>
          </div>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>Securely collaborate, anonymously.</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className={cn(
            "grid w-full grid-cols-2 p-1 h-auto",
            isDark ? "bg-black/20 border-white/10" : "bg-gray-200"
          )}>
            <TabsTrigger value="signin" className={cn("text-base py-2", isDark ? "data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400" : "data-[state=active]:bg-white text-gray-600 data-[state=active]:text-gray-900")}>Sign In</TabsTrigger>
            <TabsTrigger value="signup" className={cn("text-base py-2", isDark ? "data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400" : "data-[state=active]:bg-white text-gray-600 data-[state=active]:text-gray-900")}>Create Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-6">
            <div className="space-y-4">
              <FormInput icon={Mail} type="email" placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
              <FormInput icon={Lock} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e: any) => setPassword(e.target.value)} showPasswordToggle />
              <Button 
                onClick={handleSignIn}
                className={cn("w-full h-12 text-base", isDark ? "bg-cyan-400 hover:bg-cyan-500 text-black" : "bg-cyan-600 hover:bg-cyan-700 text-white")}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <div className="space-y-4">
              <FormInput icon={Mail} type="email" placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
              <FormInput icon={Lock} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e: any) => setPassword(e.target.value)} showPasswordToggle />
              <FormInput icon={Lock} type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} />
              <Button 
                onClick={handleSignUp}
                className={cn("w-full h-12 text-base", isDark ? "bg-cyan-400 hover:bg-cyan-500 text-black" : "bg-cyan-600 hover:bg-cyan-700 text-white")}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <p className={cn("text-center text-xs mt-6", isDark ? "text-gray-500" : "text-gray-500")}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
