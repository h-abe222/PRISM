'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

interface HtmlContentProps {
  htmlPath: string;
}

export default function HtmlContent({ htmlPath }: HtmlContentProps) {
  const [htmlContent, setHtmlContent] = useState('');
  const [cssLinks, setCssLinks] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    // HTMLファイルを取得
    fetch(htmlPath)
      .then(res => res.text())
      .then(html => {
        // linkタグからCSSファイルを抽出
        const linkMatches = html.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/gi);
        const cssFiles: string[] = [];
        if (linkMatches) {
          linkMatches.forEach(link => {
            const hrefMatch = link.match(/href="([^"]*)"/);
            if (hrefMatch) {
              cssFiles.push(hrefMatch[1]);
            }
          });
        }
        setCssLinks(cssFiles);
        
        // bodyタグの内容のみ抽出
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : html;
        
        // bodyタグのclass属性も取得
        const bodyClassMatch = html.match(/<body[^>]*class="([^"]*)"/i);
        const bodyClass = bodyClassMatch ? bodyClassMatch[1] : '';
        
        // styleタグも抽出して含める
        const styleMatches = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
        const styles = styleMatches ? styleMatches.join('\n') : '';
        
        // scriptタグも抽出して含める
        const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi);
        const scripts = scriptMatches ? scriptMatches.join('\n') : '';
        
        // bodyにclassを追加する場合は、divラッパーで適用
        const wrappedContent = bodyClass 
          ? `<div class="${bodyClass}">${bodyContent}</div>` 
          : bodyContent;
        
        setHtmlContent(styles + wrappedContent + scripts);
      })
      .catch(err => console.error('Failed to load HTML:', err));
  }, [htmlPath]);

  useEffect(() => {
    // リンクのクリックイベントを処理
    const handleClick = (e: MouseEvent) => {
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
      if (!href.startsWith('/') && !href.startsWith('http')) {
        // 現在のパスを基準に相対パスを解決
        const currentPath = window.location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        
        if (href.startsWith('../')) {
          // 親ディレクトリへの相対パス
          const pathParts = basePath.split('/').filter(p => p);
          let relativePath = href;
          
          while (relativePath.startsWith('../')) {
            relativePath = relativePath.substring(3);
            if (pathParts.length > 0) pathParts.pop();
          }
          
          nextRoute = '/' + pathParts.join('/') + (relativePath ? '/' + relativePath : '');
        } else {
          // 同じディレクトリの相対パス
          nextRoute = basePath + '/' + href;
        }
      }
      
      // .htmlファイルの拡張子を削除
      nextRoute = nextRoute.replace(/\.html$/, '');
      
      // index.htmlの場合はディレクトリパスに変換
      nextRoute = nextRoute.replace(/\/index$/, '');
      
      // 二重スラッシュを修正
      nextRoute = nextRoute.replace(/\/+/g, '/');
      router.push(nextRoute);
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [router]);

  return (
    <>
      {/* CSS ファイルを読み込む */}
      {cssLinks.map((cssLink, index) => (
        <link key={index} rel="stylesheet" href={cssLink} />
      ))}
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </>
  );
}