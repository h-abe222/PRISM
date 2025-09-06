'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Property, properties } from '@/lib/propertyData';

export default function MemberPage() {
  const [memberName, setMemberName] = useState('VIP会員様');
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const router = useRouter();

  useEffect(() => {
    // セッションから会員情報を取得
    const user = sessionStorage.getItem('prism_user');
    if (user) {
      const userData = JSON.parse(user);
      setMemberName(userData.name || 'VIP会員様');
    } else {
      // ログインしていない場合はログインページへ
      router.push('/auth/login');
    }

    // 共通の物件データを使用
    setPropertiesList(properties);
    setFilteredProperties(properties);
  }, [router]);

  const logout = () => {
    sessionStorage.removeItem('prism_user');
    router.push('/');
  };

  const filterProperties = () => {
    // フィルタリング機能（簡易版）
    setFilteredProperties(propertiesList);
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/css/common.css" />
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

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          text-align: center;
          margin: 40px 0;
        }

        .page-title {
          font-size: 2.2em;
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
          border: 1px solid var(--gray-200);
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
        {/* ページヘッダー */}
        <div className="page-header">
          <h1 className="page-title">投資物件一覧</h1>
          <p className="page-subtitle">厳選された高収益物件をご紹介します</p>
        </div>

        {/* フィルター */}
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="areaFilter">エリア</label>
            <select id="areaFilter" onChange={filterProperties}>
              <option value="">全て</option>
              <option value="港区">港区</option>
              <option value="渋谷区">渋谷区</option>
              <option value="中央区">中央区</option>
              <option value="新宿区">新宿区</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="priceFilter">価格帯</label>
            <select id="priceFilter" onChange={filterProperties}>
              <option value="">全て</option>
              <option value="500000000">5億円未満</option>
              <option value="1000000000">5-10億円</option>
              <option value="1500000000">10-15億円</option>
              <option value="9999999999">15億円以上</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="yieldFilter">利回り</label>
            <select id="yieldFilter" onChange={filterProperties}>
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
            <div key={property.id} className="property-card">
              <Link href={`/properties/${property.id}`} className="property-card-link">
                <div className="property-image">
                  <img src={property.image} alt={property.title} />
                  <div className="property-yield">利回り {property.yield}</div>
                </div>
                <div className="property-info">
                  <h3 className="property-title">{property.title}</h3>
                  <div className="property-location">
                    📍 {property.location}
                  </div>
                  <div className="property-details">
                    <div className="detail-item">
                      <div className="detail-label">専有面積</div>
                      <div className="detail-value">{property.area}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">築年</div>
                      <div className="detail-value">{property.buildYear}</div>
                    </div>
                  </div>
                  <div className="property-price">{property.price}</div>
                  <span className="btn-detail">詳細を見る →</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}