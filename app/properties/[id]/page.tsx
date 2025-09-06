'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Property, getPropertyById } from '@/lib/propertyData';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | undefined>();
  const [memberName, setMemberName] = useState('VIP会員様');
  const [currentStage, setCurrentStage] = useState(1);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    // セッションから会員情報を取得
    const user = sessionStorage.getItem('prism_user');
    if (user) {
      const userData = JSON.parse(user);
      setMemberName(userData.name || 'VIP会員様');
    }

    // 物件情報を取得
    const propertyId = params.id as string;
    const propertyData = getPropertyById(propertyId);
    if (propertyData) {
      setProperty(propertyData);
    } else {
      // 物件が見つからない場合は一覧に戻る
      router.push('/member');
    }
  }, [params.id, router]);


  const logout = () => {
    sessionStorage.removeItem('prism_user');
    router.push('/');
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
  };

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <link rel="stylesheet" href="/assets/css/common.css" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <style jsx>{`
        .member-header {
          background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
          color: white;
          padding: 20px 0;
          box-shadow: var(--shadow-sm);
        }

        .member-header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .member-name {
          font-weight: 600;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          height: 30px;
        }

        .logo img {
          height: 100%;
          width: auto;
          filter: brightness(0) invert(1);
        }

        .btn-logout {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          text-decoration: none;
          font-size: 0.9em;
          transition: all 0.3s;
          cursor: pointer;
        }

        .btn-logout:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .admin-controls {
          position: fixed;
          bottom: 30px;
          right: 30px;
          display: flex;
          gap: 10px;
          z-index: 1000;
        }

        .admin-btn {
          background: var(--primary-dark);
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

        .admin-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .admin-btn.active {
          background: var(--success);
        }

        .admin-icon {
          width: 18px;
          height: 18px;
          display: inline-block;
        }
        
        .admin-icon svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .breadcrumb {
          padding: 20px 0;
          font-size: 0.9em;
          color: var(--gray-500);
        }

        .breadcrumb a {
          color: var(--primary-light);
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .property-header {
          background: white;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: var(--shadow-sm);
        }

        .property-title {
          font-size: 2.2em;
          color: var(--primary-dark);
          margin-bottom: 10px;
        }

        .property-subtitle {
          color: var(--gray-500);
          font-size: 1.1em;
        }

        .property-main {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        .property-image-section {
          background: white;
          padding: 30px;
          box-shadow: var(--shadow-sm);
        }

        .property-main-image {
          width: 100%;
          height: 500px;
          object-fit: cover;
          margin-bottom: 20px;
        }

        .property-specs {
          background: white;
          padding: 30px;
          box-shadow: var(--shadow-sm);
        }

        .specs-title {
          font-size: 1.4em;
          color: var(--primary-dark);
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--primary-light);
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--gray-100);
        }

        .spec-label {
          color: var(--gray-500);
          font-weight: 500;
        }

        .spec-value {
          color: var(--gray-600);
          font-weight: 600;
        }

        .highlight-box {
          background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
          color: white;
          padding: 20px;
          margin-top: 20px;
          text-align: center;
        }

        .highlight-label {
          font-size: 0.9em;
          opacity: 0.9;
          margin-bottom: 5px;
        }

        .highlight-value {
          font-size: 2em;
          font-weight: 700;
        }

        .stage-indicator {
          background: white;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: var(--shadow-sm);
          border-top: 3px solid var(--primary-light);
        }

        .stage-progress {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .stage-item {
          flex: 1;
          text-align: center;
          position: relative;
          padding: 10px;
        }

        .stage-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--gray-100);
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.3em;
          color: var(--gray-300);
        }

        .stage-item.completed .stage-circle {
          background: var(--success);
          color: white;
        }

        .stage-item.current .stage-circle {
          background: var(--primary-light);
          color: white;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
        }

        .stage-label {
          font-size: 0.875rem;
          color: var(--gray-500);
          font-weight: 600;
        }

        .nav-tabs {
          display: flex;
          background: white;
          box-shadow: var(--shadow-sm);
          overflow-x: auto;
          margin-bottom: 30px;
        }

        .nav-tab {
          padding: 20px 30px;
          background: white;
          border: none;
          cursor: pointer;
          font-size: 1em;
          font-weight: 500;
          color: var(--gray-500);
          transition: all 0.3s;
          position: relative;
        }

        .nav-tab.active {
          color: var(--primary-dark);
          background: var(--gray-50);
        }

        .nav-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary-light);
        }

        .tab-content {
          background: white;
          padding: 40px;
          box-shadow: var(--shadow-sm);
          min-height: 400px;
        }

        .download-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .download-card {
          border: 1px solid var(--gray-200);
          padding: 20px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }

        .download-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--primary-light);
        }

        .download-icon {
          font-size: 2.5em;
          color: var(--primary-light);
          margin-bottom: 10px;
        }

        .download-title {
          font-weight: 600;
          color: var(--gray-600);
          margin-bottom: 5px;
        }

        .download-size {
          font-size: 0.9em;
          color: var(--gray-400);
        }

        /* 概要コメントセクション */
        .overview-comment-section {
          background: var(--gray-50);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .section-subtitle {
          font-size: 1.1em;
          color: var(--primary-dark);
          margin-bottom: 15px;
          font-weight: 600;
        }

        .overview-comment {
          line-height: 1.8;
          color: var(--gray-600);
        }

        /* 詳細情報グリッド */
        .detail-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .detail-info-item {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          background: var(--gray-50);
          border-radius: 8px;
        }

        .detail-label {
          color: var(--gray-500);
          font-weight: 500;
        }

        .detail-value {
          color: var(--gray-700);
          font-weight: 600;
        }

        /* ロケーション分析 */
        .location-map-section,
        .location-streetview-section,
        .photo-gallery-section {
          margin-bottom: 40px;
        }

        .map-container,
        .streetview-container {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        /* 写真ギャラリー */
        .gallery-main-image {
          width: 100%;
          height: 500px;
          margin-bottom: 20px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .gallery-main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-thumbnails {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
        }

        .thumbnail {
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
          opacity: 0.7;
          transition: all 0.3s;
          box-shadow: var(--shadow-sm);
        }

        .thumbnail:hover {
          opacity: 0.9;
        }

        .thumbnail.active {
          opacity: 1;
          box-shadow: 0 0 0 3px var(--primary-light);
        }

        .thumbnail img {
          width: 100%;
          height: 80px;
          object-fit: cover;
        }

        /* レントロール */
        .rent-roll-section {
          margin-bottom: 40px;
        }

        .rent-roll-table {
          width: 100%;
          border-collapse: collapse;
          box-shadow: var(--shadow-sm);
        }

        .rent-roll-table th {
          background: var(--primary-dark);
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 500;
        }

        .rent-roll-table td {
          padding: 12px;
          border-bottom: 1px solid var(--gray-100);
        }

        .rent-roll-table tbody tr:hover {
          background: var(--gray-50);
        }

        .rent-roll-table tfoot {
          background: var(--gray-100);
          font-weight: 600;
        }

        /* キャッシュフローチャート */
        .cashflow-chart-section {
          margin-bottom: 40px;
        }

        .chart-container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 20px;
        }

        .cashflow-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .summary-item {
          background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .summary-label {
          font-size: 0.9em;
          opacity: 0.9;
          display: block;
          margin-bottom: 8px;
        }

        .summary-value {
          font-size: 1.5em;
          font-weight: 700;
        }

        /* 投資指標 */
        .investment-metrics {
          background: var(--gray-50);
          padding: 30px;
          border-radius: 8px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .metric-item {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
        }

        .metric-label {
          display: block;
          color: var(--gray-500);
          font-size: 0.9em;
          margin-bottom: 8px;
        }

        .metric-value {
          display: block;
          color: var(--primary-dark);
          font-size: 1.8em;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .property-main {
            grid-template-columns: 1fr;
          }
          
          .nav-tabs {
            flex-wrap: wrap;
          }
          
          .nav-tab {
            flex: 1;
            min-width: 120px;
          }

          .gallery-main-image {
            height: 300px;
          }

          .detail-info-grid,
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 会員ヘッダー */}
      <header className="member-header">
        <div className="member-header-content">
          <div className="logo">
            <img src="/assets/images/logo/prism-logo-optimized.svg" alt="PRISM" />
          </div>
          <div className="member-info">
            <span className="member-name">{memberName}</span>
            <button className="btn-logout" onClick={logout}>ログアウト</button>
          </div>
        </div>
      </header>

      <div className="container">
        {/* パンくず */}
        <div className="breadcrumb">
          <Link href="/member">物件一覧</Link> &gt; {property.title}
        </div>

        {/* 物件ヘッダー */}
        <div className="property-header">
          <h1 className="property-title">{property.title}</h1>
          <p className="property-subtitle">{property.description}</p>
        </div>

        {/* メインコンテンツ */}
        <div className="property-main">
          <div className="property-image-section">
            <img 
              src={property.image} 
              alt={property.title}
              className="property-main-image"
            />
          </div>

          <div className="property-specs">
            <h2 className="specs-title">物件概要</h2>
            
            <div className="spec-item">
              <span className="spec-label">所在地</span>
              <span className="spec-value">{property.location}</span>
            </div>
            
            <div className="spec-item">
              <span className="spec-label">価格</span>
              <span className="spec-value">{property.price}</span>
            </div>
            
            <div className="spec-item">
              <span className="spec-label">想定利回り</span>
              <span className="spec-value">{property.yield}</span>
            </div>
            
            <div className="spec-item">
              <span className="spec-label">専有面積</span>
              <span className="spec-value">{property.area}</span>
            </div>
            
            <div className="spec-item">
              <span className="spec-label">築年</span>
              <span className="spec-value">{property.buildYear}</span>
            </div>
            
            {property.totalFloor && (
              <div className="spec-item">
                <span className="spec-label">階数</span>
                <span className="spec-value">{property.totalFloor}</span>
              </div>
            )}
            
            {property.structure && (
              <div className="spec-item">
                <span className="spec-label">構造</span>
                <span className="spec-value">{property.structure}</span>
              </div>
            )}
            
            {property.nearestStation && (
              <div className="spec-item">
                <span className="spec-label">最寄駅</span>
                <span className="spec-value">{property.nearestStation} {property.walkMinutes}</span>
              </div>
            )}

            <div className="highlight-box">
              <div className="highlight-label">想定年間収益</div>
              <div className="highlight-value">
                {property.expectedRent ? `${parseInt(property.expectedRent.replace(/[^\d]/g, '')) * 12 / 10000}万円` : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* 段階的提案システム */}
        <div className="stage-indicator">
          <div className="stage-progress">
            <div className={`stage-item ${currentStage >= 1 ? 'completed' : ''}`}>
              <div className="stage-circle">1</div>
              <div className="stage-label">基本情報</div>
            </div>
            <div className={`stage-item ${currentStage >= 2 ? 'current' : ''}`}>
              <div className="stage-circle">2</div>
              <div className="stage-label">詳細分析</div>
            </div>
            <div className={`stage-item ${currentStage >= 3 ? '' : ''}`}>
              <div className="stage-circle">3</div>
              <div className="stage-label">収益予測</div>
            </div>
            <div className={`stage-item ${currentStage >= 4 ? '' : ''}`}>
              <div className="stage-circle">4</div>
              <div className="stage-label">投資判断</div>
            </div>
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            物件概要
          </button>
          <button 
            className={`nav-tab ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            ロケーション分析
          </button>
          <button 
            className={`nav-tab ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            収益シミュレーション
          </button>
          <button 
            className={`nav-tab ${activeTab === 'download' ? 'active' : ''}`}
            onClick={() => setActiveTab('download')}
          >
            資料ダウンロード
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <>
              <h3>物件概要</h3>
              
              {/* 概要コメントセクション */}
              <div className="overview-comment-section">
                <h4 className="section-subtitle">投資ポイント</h4>
                <p className="overview-comment">
                  {property.overviewComment || '南青山プリズムビルは、東京メトロ表参道駅から徒歩5分という絶好のロケーションに位置する、2019年築の築浅プレミアムビルです。周辺には高級ブランドショップやカフェが立ち並び、安定した賃貸需要が見込めるエリアです。現在の表面利回り9.0%は、都心一等地の物件としては非常に魅力的な水準です。満室稼働中で安定した収益が確保されており、今後も継続的な収益が期待できる優良物件です。'}
                </p>
              </div>

              {/* 物件詳細情報 */}
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <span className="detail-label">土地面積</span>
                  <span className="detail-value">{property.landArea || '180㎡'}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-label">延床面積</span>
                  <span className="detail-value">{property.floorArea || '495㎡'}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-label">構造</span>
                  <span className="detail-value">{property.structure || '鉄骨造'}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-label">築年月</span>
                  <span className="detail-value">{property.buildYear || '2019年'}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-label">階数</span>
                  <span className="detail-value">{property.totalFloor || '地上5階'}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-label">最寄駅</span>
                  <span className="detail-value">{property.nearestStation} {property.walkMinutes}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-label">想定賃料</span>
                  <span className="detail-value">{property.expectedRent || '月額289万円'}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-label">稼働率</span>
                  <span className="detail-value">{property.occupancyRate || '100%'}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-label">管理費</span>
                  <span className="detail-value">{property.managementFee || '月額15万円'}</span>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'location' && (
            <>
              <h3>ロケーション分析</h3>
              
              {/* Google Map */}
              <div className="location-map-section">
                <h4 className="section-subtitle">周辺地図</h4>
                <div className="map-container">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1620.8603544436673!2d${property.lng || 139.7104}!3d${property.lat || 35.6641}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDM5JzUwLjgiTiAxMznCsDQyJzM3LjQiRQ!5e0!3m2!1sja!2sjp!4v1652345678901`}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Street View */}
              <div className="location-streetview-section">
                <h4 className="section-subtitle">ストリートビュー</h4>
                <div className="streetview-container">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!4v1652345678902!6m8!1m7!1sCAoSLEFGMVFpcE9QMDl5VXZGVm9BVnVfVFZEQ3Z3cVVJVjVfNGl3UXZ3MWNKTUJO!2m2!1d${property.lat || 35.6641}!2d${property.lng || 139.7104}!3f0!4f0!5f0.7820865974627469`}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* 写真ギャラリー */}
              <div className="photo-gallery-section">
                <h4 className="section-subtitle">物件写真</h4>
                <div className="gallery-main-image">
                  <img 
                    src={property.images?.[selectedImage] || property.image} 
                    alt={`${property.title} - ${selectedImage + 1}`}
                  />
                </div>
                <div className="gallery-thumbnails">
                  {(property.images || [property.image]).map((img, index) => (
                    <div 
                      key={index}
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={img} alt={`${property.title} - ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'revenue' && (
            <>
              <h3>収益シミュレーション</h3>
              
              {/* レントロール */}
              <div className="rent-roll-section">
                <h4 className="section-subtitle">レントロール</h4>
                <table className="rent-roll-table">
                  <thead>
                    <tr>
                      <th>階</th>
                      <th>用途</th>
                      <th>面積</th>
                      <th>賃料（月額）</th>
                      <th>敷金</th>
                      <th>契約期間</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1F</td>
                      <td>店舗</td>
                      <td>99㎡</td>
                      <td>65万円</td>
                      <td>6ヶ月</td>
                      <td>2023.4 - 2026.3</td>
                    </tr>
                    <tr>
                      <td>2F</td>
                      <td>事務所</td>
                      <td>99㎡</td>
                      <td>56万円</td>
                      <td>8ヶ月</td>
                      <td>2022.10 - 2025.9</td>
                    </tr>
                    <tr>
                      <td>3F</td>
                      <td>事務所</td>
                      <td>99㎡</td>
                      <td>56万円</td>
                      <td>8ヶ月</td>
                      <td>2023.1 - 2026.12</td>
                    </tr>
                    <tr>
                      <td>4F</td>
                      <td>事務所</td>
                      <td>99㎡</td>
                      <td>56万円</td>
                      <td>8ヶ月</td>
                      <td>2021.7 - 2024.6</td>
                    </tr>
                    <tr>
                      <td>5F</td>
                      <td>事務所</td>
                      <td>99㎡</td>
                      <td>56万円</td>
                      <td>8ヶ月</td>
                      <td>2023.3 - 2026.2</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>合計</th>
                      <th>-</th>
                      <th>495㎡</th>
                      <th>289万円</th>
                      <th>-</th>
                      <th>-</th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 20年間のキャッシュフローグラフ */}
              <div className="cashflow-chart-section">
                <h4 className="section-subtitle">キャッシュフロー予測（20年間）</h4>
                <div className="chart-container" style={{ position: 'relative', height: '400px' }}>
                  <p>チャートはメインページ（iframe）で実装済みです</p>
                </div>
                <div className="cashflow-summary">
                  <div className="summary-item">
                    <span className="summary-label">20年間総収入</span>
                    <span className="summary-value">6億9,360万円</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">20年間総支出</span>
                    <span className="summary-value">1億3,872万円</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">20年間純収益</span>
                    <span className="summary-value">5億5,488万円</span>
                  </div>
                </div>
              </div>

              {/* 投資指標 */}
              <div className="investment-metrics">
                <h4 className="section-subtitle">投資指標</h4>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-label">表面利回り</span>
                    <span className="metric-value">9.0%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">実質利回り</span>
                    <span className="metric-value">7.8%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">投資回収期間</span>
                    <span className="metric-value">11.1年</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">IRR（内部収益率）</span>
                    <span className="metric-value">8.5%</span>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'download' && (
            <>
              <h3>ダウンロード可能な資料</h3>
              <div className="download-section">
                <div className="download-card">
                  <div className="download-icon">📄</div>
                  <div className="download-title">物件概要書</div>
                  <div className="download-size">PDF (2.3MB)</div>
                </div>
                <div className="download-card">
                  <div className="download-icon">📊</div>
                  <div className="download-title">収益シミュレーション</div>
                  <div className="download-size">Excel (456KB)</div>
                </div>
                <div className="download-card">
                  <div className="download-icon">📑</div>
                  <div className="download-title">重要事項説明書</div>
                  <div className="download-size">PDF (1.8MB)</div>
                </div>
                <div className="download-card">
                  <div className="download-icon">📝</div>
                  <div className="download-title">売買契約書案</div>
                  <div className="download-size">PDF (892KB)</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 管理者コントロール */}
      <div className="admin-controls">
        <button 
          className={`admin-btn ${isAdminMode ? 'active' : ''}`}
          onClick={toggleAdminMode}
        >
          <span className="admin-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </span>
          <span>管理者</span>
        </button>
      </div>
    </>
  );
}