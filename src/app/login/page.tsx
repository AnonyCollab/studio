
'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase/provider';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { generateAnonymousName } from '../data/pseudonym/pseudonymUtils';
import { useRouter } from 'next/navigation';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const FormInput = ({ icon, type, placeholder, value, onChange, showPasswordToggle = false, isDark, disabled, onPasswordToggle, showPassword }: any) => {
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
          disabled={disabled}
        />
        {showPasswordToggle && (
          <button type="button" onClick={onPasswordToggle} className="absolute right-3 top-1/2 -translate-y-1/2">
             {showPassword ? <EyeOff className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-500")} /> : <Eye className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-500")} />}
          </button>
        )}
      </div>
    );
};


export default function LoginPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

      // Create user document in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        profile: {
          uid: user.uid,
          displayName: anonymousName,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          email: user.email
        },
        friends: []
      });
      
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
  
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // If the user is new, generate an anonymous name and create a Firestore doc
      if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        const anonymousName = generateAnonymousName(user.uid);
        await updateProfile(user, { displayName: anonymousName, photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}` });

        // Create user document in Firestore for new Google user
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
          profile: {
            uid: user.uid,
            displayName: anonymousName,
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            email: user.email
          },
          friends: []
        });

        toast({ title: 'Account Created', description: `Welcome, ${anonymousName}!` });
      } else {
        toast({ title: 'Signed In', description: `Welcome back, ${user.displayName}!` });
      }
      router.push('/posts');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Sign In Failed', description: error.message });
    }
    setIsGoogleLoading(false);
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
              <FormInput icon={Mail} type="email" placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} isDark={isDark} disabled={isLoading || isGoogleLoading}/>
              <FormInput icon={Lock} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e: any) => setPassword(e.target.value)} showPasswordToggle onPasswordToggle={() => setShowPassword(!showPassword)} showPassword={showPassword} isDark={isDark} disabled={isLoading || isGoogleLoading}/>
              <Button 
                onClick={handleSignIn}
                className={cn("w-full h-12 text-base", isDark ? "bg-cyan-400 hover:bg-cyan-500 text-black" : "bg-cyan-600 hover:bg-cyan-700 text-white")}
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <div className="space-y-4">
              <FormInput icon={Mail} type="email" placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} isDark={isDark} disabled={isLoading || isGoogleLoading}/>
              <FormInput icon={Lock} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e: any) => setPassword(e.target.value)} showPasswordToggle onPasswordToggle={() => setShowPassword(!showPassword)} showPassword={showPassword} isDark={isDark} disabled={isLoading || isGoogleLoading}/>
              <FormInput icon={Lock} type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} isDark={isDark} disabled={isLoading || isGoogleLoading}/>
              <Button 
                onClick={handleSignUp}
                className={cn("w-full h-12 text-base", isDark ? "bg-cyan-400 hover:bg-cyan-500 text-black" : "bg-cyan-600 hover:bg-cyan-700 text-white")}
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className={cn("w-full border-t", isDark ? "border-white/20" : "border-gray-300")} />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className={cn("px-2", isDark ? "bg-[#1a1f2e]" : "bg-gray-100 text-gray-500")}>Or continue with</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          className={cn(
            "w-full h-12 text-base gap-2",
            isDark 
              ? "bg-black/20 hover:bg-black/40 text-white border border-white/20"
              : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
          )}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            'Signing in with Google...'
          ) : (
            <>
              <GoogleIcon />
              Sign in with Google
            </>
          )}
        </Button>

        <p className={cn("text-center text-xs mt-8", isDark ? "text-gray-500" : "text-gray-500")}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

    