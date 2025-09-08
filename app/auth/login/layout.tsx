import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン - PRISM VIP',
  description: 'PRISM VIP会員ログイン',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Critical CSS - インライン化して初期表示を高速化 */
          :root {
            --primary: #4a6fa5;
            --primary-dark: #2c3e50;
            --primary-light: #e6f0ff;
            --primary-lighter: #f0f7ff;
            --success: #48bb78;
            --gray-100: #f7fafc;
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          
          .auth-body {
            background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 80px 20px 40px 20px;
          }
          
          .auth-container {
            background: white;
            width: 100%;
            max-width: 700px;
            box-shadow: var(--shadow-lg);
          }
          
          .loading {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            z-index: 9999;
            align-items: center;
            justify-content: center;
          }
          
          .loading.active {
            display: flex;
          }
        `
      }} />
      <link rel="stylesheet" href="/assets/css/common.css" />
      <link rel="stylesheet" href="/assets/css/auth.css" />
      {children}
    </>
  );
}