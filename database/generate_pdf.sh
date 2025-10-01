#!/bin/bash

# CPHVA Connect Database Schema PDF Generator
# This script converts the markdown documentation to PDF format

echo "🔄 Generating PDF documentation for CPHVA Connect Database Schema..."

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "❌ Error: pandoc is not installed."
    echo "Please install pandoc first:"
    echo "  macOS: brew install pandoc"
    echo "  Ubuntu/Debian: sudo apt-get install pandoc"
    echo "  Windows: Download from https://pandoc.org/installing.html"
    exit 1
fi

# Check if wkhtmltopdf is installed (for better PDF formatting)
if ! command -v wkhtmltopdf &> /dev/null; then
    echo "⚠️  Warning: wkhtmltopdf is not installed. Using basic PDF generation."
    echo "For better formatting, install wkhtmltopdf:"
    echo "  macOS: brew install wkhtmltopdf"
    echo "  Ubuntu/Debian: sudo apt-get install wkhtmltopdf"
    echo "  Windows: Download from https://wkhtmltopdf.org/downloads.html"
fi

# Create output directory if it doesn't exist
mkdir -p database/pdf

# Generate PDF with custom styling
echo "📄 Converting markdown to PDF..."

# Create a temporary HTML file with custom CSS
cat > database/temp_style.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 5px;
            margin-top: 30px;
        }
        h3 {
            color: #7f8c8d;
            margin-top: 25px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
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
        }
        pre {
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
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
        @media print {
            body {
                font-size: 12pt;
            }
            h1, h2, h3 {
                page-break-after: avoid;
            }
            table {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
EOF

# Convert markdown to HTML and append to the styled template
pandoc database/SCHEMA_DOCUMENTATION.md \
    --from markdown \
    --to html \
    --standalone \
    --output database/temp_content.html

# Combine the style and content
cat database/temp_style.html database/temp_content.html > database/combined.html

# Generate PDF
if command -v wkhtmltopdf &> /dev/null; then
    echo "🎨 Generating high-quality PDF with custom styling..."
    wkhtmltopdf \
        --page-size A4 \
        --margin-top 20mm \
        --margin-bottom 20mm \
        --margin-left 20mm \
        --margin-right 20mm \
        --header-html database/header.html \
        --footer-html database/footer.html \
        --enable-local-file-access \
        database/combined.html \
        database/pdf/CPHVA_Connect_Database_Schema.pdf
else
    echo "📄 Generating basic PDF..."
    pandoc database/SCHEMA_DOCUMENTATION.md \
        --from markdown \
        --to pdf \
        --output database/pdf/CPHVA_Connect_Database_Schema.pdf \
        --pdf-engine=wkhtmltopdf \
        --variable geometry:margin=1in
fi

# Clean up temporary files
rm -f database/temp_style.html database/temp_content.html database/combined.html

# Check if PDF was created successfully
if [ -f "database/pdf/CPHVA_Connect_Database_Schema.pdf" ]; then
    echo "✅ PDF generated successfully!"
    echo "📁 Location: database/pdf/CPHVA_Connect_Database_Schema.pdf"
    echo "📊 File size: $(du -h database/pdf/CPHVA_Connect_Database_Schema.pdf | cut -f1)"
else
    echo "❌ Error: PDF generation failed."
    echo "Please check the error messages above."
    exit 1
fi

echo "🎉 Database schema documentation PDF is ready!"

