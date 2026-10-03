const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  const k = parts[0];
  const v = parts.slice(1).join('=');
  if (k && v) env[k] = v.replace(/^["']|["']$/g, '');
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://erbvmpnxufgeinqnshzu.supabase.co';
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const sb = createClient(url, key);

async function run() {
  console.log('--- 1. Querying raw RPCs on Supabase ---');
  
  // 1. Visitors analytics
  const { data: visData, error: visErr } = await sb.rpc('ops_get_visitors_analytics', {
    p_period_days: 30,
    p_operator_id: '7f7f704e-d9f1-4edf-9952-591f41fc0c55'
  });
  console.log('ops_get_visitors_analytics error:', visErr);
  if (visData) {
    console.log('Visitors KPIs:', JSON.stringify(visData.kpis));
    console.log('Recent activity count:', visData.recentActivity ? visData.recentActivity.length : 0);
    if (visData.recentActivity && visData.recentActivity.length > 0) {
      console.log('Recent 5 hits:', JSON.stringify(visData.recentActivity.slice(0, 5), null, 2));
    }
  }

  // 2. Student analytics
  const { data: stuData, error: stuErr } = await sb.rpc('ops_get_student_analytics', {
    p_period_days: 30,
    p_operator_id: '7f7f704e-d9f1-4edf-9952-591f41fc0c55'
  });
  console.log('ops_get_student_analytics error:', stuErr);
  if (stuData) {
    console.log('Student KPIs:', JSON.stringify(stuData.kpis));
  }

  // 3. Conversion funnel
  const { data: funData, error: funErr } = await sb.rpc('ops_get_conversion_funnel', {
    p_start_date: new Date(Date.now() - 30*86400000).toISOString(),
    p_end_date: new Date().toISOString(),
    p_operator_id: '7f7f704e-d9f1-4edf-9952-591f41fc0c55'
  });
  console.log('ops_get_conversion_funnel error:', funErr);
  if (funData) {
    console.log('Funnel stages:', JSON.stringify(funData.stages));
  }
}

run().catch(console.error);
