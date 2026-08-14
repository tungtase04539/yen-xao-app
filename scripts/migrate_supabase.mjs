/**
 * Migration: copy schema + dữ liệu từ một project Supabase sang project khác.
 *
 * ⚠️ Script này DROP toàn bộ các bảng liệt kê ở TABLES trên project đích (CASCADE)
 * trước khi dựng lại. Mặc định chạy ở chế độ dry-run: chỉ in ra target và danh sách
 * bảng sắp xoá rồi dừng. Muốn chạy thật phải có ĐỦ hai điều kiện:
 *   1. Cờ --yes trên dòng lệnh
 *   2. Biến MIGRATE_CONFIRM_DROP_REF đúng bằng ref của project đích
 *
 * Chạy thử:  node --env-file=.env.local scripts/migrate_supabase.mjs
 * Chạy thật: MIGRATE_CONFIRM_DROP_REF=<target ref> node --env-file=.env.local scripts/migrate_supabase.mjs --yes
 */

import { requireEnv } from './lib/env.mjs';

const ACCESS_TOKEN = requireEnv('SUPABASE_ACCESS_TOKEN');
const SOURCE_REF = requireEnv('MIGRATE_SOURCE_REF');
const TARGET_REF = requireEnv('MIGRATE_TARGET_REF');
const SOURCE_URL = `https://${SOURCE_REF}.supabase.co`;
const TARGET_URL = `https://${TARGET_REF}.supabase.co`;
const SOURCE_SERVICE_KEY = requireEnv('MIGRATE_SOURCE_SERVICE_KEY');
const TARGET_SERVICE_KEY = requireEnv('MIGRATE_TARGET_SERVICE_KEY');

// Tables in dependency order (parents first)
const TABLES = [
  'categories',
  'products',
  'product_variants',
  'posts',
  'pages',
  'page_sections',
  'section_media',
  'hero_slides',
  'press_videos',
  'videos',
  'certifications',
  'exhibitions',
  'exhibition_images',
  'coupons',
  'orders',
  'order_items',
];

async function runSQL(ref, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`SQL error on ${ref}: ${JSON.stringify(data)}`);
  return data;
}

async function fetchAll(url, key, table) {
  let all = [];
  let from = 0;
  const limit = 1000;
  while (true) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=${limit}&offset=${from}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(await res.text());
    const rows = await res.json();
    all = all.concat(rows);
    if (rows.length < limit) break;
    from += limit;
  }
  return all;
}

async function insertRows(url, key, table, rows) {
  if (!rows.length) return 0;
  const batchSize = 500;
  for (let i = 0; i < rows.length; i += batchSize) {
    const res = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=ignore-duplicates' },
      body: JSON.stringify(rows.slice(i, i + batchSize)),
    });
    if (!res.ok) throw new Error(await res.text());
  }
  return rows.length;
}

async function buildSchema() {
  // Get enums
  const enums = await runSQL(SOURCE_REF, `
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder
  `);

  const enumMap = {};
  for (const r of enums) {
    if (!enumMap[r.typname]) enumMap[r.typname] = [];
    enumMap[r.typname].push(r.enumlabel);
  }

  // Get columns
  const cols = await runSQL(SOURCE_REF, `
    SELECT table_name, column_name, data_type, udt_name, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);

  // Get primary keys
  const pks = await runSQL(SOURCE_REF, `
    SELECT kcu.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
    ORDER BY kcu.table_name, kcu.ordinal_position
  `);

  // Get foreign keys
  const fks = await runSQL(SOURCE_REF, `
    SELECT kcu.table_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column, rc.delete_rule
    FROM information_schema.referential_constraints rc
    JOIN information_schema.key_column_usage kcu ON rc.constraint_name = kcu.constraint_name AND rc.constraint_schema = kcu.constraint_schema
    JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name AND rc.constraint_schema = ccu.constraint_schema
    WHERE kcu.table_schema = 'public'
    ORDER BY kcu.table_name
  `);

  const pkMap = {};
  for (const r of pks) {
    if (!pkMap[r.table_name]) pkMap[r.table_name] = [];
    pkMap[r.table_name].push(r.column_name);
  }

  const fkMap = {};
  for (const r of fks) {
    if (!fkMap[r.table_name]) fkMap[r.table_name] = [];
    fkMap[r.table_name].push(r);
  }

  const tableMap = {};
  for (const col of cols) {
    if (!tableMap[col.table_name]) tableMap[col.table_name] = [];
    tableMap[col.table_name].push(col);
  }

  let sql = '';

  // Create enums
  for (const [name, labels] of Object.entries(enumMap)) {
    sql += `DO $$ BEGIN CREATE TYPE ${name} AS ENUM (${labels.map(l => `'${l}'`).join(', ')}); EXCEPTION WHEN duplicate_object THEN NULL; END $$;\n`;
  }
  sql += '\n';

  // Create tables
  for (const table of TABLES) {
    const tableCols = tableMap[table];
    if (!tableCols) { console.log(`  ⚠️  Table '${table}' not found in source schema, skipping`); continue; }

    const pkCols = pkMap[table] || [];
    const tableFks = fkMap[table] || [];

    const colDefs = tableCols.map(col => {
      let type;
      if (col.data_type === 'USER-DEFINED') type = col.udt_name;
      else if (col.data_type === 'ARRAY') type = col.udt_name.replace(/^_/, '') + '[]';
      else if (col.data_type === 'character varying') type = 'text';
      else type = col.data_type;

      let def = `  "${col.column_name}" ${type}`;
      if (col.column_default) def += ` DEFAULT ${col.column_default}`;
      if (col.is_nullable === 'NO' && !col.column_default) def += ' NOT NULL';
      return def;
    });

    if (pkCols.length) colDefs.push(`  PRIMARY KEY (${pkCols.map(c => `"${c}"`).join(', ')})`);

    for (const fk of tableFks) {
      const onDelete = fk.delete_rule && fk.delete_rule !== 'NO ACTION' ? ` ON DELETE ${fk.delete_rule}` : '';
      colDefs.push(`  FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_table}"("${fk.foreign_column}")${onDelete}`);
    }

    sql += `CREATE TABLE IF NOT EXISTS "${table}" (\n${colDefs.join(',\n')}\n);\n\n`;
  }

  return sql;
}

/**
 * In ra chính xác thứ sắp bị phá huỷ, rồi chỉ cho đi tiếp khi người chạy đã xác nhận
 * bằng CẢ cờ --yes lẫn việc gõ lại ref của project đích vào MIGRATE_CONFIRM_DROP_REF.
 * Trả về false nghĩa là dry-run: dừng lại, không gửi câu SQL nào.
 */
function confirmDestructiveRun() {
  console.log('⚠️  SCRIPT NÀY XOÁ DỮ LIỆU — đọc kỹ trước khi chạy thật.\n');
  console.log(`   Project nguồn : ${SOURCE_REF}`);
  console.log(`   Project ĐÍCH  : ${TARGET_REF}  ← toàn bộ bảng dưới đây sẽ bị DROP CASCADE`);
  console.log(`   Số bảng bị xoá: ${TABLES.length}`);
  for (const t of TABLES.slice().reverse()) console.log(`     - ${t}`);
  console.log('   Kèm theo các enum: category_type, discount_type, order_status, payment_method, payment_status');
  console.log('   Không có bước backup nào trong script. Hãy tự backup / bật PITR trước.\n');

  if (!process.argv.includes('--yes')) {
    console.log('🔍 Đang ở chế độ DRY-RUN, chưa gửi câu lệnh nào lên Supabase.');
    console.log('   Muốn chạy thật:');
    console.log(`   MIGRATE_CONFIRM_DROP_REF=${TARGET_REF} node --env-file=.env.local scripts/migrate_supabase.mjs --yes`);
    return false;
  }

  const confirmed = process.env.MIGRATE_CONFIRM_DROP_REF;
  if (confirmed !== TARGET_REF) {
    console.error('❌ Đã có --yes nhưng MIGRATE_CONFIRM_DROP_REF không khớp ref của project đích.');
    console.error(`   Cần đặt MIGRATE_CONFIRM_DROP_REF=${TARGET_REF}`);
    process.exit(1);
  }

  return true;
}

async function main() {
  console.log(`🚀 Supabase Migration: ${SOURCE_REF} → ${TARGET_REF}\n`);

  if (!confirmDestructiveRun()) return;

  // Step 1: Drop old yen-xao tables in target if they exist (clean re-run)
  console.log('📋 Step 1: Dropping any previous yen-xao tables in target...');
  const dropSQL = TABLES.slice().reverse().map(t => `DROP TABLE IF EXISTS "${t}" CASCADE;`).join('\n');
  await runSQL(TARGET_REF, dropSQL);
  // Also drop enums
  await runSQL(TARGET_REF, `
    DO $$ BEGIN DROP TYPE IF EXISTS category_type CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
    DO $$ BEGIN DROP TYPE IF EXISTS discount_type CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
    DO $$ BEGIN DROP TYPE IF EXISTS order_status CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
    DO $$ BEGIN DROP TYPE IF EXISTS payment_method CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
    DO $$ BEGIN DROP TYPE IF EXISTS payment_status CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
  `);
  console.log('  ✅ Cleaned');

  // Step 2: Build and apply schema from source
  console.log('\n📋 Step 2: Reading exact schema from source and applying to target...');
  const schemaSql = await buildSchema();
  await runSQL(TARGET_REF, schemaSql);
  console.log('  ✅ Schema applied');

  // Step 3: Migrate data
  console.log('\n📋 Step 3: Migrating data...');
  for (const table of TABLES) {
    process.stdout.write(`  ${table}: `);
    let rows;
    try {
      rows = await fetchAll(SOURCE_URL, SOURCE_SERVICE_KEY, table);
    } catch (e) {
      console.log(`⚠️  fetch error: ${e.message.slice(0, 120)}`);
      continue;
    }
    if (!rows.length) { console.log('0 rows'); continue; }
    try {
      await insertRows(TARGET_URL, TARGET_SERVICE_KEY, table, rows);
      console.log(`✅ ${rows.length} rows`);
    } catch (e) {
      console.log(`❌ insert error: ${e.message.slice(0, 200)}`);
    }
  }

  // Step 4: Auth users
  console.log('\n📋 Step 4: Auth users in source...');
  const authRes = await fetch(`https://api.supabase.com/v1/projects/${SOURCE_REF}/auth/users?page=1&per_page=50`, {
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
  });
  if (authRes.ok) {
    const { users } = await authRes.json();
    if (users?.length) {
      console.log(`  Found ${users.length} user(s):`);
      users.forEach(u => console.log(`    - ${u.email} (${u.role || 'user'})`));
      console.log('  ⚠️  Recreate in target: Dashboard → Authentication → Users → Add user');
    }
  }

  // Step 5: Print new env vars
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Migration complete! Update .env.local:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`NEXT_PUBLIC_SUPABASE_URL=https://${TARGET_REF}.supabase.co`);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=<lấy ở Dashboard → Settings → API → anon public>');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
