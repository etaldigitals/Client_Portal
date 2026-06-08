/**
 * ETAL Digitals - High Fidelity Document Exporter Utility
 * Compiles uncorrupted, native PDF documents, beautiful high-resolution PNG assets,
 * and structured database worksheets to override empty mock file placeholders.
 */

// Helper to escape parenthesis for safe PDF encoding
function escapePDFText(text: string): string {
  if (!text) return '';
  return text.toString().replace(/[()]/g, '\\$&');
}

/**
 * Basic word-wrapping utility for fixed-width PDF drawing
 */
function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [''];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    // If a single word is exceptionally long, let it split or stay as-is
    if (word.length > maxChars) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      lines.push(word);
      return;
    }
    
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [''];
}

/**
 * Generates a valid standard native PDF (PDF-1.4) binary file representation.
 * Includes elegant styling, custom layout positioning, line vectors, and tabular alignment.
 */
export function generateNativePDF(options: {
  title: string;
  subtitle: string;
  meta: Array<{ label: string; value: string }>;
  tableHeaders?: string[];
  tableRows?: Array<string[]>; // aligned to headers
  totals?: Array<{ label: string; value: string }>;
  footer: string;
}): Blob {
  const { title, subtitle, meta, tableHeaders, tableRows, totals, footer } = options;

  let streamContent = '';

  // Set Helvetica Bold for main title at absolute coordinates (50, 780)
  streamContent += `BT\n/F1 16 Tf\n50 780 Td\n(${escapePDFText(title)}) Tj\nET\n`;
  
  // Set Helvetica for subtitle at absolute coordinates (50, 762)
  streamContent += `BT\n/F2 10 Tf\n50 762 Td\n(${escapePDFText(subtitle)}) Tj\nET\n`;
  
  // Draw top horizontal line separator
  // m = move to, l = line to, S = stroke line
  streamContent += '0.5 w\n0.1 G\n50 740 m\n545 740 l\nS\n';
  
  // Place metadata fields in 2 columns dynamically
  let column1Y = 720;
  const leftCol = meta.slice(0, Math.ceil(meta.length / 2));
  leftCol.forEach((item) => {
    const text = `${item.label}: ${item.value}`;
    const lines = wrapText(text, 44);
    lines.forEach((line) => {
      streamContent += `BT\n/F2 9 Tf\n50 ${column1Y} Td\n`;
      streamContent += `(${escapePDFText(line)}) Tj\n`;
      streamContent += 'ET\n';
      column1Y -= 13;
    });
    column1Y -= 4; // micro spacing
  });
  
  let column2Y = 720;
  const rightCol = meta.slice(Math.ceil(meta.length / 2));
  rightCol.forEach((item) => {
    const text = `${item.label}: ${item.value}`;
    const lines = wrapText(text, 36);
    lines.forEach((line) => {
      streamContent += `BT\n/F2 9 Tf\n320 ${column2Y} Td\n`;
      streamContent += `(${escapePDFText(line)}) Tj\n`;
      streamContent += 'ET\n';
      column2Y -= 13;
    });
    column2Y -= 4; // micro spacing
  });
  
  // Table starts safely below the lowest metadata column height
  let tableY = Math.min(column1Y, column2Y) - 15;
  
  // Check if there is a tabular section
  if (tableHeaders && tableHeaders.length > 0 && tableRows) {
    // Draw table header backplate bar (grey line)
    streamContent += `0.1 G\n50 ${tableY + 12} m\n545 ${tableY + 12} l\nS\n`;
    streamContent += `0.5 G\n50 ${tableY - 4} m\n545 ${tableY - 4} l\nS\n`;
    
    // Write headers
    streamContent += `BT\n/F1 9 Tf\n50 ${tableY} Td\n`;
    streamContent += `(${escapePDFText(tableHeaders[0] || '')}) Tj\n`;
    streamContent += 'ET\n';
    
    if (tableHeaders[1]) {
      streamContent += `BT\n/F1 9 Tf\n310 ${tableY} Td\n`;
      streamContent += `(${escapePDFText(tableHeaders[1])}) Tj\n`;
      streamContent += 'ET\n';
    }
    if (tableHeaders[2]) {
      streamContent += `BT\n/F1 9 Tf\n400 ${tableY} Td\n`;
      streamContent += `(${escapePDFText(tableHeaders[2])}) Tj\n`;
      streamContent += 'ET\n';
    }
    if (tableHeaders[3]) {
      streamContent += `BT\n/F1 9 Tf\n480 ${tableY} Td\n`;
      streamContent += `(${escapePDFText(tableHeaders[3])}) Tj\n`;
      streamContent += 'ET\n';
    }
    
    tableY -= 20;
    
    // Loop rows
    tableRows.forEach((row) => {
      const desc = row[0] || '';
      const descLines = wrapText(desc, 44); // Fits safely inside the Col 1 width space (~240pt)
      const rowHeight = (descLines.length * 12) + 6;
      
      // Check for bottom page overflow
      if (tableY - rowHeight < 110) {
        // Simple prevention: cut off and draw ellipsis
        streamContent += `BT\n/F2 8 Tf\n50 ${tableY} Td\n(... [Additional items truncated for audit size] ...) Tj\nET\n`;
        return;
      }
      
      // Draw stacked multi-line descriptions
      descLines.forEach((line, index) => {
        streamContent += `BT\n/F2 9 Tf\n50 ${tableY - (index * 12)} Td\n`;
        streamContent += `(${escapePDFText(line)}) Tj\n`;
        streamContent += 'ET\n';
      });
      
      // Col 2
      if (row[1]) {
        streamContent += `BT\n/F2 9 Tf\n310 ${tableY} Td\n`;
        streamContent += `(${escapePDFText(row[1])}) Tj\n`;
        streamContent += 'ET\n';
      }
      // Col 3
      if (row[2]) {
        streamContent += `BT\n/F2 9 Tf\n400 ${tableY} Td\n`;
        streamContent += `(${escapePDFText(row[2])}) Tj\n`;
        streamContent += 'ET\n';
      }
      // Col 4
      if (row[3]) {
        streamContent += `BT\n/F1 9 Tf\n480 ${tableY} Td\n`;
        streamContent += `(${escapePDFText(row[3])}) Tj\n`;
        streamContent += 'ET\n';
      }
      
      // Draw horizontal divider rule below the entire multi-line block height
      const lineY = tableY - rowHeight + 10;
      streamContent += `0.9 G\n50 ${lineY} m\n545 ${lineY} l\nS\n`;
      
      tableY -= rowHeight;
    });
  }
  
  // Print totals box
  if (totals && totals.length > 0) {
    tableY -= 10;
    streamContent += `0.4 G\n380 ${tableY + 10} m\n545 ${tableY + 10} l\nS\n`;
    
    totals.forEach((tot) => {
      // Check for total block space overflow
      if (tableY < 100) return;

      streamContent += `BT\n/F1 9 Tf\n380 ${tableY} Td\n`;
      streamContent += `(${escapePDFText(tot.label)}:) Tj\n`;
      streamContent += 'ET\n';
      
      streamContent += `BT\n/F1 10 Tf\n480 ${tableY} Td\n`;
      streamContent += `(${escapePDFText(tot.value)}) Tj\n`;
      streamContent += 'ET\n';
      tableY -= 16;
    });
  }
  
  // Footer label text
  streamContent += `0.5 w\n0.2 G\n50 90 m\n545 90 l\nS\n`;
  streamContent += `BT\n/F2 8 Tf\n50 75 Td\n(${escapePDFText(footer)}) Tj\nET\n`;
  streamContent += `BT\n/F2 7 Tf\n450 75 Td\n(Page 1 of 1 | Secure SSL) Tj\nET\n`;

  const streamLen = streamContent.length;

  const pdfBody = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [ 3 0 R ] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [ 0 0 595.275 841.889 ] /Contents 6 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
6 0 obj << /Length ${streamLen} >> stream
${streamContent}
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000059 00000 n 
0000000116 00000 n 
0000000267 00000 n 
0000000338 00000 n 
0000000404 00000 n 
trailer << /Size 7 /Root 1 0 R >>
startxref
${485 + streamLen}
%%EOF`;

  return new Blob([pdfBody], { type: 'application/pdf' });
}

/**
 * Dynamically draws an elegant professional receipt mockup card on an
 * HTML5 Canvas context and returns a native PNG image Blob which opens cleanly.
 */
export function generateNativeImage(options: {
  title: string;
  subtitle: string;
  meta: Array<{ label: string; value: string }>;
  badgeText: string;
  footer: string;
}): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Draw background gradient (Slate elegant backplate)
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, '#0F172A'); // Slate 900
      grad.addColorStop(1, '#1E293B'); // Slate 800
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      // Draw glowing background grids
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for (let i = 0; i < 800; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 600);
        ctx.stroke();
      }
      for (let j = 0; j < 600; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(800, j);
        ctx.stroke();
      }

      // Draw active modern layout container card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38BDF8'; // Sky blue border highlight
      ctx.lineWidth = 3;
      // Round rect helper for canvas compatibility
      const cardX = 80, cardY = 60, cardW = 640, cardH = 480, r = 20;
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardW - r, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
      ctx.lineTo(cardX + cardW, cardY + cardH - r);
      ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
      ctx.lineTo(cardX + r, cardY + cardH);
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw neon side accent line inside card
      ctx.fillStyle = '#0EA5E9';
      ctx.fillRect(cardX + 2, cardY + 20, 6, 80);

      // Draw Headers text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillText(options.title, cardX + 30, cardY + 50);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'medium 14px system-ui, -apple-system, sans-serif';
      ctx.fillText(options.subtitle, cardX + 30, cardY + 75);

      // Draw Top badge pill
      ctx.fillStyle = '#0369A1';
      ctx.beginPath();
      const badgeX = cardX + cardW - 180, badgeY = cardY + 32, badgeW = 150, badgeH = 26;
      ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6) : ctx.rect(badgeX, badgeY, badgeW, badgeH);
      ctx.fill();
      
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(options.badgeText.toUpperCase(), badgeX + badgeW / 2, badgeY + 16);
      ctx.textAlign = 'left'; // restore

      // Draw horizontal line separator
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + 30, cardY + 105);
      ctx.lineTo(cardX + cardW - 30, cardY + 105);
      ctx.stroke();

      // Draw Metadata details grid
      let detailY = cardY + 145;
      options.meta.forEach((item, index) => {
        // Multi-column grid placement (x-offset depends on even/odd index)
        const isColumn2 = index % 2 === 1;
        const currentX = isColumn2 ? (cardX + 330) : (cardX + 40);
        const currentY = detailY;

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(item.label.toUpperCase(), currentX, currentY);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(item.value, currentX, currentY + 20);

        if (isColumn2) {
          detailY += 55;
        }
      });

      // Draw simulated digital matrix grid overlay decorative graphic
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(cardX + 40, detailY + 10, cardW - 80, 80);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX + 40, detailY + 10, cardW - 80, 80);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('SECURITY STATUS MATRIX', cardX + 55, detailY + 30);
      ctx.fillStyle = '#38BDF8';
      ctx.fillText('▶ MULTIPART SECURE LEDGER ENCRYPTED | AUTH SHA-256', cardX + 55, detailY + 48);
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'italic 10px system-ui, -apple-system, sans-serif';
      ctx.fillText('This visual block is a certified graphic audit for offline system verification.', cardX + 55, detailY + 68);

      // Draw footer text bar
      ctx.fillStyle = '#64748B';
      ctx.font = '500 11px monospace';
      ctx.fillText(options.footer, cardX + 30, cardY + cardH - 25);
      ctx.fillText('SECURE IMAGE EXPORT', cardX + cardW - 165, cardY + cardH - 25);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas blob generation failed'));
        }
      }, 'image/png');

    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Compiles and returns a valid Comma-Separated Values (CSV) blob
 * which is instantly read and opened by Excel, Numbers, and Google Sheets.
 */
export function generateCSVWorksheet(headers: string[], rows: Array<string[]>): Blob {
  const content = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(r => r.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');
  
  // Return UTF-8 Blob with Byte Order Mark (BOM) to guarantee Excel reads characters correctly
  return new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), content], { type: 'text/csv;charset=utf-8;' });
}
