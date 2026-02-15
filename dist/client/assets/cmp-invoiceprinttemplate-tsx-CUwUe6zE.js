const z=n=>{const{order:t,shopName:u="Your Shop",shopLogo:r,shopWebsite:c="",shopEmail:p="",shopPhone:v="",shopAddress:x="",courierProvider:m="",consignmentId:y=""}=n;let e=[];t.items&&Array.isArray(t.items)?e=t.items.map(i=>({name:i.name||i.productName||"Product",description:i.variant||i.description||"",sku:i.sku||"",qty:i.quantity||1,unit:i.unit||"pcs",rate:i.price||i.unitPrice||0,amount:(i.price||i.unitPrice||0)*(i.quantity||1),image:i.image||i.productImage||""})):t.productName&&(e=[{name:t.productName,description:t.variantInfo||"",sku:t.sku||"",qty:t.quantity||1,unit:t.unit||"pcs",rate:t.amount/(t.quantity||1),amount:t.amount,image:t.productImage||""}]);const a=e.reduce((i,l)=>i+l.amount,0),g=t.deliveryCharge||t.shippingCost||0,s=t.discountAmount||0,b=a>0?(s/a*100).toFixed(2):"0",h=a+g-s,d=t.advancePaid||t.paidAmount||0,w=h-d,o=i=>`৳${i.toLocaleString("en-BD",{minimumFractionDigits:2,maximumFractionDigits:2})}`,$=t.date?new Date(t.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}),f=`#${(t.id||"").toString().slice(-8).toUpperCase()||"INV-"+Date.now()}`,I=e.map((i,l)=>`
    <tr>
      <td style="padding: 12px 0; font-size: 10px; color: #1a1c21; vertical-align: top;">${l+1}</td>
      <td style="padding: 12px 0; vertical-align: top;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <div style="width: 28px; height: 28px; background: #ededed; border-radius: 4px; flex-shrink: 0;${i.image?` background-image: url(${i.image}); background-size: cover; background-position: center;`:""}"></div>
          <div>
            <div style="font-size: 10px; font-weight: 600; color: #1a1c21;">${i.name}</div>
            ${i.description?`<div style="font-size: 10px; color: #5e6470;">${i.description}</div>`:""}
          </div>
        </div>
      </td>
      <td style="padding: 12px 0; font-size: 10px; color: #1a1c21; vertical-align: top;">${i.sku||"-"}</td>
      <td style="padding: 12px 0; font-size: 10px; color: #1a1c21; vertical-align: top;">${i.qty}</td>
      <td style="padding: 12px 0; font-size: 10px; color: #1a1c21; vertical-align: top;">${i.unit}</td>
      <td style="padding: 12px 0; font-size: 10px; color: #1a1c21; text-align: right; vertical-align: top;">${o(i.rate)}</td>
      <td style="padding: 12px 0; font-size: 10px; color: #1a1c21; text-align: right; vertical-align: top;">${o(i.amount)}</td>
    </tr>
  `).join("");return`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${f}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f9fafc;
      padding: 20px;
      color: #1a1c21;
    }
    
    .invoice-container {
      max-width: 595px;
      margin: 0 auto;
      background: #f9fafc;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 0;
    }
    
    .shop-info {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    
    .shop-logo {
      width: 93px;
      height: 63px;
      object-fit: contain;
    }
    
    .shop-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .shop-name {
      font-size: 18px;
      font-weight: 600;
    }
    
    .shop-contact {
      font-size: 10px;
      color: #5e6470;
      line-height: 14px;
    }
    
    .business-address {
      text-align: right;
      font-size: 10px;
      color: #5e6470;
      line-height: 14px;
      max-width: 150px;
    }
    
    .invoice-card {
      background: white;
      border: 0.5px solid #d7dae0;
      border-radius: 12px;
      padding: 20px 16px;
      margin-top: 16px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .info-item.right {
      text-align: right;
    }
    
    .info-label {
      font-size: 10px;
      font-weight: 500;
      color: #5e6470;
      line-height: 14px;
    }
    
    .info-value {
      font-size: 10px;
      font-weight: 600;
      color: #1a1c21;
      line-height: 14px;
    }
    
    .customer-address {
      font-size: 10px;
      font-weight: 400;
      color: #5e6470;
      line-height: 14px;
    }
    
    .divider {
      height: 0.5px;
      background: #d7dae0;
      margin: 12px 0;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .items-table th {
      font-size: 8px;
      font-weight: 600;
      color: #5e6470;
      text-transform: uppercase;
      letter-spacing: 0.32px;
      text-align: left;
      padding: 8px 0;
      border-bottom: 0.5px solid #d7dae0;
    }
    
    .items-table th:nth-child(6),
    .items-table th:nth-child(7) {
      text-align: right;
    }
    
    .items-table tr:last-child td {
      border-bottom: 0.5px solid #d7dae0;
    }
    
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
    
    .totals-table {
      width: 240px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #1a1c21;
      margin-bottom: 8px;
    }
    
    .totals-row.discount {
      color: #da0000;
    }
    
    .totals-row.grand-total {
      font-size: 10px;
      font-weight: 600;
    }
    
    .totals-row.due-pay {
      font-size: 10px;
      font-weight: 600;
    }
    
    .footer {
      margin-top: 24px;
      font-size: 10px;
      font-weight: 600;
      color: #1a1c21;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .invoice-container {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="shop-info">
        ${r?`<img src="${r}" alt="Logo" class="shop-logo" />`:""}
        <div class="shop-details">
          <div class="shop-name">${u}</div>
          ${c?`<div class="shop-contact">${c}</div>`:""}
          ${p?`<div class="shop-contact">${p}</div>`:""}
          ${v?`<div class="shop-contact">${v}</div>`:""}
        </div>
      </div>
      <div class="business-address">
        <div style="font-weight: 500;">Business address</div>
        ${x||"Address not set"}
      </div>
    </div>
    
    <!-- Invoice Card -->
    <div class="invoice-card">
      <!-- Info Grid Row 1 -->
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Billed to</div>
          <div class="info-value">${t.customer||"Customer"}</div>
          <div class="customer-address">${t.location||""}</div>
          <div class="customer-address">${t.phone||""}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Invoice number</div>
          <div class="info-value">${f}</div>
        </div>
        <div class="info-item right">
          <div class="info-label">Date</div>
          <div class="info-value">${$}</div>
        </div>
      </div>
      
      <!-- Info Grid Row 2 -->
      <div class="info-grid" style="margin-top: -8px;">
        <div class="info-item"></div>
        <div class="info-item">
          <div class="info-label">Provider</div>
          <div class="info-value">${m||t.courierProvider||"N/A"}</div>
        </div>
        <div class="info-item right">
          <div class="info-label">Consignment ID</div>
          <div class="info-value">${y||t.trackingId||t.courierTrackingId||"Pending"}</div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 30px;">NO.</th>
            <th style="width: 140px;">ITEM DETAIL</th>
            <th style="width: 100px;">SKU</th>
            <th style="width: 40px;">QTY</th>
            <th style="width: 50px;">UNIT</th>
            <th style="width: 80px;">RATE</th>
            <th style="width: 80px;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${I}
        </tbody>
      </table>
      
      <!-- Totals -->
      <div class="totals-section">
        <div class="totals-table">
          <div class="totals-row">
            <span>Sub Total</span>
            <span>${o(a)}</span>
          </div>
          <div class="totals-row">
            <span>Delivery Charge</span>
            <span>${o(g)}</span>
          </div>
          ${s>0?`
          <div class="totals-row discount">
            <span>Discount (${b}%)</span>
            <span>- ${o(s)}</span>
          </div>`:""}
          <div class="totals-row grand-total">
            <span>Grand Total</span>
            <span>${o(h)}</span>
          </div>
          ${d>0?`
          <div class="totals-row">
            <span>Advance Pay</span>
            <span>${o(d)}</span>
          </div>`:""}
          <div class="totals-row due-pay">
            <span>Due Pay</span>
            <span>${o(w)}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      Thanks for the business.
    </div>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    };
  <\/script>
</body>
</html>`},k=n=>{const t=window.open("","PRINT_INVOICE","width=900,height=800");if(!t){console.error("Please allow popups to print invoice.");return}t.document.write(z(n)),t.document.close(),t.focus()};export{k as p};
