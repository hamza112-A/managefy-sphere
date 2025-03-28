
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUp() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-16 px-4">
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
        <div className="md:w-1/2 max-w-md">
          <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
          <p className="text-muted-foreground mb-6">
            Sign up to start managing your inventory and processing sales with Investify.
          </p>
          <SignUpForm />
        </div>
        <div className="hidden md:block md:w-1/2">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Get Started in Minutes</h2>
            <p className="mb-4">Join thousands of businesses that use Investify to streamline their operations.</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Free account setup
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Intuitive user interface
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Secure data storage
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                24/7 customer support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
