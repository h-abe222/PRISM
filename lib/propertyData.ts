export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  yield: string;
  area: string;
  buildYear: string;
  image: string;
  // 詳細ページ用の追加情報
  description?: string;
  totalFloor?: string;
  floorArea?: string;
  landArea?: string;
  structure?: string;
  nearestStation?: string;
  walkMinutes?: string;
  expectedRent?: string;
  occupancyRate?: string;
  managementFee?: string;
  // 追加情報
  overviewComment?: string;
  images?: string[];
  mapUrl?: string;
  streetViewUrl?: string;
  lat?: number;
  lng?: number;
}

export const properties: Property[] = [
  {
    id: '001',
    title: '南青山プリズムビル',
    location: '港区南青山',
    price: '3億8,500万円',
    yield: '9.0%',
    area: '495㎡',
    buildYear: '2019年',
    image: '/assets/images/properties/001/main.jpg',
    description: '南青山の一等地に位置する築浅のプレミアムビル',
    totalFloor: '地上5階',
    floorArea: '495㎡',
    landArea: '180㎡',
    structure: '鉄骨造',
    nearestStation: '表参道駅',
    walkMinutes: '徒歩5分',
    expectedRent: '月額289万円',
    occupancyRate: '100%',
    managementFee: '月額15万円',
    overviewComment: '南青山プリズムビルは、東京メトロ表参道駅から徒歩5分という絶好のロケーションに位置する、2019年築の築浅プレミアムビルです。周辺には高級ブランドショップやカフェが立ち並び、安定した賃貸需要が見込めるエリアです。現在の表面利回り9.0%は、都心一等地の物件としては非常に魅力的な水準です。満室稼働中で安定した収益が確保されており、今後も継続的な収益が期待できる優良物件です。',
    images: [
      '/assets/images/properties/001/main.jpg',
      '/assets/images/properties/001/exterior.jpg',
      '/assets/images/properties/001/interior.jpg',
      '/assets/images/properties/001/main.jpg',
      '/assets/images/properties/001/exterior.jpg',
    ],
    lat: 35.6641,
    lng: 139.7104,
  }
];

export function getPropertyById(id: string): Property | undefined {
  return properties.find(p => p.id === id);
}