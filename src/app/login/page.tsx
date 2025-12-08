'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { siteConfig } from '@/configs/site';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const { signIn } = useAuthStore();
  const router = useRouter();

  // Show disclaimer modal on component mount
  useEffect(() => {
    setShowDisclaimer(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Educational Disclaimer Modal */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icons.construction className="h-6 w-6 text-orange-600" />
              <DialogTitle className="text-lg font-bold text-orange-800 dark:text-orange-200">
                Experimental Development Site
              </DialogTitle>
              <Icons.construction className="h-6 w-6 text-orange-600" />
            </div>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="space-y-4 text-sm text-orange-700 dark:text-orange-300">
              <p>
                This platform is being developed collaboratively for educational, testing, and research purposes.
              </p>
              <p>
                It does not host or distribute copyrighted content.
              </p>
              <p className="font-semibold">
                Access is restricted to approved contributors. Unauthorized use is prohibited.
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs text-orange-600 dark:text-orange-400 pt-2">
                <Icons.shield className="h-4 w-4" />
                <span>Built with passion by HXP</span>
              </div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Login Form */}
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <Icons.logo className="h-8 w-8" />
                <span className="text-2xl font-bold">{siteConfig.name}</span>
              </div>
              <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the streaming platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Contact your administrator for access credentials</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 