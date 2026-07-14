import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read env variables
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function run() {
  console.log('Checking storage bucket "product-images"...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    process.exit(1);
  }
  
  const bucketName = 'product-images';
  const bucketExists = buckets.some(b => b.id === bucketName);
  
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  const maxFileSize = 30 * 1024 * 1024; // 30MB
  
  if (bucketExists) {
    console.log(`Bucket "${bucketName}" already exists. Updating configuration...`);
    const { data, error } = await supabase.storage.updateBucket(bucketName, {
      public: true,
      allowedMimeTypes: allowedMimeTypes,
      fileSizeLimit: maxFileSize
    });
    if (error) {
      console.error('Error updating bucket:', error);
      process.exit(1);
    }
    console.log('Bucket configuration updated successfully.');
  } else {
    console.log(`Bucket "${bucketName}" does not exist. Creating it...`);
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: allowedMimeTypes,
      fileSizeLimit: maxFileSize
    });
    if (error) {
      console.error('Error creating bucket:', error);
      process.exit(1);
    }
    console.log('Bucket created successfully.');
  }
  
  console.log('Current buckets:');
  const { data: finalBuckets } = await supabase.storage.listBuckets();
  console.log(finalBuckets);
}

run();
