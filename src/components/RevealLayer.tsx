import React from 'react';

export interface RevealLayerProps {
  x: number;
  y: number;
  r?: number;
  imageSrc?: string;
}

export const RevealLayer: React.FC<RevealLayerProps> = ({
  x,
  y,
  r = 200,
  imageSrc = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85',
}) => {
  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none bg-center bg-cover bg-no-repeat select-none transition-[opacity] duration-200"
      style={{
        backgroundImage: `url(${imageSrc})`,
        WebkitMaskImage: `radial-gradient(circle ${r}px at ${x}px ${y}px, black 0%, black 65%, transparent 100%)`,
        maskImage: `radial-gradient(circle ${r}px at ${x}px ${y}px, black 0%, black 65%, transparent 100%)`,
      }}
    >
      {/* Subtle cursor tracking glow ring */}
      <div
        className="absolute rounded-full border border-white/20 pointer-events-none -translate-x-1/2 -translate-y-1/2 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${r * 2}px`,
          height: `${r * 2}px`,
        }}
      />
    </div>
  );
};
