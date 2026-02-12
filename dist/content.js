function s(){chrome.storage.local.get(["blockedSites","focusMode"],t=>{const o=t.blockedSites||[],n=t.focusMode||!1,e=window.location.hostname;if(console.log("ZenFocus Debug:",{blockedSites:o,focusMode:n,currentUrl:e}),!n){console.log("ZenFocus: Focus mode is OFF");return}o.some(r=>{const a=r.replace(/^(https?:\/\/)?(www\.)?/,"").toLowerCase(),i=e.toLowerCase().includes(a);return console.log(`ZenFocus: Checking ${a} against ${e}: ${i}`),i})&&(console.log("ZenFocus: Site is BLOCKED! Replacing page..."),document.documentElement.innerHTML=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>ZenFocus - Site Engellendi</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              overflow: hidden;
            }

            .zen-focus-block-screen {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 30%, #ddd6fe 60%, #fce7f3 100%);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              z-index: 999999;
            }

            .pulse-circle {
              position: absolute;
              width: 300px;
              height: 300px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, rgba(196, 181, 253, 0.15) 50%, transparent 100%);
              box-shadow: 
                0 0 80px rgba(167, 139, 250, 0.3),
                0 0 140px rgba(196, 181, 253, 0.2),
                inset 0 0 60px rgba(167, 139, 250, 0.1);
              animation: pulse-animation 3s ease-in-out infinite;
            }

            @keyframes pulse-animation {
              0%, 100% {
                transform: scale(1);
                opacity: 0.6;
              }
              50% {
                transform: scale(1.15);
                opacity: 0.9;
              }
            }

            .content-wrapper {
              position: relative;
              z-index: 10;
              text-align: center;
              max-width: 600px;
              padding: 40px;
            }

            .main-text {
              font-size: 48px;
              font-weight: 300;
              color: #4c1d95;
              margin-bottom: 20px;
              letter-spacing: -0.5px;
              line-height: 1.3;
              text-shadow: 0 2px 10px rgba(139, 92, 246, 0.1);
              animation: fade-in 1s ease-out;
            }

            .sub-text {
              font-size: 24px;
              font-weight: 300;
              color: #6b21a8;
              margin-bottom: 60px;
              letter-spacing: 0.5px;
              animation: fade-in 1.5s ease-out;
            }

            @keyframes fade-in {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .back-button {
              display: inline-flex;
              align-items: center;
              gap: 12px;
              padding: 16px 40px;
              background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%);
              backdrop-filter: blur(10px);
              border: 2px solid rgba(167, 139, 250, 0.3);
              border-radius: 50px;
              color: #ffffff;
              font-size: 18px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 20px rgba(167, 139, 250, 0.3);
              animation: fade-in 2s ease-out;
            }

            .back-button:hover {
              background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
              border-color: rgba(139, 92, 246, 0.5);
              transform: translateY(-2px);
              box-shadow: 0 6px 30px rgba(167, 139, 250, 0.4);
            }

            .back-button:active {
              transform: translateY(0);
            }

            .back-icon {
              width: 24px;
              height: 24px;
              transition: transform 0.3s ease;
            }

            .back-button:hover .back-icon {
              transform: translateX(-4px);
            }

            @media (max-width: 768px) {
              .pulse-circle {
                width: 200px;
                height: 200px;
              }

              .main-text {
                font-size: 32px;
              }

              .sub-text {
                font-size: 18px;
                margin-bottom: 40px;
              }

              .back-button {
                padding: 14px 32px;
                font-size: 16px;
              }
            }
          </style>
        </head>
        <body>
          <div class="zen-focus-block-screen">
            <div class="pulse-circle"></div>
            
            <div class="content-wrapper">
              <h1 class="main-text">Şu an odaklanma zamanı.</h1>
              <p class="sub-text">Derin bir nefes al.</p>
              
              <button class="back-button" onclick="window.history.back()">
                <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Geri Dön
              </button>
            </div>
          </div>
        </body>
      </html>
      `)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",s):s();
