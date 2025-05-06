// app/login/LoginForm.jsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/utils/login';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className={`group relative flex w-full justify-center rounded-md bg-indigo-600 py-3 px-4 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {pending ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </span>
      ) : (
        <span>Sign in</span>
      )}
    </button>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);
  const sessionError = searchParams.get('error') === 'SessionRequired';
  
  
  // Create a wrapper function for the form action
  const handleFormAction = async (formData) => {
    // Clear the URL by removing query parameters
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    // Call the original authenticate action
    return dispatch(formData);
  };

  return (
    <div className="h-min mb-40">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      {(errorMessage || sessionError) && (
        <div className={`rounded-md ${sessionError ? 'bg-yellow-50' : 'bg-red-50'} p-4 mt-4`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon 
                className={`h-5 w-5 ${sessionError ? 'text-yellow-400' : 'text-red-400'}`} 
                aria-hidden="true" 
              />
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${sessionError ? 'text-yellow-800' : 'text-red-800'}`}>
                {sessionError ? 'Please sign in to access this page' : errorMessage}
              </h3>
            </div>
          </div>
        </div>
      )}

      <form action={handleFormAction} className="mt-8 space-y-6">
        <div className="space-y-2 rounded-md shadow-sm">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full rounded-t-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="relative block w-full rounded-b-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Password"
            />
          </div>
        </div>

        <LoginButton />
      </form>
    </div>
  );
}