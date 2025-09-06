// pdf-libを使用した日本語対応PDF生成モジュール（拡張版）

class PDFGeneratorPdfLibEnhanced {
    constructor() {
        this.loadPdfLib();
    }

    // pdf-libライブラリを動的に読み込み
    async loadPdfLib() {
        if (typeof window.PDFLib === 'undefined') {
            // pdf-libをCDNから読み込み
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
            document.head.appendChild(script);
            
            // fontkitもCDNから読み込み
            const fontkitScript = document.createElement('script');
            fontkitScript.src = 'https://unpkg.com/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js';
            document.head.appendChild(fontkitScript);
            
            return new Promise((resolve) => {
                script.onload = () => {
                    fontkitScript.onload = () => {
                        console.log('pdf-lib and fontkit loaded');
                        resolve();
                    };
                };
            });
        }
    }

    // 物件概要書PDF生成（pdf-lib版・拡張）
    async generatePropertyOverview() {
        await this.loadPdfLib();
        
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        
        // 新しいPDFドキュメントを作成
        const pdfDoc = await PDFDocument.create();
        
        // fontkitを登録
        pdfDoc.registerFontkit(fontkit);
        
        // 日本語フォントを読み込み
        let notoFont;
        try {
            // Noto Sans JPフォント（Google Fontsから直接）
            const fontUrl = 'https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf';
            const fontResponse = await fetch(fontUrl);
            
            if (!fontResponse.ok) {
                throw new Error('Font fetch failed');
            }
            
            const fontBytes = await fontResponse.arrayBuffer();
            
            // フォントを埋め込み（subset: falseを明示的に指定）
            notoFont = await pdfDoc.embedFont(fontBytes, { subset: false });
            
            console.log('Japanese font loaded successfully');
        } catch (error) {
            console.error('Failed to load Japanese font:', error);
            // フォールバック: 標準フォントを使用
            notoFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }
        
        // 標準フォントも読み込み
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // ブランドカラー
        const colors = {
            primary: rgb(26/255, 54/255, 93/255),
            primaryLight: rgb(70/255, 130/255, 180/255),
            white: rgb(1, 1, 1),
            text: rgb(51/255, 51/255, 51/255),
            textLight: rgb(102/255, 102/255, 102/255),
            background: rgb(248/255, 249/255, 250/255)
        };
        
        // ========== 1ページ目: 表紙 ==========
        const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 in points
        const { width, height } = page1.getSize();
        
        // ヘッダー背景（シンプルな青背景）
        page1.drawRectangle({
            x: 0,
            y: height - 100,
            width: width,
            height: 100,
            color: colors.primary,
        });
        
        // ヘッダー下部にアクセントライン
        page1.drawRectangle({
            x: 0,
            y: height - 102,
            width: width,
            height: 2,
            color: colors.primaryLight,
        });
        
        // PRISMロゴ画像を右上に配置
        let logoTopY = height - 50; // ロゴの上端位置
        try {
            const logoUrl = '/assets/images/logo/prism-white.png';
            const logoResponse = await fetch(logoUrl);
            
            if (logoResponse.ok) {
                const logoBytes = await logoResponse.arrayBuffer();
                const logoImage = await pdfDoc.embedPng(logoBytes);
                
                // ロゴのサイズをさらに小さく調整
                const logoDims = logoImage.scale(0.08);
                
                page1.drawImage(logoImage, {
                    x: width - logoDims.width - 50,
                    y: logoTopY - logoDims.height,
                    width: logoDims.width,
                    height: logoDims.height,
                });
            }
        } catch (error) {
            console.error('Failed to load logo:', error);
        }
        
        // ドキュメント名（左上）- 位置を下げてサイズを大きく
        page1.drawText('物件概要書', {
            x: 50,
            y: logoTopY - 18, // 位置を下げる
            size: 24, // フォントサイズを大きく
            font: notoFont,
            color: colors.white,
        });
        
        // 物件名と住所（白い背景の上部）
        let yPos = height - 175;
        
        // 物件名（大きく表示）
        page1.drawText('南青山プリズムビル', {
            x: 50,
            y: yPos,
            size: 28,
            font: notoFont,
            color: colors.primary,
        });
        
        yPos -= 35;
        
        // 住所
        page1.drawText('〒107-0062 東京都港区南青山3-15-8', {
            x: 50,
            y: yPos,
            size: 14,
            font: notoFont,
            color: colors.text,
        });
        
        // 物件概要セクション
        yPos -= 20;
        
        // セクションタイトル（他のセクションと統一）
        this.drawSectionTitle(page1, '物件概要', yPos, colors, notoFont);
        yPos -= 45;
        
        // 物件概要ボックス（パディングを最小限に）
        const summaryBox = {
            x: 50,
            y: yPos - 35,
            width: width - 100,
            height: 35,
        };
        
        page1.drawRectangle({
            ...summaryBox,
            color: rgb(1, 1, 1),
            borderColor: colors.primary,
            borderWidth: 1,
        });
        
        // サマリー情報（コンパクトに配置）
        const summaryInfo = [
            { label: '物件種別', value: 'オフィスビル' },
            { label: '築年月', value: '2019年（築5年）' },
            { label: '表面利回り', value: '9.0%' },
            { label: '売買価格', value: '3億8,500万円' }
        ];
        
        let xOffset = 65;
        const labelY = yPos - 15;
        const valueY = yPos - 28;
        
        for (const info of summaryInfo) {
            page1.drawText(info.label, {
                x: xOffset,
                y: labelY,
                size: 9,
                font: notoFont,
                color: colors.textLight,
            });
            
            page1.drawText(info.value, {
                x: xOffset,
                y: valueY,
                size: 11,
                font: notoFont,
                color: colors.text,
            });
            
            xOffset += 125;
        }
        
        yPos -= 60;
        
        // メイン画像セクション
        page1.drawText('メイン画像', {
            x: 50,
            y: yPos,
            size: 14,
            font: notoFont,
            color: colors.primary,
        });
        
        yPos -= 20;
        
        // メイン写真を左右余白いっぱいに表示
        try {
            const photoUrl = '/assets/images/properties/001/main.jpg';
            const photoResponse = await fetch(photoUrl);
            
            if (photoResponse.ok) {
                const photoBytes = await photoResponse.arrayBuffer();
                const photoImage = await pdfDoc.embedJpg(photoBytes);
                
                // 写真の最大サイズを設定（左右余白50pxずつ）
                const maxWidth = width - 100;
                const maxHeight = 350; // 最大高さを大きく
                
                // アスペクト比を保持してサイズを計算
                const photoSize = photoImage.size();
                const aspectRatio = photoSize.width / photoSize.height;
                
                let finalWidth = maxWidth;
                let finalHeight = finalWidth / aspectRatio;
                
                // 高さが最大値を超える場合は調整
                if (finalHeight > maxHeight) {
                    finalHeight = maxHeight;
                    finalWidth = finalHeight * aspectRatio;
                }
                
                // 中央に配置
                page1.drawImage(photoImage, {
                    x: (width - finalWidth) / 2,
                    y: yPos - finalHeight,
                    width: finalWidth,
                    height: finalHeight,
                });
                
                yPos -= finalHeight + 20;
            }
        } catch (error) {
            // 写真が利用できない場合はプレースホルダーを表示
            page1.drawRectangle({
                x: 50,
                y: yPos - 300,
                width: width - 100,
                height: 300,
                color: colors.background,
                borderColor: colors.primaryLight,
                borderWidth: 1,
            });
            
            page1.drawText('物件外観写真', {
                x: width / 2 - 40,
                y: yPos - 150,
                size: 14,
                font: notoFont,
                color: colors.textLight,
            });
            
            yPos -= 320;
        }
        
        // ========== 2ページ目: 投資ハイライトと物件詳細 ==========
        const page2 = pdfDoc.addPage([595.28, 841.89]);
        yPos = height - 50;
        
        // セクションタイトル（投資ハイライト）
        this.drawSectionTitle(page2, '投資ハイライト', yPos, colors, notoFont);
        yPos -= 45;
        
        // 投資ハイライトの内容
        const highlights = [
            '表参道駅徒歩5分の一等地立地',
            '2019年築・新耐震基準適合の築浅物件',
            '表面利回り9.0%（満室時10.8%の高利回り）',
            'NOI利回り6.9%・安定収益',
            '現在稼働率83.3%・満室へのアップサイド',
            '高級ブランド・IT企業等の優良テナント'
        ];
        
        for (let i = 0; i < highlights.length; i++) {
            // 背景ボックス
            page2.drawRectangle({
                x: 50,
                y: yPos - 25,
                width: width - 100,
                height: 28,
                color: i % 2 === 0 ? colors.background : rgb(1, 1, 1),
                borderColor: rgb(0.9, 0.9, 0.9),
                borderWidth: 0.5,
            });
            
            // チェックマーク
            page2.drawText('✓', {
                x: 60,
                y: yPos - 15,
                size: 12,
                font: notoFont,
                color: colors.primaryLight,
            });
            
            page2.drawText(highlights[i], {
                x: 80,
                y: yPos - 15,
                size: 11,
                font: notoFont,
                color: colors.text,
            });
            
            yPos -= 30;
        }
        
        // 物件詳細情報セクション
        yPos -= 30;
        this.drawSectionTitle(page2, '物件詳細情報', yPos, colors, notoFont);
        yPos -= 45;
        
        // 物件詳細をテーブル形式で表示
        const propertyDetails = [
            { label: '物件名称', value: '南青山プリズムビル', highlight: true },
            { label: '所在地', value: '東京都港区南青山3-15-8' },
            { label: '最寄駅', value: '東京メトロ表参道駅 徒歩5分' },
            { label: '築年月', value: '2019年（築5年）' },
            { label: '構造・階数', value: '鉄骨造 地上5階建' },
            { label: '延床面積', value: '495㎡' },
            { label: '土地面積', value: '180㎡' },
            { label: '現在稼働率', value: '83.3%（6室中5室入居）', highlight: true },
            { label: '月額賃料収入', value: '289万円' },
            { label: '年間賃料収入', value: '3,468万円' },
            { label: '売買価格', value: '3億8,500万円', highlight: true },
            { label: '表面利回り', value: '9.0%', highlight: true }
        ];
        
        // ページ指定
        let currentPage = page2;
        
        for (const detail of propertyDetails) {
            // ページが足りなくなったら新しいページを追加
            if (yPos < 100) {
                currentPage = pdfDoc.addPage([595.28, 841.89]);
                yPos = height - 50;
            }
            
            this.drawDetailRow(currentPage, detail, yPos, width, colors, notoFont);
            yPos -= 28;
        }
        
        // 3ページ目を作成して写真を追加
        const page2b = pdfDoc.addPage([595.28, 841.89]);
        yPos = height - 50;
        
        // 物件写真セクション
        this.drawSectionTitle(page2b, '物件写真', yPos, colors, notoFont);
        yPos -= 45;
        
        let photoDisplayed = false;
        
        // 外観写真
        try {
            const exteriorUrl = '/assets/images/properties/001/exterior.jpg';
            const exteriorResponse = await fetch(exteriorUrl);
            
            if (exteriorResponse.ok) {
                const exteriorBytes = await exteriorResponse.arrayBuffer();
                const exteriorImage = await pdfDoc.embedJpg(exteriorBytes);
                
                const photoWidth = (width - 120) / 2; // 2列表示
                const maxPhotoHeight = 150;
                const aspectRatio = exteriorImage.size().width / exteriorImage.size().height;
                let photoHeight = photoWidth / aspectRatio;
                
                if (photoHeight > maxPhotoHeight) {
                    photoHeight = maxPhotoHeight;
                }
                
                page2b.drawText('外観', {
                    x: 60,
                    y: yPos,
                    size: 10,
                    font: notoFont,
                    color: colors.text,
                });
                
                page2b.drawImage(exteriorImage, {
                    x: 50,
                    y: yPos - 15 - photoHeight,
                    width: photoWidth,
                    height: photoHeight,
                });
                
                photoDisplayed = true;
            }
        } catch (error) {
            console.log('Exterior photo not available');
        }
        
        // 内観写真
        try {
            const interiorUrl = '/assets/images/properties/001/interior.jpg';
            const interiorResponse = await fetch(interiorUrl);
            
            if (interiorResponse.ok) {
                const interiorBytes = await interiorResponse.arrayBuffer();
                const interiorImage = await pdfDoc.embedJpg(interiorBytes);
                
                const photoWidth = (width - 120) / 2;
                const maxPhotoHeight = 150;
                const aspectRatio = interiorImage.size().width / interiorImage.size().height;
                let photoHeight = photoWidth / aspectRatio;
                
                if (photoHeight > maxPhotoHeight) {
                    photoHeight = maxPhotoHeight;
                }
                
                page2b.drawText('内観', {
                    x: width / 2 + 10,
                    y: yPos,
                    size: 10,
                    font: notoFont,
                    color: colors.text,
                });
                
                page2b.drawImage(interiorImage, {
                    x: width / 2 + 10,
                    y: yPos - 15 - photoHeight,
                    width: photoWidth,
                    height: photoHeight,
                });
                
                photoDisplayed = true;
            }
        } catch (error) {
            console.log('Interior photo not available');
        }
        
        if (photoDisplayed) {
            yPos -= 180;
        }
        
        // ========== 4ページ目: ロケーション情報 ==========
        const page4 = pdfDoc.addPage([595.28, 841.89]);
        yPos = height - 50;
        
        // セクションタイトル（ロケーション情報）
        this.drawSectionTitle(page4, 'ロケーション情報', yPos, colors, notoFont);
        yPos -= 50;
        
        // アクセス情報
        const accessInfo = [
            { station: '表参道駅', line: '東京メトロ半蔵門線・銀座線・千代田線', time: '徒歩5分' },
            { station: '渋谷駅', line: 'JR各線・東京メトロ各線', time: '徒歩12分' },
            { station: '六本木駅', line: '東京メトロ日比谷線・大江戸線', time: '徒歩15分' }
        ];
        
        for (const access of accessInfo) {
            page4.drawRectangle({
                x: 50,
                y: yPos - 28,
                width: width - 100,
                height: 32,
                color: colors.background,
                borderColor: rgb(0.9, 0.9, 0.9),
                borderWidth: 0.5,
            });
            
            page4.drawText(access.station, {
                x: 60,
                y: yPos - 15,
                size: 12,
                font: notoFont,
                color: colors.primary,
            });
            
            page4.drawText(access.line, {
                x: 150,
                y: yPos - 15,
                size: 10,
                font: notoFont,
                color: colors.text,
            });
            
            page4.drawText(access.time, {
                x: width - 150,
                y: yPos - 15,
                size: 11,
                font: notoFont,
                color: colors.primaryLight,
            });
            
            yPos -= 35;
        }
        
        // 周辺環境
        yPos -= 20;
        this.drawSectionTitle(page4, '周辺環境', yPos, colors, notoFont);
        yPos -= 45;
        
        const amenities = [
            'コンビニ（セブンイレブン）: 徒歩1分',
            'スーパー（紀ノ国屋）: 徒歩3分',
            '郵便局: 徒歩2分',
            '銀行（三菱UFJ・みずほ）: 徒歩5分',
            '公園（青山公園）: 徒歩7分',
            '医療機関（南青山クリニック）: 徒歩5分'
        ];
        
        for (const amenity of amenities) {
            page4.drawText('・', {
                x: 60,
                y: yPos,
                size: 10,
                font: notoFont,
                color: colors.text,
            });
            
            page4.drawText(amenity, {
                x: 75,
                y: yPos,
                size: 10,
                font: notoFont,
                color: colors.text,
            });
            yPos -= 20;
        }
        
        // マップ情報
        yPos -= 30;
        
        // マップセクションタイトル
        page4.drawText('📍 マップ情報', {
            x: 50,
            y: yPos,
            size: 12,
            font: notoFont,
            color: colors.primary,
        });
        
        yPos -= 20;
        
        // OpenStreetMapの静的画像を埋め込み（または事前に用意した画像）
        try {
            // まず、ローカルに保存された地図画像を試す
            let mapImageBytes;
            let mapLoaded = false;
            
            // ローカルマップ画像を試す
            try {
                const localMapUrl = '/assets/images/properties/001/map.png';
                const localMapResponse = await fetch(localMapUrl);
                if (localMapResponse.ok) {
                    mapImageBytes = await localMapResponse.arrayBuffer();
                    const mapImage = await pdfDoc.embedPng(mapImageBytes);
                    
                    // マップの最大サイズを設定（左右余白いっぱい）
                    const boxWidth = width - 100; // 左右50pxずつの余白
                    const boxHeight = 200; // 固定高さ
                    
                    // マップ画像の元のサイズ
                    const mapSize = mapImage.size();
                    const mapAspectRatio = mapSize.width / mapSize.height;
                    const boxAspectRatio = boxWidth / boxHeight;
                    
                    // カバースタイルでの表示サイズを計算（アスペクト比を保持）
                    let displayWidth, displayHeight;
                    let offsetX = 0, offsetY = 0;
                    
                    if (mapAspectRatio > boxAspectRatio) {
                        // 画像が横長すぎる場合：高さに合わせて幅を計算
                        displayHeight = boxHeight;
                        displayWidth = displayHeight * mapAspectRatio;
                        offsetX = -(displayWidth - boxWidth) / 2; // 中央配置のためのオフセット
                    } else {
                        // 画像が縦長すぎる場合：幅に合わせて高さを計算
                        displayWidth = boxWidth;
                        displayHeight = displayWidth / mapAspectRatio;
                        offsetY = -(displayHeight - boxHeight) / 2; // 中央配置のためのオフセット
                    }
                    
                    // 枠を描画
                    page4.drawRectangle({
                        x: 50,
                        y: yPos - boxHeight - 10,
                        width: boxWidth,
                        height: boxHeight,
                        color: rgb(1, 1, 1),
                        borderColor: colors.primaryLight,
                        borderWidth: 1,
                    });
                    
                    // クリッピング領域を設定（枠内のみ表示）
                    page4.pushOperators(
                        PDFLib.pushGraphicsState(),
                        PDFLib.rectangle(50, yPos - boxHeight - 10, boxWidth, boxHeight),
                        PDFLib.clip(),
                        PDFLib.endPath()
                    );
                    
                    // マップを描画（カバースタイル・アスペクト比保持）
                    page4.drawImage(mapImage, {
                        x: 50 + offsetX,
                        y: yPos - boxHeight - 10 + offsetY,
                        width: displayWidth,
                        height: displayHeight,
                    });
                    
                    // クリッピング領域を解除
                    page4.pushOperators(PDFLib.popGraphicsState());
                    
                    yPos -= boxHeight + 30;
                    mapLoaded = true;
                }
            } catch (error) {
                console.log('Local map not available');
            }
            
            // マップが読み込めなかった場合は、OpenStreetMapの静的タイルを使用
            if (!mapLoaded) {
                // OpenStreetMapタイルのURLを生成（南青山の座標）
                const lat = 35.6640;
                const lon = 139.7140;
                const zoom = 16;
                
                // タイル座標を計算
                const n = Math.pow(2, zoom);
                const xtile = Math.floor((lon + 180) / 360 * n);
                const ytile = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
                
                // OpenStreetMapタイルURL
                const osmUrl = `https://tile.openstreetmap.org/${zoom}/${xtile}/${ytile}.png`;
                
                try {
                    const osmResponse = await fetch(osmUrl);
                    if (osmResponse.ok) {
                        const osmBytes = await osmResponse.arrayBuffer();
                        const osmImage = await pdfDoc.embedPng(osmBytes);
                        
                        // OSMタイルのサイズ（通常256x256）
                        const tileSize = 256;
                        const displaySize = Math.min(200, tileSize * 0.8);
                        
                        // 枠を描画
                        page4.drawRectangle({
                            x: (width - displaySize) / 2 - 5,
                            y: yPos - displaySize - 15,
                            width: displaySize + 10,
                            height: displaySize + 10,
                            color: rgb(1, 1, 1),
                            borderColor: colors.primaryLight,
                            borderWidth: 1,
                        });
                        
                        // 中央に配置
                        page4.drawImage(osmImage, {
                            x: (width - displaySize) / 2,
                            y: yPos - displaySize - 10,
                            width: displaySize,
                            height: displaySize,
                        });
                        
                        yPos -= displaySize + 30;
                        mapLoaded = true;
                    }
                } catch (error) {
                    console.log('OSM tile loading failed');
                }
            }
            
            // マップが読み込めなかった場合は、プレースホルダーを表示
            if (!mapLoaded) {
                page4.drawRectangle({
                    x: 50,
                    y: yPos - 200,
                    width: width - 100,
                    height: 200,
                    color: colors.background,
                    borderColor: colors.primaryLight,
                    borderWidth: 1,
                });
                
                page4.drawText('地図エリア', {
                    x: width / 2 - 30,
                    y: yPos - 100,
                    size: 14,
                    font: notoFont,
                    color: colors.textLight,
                });
                
                yPos -= 210;
            }
            
        } catch (error) {
            console.error('Failed to load map:', error);
            
            // エラー時はテキストで地図情報を表示
            page4.drawRectangle({
                x: 50,
                y: yPos - 120,
                width: width - 100,
                height: 120,
                color: colors.background,
                borderColor: colors.primaryLight,
                borderWidth: 1,
            });
            
            yPos -= 130;
        }
        
        // マップの下に追加情報（余白を確保）
        if (yPos < 150) {
            // 新しいページを追加
            const page5 = pdfDoc.addPage([595.28, 841.89]);
            yPos = height - 50;
            
            page5.drawText('Google Mapsで確認: ', {
                x: 60,
                y: yPos,
                size: 10,
                font: notoFont,
                color: colors.text,
            });
            
            yPos -= 20;
            
            page5.drawText('https://maps.google.com/?q=東京都港区南青山3-15-8', {
                x: 60,
                y: yPos,
                size: 9,
                font: notoFont,
                color: colors.primaryLight,
            });
            
            yPos -= 25;
            
            page5.drawText('※ 表参道駅A4出口から徒歩5分の好立地', {
                x: 60,
                y: yPos,
                size: 9,
                font: notoFont,
                color: colors.textLight,
            });
            
            yPos -= 15;
            
            page5.drawText('※ 青山通り沿い、ブランドショップや高級レストランが立ち並ぶエリア', {
                x: 60,
                y: yPos,
                size: 9,
                font: notoFont,
                color: colors.textLight,
            });
        } else {
            page4.drawText('Google Mapsで確認: ', {
                x: 60,
                y: yPos,
                size: 10,
                font: notoFont,
                color: colors.text,
            });
            
            yPos -= 20;
            
            page4.drawText('https://maps.google.com/?q=東京都港区南青山3-15-8', {
                x: 60,
                y: yPos,
                size: 9,
                font: notoFont,
                color: colors.primaryLight,
            });
            
            yPos -= 25;
            
            page4.drawText('※ 表参道駅A4出口から徒歩5分の好立地', {
                x: 60,
                y: yPos,
                size: 9,
                font: notoFont,
                color: colors.textLight,
            });
            
            yPos -= 15;
            
            page4.drawText('※ 青山通り沿い、ブランドショップや高級レストランが立ち並ぶエリア', {
                x: 60,
                y: yPos,
                size: 9,
                font: notoFont,
                color: colors.textLight,
            });
        }
        
        // フッター
        const pageCount = pdfDoc.getPageCount();
        const pages = pdfDoc.getPages();
        
        for (let i = 0; i < pageCount; i++) {
            const currentPage = pages[i];
            
            // フッターライン
            currentPage.drawLine({
                start: { x: 50, y: 50 },
                end: { x: width - 50, y: 50 },
                thickness: 1,
                color: colors.primary,
            });
            
            // ページ番号
            currentPage.drawText(`${i + 1} / ${pageCount}`, {
                x: width / 2 - 15,
                y: 30,
                size: 9,
                font: helveticaBold,
                color: colors.textLight,
            });
            
            // 日付
            const now = new Date();
            const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日作成`;
            currentPage.drawText(dateStr, {
                x: width - 150,
                y: 30,
                size: 9,
                font: notoFont,
                color: colors.textLight,
            });
            
            // PRISM copyright
            currentPage.drawText('© PRISM - Premium Real Estate Investment Solutions', {
                x: 50,
                y: 30,
                size: 8,
                font: helveticaBold,
                color: colors.textLight,
            });
        }
        
        // PDFをダウンロード
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '南青山プリズムビル_物件概要書.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    // セクションタイトルを描画するヘルパー関数
    drawSectionTitle(page, title, yPos, colors, font) {
        // 左側にアクセントライン
        page.drawRectangle({
            x: 50,
            y: yPos - 25,
            width: 4,
            height: 25,
            color: colors.primaryLight,
        });
        
        page.drawText(title, {
            x: 65,
            y: yPos - 20,
            size: 16,
            font: font,
            color: colors.primary,
        });
        
        // セクション下線
        page.drawLine({
            start: { x: 50, y: yPos - 30 },
            end: { x: page.getSize().width - 50, y: yPos - 30 },
            thickness: 0.5,
            color: PDFLib.rgb(0.85, 0.85, 0.85),
        });
    }
    
    // 詳細情報の行を描画するヘルパー関数
    drawDetailRow(page, detail, yPos, width, colors, font) {
        const { rgb } = PDFLib;
        
        // 背景デザイン
        if (detail.highlight) {
            // 重要項目は薄い青背景
            page.drawRectangle({
                x: 45,
                y: yPos - 24,
                width: width - 90,
                height: 26,
                color: rgb(0.95, 0.97, 1),
                borderColor: colors.primaryLight,
                borderWidth: 0.5,
            });
        } else {
            // 通常項目は交互に背景色
            page.drawRectangle({
                x: 45,
                y: yPos - 24,
                width: width - 90,
                height: 26,
                color: colors.background,
            });
        }
        
        // 左側のライン
        page.drawLine({
            start: { x: 45, y: yPos - 24 },
            end: { x: 45, y: yPos + 2 },
            thickness: 2,
            color: detail.highlight ? colors.primaryLight : rgb(0.9, 0.9, 0.9),
        });
        
        // ラベル
        page.drawText(detail.label, {
            x: 60,
            y: yPos - 15,
            size: 11,
            font: font,
            color: detail.highlight ? colors.primary : colors.text,
        });
        
        // コロン
        page.drawText(':', {
            x: 200,
            y: yPos - 15,
            size: 11,
            font: font,
            color: colors.textLight,
        });
        
        // 値
        page.drawText(detail.value, {
            x: 220,
            y: yPos - 15,
            size: 11,
            font: font,
            color: detail.highlight ? colors.primary : colors.text,
        });
    }
}

// グローバルに公開
window.PDFGeneratorPdfLibEnhanced = PDFGeneratorPdfLibEnhanced;