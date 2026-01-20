import { PDFDocument, rgb } from "pdf-lib";
import type { Portfolio, Holding } from "../../drizzle/schema";

interface PDFGeneratorOptions {
  portfolio: Portfolio;
  holdings: Holding[];
  generatedAt: Date;
}

export async function generatePDF(options: PDFGeneratorOptions): Promise<Buffer> {
  const { portfolio, holdings, generatedAt } = options;

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();

  const margin = 40;
  const contentWidth = width - 2 * margin;
  let yPosition = height - margin;

  const drawText = (
    text: string,
    fontSize: number = 12,
    isBold: boolean = false,
    color = rgb(0, 0, 0)
  ) => {
    page.drawText(text, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color,
    });
    yPosition -= fontSize + 8;
  };

  const drawLine = () => {
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    yPosition -= 16;
  };

  const checkPageSpace = (spaceNeeded: number) => {
    if (yPosition - spaceNeeded < margin) {
      page = pdfDoc.addPage([612, 792]);
      yPosition = height - margin;
    }
  };

  // Header
  drawText("PORTFOLIO ANALYSIS REPORT", 24, true, rgb(0, 0.4, 0.8));
  yPosition -= 4;
  drawText(portfolio.name, 18, true);
  drawText(`Generated: ${generatedAt.toLocaleDateString()}`, 10);
  yPosition -= 8;
  drawLine();

  // Summary Section
  drawText("PORTFOLIO SUMMARY", 14, true);
  yPosition -= 4;

  const totalCost = holdings.reduce((sum, h) => {
    return sum + parseFloat(h.purchasePrice) * parseFloat(h.quantity);
  }, 0);

  drawText(`Total Holdings: ${holdings.length}`);
  drawText(`Total Investment: $${totalCost.toFixed(2)}`);
  drawText(`Asset Types: ${new Set(holdings.map((h) => h.assetType)).size}`);
  yPosition -= 12;
  drawLine();

  // Holdings Section
  drawText("HOLDINGS DETAILS", 14, true);
  yPosition -= 4;

  // Table headers
  const colWidth = contentWidth / 5;
  checkPageSpace(20);
  const headerY = yPosition;
  page.drawText("Symbol", { x: margin, y: headerY, size: 10 });
  page.drawText("Name", { x: margin + colWidth, y: headerY, size: 10 });
  page.drawText("Type", { x: margin + colWidth * 2, y: headerY, size: 10 });
  page.drawText("Quantity", { x: margin + colWidth * 3, y: headerY, size: 10 });
  page.drawText("Price", { x: margin + colWidth * 4, y: headerY, size: 10 });
  yPosition -= 16;

  // Table rows
  holdings.forEach((holding) => {
    checkPageSpace(20);

    page.drawText(holding.symbol, { x: margin, y: yPosition, size: 9 });
    page.drawText(holding.name.substring(0, 15), {
      x: margin + colWidth,
      y: yPosition,
      size: 9,
    });
    page.drawText(holding.assetType, {
      x: margin + colWidth * 2,
      y: yPosition,
      size: 9,
    });
    page.drawText(holding.quantity, {
      x: margin + colWidth * 3,
      y: yPosition,
      size: 9,
    });
    page.drawText(`$${holding.purchasePrice}`, {
      x: margin + colWidth * 4,
      y: yPosition,
      size: 9,
    });
    yPosition -= 14;
  });

  yPosition -= 12;
  checkPageSpace(20);
  drawLine();

  // Asset Allocation Section
  drawText("ASSET ALLOCATION", 14, true);
  yPosition -= 4;

  const allocation = holdings.reduce(
    (acc, h) => {
      const type = h.assetType;
      const value = parseFloat(h.quantity) * parseFloat(h.purchasePrice);
      acc[type] = (acc[type] || 0) + value;
      return acc;
    },
    {} as Record<string, number>
  );

  Object.entries(allocation).forEach(([type, value]) => {
    checkPageSpace(20);
    const percentage = ((value / totalCost) * 100).toFixed(1);
    drawText(`${type.toUpperCase()}: $${value.toFixed(2)} (${percentage}%)`);
  });

  yPosition -= 12;
  checkPageSpace(20);
  drawLine();

  // Footer
  yPosition = margin - 20;
  page.drawText("This report is for informational purposes only.", {
    x: margin,
    y: yPosition,
    size: 8,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
