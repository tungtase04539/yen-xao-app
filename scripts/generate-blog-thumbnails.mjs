/**
 * Script sinh ảnh thumbnail cho 30 bài blog bằng Gemini Imagen API
 * và upload lên Supabase Storage.
 *
 * Chạy: node scripts/generate-blog-thumbnails.mjs
 */

import { createClient } from '@supabase/supabase-js';

// === CONFIG ===
const GEMINI_API_KEY = 'AIzaSyA9HxR3AbzpkRGZOOT3iEloB7dfzOTuJ_4';
const SUPABASE_URL = 'https://dxrogturyjgaxyiqpxhs.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4cm9ndHVyeWpnYXh5aXFweGhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUyNDg5NiwiZXhwIjoyMDg4MTAwODk2fQ.9GVYU04oxxNBbhu8CEGbMX8BuzHLUEZrU3JvtwFd62Y';
const BUCKET = 'posts';
const FOLDER = 'thumbnails';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Image prompts cho từng bài (mapping slug → prompt)
const IMAGE_PROMPTS = {
  'yen-tinh-che-va-yen-tho-nen-chon-loai-nao': 'Professional product photography of two types of bird nest on white marble surface, one raw natural nest and one cleaned refined nest, soft warm lighting, luxury food styling, Vietnamese aesthetic, 16:9 aspect ratio',
  'hoang-yen-sam-dong-trung-50-san-pham-cao-cap-nhat-qiqi': 'Luxury glass jar of premium bird nest soup with cordyceps and ginseng, golden amber color, elegant packaging on dark wooden table, soft studio lighting, Vietnamese premium food product, 16:9',
  'huong-dan-so-che-to-yen-tho-tu-a-z-cho-nguoi-moi': 'Step by step bird nest preparation, raw bird nest soaking in clear water in ceramic bowl, tweezers removing feathers, clean kitchen setup, warm natural lighting, Vietnamese cooking tutorial style, 16:9',
  'nguoi-gia-an-yen-sao-co-tot-khong-lieu-luong-phu-hop': 'Happy healthy elderly Vietnamese couple enjoying bird nest soup together at breakfast, warm family scene, bright modern kitchen, soft morning light, 16:9',
  'yen-chung-duong-phen-qiqi-tien-loi-cho-ca-gia-dinh': 'Beautiful glass jars of bird nest with rock sugar, clear white milky liquid with visible nest strands, arranged on wooden tray with family setting background, warm lighting, 16:9',
  'tre-em-may-tuoi-duoc-an-yen-sao-luu-y-cho-me': 'Vietnamese mother gently feeding bird nest porridge to cute toddler in high chair, warm cozy kitchen, soft natural light, nurturing scene, 16:9',
  'cach-bao-quan-yen-sao-kho-va-yen-chung-dung-chuan': 'Organized storage of dried bird nest in glass container with silica gel packets, clean refrigerator shelf, neat kitchen organization, bright clean photography, 16:9',
  'vi-sao-nguoi-hai-phong-tin-chon-qiqi-yen-sao': 'Beautiful storefront of a premium bird nest shop in Vietnamese city street, elegant signage, warm welcoming interior visible through glass window, Hai Phong urban setting, 16:9',
  '7-cong-thuc-che-yen-giai-nhiet-cho-mua-he-hai-phong': 'Colorful array of Vietnamese bird nest dessert drinks with tropical fruits, coconut, red dates, in clear glass bowls with ice, refreshing summer food photography, bright and vibrant, 16:9',
  'yen-sao-co-giup-tang-can-cho-nguoi-gay-khong': 'Healthy Vietnamese person enjoying nutritious bird nest meal with balanced diet foods around, bright cheerful atmosphere, wellness and health concept, 16:9',
  'goi-y-qua-tang-yen-sao-cao-cap-dip-le-tet': 'Luxurious bird nest gift box set with red and gold packaging, Vietnamese Tet decoration, premium glass jars beautifully arranged, elegant gift wrapping, festive atmosphere, 16:9',
  'yen-sam-dong-trung-duong-kieng-giai-phap-cho-nguoi-tieu-duong': 'Sugar-free bird nest product with Isomalt, medical wellness concept, clean white and green design, health-conscious food photography, blood sugar monitor in background, 16:9',
  'nen-an-yen-sao-luc-nao-trong-ngay-de-hap-thu-tot-nhat': 'Beautiful clock showing morning time with bird nest bowl on breakfast table, sunrise through window, peaceful morning routine, warm golden light, Vietnamese style, 16:9',
  'yen-sao-ho-tro-hoi-phuc-sau-phau-thuat-nhu-the-nao': 'Bird nest soup in hospital bedside tray, caring hands holding bowl, recovery and healing concept, warm comforting atmosphere, soft lighting, 16:9',
  'kinh-nghiem-chon-mua-to-yen-tho-chat-luong-cao': 'Close-up of hands examining premium raw bird nest quality, magnifying glass, natural texture visible, expert inspection scene, warm studio lighting, 16:9',
  'yen-chung-dong-trung-ha-thao-qiqi-cong-dung-vuot-troi': 'Premium bird nest with cordyceps in glass jar, golden amber color with visible nest strands and cordyceps, traditional Vietnamese medicine herbs around, elegant product photography, 16:9',
  '5-sai-lam-khi-chung-yen-khien-mat-chat-dinh-duong': 'Split image showing wrong vs right way to cook bird nest, boiling water with X mark vs gentle double boiling with checkmark, educational cooking comparison, clean design, 16:9',
  'xu-huong-qua-tang-suc-khoe-tai-hai-phong-2026': 'Modern Vietnamese gift giving scene, variety of health products including bird nest jars, ginseng, cordyceps in beautiful gift boxes, trendy packaging design, 2026 modern aesthetic, 16:9',
  'sialic-acid-trong-yen-sao-vi-sao-quy-hon-vang': 'Scientific illustration of sialic acid molecular structure combined with bird nest, elegant fusion of science and nature, gold and white color scheme, premium educational visual, 16:9',
  'cach-nau-chao-yen-sao-bo-duong-cho-be-an-dam': 'Cute baby food bowls with bird nest congee, colorful baby-friendly presentations with pumpkin and chicken varieties, soft pastel kitchen background, adorable food styling, 16:9',
  'phan-biet-yen-dao-va-yen-nha-loai-nao-tot-hon': 'Side by side comparison of cave bird nest on rocky cliff vs house bird nest in modern swiftlet house, nature vs architecture, educational comparison layout, 16:9',
  'yen-sao-tang-cuong-mien-dich-mua-chuyen-giao-thoi-tiet': 'Strong immune system shield concept with bird nest bowl, seasonal weather transition background showing rain to sunshine, health protection visual, warm and protective mood, 16:9',
  'review-dong-yen-sam-dong-trung-35-qiqi-co-dang-mua': 'Hands opening a glass jar of bird nest with cordyceps and ginseng, review unboxing style, close-up product details visible, authentic review photography, warm tones, 16:9',
  'tai-sao-yen-sao-duoc-goi-la-vang-trang-cua-suc-khoe': 'Pristine white bird nest on golden silk fabric, luxurious presentation suggesting white gold, dramatic lighting, artistic premium food photography, 16:9',
  'yen-sao-cho-phu-nu-sau-sinh-hoi-phuc-va-dep-da': 'Beautiful Vietnamese mother with glowing skin holding newborn baby, bird nest bowl nearby, postpartum recovery and beauty concept, soft warm maternal lighting, 16:9',
  'huong-dan-ngam-to-yen-dung-ky-thuat-de-no-toi-da': 'Time-lapse style showing bird nest expanding in water from dry to fully soaked, clear glass bowl, clean demonstration photography, before and after comparison, 16:9',
  'qiqi-yen-sao-giao-hang-tan-noi-toan-hai-phong': 'Delivery person handing over beautifully packaged bird nest gift box at doorstep, Hai Phong cityscape in background, fast delivery concept, warm friendly interaction, 16:9',
  'yen-sao-ket-hop-voi-thuc-pham-nao-de-tang-hap-thu': 'Beautiful flat lay of bird nest surrounded by complementary ingredients - red dates, goji berries, rock sugar, lotus seeds, ginseng, on wooden cutting board, food pairing guide visual, 16:9',
  'nguoi-bi-gout-co-an-duoc-yen-sao-khong-chuyen-gia-giai-dap': 'Medical consultation scene with doctor discussing nutrition, bird nest products on desk, joint health X-ray subtle in background, professional healthcare setting, 16:9',
  'faq-15-cau-hoi-thuong-gap-khi-mua-yen-sao-lan-dau': 'Friendly FAQ concept with question mark icons around beautiful bird nest product display, clean modern design, welcoming first-time buyer atmosphere, bright and inviting, 16:9',
};

async function generateImage(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        numberOfImages: 1,
        aspectRatio: '16:9',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const base64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) throw new Error('No image data in response');
  return Buffer.from(base64, 'base64');
}

async function uploadToSupabase(imageBuffer, slug) {
  const fileName = `${FOLDER}/${Date.now()}-${slug}.png`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, imageBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(`Upload error: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return publicUrl;
}

async function updatePostThumbnail(slug, thumbnailUrl) {
  const { error } = await supabase
    .from('posts')
    .update({ thumbnail: thumbnailUrl })
    .eq('slug', slug);

  if (error) throw new Error(`DB update error: ${error.message}`);
}

async function main() {
  // Lấy tất cả posts scheduled chưa có thumbnail
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, slug, title')
    .eq('status', 'scheduled')
    .is('thumbnail', null)
    .order('published_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch posts:', error);
    return;
  }

  console.log(`Found ${posts.length} posts without thumbnails\n`);

  let success = 0;
  let failed = 0;

  for (const post of posts) {
    const prompt = IMAGE_PROMPTS[post.slug];
    if (!prompt) {
      console.log(`⚠️  No prompt for: ${post.slug} — skipping`);
      continue;
    }

    try {
      console.log(`🎨 [${success + failed + 1}/${posts.length}] Generating: ${post.title.substring(0, 50)}...`);

      // 1. Generate image
      const imageBuffer = await generateImage(prompt);
      console.log(`   ✅ Image generated (${(imageBuffer.length / 1024).toFixed(0)} KB)`);

      // 2. Upload to Supabase Storage
      const publicUrl = await uploadToSupabase(imageBuffer, post.slug);
      console.log(`   ✅ Uploaded: ${publicUrl.substring(publicUrl.lastIndexOf('/') + 1)}`);

      // 3. Update post in database
      await updatePostThumbnail(post.slug, publicUrl);
      console.log(`   ✅ Database updated\n`);

      success++;

      // Rate limit: wait 2s between requests
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}\n`);
      failed++;
      // Wait longer on error
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`\n========================================`);
  console.log(`Done! ✅ ${success} success, ❌ ${failed} failed`);
}

main();
