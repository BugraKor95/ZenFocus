if(window.location.protocol!=="chrome-extension:"){let s=function(e,o){return e.some(n=>{const i=n.replace(/^(https?:\/\/)?(www\.)?/,"").toLowerCase();return o.toLowerCase().includes(i)})},r=function(e){const o=e?`linear-gradient(135deg, ${e.bgColor1} 0%, ${e.bgColor2} 30%, ${e.bgColor3} 60%, ${e.bgColor4} 100%)`:"linear-gradient(135deg, #f8fafc 0%, #e0e7ff 30%, #ddd6fe 60%, #fce7f3 100%)",n=e&&e.textColor||"#4c1d95",i=e&&e.subTextColor||"#6b21a8",t=e&&e.accentColor||"#a78bfa",c=e&&e.mainText||"Time to focus.",l=e&&e.subText||"Take a deep breath.",d=!e||e.pulseEnabled!==!1;window.stop(),document.open(),document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZenFocus - Site Blocked</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; }
    .zen-focus-block-screen {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: ${o};
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      z-index: 999999;
    }
    .pulse-circle {
      position: absolute; width: 300px; height: 300px; border-radius: 50%;
      display: ${d?"block":"none"};
      background: radial-gradient(circle, ${t}40 0%, ${t}20 50%, transparent 100%);
      box-shadow: 0 0 80px ${t}30, 0 0 140px ${t}20, inset 0 0 60px ${t}15;
      animation: pulse-animation 3s ease-in-out infinite;
    }
    @keyframes pulse-animation {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.15); opacity: 0.9; }
    }
    .content-wrapper { position: relative; z-index: 10; text-align: center; max-width: 600px; padding: 40px; }
    .main-text {
      font-size: 48px; font-weight: 300; color: ${n}; margin-bottom: 20px;
      letter-spacing: -0.5px; line-height: 1.3; animation: fade-in 1s ease-out;
    }
    .sub-text {
      font-size: 24px; font-weight: 300; color: ${i}; margin-bottom: 60px;
      letter-spacing: 0.5px; animation: fade-in 1.5s ease-out;
    }
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .back-button {
      display: inline-flex; align-items: center; gap: 12px; padding: 16px 40px;
      background: linear-gradient(135deg, ${t} 0%, ${t}cc 100%);
      backdrop-filter: blur(10px); border: 2px solid ${t}50;
      border-radius: 50px; color: #ffffff; font-size: 18px; font-weight: 500;
      cursor: pointer; transition: all 0.3s ease;
      box-shadow: 0 4px 20px ${t}40; animation: fade-in 2s ease-out;
    }
    .back-button:hover {
      filter: brightness(0.9); transform: translateY(-2px);
      box-shadow: 0 6px 30px ${t}50;
    }
    .back-button:active { transform: translateY(0); }
    .back-icon { width: 24px; height: 24px; transition: transform 0.3s ease; }
    .back-button:hover .back-icon { transform: translateX(-4px); }
    @media (max-width: 768px) {
      .pulse-circle { width: 200px; height: 200px; }
      .main-text { font-size: 32px; }
      .sub-text { font-size: 18px; margin-bottom: 40px; }
      .back-button { padding: 14px 32px; font-size: 16px; }
    }
  </style>
</head>
<body>
  <div class="zen-focus-block-screen">
    <div class="pulse-circle"></div>
    <div class="content-wrapper">
      <h1 class="main-text">${c}</h1>
      <p class="sub-text">${l}</p>
      <button class="back-button" onclick="window.history.back()">
        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Go Back
      </button>
    </div>
  </div>
</body>
</html>`),document.close()},a=function(){chrome.storage.local.get(["blockedSites","focusMode","blockPageSettings"],e=>{const o=e.blockedSites||[],n=e.focusMode||!1,i=window.location.hostname;n&&s(o,i)&&r(e.blockPageSettings||null)})};var p=s,f=r,b=a;a(),chrome.storage.onChanged.addListener((e,o)=>{o==="local"&&(e.blockedSites||e.focusMode)&&a()})}
