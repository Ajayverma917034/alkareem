import { useEffect, useState } from "react";

const style = `
  @keyframes thrustUp {
    0%   { transform: translateY(0px); opacity: 0.3; }
    50%  { transform: translateY(-18px); opacity: 1; }
    100% { transform: translateY(0px); opacity: 0.3; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.15; transform: scaleX(1); }
    50%       { opacity: 0.35; transform: scaleX(1.08); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .ut-loader-root {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    gap: 0;
  }

  .ut-bars {
    display: flex;
    align-items: flex-end;
    gap: 7px;
    height: 52px;
    margin-bottom: 36px;
  }

  .ut-bar {
    width: 6px;
    border-radius: 99px;
    animation: thrustUp 1.4s ease-in-out infinite;
  }

  .ut-bar:nth-child(1) { height: 22px; background: #534AB7; animation-delay: 0s; }
  .ut-bar:nth-child(2) { height: 34px; background: #7F77DD; animation-delay: 0.12s; }
  .ut-bar:nth-child(3) { height: 46px; background: #AFA9EC; animation-delay: 0.24s; }
  .ut-bar:nth-child(4) { height: 52px; background: #CECBF6; animation-delay: 0.36s; }
  .ut-bar:nth-child(5) { height: 46px; background: #AFA9EC; animation-delay: 0.48s; }
  .ut-bar:nth-child(6) { height: 34px; background: #7F77DD; animation-delay: 0.60s; }
  .ut-bar:nth-child(7) { height: 22px; background: #534AB7; animation-delay: 0.72s; }

  .ut-wordmark {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: linear-gradient(90deg, #7F77DD 0%, #CECBF6 40%, #7F77DD 80%, #CECBF6 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 2.8s linear infinite, fadeIn 0.6s ease both;
  }

  .ut-tagline {
    margin-top: 10px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    animation: fadeIn 0.9s ease 0.2s both;
  }

  .ut-track {
    margin-top: 40px;
    width: 140px;
    height: 2px;
    background: rgba(255,255,255,0.07);
    border-radius: 99px;
    overflow: hidden;
    animation: fadeIn 0.9s ease 0.4s both;
  }

  @keyframes trackFill {
    0%   { width: 0%; opacity: 1; }
    80%  { width: 100%; opacity: 1; }
    100% { width: 100%; opacity: 0; }
  }

  .ut-track-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #534AB7, #CECBF6);
    animation: trackFill 2s ease-in-out infinite;
  }
`;

export default function FullScreenLoader() {
  return (
    <>
      <style>{style}</style>
      <div className="ut-loader-root" role="status" aria-label="Loading All Kareem Tarbiyat">
        <div className="ut-bars">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="ut-bar" />
          ))}
        </div>
        <div className="ut-wordmark">All Kareem Tarbiyat</div>
        <div className="ut-tagline">Preparing your workspace</div>
        <div className="ut-track">
          <div className="ut-track-fill" />
        </div>
      </div>
    </>
  );
}