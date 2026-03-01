'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email hoặc mật khẩu không đúng');
      setLoading(false);
      return;
    }

    router.replace('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-burgundy-dark to-burgundy p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center text-burgundy font-bold text-xl font-serif mx-auto mb-3">
            YS
          </div>
          <h1 className="text-xl font-bold font-serif text-burgundy">Admin Login</h1>
          <p className="text-sm text-muted-foreground">Yến Sào Cao Cấp</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yensaocaocap.vn"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Mật khẩu</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-burgundy hover:bg-burgundy-light py-5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </div>
  );
}
