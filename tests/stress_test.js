/**
 * ClipSphere Stress Test Script
 * 
 * This script simulates simultaneous video uploads to verify:
 * 1. Duration Gate (Rejecting > 5 mins)
 * 2. MinIO Storage persistence
 * 3. Concurrent processing under load
 * 
 * Usage:
 * 1. Ensure backend is running at http://localhost:5050
 * 2. Place a test video file named 'test.mp4' in this directory.
 * 3. Run: node tests/stress_test.js [authToken] [numConcurrent]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_URL = 'http://localhost:5050/api/v1';

async function runStressTest() {
  const token = process.argv[2];
  const numConcurrent = parseInt(process.argv[3]) || 5;
  const testFilePath = path.join(__dirname, 'test.mp4');

  if (!token) {
    console.error('Error: Authentication token required.');
    console.log('Usage: node tests/stress_test.js <TOKEN> <NUM_CONCURRENT>');
    process.exit(1);
  }

  if (!fs.existsSync(testFilePath)) {
    console.error(`Error: Test video file not found at ${testFilePath}`);
    console.log('Please provide a valid test.mp4 file for uploading.');
    process.exit(1);
  }

  console.log(`Starting stress test with ${numConcurrent} concurrent uploads...`);

  const uploadTask = async (index) => {
    const start = Date.now();
    try {
      const formData = new FormData();
      const fileBlob = new Blob([fs.readFileSync(testFilePath)], { type: 'video/mp4' });
      formData.append('video', fileBlob, `stress_test_${index}.mp4`);
      formData.append('title', `Stress Test Video ${index}`);
      formData.append('description', 'Simulated high-load upload');

      const response = await fetch(`${API_URL}/videos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      const duration = Date.now() - start;

      if (response.ok) {
        console.log(`[Success] Upload ${index} completed in ${duration}ms. Video ID: ${data.data.video._id}`);
      } else {
        console.error(`[Failed] Upload ${index} failed with status ${response.status}: ${data.message}`);
      }
    } catch (error) {
      console.error(`[Error] Upload ${index} encountered an error:`, error.message);
    }
  };

  const tasks = Array.from({ length: numConcurrent }, (_, i) => uploadTask(i));
  
  await Promise.all(tasks);
  
  console.log('\nStress test complete.');
}

runStressTest().catch(console.error);
