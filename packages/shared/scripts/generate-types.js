const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

try {
  console.log("Generating types from Supabase Cloud...");
  const output = execSync("npx supabase gen types typescript --linked", {
    maxBuffer: 10 * 1024 * 1024,
  });
  
  const targetPath = path.join(__dirname, "../src/types/database.ts");
  
  // Create parent directory if it doesn't exist
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  
  fs.writeFileSync(targetPath, output);
  console.log("Successfully wrote types to:", targetPath);
} catch (e) {
  console.error("Error generating types:", e);
  process.exit(1);
}
