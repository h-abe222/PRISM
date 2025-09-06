'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  yield: number;
  type: string;
  area: string;
  image: string;
}

export default function MemberDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('VIP会員様');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [areaFilter, setAreaFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [yieldFilter, setYieldFilter] = useState('');

  // 物件データ
  const properties: Property[] = [
    {
      id: '001',
      title: "南青山プリズムビル",
      location: "港区南青山",
      price: 385000000,
      yield: 9.0,
      type: "RC造 事務所ビル",
      area: "港区",
      image: "/assets/images/properties/001/main.jpg"
    }
  ];

  useEffect(() => {
    // ユーザー情報を取得
    if (typeof window !== 'undefined') {
      const user = JSON.parse(sessionStorage.getItem('prism_user') || '{}');
      if (!user.email) {
        router.push('/auth/login');
      } else if (user.name) {
        setUserName(user.name);
      }
    }
    
    // 初期表示
    setFilteredProperties(properties);
  }, []);

  const formatPrice = (price: number): string => {
    if (price >= 100000000) {
      return (price / 100000000).toFixed(1) + '億円';
    }
    return (price / 10000).toLocaleString() + '万円';
  };

  const filterProperties = () => {
    let filtered = properties.filter(property => {
      let matches = true;

      if (areaFilter && property.area !== areaFilter) matches = false;
      
      if (priceFilter) {
        const priceLimit = parseInt(priceFilter);
        if (priceLimit === 9999999999) {
          if (property.price < 1500000000) matches = false;
        } else {
          if (property.price >= priceLimit) matches = false;
        }
      }

      if (yieldFilter) {
        const yieldLimit = parseFloat(yieldFilter);
        if (property.yield < yieldLimit) matches = false;
      }

      return matches;
    });

    setFilteredProperties(filtered);
  };

  useEffect(() => {
    filterProperties();
  }, [areaFilter, priceFilter, yieldFilter]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('prism_user');
    }
    router.push('/');
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-dark: #1a365d;
          --primary: #2c5282;
          --primary-light: #3182ce;
          --primary-black: #000000;
          --gray-100: #f7fafc;
          --gray-500: #718096;
          --gray-600: #4a5568;
          --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Yu Gothic', sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f8f9fa;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

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

        .page-header {
          text-align: center;
          margin: 40px 0;
        }

        .page-title {
          font-size: 2.5em;
          color: var(--primary-dark);
          margin-bottom: 10px;
        }

        .page-subtitle {
          color: var(--gray-500);
          font-size: 1.1em;
          margin-top: 10px;
        }

        .filters {
          background: white;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: var(--shadow-sm);
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-size: 0.9em;
          font-weight: 600;
          color: var(--gray-500);
        }

        .filter-group select {
          min-width: 150px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .property-card {
          background: white;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s;
          cursor: pointer;
          position: relative;
        }

        .property-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        
        .property-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .property-image {
          width: 100%;
          height: 240px;
          background: var(--gray-100);
          position: relative;
          overflow: hidden;
        }

        .property-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .property-yield {
          position: absolute;
          top: 15px;
          right: 15px;
          background: var(--primary-light);
          color: white;
          padding: 6px 12px;
          font-weight: 600;
          font-size: 0.9em;
        }

        .property-info {
          padding: 25px;
        }

        .property-title {
          color: var(--primary-dark);
          font-size: 1.2em;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .property-location {
          color: var(--gray-500);
          font-size: 0.9em;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .property-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .detail-item {
          font-size: 0.9em;
        }

        .detail-label {
          color: var(--gray-500);
          margin-bottom: 3px;
        }

        .detail-value {
          font-weight: 600;
          color: var(--gray-600);
        }

        .property-price {
          font-size: 1.4em;
          font-weight: 700;
          color: var(--primary-dark);
          margin-bottom: 20px;
        }

        .btn-detail {
          width: 100%;
          background: var(--primary-black);
          color: white;
          padding: 12px;
          text-align: center;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          border-radius: 0;
          display: block;
        }

        .btn-detail:hover {
          background: #1a1a1a;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .no-properties {
          text-align: center;
          padding: 60px 20px;
          color: var(--gray-500);
        }

        @media (max-width: 768px) {
          .filters {
            flex-direction: column;
            align-items: stretch;
          }

          .properties-grid {
            grid-template-columns: 1fr;
          }

          .member-header-content {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .property-details {
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
            <span className="member-name">{userName}</span>
            <button className="btn-logout" onClick={handleLogout}>ログアウト</button>
          </div>
        </div>
      </header>

      <div className="container">
        {/* ページヘッダー */}
        <div className="page-header">
          <h1 className="page-title">投資物件一覧</h1>
          <p className="page-subtitle">厳選された高収益物件をご紹介します</p>
        </div>

        {/* フィルター */}
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="areaFilter">エリア</label>
            <select 
              id="areaFilter" 
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
            >
              <option value="">全て</option>
              <option value="港区">港区</option>
              <option value="渋谷区">渋谷区</option>
              <option value="中央区">中央区</option>
              <option value="新宿区">新宿区</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="priceFilter">価格帯</label>
            <select 
              id="priceFilter"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="">全て</option>
              <option value="500000000">5億円未満</option>
              <option value="1000000000">5-10億円</option>
              <option value="1500000000">10-15億円</option>
              <option value="9999999999">15億円以上</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="yieldFilter">利回り</label>
            <select 
              id="yieldFilter"
              value={yieldFilter}
              onChange={(e) => setYieldFilter(e.target.value)}
            >
              <option value="">全て</option>
              <option value="5">5%以上</option>
              <option value="6">6%以上</option>
              <option value="7">7%以上</option>
            </select>
          </div>
        </div>

        {/* 物件グリッド */}
        <div className="properties-grid">
          {filteredProperties.map(property => (
            <Link href={`/properties/${property.id}`} key={property.id} className="property-card-link">
              <div className="property-card">
                <div className="property-image">
                  <img src={property.image} alt={property.title} />
                  <div className="property-yield">{property.yield}%</div>
                </div>
                <div className="property-info">
                  <h3 className="property-title">{property.title}</h3>
                  <div className="property-location">
                    📍 {property.location}
                  </div>
                  <div className="property-details">
                    <div className="detail-item">
                      <div className="detail-label">物件種別</div>
                      <div className="detail-value">{property.type}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">表面利回り</div>
                      <div className="detail-value">{property.yield}%</div>
                    </div>
                  </div>
                  <div className="property-price">{formatPrice(property.price)}</div>
                  <div className="btn-detail">詳細を見る</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 物件なし表示 */}
        {filteredProperties.length === 0 && (
          <div className="no-properties">
            <p>条件に合う物件が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </>
  );
}