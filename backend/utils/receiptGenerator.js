import puppeteer from 'puppeteer';

export const generateReceiptPdfBuffer = async (booking, property, tenant) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    const date = booking.paymentDetails?.paidAt ? new Date(booking.paymentDetails.paidAt).toLocaleDateString() : new Date().toLocaleDateString();
    const amount = booking.paymentDetails?.amount || 0;
    const method = booking.paymentDetails?.paymentMethod || 'Online';
    const txnId = booking.paymentDetails?.transactionId || 'N/A';
    const refId = booking.bookingId || booking._id;
    
    const propName = property?.societyName || property?.pgName || property?.propertyCategory || 'Housynest Property';
    const tenantName = tenant?.name || `${booking.personalInfo?.firstName || ''} ${booking.personalInfo?.lastName || ''}`.trim() || 'Tenant';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
        .receipt-container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 8px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #062F26; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #062F26; }
        .title { font-size: 24px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .details-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .col { width: 48%; }
        .col h3 { font-size: 14px; color: #888; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
        .col p { margin: 5px 0; font-size: 15px; }
        .payment-box { background: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 40px; }
        .payment-box table { width: 100%; border-collapse: collapse; }
        .payment-box th, .payment-box td { padding: 12px 0; text-align: left; border-bottom: 1px solid #eee; }
        .payment-box th { font-weight: 600; color: #555; }
        .total-row td { font-weight: bold; font-size: 18px; border-bottom: none; border-top: 2px solid #ddd; padding-top: 15px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; }
        .status-badge { display: inline-block; padding: 4px 10px; background: #e6f6f1; color: #0AA87D; border-radius: 12px; font-size: 12px; font-weight: bold; border: 1px solid #b3e6d8; }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div>
            <div class="logo">Housynest</div>
            <p style="margin: 5px 0 0; color: #666;">Payment Receipt</p>
          </div>
          <div style="text-align: right;">
            <div class="title">RECEIPT</div>
            <p style="margin: 5px 0 0; font-weight: bold;">Ref: ${refId}</p>
            <p style="margin: 5px 0 0; color: #666;">Date: ${date}</p>
          </div>
        </div>

        <div class="details-grid">
          <div class="col">
            <h3>Billed To</h3>
            <p><strong>${tenantName}</strong></p>
            <p>${tenant?.email || booking.personalInfo?.email || ''}</p>
            <p>${tenant?.phone || booking.personalInfo?.mobileNumber || ''}</p>
          </div>
          <div class="col">
            <h3>Property Details</h3>
            <p><strong>${propName}</strong></p>
            <p>${property?.locality || ''}, ${property?.city || ''}</p>
            ${booking.roomDetails?.roomName ? `<p>Room: ${booking.roomDetails.roomName} | Bed: ${booking.roomDetails.bedName}</p>` : ''}
          </div>
        </div>

        <div class="payment-box">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Method</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Booking Payment for ${propName}</td>
                <td>${method}</td>
                <td style="text-align: right;">₹${amount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colspan="3" style="color: #666; font-size: 13px; padding-top: 8px; border-bottom: none;">
                  Transaction ID: ${txnId}
                </td>
              </tr>
              <tr class="total-row">
                <td colspan="2">Total Paid</td>
                <td style="text-align: right; color: #062F26;">₹${amount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="text-align: right;">
          <span class="status-badge">Payment Successful</span>
        </div>

        <div class="footer">
          <p>This is a computer-generated receipt and does not require a physical signature.</p>
          <p>&copy; ${new Date().getFullYear()} Housynest. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    throw error;
  }
};
