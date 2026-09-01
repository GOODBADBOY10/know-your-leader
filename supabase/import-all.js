// Merges every state file in states/ into one dataset and imports it into Supabase.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node import-all.js states
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node import-all.js states --only-verified
//
// Each teammate edits their own states/<state>.json — no merge conflicts, since
// files never overlap. This script reads all of them, combines the arrays, and
// runs the same upsert logic as import.js. Safe to re-run anytime.
//
// --only-verified skips any file whose "_status" isn't "verified" — use this
// for the public-safe import so half-finished states never go live.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const statesDir = process.argv[2];
const onlyVerified = process.argv.includes('--only-verified');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}
if (!statesDir) {
  console.error('Usage: node import-all.js <states-directory> [--only-verified]');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function fail(step, error) {
  console.error(`\n✗ Failed during: ${step}`);
  console.error(error);
  process.exit(1);
}

function loadAndMerge() {
  const files = readdirSync(statesDir).filter(
    f => f.endsWith('.json') && !f.startsWith('_') // skip _TEMPLATE.json
  );

  const merged = {
    senatorialDistricts: [],
    federalConstituencies: [],
    stateConstituencies: [],
    lgas: [],
    officeholders: [],
  };

  const skipped = [];
  const included = [];

  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(statesDir, file), 'utf8'));
    const status = raw._status || 'unknown';

    if (onlyVerified && status !== 'verified') {
      skipped.push(`${file} (status: ${status})`);
      continue;
    }

    included.push(`${file} (status: ${status})`);
    merged.senatorialDistricts.push(...(raw.senatorialDistricts || []));
    merged.federalConstituencies.push(...(raw.federalConstituencies || []));
    merged.stateConstituencies.push(...(raw.stateConstituencies || []));
    merged.lgas.push(...(raw.lgas || []));
    merged.officeholders.push(...(raw.officeholders || []));
  }

  console.log(`Included ${included.length} file(s):`);
  included.forEach(f => console.log(`  ✓ ${f}`));
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length} file(s) (not verified):`);
    skipped.forEach(f => console.log(`  – ${f}`));
  }
  console.log();

  return merged;
}

async function main() {
  const data = loadAndMerge();

  // ---------- states (already seeded by schema.sql — just load the id map) ----------
  const { data: stateRows, error: stateErr } = await supabase.from('states').select('id, name');
  if (stateErr) return fail('loading states', stateErr);
  const stateId = Object.fromEntries(stateRows.map(s => [s.name, s.id]));

  const requireState = (name) => {
    const id = stateId[name];
    if (!id) throw new Error(`Unknown state "${name}" — check spelling matches schema.sql exactly.`);
    return id;
  };

  // ---------- senatorial districts ----------
  const senDistrictId = {};
  for (const d of data.senatorialDistricts) {
    const { data: row, error } = await supabase
      .from('senatorial_districts')
      .upsert({ state_id: requireState(d.state), name: d.name }, { onConflict: 'state_id,name' })
      .select('id')
      .single();
    if (error) return fail(`senatorial_district ${d.state}/${d.name}`, error);
    senDistrictId[`${d.state}|${d.name}`] = row.id;
  }
  console.log(`✓ Senatorial districts: ${data.senatorialDistricts.length}`);

  // ---------- federal constituencies ----------
  const fedConstId = {};
  for (const c of data.federalConstituencies) {
    const { data: row, error } = await supabase
      .from('federal_constituencies')
      .upsert({ state_id: requireState(c.state), name: c.name }, { onConflict: 'state_id,name' })
      .select('id')
      .single();
    if (error) return fail(`federal_constituency ${c.state}/${c.name}`, error);
    fedConstId[`${c.state}|${c.name}`] = row.id;
  }
  console.log(`✓ Federal constituencies: ${data.federalConstituencies.length}`);

  // ---------- state constituencies ----------
  const stateConstId = {};
  for (const c of data.stateConstituencies) {
    const { data: row, error } = await supabase
      .from('state_constituencies')
      .upsert({ state_id: requireState(c.state), name: c.name }, { onConflict: 'state_id,name' })
      .select('id')
      .single();
    if (error) return fail(`state_constituency ${c.state}/${c.name}`, error);
    stateConstId[`${c.state}|${c.name}`] = row.id;
  }
  console.log(`✓ State constituencies: ${data.stateConstituencies.length}`);

  // ---------- LGAs ----------
  const lgaId = {};
  for (const l of data.lgas) {
    const row = {
      state_id: requireState(l.state),
      name: l.name,
      senatorial_district_id: l.senatorialDistrict ? senDistrictId[`${l.state}|${l.senatorialDistrict}`] : null,
      federal_constituency_id: l.federalConstituency ? fedConstId[`${l.state}|${l.federalConstituency}`] : null,
      state_constituency_id: l.stateConstituency ? stateConstId[`${l.state}|${l.stateConstituency}`] : null,
    };
    const { data: inserted, error } = await supabase
      .from('lgas')
      .upsert(row, { onConflict: 'state_id,name' })
      .select('id')
      .single();
    if (error) return fail(`lga ${l.state}/${l.name}`, error);
    lgaId[`${l.state}|${l.name}`] = inserted.id;
  }
  console.log(`✓ LGAs: ${data.lgas.length}`);

  // ---------- offices (static, loaded not created) ----------
  const { data: officeRows, error: officeErr } = await supabase.from('offices').select('id, code');
  if (officeErr) return fail('loading offices', officeErr);
  const officeId = Object.fromEntries(officeRows.map(o => [o.code, o.id]));

  // ---------- officeholders ----------
  let count = 0;
  for (const oh of data.officeholders) {
    const office = officeId[oh.office];
    if (!office) return fail('officeholder office code', new Error(`Unknown office code "${oh.office}"`));

    const row = {
      office_id: office,
      name: oh.name,
      party: oh.party || null,
      term_start: oh.termStart || null,
      term_end: oh.termEnd || null,
      photo_url: oh.photoUrl || null,
      source: oh.source || 'manual',
      state_id: null,
      lga_id: null,
      senatorial_district_id: null,
      federal_constituency_id: null,
      state_constituency_id: null,
      external_key: null,
    };

    switch (oh.office) {
      case 'PRES':
        row.external_key = 'PRES';
        break;
      case 'SPRES':
        row.external_key = 'SPRES';
        break;
      case 'SPEAK':
        row.external_key = 'SPEAK';
        break;
      case 'GOV':
        row.state_id = requireState(oh.state);
        row.external_key = `GOV|${oh.state}`;
        break;
      case 'SEN':
        row.senatorial_district_id = senDistrictId[`${oh.state}|${oh.senatorialDistrict}`];
        if (!row.senatorial_district_id) throw new Error(`Unknown senatorial district for SEN "${oh.name}"`);
        row.external_key = `SEN|${oh.state}|${oh.senatorialDistrict}`;
        break;
      case 'REP':
        row.federal_constituency_id = fedConstId[`${oh.state}|${oh.federalConstituency}`];
        if (!row.federal_constituency_id) throw new Error(`Unknown federal constituency for REP "${oh.name}"`);
        row.external_key = `REP|${oh.state}|${oh.federalConstituency}`;
        break;
      case 'HOA':
        row.state_constituency_id = stateConstId[`${oh.state}|${oh.stateConstituency}`];
        if (!row.state_constituency_id) throw new Error(`Unknown state constituency for HOA "${oh.name}"`);
        row.external_key = `HOA|${oh.state}|${oh.stateConstituency}`;
        break;
      case 'CHM':
        row.lga_id = lgaId[`${oh.state}|${oh.lga}`];
        if (!row.lga_id) throw new Error(`Unknown LGA for CHM "${oh.name}"`);
        row.external_key = `CHM|${oh.state}|${oh.lga}`;
        break;
    }

    const { error } = await supabase.from('officeholders').upsert(row, { onConflict: 'external_key' });
    if (error) return fail(`officeholder ${oh.name} (${oh.office})`, error);
    count++;
  }
  console.log(`✓ Officeholders: ${count}`);

  console.log('\nDone. Data is live in Supabase.');
}

main();