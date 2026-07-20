if (
  process.env.CI ||
  process.env.VERCEL ||
  process.env.NODE_ENV === "production"
) {
  console.log("Skipping Husky on CI");
  process.exit(0);
}

try {
  require("child_process").execSync("npx husky install", {
    stdio: "inherit",
  });
} catch {
  console.log("Husky not installed");
}
