const { execSync } = require("child_process");
const fs = require("fs/promises");
const path = require("path");
const v8toIstanbul = require("v8-to-istanbul");
const libCoverage = require("istanbul-lib-coverage");
const libReport = require("istanbul-lib-report");
const reports = require("istanbul-reports");

const TEMP_DIR = path.join(process.cwd(), "coverage", "temp");
const OUTPUT_DIR = path.join(process.cwd(), "coverage", "frontend");

async function generateCoverage() {
  try {
    console.log("🧪 Running Playwright tests with coverage...");
    
    // Run tests
    execSync("npx playwright test", { stdio: "inherit" });

    console.log("\n📊 Generating coverage report...");

    // Read all v8 coverage files
    const files = await fs.readdir(TEMP_DIR);
    const coverageFiles = files.filter((f) => f.startsWith("v8-coverage-"));

    if (coverageFiles.length === 0) {
      console.warn("⚠️  No coverage files found!");
      return;
    }

    const map = libCoverage.createCoverageMap({});

    // Process each coverage file
    for (const file of coverageFiles) {
      const filePath = path.join(TEMP_DIR, file);
      const rawCoverage = JSON.parse(await fs.readFile(filePath, "utf8"));

      for (const entry of rawCoverage) {
        // Only process maria-add-book.js
        if (!entry.url.includes("maria-add-book.js")) continue;

        // Convert URL to local file path
        const scriptPath = entry.url.replace(/^.*\/js\//, path.join(process.cwd(), "public", "js") + path.sep);
        
        try {
          const converter = v8toIstanbul(scriptPath, 0, { source: await fs.readFile(scriptPath, "utf8") });
          await converter.load();
          converter.applyCoverage(entry.functions);
          
          const istanbulCoverage = converter.toIstanbul();
          map.merge(istanbulCoverage);
        } catch (err) {
          console.warn(`⚠️  Could not process ${scriptPath}: ${err.message}`);
        }
      }
    }

    // Generate reports
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    const context = libReport.createContext({
      dir: OUTPUT_DIR,
      coverageMap: map,
    });

    const htmlReport = reports.create("html");
    const textReport = reports.create("text");
    
    htmlReport.execute(context);
    textReport.execute(context);

    // Retrieve overall coverage summary data from the coverage map
    const summary = map.getCoverageSummary().data;

    // Define minimum acceptable coverage thresholds for each metric (in percentage)
    const thresholds = {
      lines: 80,       // Minimum 80% of lines must be covered
      statements: 80,  // Minimum 80% of statements must be covered
      functions: 80,   // Minimum 80% of functions must be covered
      branches: 80     // Minimum 80% of branches must be covered
    };

    // Array to store any metrics that do not meet the defined threshold
    let belowThreshold = [];

    // Loop through each coverage metric (lines, statements, functions, branches)
    for (const [metric, threshold] of Object.entries(thresholds)) {
      const covered = summary[metric].pct; // Get the coverage percentage for this metric
      // Check if the actual coverage is below the threshold
      if (covered < threshold) {
        // Add a message to the belowThreshold array for reporting later
        belowThreshold.push(`${metric}: ${covered}% (below ${threshold}%)`);
      }
    }

    // If any metrics fall below the required threshold
    if (belowThreshold.length > 0) {
      console.error('\n❌ Coverage threshold NOT met:');
      // Print each failing metric and its coverage percentage
      belowThreshold.forEach(msg => console.error(`  - ${msg}`));
      // Set exit code to 1 to indicate failure (useful for CI/CD pipelines)
      process.exitCode = 1;
    } else {
      // If all thresholds are met, display a success message
      console.log('\n✅ All coverage thresholds met.');
    }

    // ✅ ADDITIONAL FEATURE #2: Individual File Coverage Breakdown
    console.log('\n📁 Individual File Coverage:');
    const files2 = map.files();
    files2.forEach(file => {
      const fileCoverage = map.fileCoverageFor(file);
      const fileSummary = fileCoverage.toSummary();
      const fileName = path.basename(file);
      
      console.log(`\n  ${fileName}:`);
      console.log(`    Lines: ${fileSummary.lines.pct.toFixed(2)}%`);
      console.log(`    Statements: ${fileSummary.statements.pct.toFixed(2)}%`);
      console.log(`    Functions: ${fileSummary.functions.pct.toFixed(2)}%`);
      console.log(`    Branches: ${fileSummary.branches.pct.toFixed(2)}%`);
    });

    console.log(`\n✅ Coverage report generated at: ${OUTPUT_DIR}/index.html`);
    
    // Print summary
    console.log("\n📈 Overall Coverage Summary:");
    console.log(`  Lines: ${summary.lines.pct.toFixed(2)}%`);
    console.log(`  Statements: ${summary.statements.pct.toFixed(2)}%`);
    console.log(`  Functions: ${summary.functions.pct.toFixed(2)}%`);
    console.log(`  Branches: ${summary.branches.pct.toFixed(2)}%`);

    // Check if coverage meets threshold
    if (summary.lines.pct < 80) {
      console.warn(`\n⚠️  Warning: Line coverage ${summary.lines.pct.toFixed(2)}% is below 80% threshold`);
    }

  } catch (error) {
    console.error("❌ Error generating coverage:", error.message);
    process.exit(1);
  }
}

generateCoverage();