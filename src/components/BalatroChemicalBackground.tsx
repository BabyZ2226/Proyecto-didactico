import React from 'react';

interface BalatroChemicalBackgroundProps {
  intensity?: number;
}

export const BalatroChemicalBackground: React.FC<BalatroChemicalBackgroundProps> = React.memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 bg-[#f4eee1]">
      {/* Warm antique parchment texture and subtle sun-faded gradations */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 15%, rgba(255, 253, 247, 0.7) 0%, rgba(244, 238, 225, 0.5) 45%, rgba(228, 218, 198, 0.75) 100%)',
        }}
      />

      {/* Antique paper fiber grain / subtle topographic lines pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="vintage-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="#5a452a"
              strokeWidth="0.75"
              strokeDasharray="2 4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vintage-grid)" />
      </svg>

      {/* Watermarked Antique Expedition Compass Rose (matching the reference image) */}
      <div className="absolute right-[-100px] top-[180px] w-[580px] h-[580px] opacity-[0.055] pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full fill-none stroke-[#3d2e1c]" strokeWidth="0.8">
          <circle cx="100" cy="100" r="95" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="80" />
          <circle cx="100" cy="100" r="45" />
          <circle cx="100" cy="100" r="15" />
          {/* Compass Points */}
          <polygon points="100,8 106,85 100,100" fill="#3d2e1c" opacity="0.4" />
          <polygon points="100,8 94,85 100,100" fill="#3d2e1c" opacity="0.7" />
          <polygon points="100,192 106,115 100,100" fill="#3d2e1c" opacity="0.4" />
          <polygon points="100,192 94,115 100,100" fill="#3d2e1c" opacity="0.7" />
          <polygon points="192,100 115,106 100,100" fill="#3d2e1c" opacity="0.4" />
          <polygon points="192,100 115,94 100,100" fill="#3d2e1c" opacity="0.7" />
          <polygon points="8,100 85,106 100,100" fill="#3d2e1c" opacity="0.4" />
          <polygon points="8,100 85,94 100,100" fill="#3d2e1c" opacity="0.7" />
          {/* Diagonal secondary points */}
          <polygon points="165,35 110,90 100,100" fill="#3d2e1c" opacity="0.3" />
          <polygon points="35,165 90,110 100,100" fill="#3d2e1c" opacity="0.3" />
          <polygon points="165,165 110,110 100,100" fill="#3d2e1c" opacity="0.3" />
          <polygon points="35,35 90,90 100,100" fill="#3d2e1c" opacity="0.3" />
        </svg>
      </div>

      {/* Left side secondary subtle watermark compass */}
      <div className="absolute left-[-80px] bottom-[200px] w-[420px] h-[420px] opacity-[0.035] pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full fill-none stroke-[#3d2e1c]" strokeWidth="0.8">
          <circle cx="100" cy="100" r="90" strokeDasharray="2 3" />
          <circle cx="100" cy="100" r="75" />
          <polygon points="100,10 105,88 100,100" fill="#3d2e1c" opacity="0.4" />
          <polygon points="100,190 105,112 100,100" fill="#3d2e1c" opacity="0.4" />
          <polygon points="190,100 112,105 100,100" fill="#3d2e1c" opacity="0.4" />
          <polygon points="10,100 88,105 100,100" fill="#3d2e1c" opacity="0.4" />
        </svg>
      </div>

      {/* Soft warm aged paper border vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(105,80,50,0.18)] pointer-events-none" />
    </div>
  );
});
