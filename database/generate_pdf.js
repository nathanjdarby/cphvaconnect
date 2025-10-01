#!/usr/bin/env node

/**
 * CPHVA Connect Database Schema PDF Generator
 * Node.js alternative to the bash script for generating PDF documentation
 */

const fs = require("fs");
const path = require("path");

// Check if required packages are installed
function checkDependencies() {
  const requiredPackages = ["puppeteer", "marked"];
  const missingPackages = [];

  for (const pkg of requiredPackages) {
    try {
      require.resolve(pkg);
    } catch (e) {
      missingPackages.push(pkg);
    }
  }

  if (missingPackages.length > 0) {
    console.log("❌ Missing required packages:");
    missingPackages.forEach((pkg) => console.log(`  - ${pkg}`));
    console.log("\n📦 Install them with:");
    console.log(`  npm install ${missingPackages.join(" ")}`);
    return false;
  }

  return true;
}

async function generatePDF() {
  console.log(
    "🔄 Generating PDF documentation for CPHVA Connect Database Schema..."
  );

  if (!checkDependencies()) {
    process.exit(1);
  }

  try {
    const puppeteer = require("puppeteer");
    const { marked } = require("marked");

    // Read the markdown file
    const markdownPath = path.join(__dirname, "SCHEMA_DOCUMENTATION.md");
    if (!fs.existsSync(markdownPath)) {
      console.log("❌ Error: SCHEMA_DOCUMENTATION.md not found");
      process.exit(1);
    }

    const markdownContent = fs.readFileSync(markdownPath, "utf8");

    // Convert markdown to HTML
    const htmlContent = marked(markdownContent);

    // Create the full HTML document with styling
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CPHVA Connect Database Schema Documentation</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 0;
            font-size: 12pt;
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            font-size: 24pt;
            margin-top: 0;
        }
        
        h2 {
            color: #34495e;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 5px;
            margin-top: 30px;
            font-size: 18pt;
            page-break-after: avoid;
        }
        
        h3 {
            color: #7f8c8d;
            margin-top: 25px;
            font-size: 14pt;
            page-break-after: avoid;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            font-size: 10pt;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        code {
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 10pt;
        }
        
        pre {
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
            font-size: 10pt;
            page-break-inside: avoid;
        }
        
        pre code {
            background-color: transparent;
            padding: 0;
        }
        
        .highlight {
            background-color: #fff3cd;
            padding: 10px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
        }
        
        .info-box {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .warning-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .success-box {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 30px 0;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 5px 0;
        }
        
        blockquote {
            border-left: 4px solid #3498db;
            margin: 20px 0;
            padding-left: 20px;
            font-style: italic;
            color: #7f8c8d;
        }
        
        .toc {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .toc h2 {
            margin-top: 0;
            border-bottom: none;
        }
        
        .toc ul {
            list-style-type: none;
            padding-left: 0;
        }
        
        .toc li {
            margin: 5px 0;
        }
        
        .toc a {
            text-decoration: none;
            color: #007bff;
        }
        
        .toc a:hover {
            text-decoration: underline;
        }
        
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50px;
            background-color: #f8f9fa;
            border-top: 1px solid #dee2e6;
            text-align: center;
            padding: 15px;
            font-size: 10pt;
            color: #6c757d;
        }
        
        .content {
            margin-bottom: 70px;
        }
    </style>
</head>
<body>
    <div class="content">
        ${htmlContent}
    </div>
    
    <div class="footer">
        CPHVA Connect Database Schema Documentation | Generated on ${new Date().toLocaleDateString()} | Page <span class="pageNumber"></span>
    </div>
</body>
</html>`;

    // Create output directory
    const outputDir = path.join(__dirname, "pdf");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(
      outputDir,
      "CPHVA_Connect_Database_Schema.pdf"
    );

    // Launch browser and generate PDF
    console.log("🌐 Launching browser...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set content and wait for rendering
    await page.setContent(fullHTML, { waitUntil: "networkidle0" });

    console.log("📄 Generating PDF...");
    await page.pdf({
      path: outputPath,
      format: "A4",
      margin: {
        top: "2cm",
        right: "2cm",
        bottom: "3cm",
        left: "2cm",
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
                <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
                    CPHVA Connect Database Schema Documentation | Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                </div>
            `,
    });

    await browser.close();

    // Check if PDF was created successfully
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log("✅ PDF generated successfully!");
      console.log(`📁 Location: ${outputPath}`);
      console.log(`📊 File size: ${fileSizeInMB} MB`);
      console.log("🎉 Database schema documentation PDF is ready!");
    } else {
      console.log("❌ Error: PDF file was not created");
      process.exit(1);
    }
  } catch (error) {
    console.log("❌ Error generating PDF:", error.message);
    process.exit(1);
  }
}

// Run the PDF generation
generatePDF();

