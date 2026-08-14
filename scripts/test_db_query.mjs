/**
 * Smoke test chỉ đọc: kiểm tra app có kết nối được Supabase và thấy dữ liệu không.
 * Chạy: node --env-file=.env.local scripts/test_db_query.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { requireEnv } from './lib/env.mjs';

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching posts:', error);
  } else {
    console.log('Sample Post:', JSON.stringify(posts, null, 2));
  }

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*');

  if (catError) {
    console.error('Error fetching categories:', catError);
  } else {
    console.log('Categories:', JSON.stringify(categories, null, 2));
  }
}

test();
