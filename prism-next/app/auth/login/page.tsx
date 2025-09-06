'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // デモアカウント認証
    if (email === 'prism.demo@investment.com' && password === 'PrismVIP2025!') {
      // ユーザー情報をセッションストレージに保存
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('prism_user', JSON.stringify({
          email: email,
          name: 'デモユーザー',
          loginTime: new Date().toISOString()
        }));
      }
      router.push('/member');
    } else {
      setError('メールアドレスまたはパスワードが正しくありません');
    }
  };

  const handleDemoLogin = () => {
    setEmail('prism.demo@investment.com');
    setPassword('PrismVIP2025!');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('prism_user', JSON.stringify({
          email: 'prism.demo@investment.com',
          name: 'デモユーザー',
          loginTime: new Date().toISOString()
        }));
      }
      router.push('/member');
    }, 100);
  };

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Yu Gothic', sans-serif;
          background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-container {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .login-header {
          background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
          padding: 40px;
          text-align: center;
          color: white;
        }

        .logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
        }

        .logo-image {
          height: 60px;
          width: auto;
          filter: brightness(0) invert(1);
        }

        .login-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95em;
          letter-spacing: 0.05em;
        }

        .login-form-container {
          padding: 40px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #2d3748;
          font-weight: 600;
          font-size: 0.95em;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1em;
          transition: all 0.3s;
          background: #f7fafc;
        }

        .form-input:focus {
          outline: none;
          border-color: #3182ce;
          background: white;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
        }

        .password-container {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #718096;
          cursor: pointer;
          font-size: 1.2em;
          padding: 5px;
        }

        .toggle-password:hover {
          color: #2d3748;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-login {
          width: 100%;
          background: linear-gradient(135deg, #3182ce 0%, #2563eb 100%);
          color: white;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-size: 1.1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .btn-login:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          transform: translateY(-1px);
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 30px 0;
          color: #a0aec0;
          font-size: 0.9em;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .divider span {
          padding: 0 15px;
        }

        .btn-demo {
          width: 100%;
          background: white;
          color: #2d3748;
          padding: 14px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-demo:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
          transform: translateY(-1px);
        }

        .login-footer {
          text-align: center;
          padding: 30px;
          background: #f7fafc;
          border-top: 1px solid #e2e8f0;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 15px;
        }

        .footer-link {
          color: #4a5568;
          text-decoration: none;
          font-size: 0.9em;
          transition: color 0.3s;
        }

        .footer-link:hover {
          color: #2d3748;
          text-decoration: underline;
        }

        .copyright {
          color: #a0aec0;
          font-size: 0.85em;
          margin-top: 15px;
        }
      `}</style>

      <div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            <img 
              src="/assets/images/logo/prism-logo-optimized.svg" 
              alt="PRISM" 
              className="logo-image"
            />
          </div>
          <div className="login-subtitle">VIP MEMBER LOGIN</div>
        </div>

        <div className="login-form-container">
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">メールアドレス</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">パスワード</label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login">
              ログイン
            </button>
          </form>

          <div className="divider">
            <span>または</span>
          </div>

          <button className="btn-demo" onClick={handleDemoLogin}>
            <span>🔐</span>
            <span>デモアカウントでログイン</span>
          </button>
        </div>

        <div className="login-footer">
          <div className="footer-links">
            <a href="/support/password-reset" className="footer-link">パスワードを忘れた方</a>
            <a href="/support/contact" className="footer-link">お問い合わせ</a>
          </div>
          <div className="copyright">
            © 2024 PRISM Investment. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}