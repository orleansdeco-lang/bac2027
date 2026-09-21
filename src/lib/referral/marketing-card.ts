/**
 * SHATER BAC 2027 - Marketing Poster Card Generator
 * Renders an ultra high-resolution, branded shareable poster card containing:
 * 1. Official Platform Branding & Slogan
 * 2. High-contrast QR Code scannable with any smartphone camera
 * 3. Prominently styled referral voucher code with 10% discount badge
 * 4. Key educational value proposition highlights
 * 5. Direct download (PNG) and mobile web share integration
 */

import QRCode from "qrcode";

export interface MarketingCardOptions {
  referralCode: string;
  regUrl: string;
  studentName?: string;
  discountPercentage?: number;
}

/**
 * Helper to wrap text cleanly on canvas
 */
function drawTextCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (maxWidth) {
    ctx.fillText(text, x, y, maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }
}

/**
 * Helper to draw a rounded rectangle
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor?: string,
  strokeColor?: string,
  lineWidth = 1
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Generates the marketing poster canvas
 */
export async function renderMarketingPosterCanvas(
  options: MarketingCardOptions
): Promise<HTMLCanvasElement> {
  const {
    referralCode,
    regUrl,
    discountPercentage = 10,
  } = options;

  // Generate QR Code data URL at high resolution
  const qrDataUrl = await QRCode.toDataURL(regUrl, {
    width: 600,
    margin: 1,
    color: {
      dark: "#1A2422",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });

  // Load QR Image
  const qrImage = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = qrDataUrl;
  });

  // Canvas Dimensions: 900 x 1200 (3:4 aspect ratio, high resolution)
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  // 1. Background Gradient (Luxury Dark Clay Palette)
  const bgGradient = ctx.createLinearGradient(0, 0, 0, 1200);
  bgGradient.addColorStop(0, "#192220");
  bgGradient.addColorStop(0.45, "#21322F");
  bgGradient.addColorStop(1, "#141C1A");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 900, 1200);

  // Background Subtle Ambient Circles
  ctx.save();
  const radialGlow = ctx.createRadialGradient(450, 200, 50, 450, 200, 450);
  radialGlow.addColorStop(0, "rgba(95, 143, 134, 0.22)");
  radialGlow.addColorStop(1, "rgba(95, 143, 134, 0)");
  ctx.fillStyle = radialGlow;
  ctx.beginPath();
  ctx.arc(450, 200, 450, 0, Math.PI * 2);
  ctx.fill();

  const radialBottomGlow = ctx.createRadialGradient(450, 950, 50, 450, 950, 400);
  radialBottomGlow.addColorStop(0, "rgba(215, 166, 106, 0.15)");
  radialBottomGlow.addColorStop(1, "rgba(215, 166, 106, 0)");
  ctx.fillStyle = radialBottomGlow;
  ctx.beginPath();
  ctx.arc(450, 950, 400, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Outer Gold Decorative Border
  drawRoundedRect(ctx, 24, 24, 852, 1152, 36, undefined, "rgba(215, 166, 106, 0.4)", 2);
  drawRoundedRect(ctx, 32, 32, 836, 1136, 30, undefined, "rgba(255, 255, 255, 0.08)", 1);

  // 2. Header: Logo & Branding
  // Top Badge
  drawRoundedRect(ctx, 275, 55, 350, 42, 21, "rgba(95, 143, 134, 0.25)", "rgba(95, 143, 134, 0.6)", 1.5);
  ctx.font = "bold 17px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#A3D4CC";
  drawTextCentered(ctx, "🎓 المنصة الجزائرية الأولى لتحضير البكالوريا", 450, 76);

  // Main Title
  ctx.font = "900 44px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  drawTextCentered(ctx, "شاطر • SHATER BAC 2027", 450, 135);

  // Subtitle
  ctx.font = "600 20px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#D2DEDC";
  drawTextCentered(ctx, "طريقك المضمون للتفوق الدراسي وبلوغ معدل أحلامك", 450, 180);

  // 3. Discount Voucher Pill
  drawRoundedRect(ctx, 160, 215, 580, 56, 28, "rgba(215, 166, 106, 0.2)", "rgba(215, 166, 106, 0.8)", 2);
  ctx.font = "900 24px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#F5D4A4";
  drawTextCentered(ctx, `🎁 بطاقة دعوة حصرية • خصم ${discountPercentage}% فوري عند التسجيل`, 450, 243);

  // 4. White Center Card for QR Code
  const cardX = 230;
  const cardY = 295;
  const cardW = 440;
  const cardH = 460;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 28, "#FFFFFF", "rgba(215, 166, 106, 0.4)", 2);

  // Shater top tag inside white card
  ctx.font = "bold 15px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#5F8F86";
  drawTextCentered(ctx, "• امسح الكود بكاميرا الهاتف •", 450, 325);

  // Draw QR Image
  const qrSize = 310;
  ctx.drawImage(qrImage, 450 - qrSize / 2, 350, qrSize, qrSize);

  // Card bottom info
  ctx.font = "bold 15px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#26302F";
  drawTextCentered(ctx, "الدخول المباشر مع تفعيل الخصم تلقائياً", 450, 685);
  ctx.font = "600 14px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#738A86";
  drawTextCentered(ctx, "shater.dz", 450, 715);

  // 5. Referral Code Banner Box
  const codeBoxY = 780;
  drawRoundedRect(
    ctx,
    100,
    codeBoxY,
    700,
    130,
    24,
    "rgba(0, 0, 0, 0.4)",
    "rgba(215, 166, 106, 0.9)",
    2
  );

  ctx.font = "bold 17px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#E0EAE8";
  drawTextCentered(ctx, "أو أدخل كود الخصم التالي يدوياً عند التسجيل والدفع:", 450, codeBoxY + 32);

  // Big Monospace Code
  ctx.font = "900 40px 'Courier New', monospace, sans-serif";
  ctx.fillStyle = "#FFD992";
  drawTextCentered(ctx, referralCode, 450, codeBoxY + 76);

  ctx.font = "600 14px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#A8C4C0";
  drawTextCentered(ctx, `يمنحك تخفيض ${discountPercentage}% فوري على الاشتراك الكامل`, 450, codeBoxY + 110);

  // 6. Value Proposition Features (3 Highlights)
  const featY = 935;
  const featH = 46;

  // Feature 1
  drawRoundedRect(ctx, 70, featY, 235, featH, 14, "rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.15)", 1);
  ctx.font = "bold 15px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#EFE9DC";
  drawTextCentered(ctx, "✓ منهاج كامل لجميع الشعب", 187, featY + 23);

  // Feature 2
  drawRoundedRect(ctx, 320, featY, 260, featH, 14, "rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.15)", 1);
  ctx.font = "bold 15px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#EFE9DC";
  drawTextCentered(ctx, "✓ بنك تمارين وبكالوريات محلولة", 450, featY + 23);

  // Feature 3
  drawRoundedRect(ctx, 595, featY, 235, featH, 14, "rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.15)", 1);
  ctx.font = "bold 15px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#EFE9DC";
  drawTextCentered(ctx, "✓ أسبوع تجريبي مجاني 100%", 712, featY + 23);

  // 7. Footer
  ctx.font = "bold 17px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#D7A66A";
  drawTextCentered(ctx, "🚀 ابدأ الآن أسبوعك المجاني وحضّر للبكالوريا بثقة واحترافية", 450, 1025);

  ctx.font = "500 14px 'Segoe UI', Tahoma, Arial, sans-serif";
  ctx.fillStyle = "#839E99";
  drawTextCentered(ctx, "منصة شاطر التعليمية المتطورة للجزائر • shater.dz", 450, 1060);

  return canvas;
}

/**
 * Downloads the marketing poster directly as a PNG
 */
export async function downloadMarketingPoster(options: MarketingCardOptions): Promise<void> {
  const canvas = await renderMarketingPosterCanvas(options);
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `shater_bac2027_card_${options.referralCode}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Converts canvas to a Blob for sharing
 */
export async function getMarketingPosterBlob(options: MarketingCardOptions): Promise<Blob> {
  const canvas = await renderMarketingPosterCanvas(options);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create blob from canvas"));
    }, "image/png");
  });
}

/**
 * Mobile Web Share API integration: shares image file if supported,
 * otherwise falls back to standard text link sharing.
 */
export async function shareMarketingPoster(options: MarketingCardOptions): Promise<boolean> {
  const { referralCode, regUrl } = options;
  const shareText = `🎓 هدية خاصة لك! سجل في منصة شاطر لتحضير بكالوريا 2027 واستفد من خصم 10% فوري مع أسبوع تجريبي مجاني عبر كود الخصم: ${referralCode}\nرابط التسجيل المباشر:\n${regUrl}`;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const blob = await getMarketingPosterBlob(options);
      const file = new File([blob], `shater_${referralCode}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "بطاقة دعوة منصة شاطر للبكالوريا",
          text: shareText,
          files: [file],
        });
        return true;
      } else {
        await navigator.share({
          title: "بطاقة دعوة منصة شاطر للبكالوريا",
          text: shareText,
          url: regUrl,
        });
        return true;
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return false;
      console.warn("Share API fallback:", err);
    }
  }

  // Fallback to WhatsApp direct message
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  window.open(waUrl, "_blank");
  return true;
}
