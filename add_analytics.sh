#!/bin/bash

# Find all HTML files and add Vercel Analytics script to the <head> section
find . -name "*.html" -type f | while read file; do
    # Check if the file already contains the Vercel Analytics script
    if grep -q "vercel-insights.com" "$file"; then
        echo "Skipping $file (already has analytics)"
        continue
    fi
    
    # Check if file has a </head> tag
    if grep -q "</head>" "$file"; then
        # Add the script before </head>
        sed -i 's|</head>|    <script defer src="https://cdn.vercel-insights.com/v1/script.js"></script>\n</head>|' "$file"
        echo "Added analytics to $file"
    else
        echo "Warning: $file doesn't have a </head> tag"
    fi
done

echo "Done!"
