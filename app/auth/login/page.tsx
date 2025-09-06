'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // デモ用：実際の認証の代わりに遅延処理
    setTimeout(() => {
      if (email && password) {
        // セッションに保存
        sessionStorage.setItem('prism_user', JSON.stringify({
          email: email,
          name: email === 'prism.demo@investment.com' ? 'デモユーザー' : 'ユーザー',
          loginTime: new Date().toISOString()
        }));
        // メンバーページへリダイレクト
        router.push('/member');
      }
      setLoading(false);
    }, 1000);
  };

  const loginDemo = () => {
    setEmail('prism.demo@investment.com');
    setPassword('PrismVIP2025!');
    setLoading(true);

    setTimeout(() => {
      sessionStorage.setItem('prism_user', JSON.stringify({
        email: 'prism.demo@investment.com',
        name: 'デモユーザー',
        loginTime: new Date().toISOString()
      }));
      router.push('/member');
    }, 1000);
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/css/common.css" />
      <link rel="stylesheet" href="/assets/css/auth.css" />
      <style jsx>{`
        .btn-demo {
          width: 100%;
          background: var(--success);
          color: white;
          padding: 12px;
          border: none;
          margin-top: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-demo:hover {
          background: #2f855a;
        }
      `}</style>

      <div className="auth-body">
        {/* ローディング */}
        <div className={`loading ${loading ? 'active' : ''}`} id="loading">
          <div className="spinner"></div>
        </div>

        <div className="auth-container auth-container-narrow">
          {/* ヘッダー */}
          <div className="auth-header">
            <div className="logo-large">
              <img src="/assets/images/logo/prism-logo-optimized.svg" alt="PRISM" />
            </div>
            <div className="auth-subtitle">VIP MEMBER LOGIN</div>
          </div>

          {/* ログインフォーム */}
          <form className="auth-form" id="loginForm" onSubmit={handleLogin}>
            <h2 className="form-title">会員ログイン</h2>
            
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" name="remember" />
                <span>ログイン状態を保持</span>
              </label>
              <a href="#" className="forgot-password">パスワードを忘れた方</a>
            </div>
            
            <button type="submit" className="btn btn-black btn-full">ログイン</button>
            
            {/* デモ用ログイン情報 */}
            <div className="demo-login">
              <div className="demo-title">🔐 デモアカウント（テスト用）</div>
              <div className="demo-credentials">
                メール: <code>prism.demo@investment.com</code><br/>
                パスワード: <code>PrismVIP2025!</code>
              </div>
              <button type="button" className="btn-demo" onClick={loginDemo}>
                デモアカウントでログイン
              </button>
            </div>
          </form>

          {/* フッター */}
          <div className="auth-footer">
            <div className="signup-prompt">まだ会員登録がお済みでない方</div>
            <Link href="/auth/register" className="btn-signup">新規会員登録</Link>
            <Link href="/" className="back-to-top">← トップページに戻る</Link>
          </div>
        </div>
      </div>
    </>
  );
}