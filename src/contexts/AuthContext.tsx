
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from '@/components/ui/sonner';

type UserRole = 'general' | 'user' | 'manager';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUserRole: () => UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<UserData, 'uid'>;
            setUserData({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: userData.role
            });
          } else {
            // If no user document exists, create one with default role
            const newUserData = {
              email: user.email,
              displayName: user.displayName,
              role: 'user' as UserRole
            };
            await setDoc(doc(db, 'users', user.uid), newUserData);
            setUserData({
              uid: user.uid,
              ...newUserData
            });
          }
        } catch (error) {
          console.error('Error fetching user data', error);
          toast.error('Error loading user data');
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName: name });
      
      // Create user document with default role
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        displayName: name,
        role: 'user' as UserRole
      });
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Error signing up:', error);
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      }
      toast.error(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
    } catch (error: any) {
      console.error('Error signing in:', error);
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      }
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  const getUserRole = (): UserRole => {
    return userData?.role || 'general';
  };

  const value = {
    currentUser,
    userData,
    loading,
    signUp,
    signIn,
    signOut,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
