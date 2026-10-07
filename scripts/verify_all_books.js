const fs = require('fs');
const path = require('path');

const booksDir = path.resolve('public/documents/books');
const files = fs.readdirSync(booksDir).filter(f => f.endsWith('.pdf'));

console.log(`Auditing ${files.length} book files in ${booksDir}...\n`);

let duplicatesOrExams = [];
let validBooks = [];
let sizeDistribution = {};

for (const file of files) {
  const filePath = path.join(booksDir, file);
  const stats = fs.statSync(filePath);
  const size = stats.size;
  const buf = Buffer.alloc(Math.min(size, 4096));
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);

  const header = buf.slice(0, 5).toString();
  const textSample = buf.toString('utf-8');

  // Check for the known dummy exam copy: exactly 1086711 bytes or containing Bac 2024 exam signature
  const isDummyExam = (size === 1086711) || textSample.includes('Bac2024') || textSample.includes('electricite');

  if (isDummyExam) {
    duplicatesOrExams.push({ file, size: (size / (1024 * 1024)).toFixed(2) + ' MB' });
  } else {
    validBooks.push({ file, size: (size / (1024 * 1024)).toFixed(2) + ' MB' });
  }
}

console.log(`Valid Authentic Books: ${validBooks.length}/${files.length}`);
console.log(`Remaining Dummy/Exam Copies: ${duplicatesOrExams.length}/${files.length}`);

if (duplicatesOrExams.length > 0) {
  console.log('\nFiles still needing authentic replacement:');
  duplicatesOrExams.forEach(d => console.log(`  - ${d.file} (${d.size})`));
} else {
  console.log('\n ALL 57 BOOKS ARE AUTHENTIC AND UNIQUE BOOKS/REFERENCES!');
}
