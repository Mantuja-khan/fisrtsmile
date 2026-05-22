import fs from "fs";
import path from "path";

const srcDir =
  "C:\\Users\\NUR MIYAN\\.gemini\\antigravity\\brain\\268157ab-b26b-498b-a245-f033b767bf49";
const destDir = "c:\\Users\\NUR MIYAN\\Downloads\\firstsmile\\firstsmile\\public\\ages";

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = [
  { src: "age_0_1_year_1778576271585.png", dest: "age_0_1.png" },
  { src: "age_2_3_year_1778576292983.png", dest: "age_2_3.png" },
  { src: "age_3_5_year_1778576312683.png", dest: "age_3_5.png" },
  { src: "age_5_13_year_1778576333478.png", dest: "age_5_13.png" },
];

files.forEach((f) => {
  try {
    fs.copyFileSync(path.join(srcDir, f.src), path.join(destDir, f.dest));
    console.log(`Copied ${f.dest}`);
  } catch (e) {
    console.error(`Failed to copy ${f.src}:`, e.message);
  }
});
