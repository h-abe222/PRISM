'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Property001Page() {
  const router = useRouter();

  useEffect(() => {
    // iframeのロード後に内部のリンクを処理
    const setupIframeNavigation = () => {
      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      if (!iframe) return;

      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        // iframe内のクリックイベントを処理
        const handleIframeClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const anchor = target.closest('a');
          
          if (!anchor) return;
          
          const href = anchor.getAttribute('href');
          if (!href) return;
          
          // 外部リンクは通常通り
          if (href.startsWith('http://') || href.startsWith('https://')) {
            return;
          }
          
          e.preventDefault();
          
          // 汎用的なルーティング変換
          let nextRoute = href;
          
          // 相対パスの処理
          if (href.startsWith('../')) {
            // 親ディレクトリへの相対パスを処理
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/').filter(p => p);
            pathParts.pop(); // 現在のページを削除
            
            let relativePath = href;
            while (relativePath.startsWith('../')) {
              relativePath = relativePath.substring(3);
              if (pathParts.length > 0) pathParts.pop();
            }
            
            nextRoute = '/' + pathParts.join('/') + (relativePath ? '/' + relativePath : '');
          }
          
          // .htmlファイルの拡張子を削除
          nextRoute = nextRoute.replace(/\.html$/, '');
          
          // index.htmlの場合はディレクトリパスに変換
          nextRoute = nextRoute.replace(/\/index$/, '');
          
          // 空文字またはルートの場合
          if (!nextRoute || nextRoute === '/') {
            nextRoute = '/';
          }
          
          router.push(nextRoute);
        };

        iframeDoc.addEventListener('click', handleIframeClick);

        // iframe内のグローバル関数を定義
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (iframeWindow as any).toggleAdminMode = () => {
            const adminBtn = document.querySelector('.admin-btn-wrapper');
            if (adminBtn) {
              adminBtn.classList.toggle('active');
            }
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (iframeWindow as any).logout = () => {
            sessionStorage.removeItem('prism_user');
            router.push('/');
          };
        }

        return () => {
          iframeDoc.removeEventListener('click', handleIframeClick);
        };
      } catch (error) {
        console.error('Failed to setup iframe navigation:', error);
      }
    };

    // iframeのロードを待つ
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.addEventListener('load', setupIframeNavigation);
      
      // 既にロード済みの場合
      if (iframe.contentDocument?.readyState === 'complete') {
        setupIframeNavigation();
      }
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', setupIframeNavigation);
      }
    };
  }, [router]);

  return (
    <>
      <iframe 
        src="/001.html"
        style={{ 
          width: '100%', 
          height: '100vh', 
          border: 'none',
          display: 'block'
        }}
        title="南青山プリズムビル - PRISM"
      />
      
      {/* 管理者コントロールを外側に配置 */}
      <style jsx>{`
        .admin-controls-wrapper {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 10000;
        }
        
        .admin-btn-wrapper {
          background: #1a365d;
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s;
        }
        
        .admin-btn-wrapper:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        .admin-btn-wrapper.active {
          background: #38a169;
        }
        
        .admin-icon-svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }
      `}</style>
      
      <div className="admin-controls-wrapper">
        <button 
          className="admin-btn-wrapper"
          onClick={() => {
            const btn = document.querySelector('.admin-btn-wrapper');
            btn?.classList.toggle('active');
          }}
        >
          <svg className="admin-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
          <span>管理者</span>
        </button>
      </div>
    </>
  );
}