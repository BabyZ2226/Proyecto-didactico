import React from 'react';

export type ColossusVariant =
  | 'sunset_crimson'
  | 'azure_cobalt'
  | 'violet_knight'
  | 'emerald_abyss'
  | 'golden_atlas';

interface SilhouetteColossusArtProps {
  variant: ColossusVariant;
  className?: string;
}

/**
 * Renders the 4 square geometric sigil icons seen underneath the description
 * in the "II SILHOUETTE" reference poster, customized with subtle educational game motifs.
 */
export const RunicSigilsRow: React.FC<{
  darkTheme?: boolean;
  theme?: 'light' | 'dark';
  align?: 'left' | 'right';
}> = React.memo(({ darkTheme = false, theme, align = 'left' }) => {
  const isDark = theme ? theme === 'dark' : darkTheme;
  const strokeColor = isDark ? '#71717a' : '#78716c';
  const fillColor = isDark ? '#3f3f46' : '#a8a29e';

  return (
    <div
      className={`flex items-center gap-2 py-2 ${
        align === 'right' ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Sigil 1: Nested Diamond Atom Maze */}
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" />
        <polygon points="12,5 19,12 12,19 5,12" />
        <circle cx="12" cy="12" r="2.5" fill={fillColor} />
      </svg>

      {/* Sigil 2: Sacred Chamber Keyhole Frame */}
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" />
        <rect x="6" y="6" width="12" height="12" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <circle cx="12" cy="11" r="2" fill={fillColor} />
        <polygon points="11,12 13,12 13.8,16 10.2,16" fill={fillColor} stroke="none" />
      </svg>

      {/* Sigil 3: Diagonal Hatch Shield */}
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" />
        <polygon points="4,20 20,4 20,10 10,20" fill={fillColor} stroke="none" />
        <line x1="4" y1="14" x2="14" y2="4" />
        <line x1="10" y1="20" x2="20" y2="10" />
      </svg>

      {/* Sigil 4: Tri-Band Emblem */}
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" />
        <polygon points="4,4 14,4 4,14" fill={fillColor} stroke="none" />
        <line x1="4" y1="19" x2="19" y2="4" />
        <line x1="9" y1="20" x2="20" y2="9" />
      </svg>
    </div>
  );
});

/**
 * Ornate rotated diamond badge with Roman numeral inside, matching the reference poster.
 */
export const DiamondRankBadge: React.FC<{
  numeral: string;
  color?: 'gray' | 'emerald' | 'crimson';
  theme?: 'light' | 'dark';
}> = React.memo(({ numeral, color, theme }) => {
  const resolvedColor = color || (theme === 'dark' ? 'emerald' : 'gray');
  const stroke =
    resolvedColor === 'emerald'
      ? '#10b981'
      : resolvedColor === 'crimson'
      ? '#9e1b24'
      : '#71717a';
  const text =
    resolvedColor === 'emerald'
      ? 'text-[#10b981]'
      : resolvedColor === 'crimson'
      ? 'text-[#9e1b24]'
      : 'text-zinc-600';

  return (
    <div className="relative w-10 h-10 flex items-center justify-center shrink-0 select-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 40" fill="none">
        <polygon points="20,2 38,20 20,38 2,20" stroke={stroke} strokeWidth="1.5" />
        <polygon
          points="20,6 34,20 20,34 6,20"
          stroke={stroke}
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>
      <span className={`font-serif font-bold text-xs tracking-tighter ${text}`}>
        {numeral}
      </span>
    </div>
  );
});

/**
 * Double-exposure colossus silhouette artwork inspired by Buzhimiao's "II SILHOUETTE",
 * with each interior world custom-designed around its specific AulaPlay educational game:
 *  - sunset_crimson: 100 Latinos Dicen (Survey Board, 3 Strikes [X][X][X], Giant Retro Mic, Equipo Sol vs Equipo Rayo)
 *  - azure_cobalt: Escape Room 10 Cámaras (10 Illuminated Chambers, Clockwork Gears, Giant Keyhole Portal, Master Key)
 *  - violet_knight: Póker del Octeto (Periodic Table Element Cards, Lewis Octet Atoms, Erlenmeyer Flasks, Molecular Bonds)
 *  - emerald_abyss: Guías, Fórmulas y Laboratorio (Open Illuminated Grimoire, Benzene Ring, DNA Helix, Chemical Equations)
 */
export const SilhouetteColossusArt: React.FC<SilhouetteColossusArtProps> = React.memo(({
  variant,
  className = '',
}) => {
  // ===========================================================================
  // 1. 100 LATINOS DICEN (Sunset Crimson & Amber Arena Double-Exposure)
  // ===========================================================================
  if (variant === 'sunset_crimson') {
    return (
      <svg
        viewBox="0 0 520 560"
        className={`w-full max-w-[440px] h-auto select-none overflow-visible ${className}`}
      >
        <defs>
          {/* Jagged Minotaur / Titan Silhouette Clip Path with Ragged Brush Edges */}
          <clipPath id="clipSunsetColossus">
            <path d="M195,48 C225,38 265,42 295,62 L322,55 L348,88 C378,108 405,135 422,165 L455,148 L465,205 C478,245 488,295 495,355 L482,425 L455,475 L415,495 L372,482 L362,435 L382,365 C378,315 368,265 352,215 L335,245 L338,325 L345,425 L312,485 L215,492 L175,478 L145,425 L165,365 L142,355 L132,425 L155,472 L108,492 L65,465 L45,405 L38,325 L55,255 L42,195 L68,145 L112,115 L145,65 Z" />
          </clipPath>

          <linearGradient id="sunsetSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d95338" />
            <stop offset="32%" stopColor="#f58233" />
            <stop offset="65%" stopColor="#e04f3e" />
            <stop offset="86%" stopColor="#7a1c36" />
            <stop offset="100%" stopColor="#260614" />
          </linearGradient>

          <linearGradient id="spotlightBeam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Brush Splatter Accents */}
        <path
          d="M110,496 L220,502 L190,512 Z M360,492 L445,498 L405,510 Z M52,180 L34,195 L48,205 Z"
          fill="#3b0a1e"
          opacity="0.75"
        />

        {/* Clipped Double-Exposure Interior: 100 LATINOS DICEN ARENA */}
        <g clipPath="url(#clipSunsetColossus)">
          {/* Warm Sunset Sky */}
          <rect x="0" y="0" width="520" height="560" fill="url(#sunsetSky)" />

          {/* Sweeping Game Show Stage Spotlights */}
          <polygon points="80,450 185,70 235,70 155,450" fill="url(#spotlightBeam)" />
          <polygon points="410,450 305,70 255,70 345,450" fill="url(#spotlightBeam)" />

          {/* Giant Glowing White-Gold Sun & Concentric Sound Waves */}
          <circle cx="248" cy="178" r="95" fill="none" stroke="#fde68a" strokeWidth="1" strokeDasharray="6 4" opacity="0.45" />
          <circle cx="248" cy="178" r="80" fill="#fde68a" opacity="0.25" />
          <circle cx="248" cy="178" r="62" fill="#fffbeb" opacity="0.96" />

          {/* GIANT FLOATING "100 LATINOS DICEN" SURVEY SCOREBOARD IN THE SKY */}
          <g transform="translate(153, 108)">
            {/* Outer Board Frame */}
            <rect
              x="0"
              y="0"
              width="190"
              height="122"
              rx="8"
              fill="#450a1f"
              opacity="0.92"
              stroke="#fbbf24"
              strokeWidth="2.5"
            />
            {/* Inner dotted bulb border */}
            <rect
              x="5"
              y="5"
              width="180"
              height="112"
              rx="5"
              fill="none"
              stroke="#fde68a"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            {/* Top Banner: 100 */}
            <rect x="62" y="-10" width="66" height="18" rx="4" fill="#fbbf24" />
            <text
              x="95"
              y="3"
              textAnchor="middle"
              fill="#450a1f"
              fontSize="11"
              fontWeight="900"
              fontFamily="serif"
              letterSpacing="2"
            >
              ★ 100 ★
            </text>

            {/* 6 Survey Answer Slots (2 Columns x 3 Rows) */}
            {/* Slot 1 */}
            <rect x="14" y="16" width="76" height="18" rx="3" fill="#7a1c36" stroke="#fbbf24" strokeWidth="1" />
            <rect x="18" y="21" width="44" height="8" rx="1.5" fill="#fde68a" opacity="0.9" />
            <text x="82" y="29" textAnchor="end" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace">45</text>

            {/* Slot 2 */}
            <rect x="14" y="40" width="76" height="18" rx="3" fill="#7a1c36" stroke="#fbbf24" strokeWidth="1" />
            <rect x="18" y="45" width="34" height="8" rx="1.5" fill="#fde68a" opacity="0.8" />
            <text x="82" y="53" textAnchor="end" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace">24</text>

            {/* Slot 3 */}
            <rect x="14" y="64" width="76" height="18" rx="3" fill="#7a1c36" stroke="#fbbf24" strokeWidth="1" />
            <rect x="18" y="69" width="24" height="8" rx="1.5" fill="#fde68a" opacity="0.7" />
            <text x="82" y="77" textAnchor="end" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace">15</text>

            {/* Slot 4 */}
            <rect x="100" y="16" width="76" height="18" rx="3" fill="#7a1c36" stroke="#fbbf24" strokeWidth="1" />
            <rect x="104" y="21" width="18" height="8" rx="1.5" fill="#fde68a" opacity="0.7" />
            <text x="168" y="29" textAnchor="end" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace">09</text>

            {/* Slot 5 (Unrevealed) */}
            <rect x="100" y="40" width="76" height="18" rx="3" fill="#541127" stroke="#f59e0b" strokeWidth="1" opacity="0.85" />
            <circle cx="138" cy="49" r="6" fill="#fbbf24" opacity="0.85" />
            <text x="138" y="52.5" textAnchor="middle" fill="#450a1f" fontSize="8" fontWeight="bold">5</text>

            {/* Slot 6 (Unrevealed) */}
            <rect x="100" y="64" width="76" height="18" rx="3" fill="#541127" stroke="#f59e0b" strokeWidth="1" opacity="0.85" />
            <circle cx="138" cy="73" r="6" fill="#fbbf24" opacity="0.85" />
            <text x="138" y="76.5" textAnchor="middle" fill="#450a1f" fontSize="8" fontWeight="bold">6</text>

            {/* Iconic 3 Strikes Row at Bottom of Board: [X] [X] [X] */}
            <g transform="translate(49, 90)">
              <rect x="0" y="0" width="24" height="22" rx="3" fill="#dc2626" stroke="#fef08a" strokeWidth="1.2" />
              <text x="12" y="16" textAnchor="middle" fill="#fffbeb" fontSize="14" fontWeight="900">✕</text>

              <rect x="34" y="0" width="24" height="22" rx="3" fill="#dc2626" stroke="#fef08a" strokeWidth="1.2" />
              <text x="46" y="16" textAnchor="middle" fill="#fffbeb" fontSize="14" fontWeight="900">✕</text>

              <rect x="68" y="0" width="24" height="22" rx="3" fill="#dc2626" stroke="#fef08a" strokeWidth="1.2" />
              <text x="80" y="16" textAnchor="middle" fill="#fffbeb" fontSize="14" fontWeight="900">✕</text>
            </g>
          </g>

          {/* GIANT VINTAGE BROADCAST MICROPHONE TOWER IN CENTER */}
          <g transform="translate(222, 248)">
            {/* Microphone Glow */}
            <circle cx="26" cy="30" r="34" fill="#fef08a" opacity="0.25" />
            {/* Retro Condenser Capsule */}
            <rect x="10" y="4" width="32" height="48" rx="16" fill="#541127" stroke="#fde68a" strokeWidth="2.5" />
            {/* Horizontal Metallic Grill Lines */}
            <line x1="12" y1="16" x2="40" y2="16" stroke="#fde68a" strokeWidth="1.8" />
            <line x1="11" y1="24" x2="41" y2="24" stroke="#fde68a" strokeWidth="1.8" />
            <line x1="11" y1="32" x2="41" y2="32" stroke="#fde68a" strokeWidth="1.8" />
            <line x1="12" y1="40" x2="40" y2="40" stroke="#fde68a" strokeWidth="1.8" />
            {/* U-Shaped Yoke Mount & Stand */}
            <path d="M4,30 C4,60 48,60 48,30" fill="none" stroke="#450a1f" strokeWidth="4" />
            <rect x="22" y="54" width="8" height="115" fill="#450a1f" />
            <polygon points="8,165 44,165 54,195 -2,195" fill="#300818" />
          </g>

          {/* Midground Colosseum Arches & Studio Towers */}
          <g fill="#ba3236" opacity="0.85">
            <rect x="58" y="180" width="36" height="270" />
            <rect x="94" y="230" width="22" height="220" />
            {/* Arena Colosseum Arches */}
            <path d="M125,382 L370,382 L370,455 L345,455 L345,412 A18,18 0 0,0 309,412 L309,455 L285,455 L285,412 A18,18 0 0,0 249,412 L249,455 L225,455 L225,412 A18,18 0 0,0 189,412 L189,455 L165,455 L165,412 A18,18 0 0,0 129,412 L129,455 L125,455 Z" />
          </g>

          {/* Foreground Dark Burgundy Studio Pillars */}
          <g fill="#541127">
            <rect x="35" y="140" width="38" height="360" />
            <rect x="398" y="155" width="42" height="345" />
            <rect x="440" y="215" width="55" height="285" />
          </g>

          {/* TWO RIVAL TEAM PODIUMS AT CENTRALBUZZER: EQUIPO SOL vs EQUIPO RAYO */}
          {/* Left Podium: Equipo Sol */}
          <g transform="translate(158, 392)">
            <polygon points="0,0 38,0 32,60 4,60" fill="#3b071b" stroke="#fbbf24" strokeWidth="1.2" />
            {/* Sun Emblem */}
            <circle cx="19" cy="24" r="8" fill="#fbbf24" />
            {/* Challenger 1 Silhouette */}
            <circle cx="18" cy="-18" r="6" fill="#240511" />
            <path d="M10,-10 L26,-10 L30,0 L6,0 Z" fill="#240511" />
          </g>

          {/* Right Podium: Equipo Rayo */}
          <g transform="translate(298, 392)">
            <polygon points="0,0 38,0 34,60 6,60" fill="#3b071b" stroke="#fbbf24" strokeWidth="1.2" />
            {/* Lightning Bolt Emblem */}
            <polygon points="22,12 13,25 20,25 16,38 27,23 20,23" fill="#fbbf24" />
            {/* Challenger 2 Silhouette */}
            <circle cx="20" cy="-18" r="6" fill="#240511" />
            <path d="M12,-10 L28,-10 L32,0 L8,0 Z" fill="#240511" />
          </g>

          {/* Ground Stage Platform & Neon Reflection Lines */}
          <rect x="30" y="450" width="460" height="60" fill="#280614" />
          <line x1="155" y1="464" x2="345" y2="464" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />
          <line x1="185" y1="474" x2="310" y2="474" stroke="#f58233" strokeWidth="1.5" opacity="0.55" />
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 2. ESCAPE ROOM: 10 CÁMARAS (Azure Cobalt Keyhole, Gears & 10 Chambers)
  // ===========================================================================
  if (variant === 'azure_cobalt') {
    return (
      <svg
        viewBox="0 0 520 600"
        className={`w-full max-w-[440px] h-auto select-none overflow-visible ${className}`}
      >
        <defs>
          {/* Rearing Guardian Colossus Silhouette Clip Path */}
          <clipPath id="clipAzureColossus">
            <path d="M165,35 L225,28 L255,48 L242,75 L285,115 L335,165 L395,195 L445,245 L475,325 L485,415 L502,445 L488,515 L455,545 L425,525 L438,465 L402,415 L355,412 L345,465 L372,535 L348,575 L312,525 L292,455 L315,405 L265,385 L215,392 L175,435 L212,505 L188,532 L135,482 L105,425 L145,375 L182,355 L172,285 L188,215 L175,145 L132,135 L142,95 L165,65 Z" />
          </clipPath>

          <linearGradient id="azureSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="32%" stopColor="#0284c7" />
            <stop offset="62%" stopColor="#03488c" />
            <stop offset="85%" stopColor="#081c3d" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>
        </defs>

        <g clipPath="url(#clipAzureColossus)">
          <rect x="0" y="0" width="520" height="600" fill="url(#azureSky)" />

          {/* Glowing Cyan Clockwork Moon at Top Head */}
          <circle cx="195" cy="82" r="24" fill="#e0f2fe" />
          <circle cx="195" cy="82" r="38" fill="none" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="195" cy="82" r="48" fill="#7dd3fc" opacity="0.28" />

          {/* GIANT INTERLOCKING CLOCKWORK GEARS IN THE SKY */}
          {/* Gear 1 */}
          <g transform="translate(335, 195)" opacity="0.55">
            <circle cx="0" cy="0" r="46" fill="none" stroke="#7dd3fc" strokeWidth="8" strokeDasharray="10 8" />
            <circle cx="0" cy="0" r="34" fill="#075985" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="0" cy="0" r="12" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.5" />
            <line x1="-34" y1="0" x2="34" y2="0" stroke="#38bdf8" strokeWidth="2" />
            <line x1="0" y1="-34" x2="0" y2="34" stroke="#38bdf8" strokeWidth="2" />
          </g>

          {/* Gear 2 */}
          <g transform="translate(205, 195)" opacity="0.45">
            <circle cx="0" cy="0" r="32" fill="none" stroke="#bae6fd" strokeWidth="6" strokeDasharray="8 6" />
            <circle cx="0" cy="0" r="24" fill="none" stroke="#38bdf8" strokeWidth="2" />
          </g>

          {/* TOWER OF 10 CHAMBERS CITADEL */}
          <polygon points="150,365 262,102 375,365" fill="#0369a1" opacity="0.82" />
          <rect x="236" y="95" width="52" height="260" fill="#075985" stroke="#38bdf8" strokeWidth="1" />
          <polygon points="236,95 262,58 288,95" fill="#0c4a6e" />

          {/* 10 Illuminated Chamber Windows (2 Columns x 5 Rows = 10 Cámaras!) */}
          {[0, 1, 2, 3, 4].map((row) => (
            <g key={row} transform={`translate(244, ${110 + row * 28})`}>
              {/* Left Chamber Window */}
              <rect x="0" y="0" width="14" height="18" rx="7" fill="#e0f2fe" opacity="0.92" />
              {/* Right Chamber Window */}
              <rect x="22" y="0" width="14" height="18" rx="7" fill="#7dd3fc" opacity="0.85" />
            </g>
          ))}

          {/* GIANT GLOWING KEYHOLE SANCTUARY PORTAL AT BASE OF CITADEL */}
          <g transform="translate(262, 305)">
            {/* Outer Arcane Ring */}
            <circle cx="0" cy="-14" r="30" fill="#082f49" stroke="#38bdf8" strokeWidth="2" />
            {/* Radiant Cyan Keyhole */}
            <circle cx="0" cy="-16" r="14" fill="#e0f2fe" />
            <polygon points="-7,-8 7,-8 12,28 -12,28" fill="#e0f2fe" />
            {/* Glow rays from keyhole */}
            <polygon points="-12,28 12,28 38,75 -38,75" fill="#7dd3fc" opacity="0.35" />
          </g>

          {/* Floating Cipher Padlock & Hourglass Icons in Sky */}
          <g transform="translate(388, 255)">
            <rect x="0" y="10" width="24" height="20" rx="3" fill="#082f49" stroke="#7dd3fc" strokeWidth="1.8" />
            <path d="M5,10 V5 A7,7 0 0,1 19,5 V10" fill="none" stroke="#7dd3fc" strokeWidth="1.8" />
            <circle cx="12" cy="20" r="2.5" fill="#e0f2fe" />
          </g>

          {/* Ancient Ruined Columns & Labyrinth Gates */}
          <g fill="#062147">
            <rect x="172" y="295" width="12" height="90" />
            <rect x="196" y="285" width="12" height="100" />
            <rect x="220" y="305" width="12" height="80" />
            <rect x="168" y="282" width="48" height="8" />
            <rect x="345" y="275" width="14" height="110" />
            <rect x="372" y="290" width="14" height="95" />
            <rect x="340" y="270" width="52" height="8" />
          </g>

          {/* Explorer Holding Up the Glowing Master Key in Front of the Keyhole */}
          <g transform="translate(256, 342)">
            <circle cx="6" cy="8" r="4" fill="#020817" />
            <polygon points="1,13 11,13 14,36 -2,36" fill="#020817" />
            {/* Raised Arm & Glowing Golden/Cyan Master Key */}
            <line x1="10" y1="15" x2="22" y2="2" stroke="#e0f2fe" strokeWidth="2" />
            <circle cx="25" cy="-1" r="4" fill="none" stroke="#e0f2fe" strokeWidth="1.8" />
            <line x1="20" y1="4" x2="17" y2="8" stroke="#e0f2fe" strokeWidth="1.8" />
          </g>

          {/* Deep Midnight Lower Legs */}
          <rect x="80" y="382" width="440" height="220" fill="#03091c" />
        </g>

        {/* Flying Ravens / Cipher Fragments outside silhouette */}
        <g fill="#0284c7">
          <path d="M142,225 Q147,218 152,225 Q157,218 162,225 Q152,222 142,225 Z" />
          <path d="M405,175 Q412,166 418,175 Q424,166 430,175 Q418,171 405,175 Z" />
          <path d="M312,62 Q316,56 320,62 Q324,56 328,62 Q320,59 312,62 Z" />
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 3. PÓKER DEL OCTETO (Violet Alchemist Knight, Element Cards & Molecules)
  // ===========================================================================
  if (variant === 'violet_knight') {
    return (
      <svg
        viewBox="0 0 520 580"
        className={`w-full max-w-[440px] h-auto select-none overflow-visible ${className}`}
      >
        <defs>
          {/* Armored Gaius Knight Colossus Silhouette Clip Path */}
          <clipPath id="clipVioletColossus">
            <path d="M235,32 C255,30 275,32 288,48 L335,55 L312,78 L345,108 L405,122 L448,165 L485,205 L462,265 L478,345 L465,425 L492,475 L475,515 L415,535 L335,555 L245,565 L165,548 L95,525 L68,485 L105,445 L145,442 L148,325 L105,295 L82,255 L122,225 L75,185 L115,145 L165,115 L205,78 L185,55 L222,48 Z" />
          </clipPath>

          <linearGradient id="violetSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7e22ce" />
            <stop offset="28%" stopColor="#d8b4fe" />
            <stop offset="54%" stopColor="#c084fc" />
            <stop offset="78%" stopColor="#581c87" />
            <stop offset="100%" stopColor="#1e0938" />
          </linearGradient>
        </defs>

        <g clipPath="url(#clipVioletColossus)">
          <rect x="0" y="0" width="520" height="580" fill="url(#violetSky)" />

          {/* Diagonal Lavender Sunbeams */}
          <polygon points="150,70 280,70 450,280 280,280" fill="#f3e8ff" opacity="0.32" />

          {/* GIANT ATOMIC ORBITALS & LEWIS OCTET SUN IN THE SKY */}
          <g transform="translate(295, 205)">
            {/* Nucleus Glow */}
            <circle cx="0" cy="0" r="46" fill="#fae8ff" opacity="0.9" />
            {/* 3 Intersecting Elliptical Electron Orbitals */}
            <ellipse
              cx="0"
              cy="0"
              rx="88"
              ry="28"
              fill="none"
              stroke="#faf5ff"
              strokeWidth="1.6"
              transform="rotate(28)"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="88"
              ry="28"
              fill="none"
              stroke="#faf5ff"
              strokeWidth="1.6"
              transform="rotate(-28)"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="88"
              ry="28"
              fill="none"
              stroke="#faf5ff"
              strokeWidth="1.4"
              strokeDasharray="4 4"
              transform="rotate(90)"
            />
            {/* 8 Valence Electrons (Octet Rule!) */}
            <circle cx="76" cy="40" r="4.5" fill="#22e584" />
            <circle cx="-76" cy="-40" r="4.5" fill="#22e584" />
            <circle cx="76" cy="-40" r="4.5" fill="#faf5ff" />
            <circle cx="-76" cy="40" r="4.5" fill="#faf5ff" />
            <circle cx="0" cy="-88" r="4.5" fill="#22e584" />
            <circle cx="0" cy="88" r="4.5" fill="#22e584" />
            {/* Central Element Symbol inside Sun */}
            <text
              x="0"
              y="8"
              textAnchor="middle"
              fill="#581c87"
              fontSize="24"
              fontWeight="900"
              fontFamily="serif"
            >
              O₂
            </text>
          </g>

          {/* FLOATING PERIODIC TABLE POKER CARDS IN THE SKY */}
          {/* Card 1: Carbon (6 C) */}
          <g transform="translate(152, 118) rotate(-14)">
            <rect
              x="0"
              y="0"
              width="48"
              height="68"
              rx="5"
              fill="#3b0764"
              stroke="#f5d0fe"
              strokeWidth="2"
            />
            <text x="7" y="13" fill="#22e584" fontSize="9" fontWeight="bold" fontFamily="monospace">6</text>
            <text x="24" y="42" textAnchor="middle" fill="#faf5ff" fontSize="22" fontWeight="900" fontFamily="serif">C</text>
            <text x="24" y="57" textAnchor="middle" fill="#e9d5ff" fontSize="7" fontFamily="monospace">4 VALENCIA</text>
          </g>

          {/* Card 2: Hydrogen (1 H) */}
          <g transform="translate(368, 108) rotate(16)">
            <rect
              x="0"
              y="0"
              width="46"
              height="64"
              rx="5"
              fill="#3b0764"
              stroke="#22e584"
              strokeWidth="2"
            />
            <text x="7" y="13" fill="#22e584" fontSize="9" fontWeight="bold" fontFamily="monospace">1</text>
            <text x="23" y="40" textAnchor="middle" fill="#faf5ff" fontSize="20" fontWeight="900" fontFamily="serif">H</text>
            <text x="23" y="54" textAnchor="middle" fill="#22e584" fontSize="7" fontFamily="monospace">OCTETO</text>
          </g>

          {/* Card 3: Sodium (11 Na) */}
          <g transform="translate(215, 255) rotate(-6)">
            <rect
              x="0"
              y="0"
              width="42"
              height="58"
              rx="4"
              fill="#4c1d95"
              stroke="#e9d5ff"
              strokeWidth="1.5"
            />
            <text x="6" y="12" fill="#f5d0fe" fontSize="8" fontWeight="bold" fontFamily="monospace">11</text>
            <text x="21" y="36" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900" fontFamily="serif">Na</text>
          </g>

          {/* Multi-Tiered Molecular Bridge & Lab Viaduct */}
          <g fill="#581c87" opacity="0.92">
            <rect x="140" y="345" width="260" height="8" />
            <path d="M150,353 L390,353 L390,415 L372,415 L372,375 A16,16 0 0,0 340,375 L340,415 L318,415 L318,375 A16,16 0 0,0 286,375 L286,415 L264,415 L264,375 A16,16 0 0,0 232,375 L232,415 L210,415 L210,375 A16,16 0 0,0 178,375 L178,415 L150,415 Z" />
          </g>

          {/* Left Cliff & Giant Erlenmeyer Flask Alchemy Tower on Right */}
          <path d="M70,220 L215,245 L245,270 L185,305 L185,465 L70,465 Z" fill="#1e0938" />
          {/* Giant Erlenmeyer Silhouette Tower on Right */}
          <g transform="translate(375, 225)">
            <rect x="24" y="0" width="24" height="55" fill="#2a0e4d" stroke="#c084fc" strokeWidth="1.5" />
            <rect x="18" y="-6" width="36" height="8" rx="3" fill="#2a0e4d" stroke="#c084fc" strokeWidth="1.5" />
            <polygon points="24,55 48,55 82,165 -10,165" fill="#2a0e4d" stroke="#c084fc" strokeWidth="1.5" />
            {/* Glowing Liquid & Bubbles inside Flask */}
            <polygon points="6,115 66,115 78,160 -6,160" fill="#a855f7" opacity="0.65" />
            <circle cx="32" cy="102" r="5" fill="#f5d0fe" opacity="0.8" />
            <circle cx="42" cy="84" r="3.5" fill="#22e584" opacity="0.9" />
            <circle cx="28" cy="68" r="2.5" fill="#f5d0fe" opacity="0.8" />
          </g>

          {/* Reflective Lavender Lake at Bottom */}
          <rect x="65" y="425" width="430" height="145" fill="#7e22ce" opacity="0.48" />
          <line x1="190" y1="455" x2="340" y2="455" stroke="#f5d0fe" strokeWidth="2" opacity="0.65" />
          <line x1="215" y1="472" x2="310" y2="472" stroke="#f5d0fe" strokeWidth="1.5" opacity="0.45" />

          {/* Foreground Molecular Bond Trees */}
          <g fill="#19072e">
            <path d="M210,565 L222,475 L228,475 L222,565 Z" />
            <path d="M224,505 L198,482 L202,478 L226,498 Z" />
            <circle cx="198" cy="478" r="5" fill="#c084fc" />
            <path d="M325,565 L335,442 L344,442 L338,565 Z" />
            <path d="M338,485 L368,452 L373,456 L340,494 Z" />
            <circle cx="372" cy="452" r="6" fill="#22e584" />
            <path d="M336,502 L305,472 L310,468 L338,494 Z" />
            <circle cx="305" cy="468" r="5" fill="#f5d0fe" />
          </g>
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 4. GLOBO TERRÁQUEO 3D: GEOGRAFÍA MUNDIAL (Golden Atlas & Cyan Meridian Globe)
  // ===========================================================================
  if (variant === 'golden_atlas') {
    return (
      <svg
        viewBox="0 0 520 580"
        className={`w-full max-w-[440px] h-auto select-none overflow-visible ${className}`}
      >
        <defs>
          <clipPath id="clipAtlasColossus">
            <path d="M180,42 C245,30 315,38 370,85 L435,148 L475,235 L482,340 L452,430 L435,535 L412,575 L125,575 L108,495 L88,415 L52,335 L48,235 L78,150 L125,85 Z" />
          </clipPath>

          <linearGradient id="atlasSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="32%" stopColor="#0284c7" />
            <stop offset="62%" stopColor="#0ea5e9" />
            <stop offset="84%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        <g clipPath="url(#clipAtlasColossus)">
          <rect x="0" y="0" width="520" height="580" fill="url(#atlasSky)" />

          {/* Glowing 3D Earth Globe in Center Sky */}
          <g transform="translate(260, 210)">
            {/* Atmosphere Halo */}
            <circle cx="0" cy="0" r="108" fill="#38bdf8" opacity="0.22" />
            <circle cx="0" cy="0" r="92" fill="#0c4a6e" stroke="#7dd3fc" strokeWidth="2.5" />

            {/* Latitude & Longitude Meridians */}
            <ellipse cx="0" cy="0" rx="92" ry="34" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.65" />
            <ellipse cx="0" cy="0" rx="92" ry="66" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.45" />
            <ellipse cx="0" cy="0" rx="36" ry="92" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.65" />
            <ellipse cx="0" cy="0" rx="68" ry="92" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.45" />
            <line x1="-92" y1="0" x2="92" y2="0" stroke="#fde047" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Stylized Illuminated Continents (Americas, Europe/Africa) */}
            <path
              d="M-62,-48 L-34,-54 L-22,-32 L-38,-12 L-24,8 L-14,35 L-32,68 L-46,48 L-42,14 L-64,-12 Z"
              fill="#22e584"
              opacity="0.85"
              stroke="#bbf7d0"
              strokeWidth="1"
            />
            <path
              d="M12,-56 L48,-48 L62,-22 L42,-4 L54,28 L34,62 L14,42 L18,6 L4,-18 Z"
              fill="#f59e0b"
              opacity="0.9"
              stroke="#fef08a"
              strokeWidth="1"
            />

            {/* Target Country Pin */}
            <circle cx="32" cy="-14" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <circle cx="32" cy="-14" r="14" fill="none" stroke="#fde047" strokeWidth="1.5" />
          </g>

          {/* Compass Rose Emblem Below Globe */}
          <g transform="translate(260, 365)">
            <circle cx="0" cy="0" r="28" fill="#082f49" stroke="#fde047" strokeWidth="1.5" />
            <polygon points="0,-24 6,-6 24,0 6,6 0,24 -6,6 -24,0 -6,-6" fill="#fde047" />
            <circle cx="0" cy="0" r="4" fill="#082f49" />
          </g>

          {/* Horizon Mountains & Cartography Sanctuary */}
          <polygon points="40,460 155,375 245,445 365,365 485,460 485,580 40,580" fill="#082f49" />
          <rect x="40" y="455" width="445" height="125" fill="#020617" />
          <line x1="150" y1="478" x2="370" y2="478" stroke="#38bdf8" strokeWidth="2" opacity="0.65" />
          <line x1="190" y1="496" x2="330" y2="496" stroke="#22e584" strokeWidth="1.5" opacity="0.5" />
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 5. GUÍAS, FÓRMULAS Y LABORATORIO (Emerald Abyss Grimoire, Hexagons & DNA)
  // ===========================================================================
  return (
    <svg
      viewBox="0 0 520 580"
      className={`w-full max-w-[440px] h-auto select-none overflow-visible ${className}`}
    >
      <defs>
        {/* Horned Sage Colossus Silhouette Clip Path */}
        <clipPath id="clipEmeraldColossus">
          <path d="M175,45 C245,35 325,55 385,105 L435,175 L468,265 L475,355 L442,425 L438,515 L425,575 L135,575 L125,495 L105,425 L68,355 L58,265 L65,175 L22,192 L12,165 L52,115 L115,68 Z" />
        </clipPath>

        <linearGradient id="emeraldSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#052e16" />
          <stop offset="30%" stopColor="#15803d" />
          <stop offset="58%" stopColor="#4ade80" />
          <stop offset="78%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#052e16" />
        </linearGradient>
      </defs>

      <g clipPath="url(#clipEmeraldColossus)">
        <rect x="0" y="0" width="520" height="580" fill="url(#emeraldSky)" />

        {/* Glowing Full Moon & Benzene Ring Constellation */}
        <circle cx="262" cy="135" r="44" fill="#f0fdf4" />
        <circle cx="262" cy="135" r="68" fill="#86efac" opacity="0.3" />

        {/* Chemical Benzene Ring Hexagon Around Moon */}
        <polygon
          points="262,75 314,105 314,165 262,195 210,165 210,105"
          fill="none"
          stroke="#bbf7d0"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <circle cx="262" cy="75" r="4" fill="#f0fdf4" />
        <circle cx="314" cy="105" r="4" fill="#f0fdf4" />
        <circle cx="314" cy="165" r="4" fill="#f0fdf4" />
        <circle cx="262" cy="195" r="4" fill="#f0fdf4" />
        <circle cx="210" cy="165" r="4" fill="#f0fdf4" />
        <circle cx="210" cy="105" r="4" fill="#f0fdf4" />

        {/* LEVITATING OPEN ILLUMINATED GRIMOIRE / FORMULA BOOK IN CENTER */}
        <g transform="translate(262, 142)">
          {/* Left Page */}
          <path
            d="M-36,-16 Q-18,-22 0,-12 L0,20 Q-18,12 -36,18 Z"
            fill="#052e16"
            stroke="#86efac"
            strokeWidth="2"
          />
          {/* Right Page */}
          <path
            d="M36,-16 Q18,-22 0,-12 L0,20 Q18,12 36,18 Z"
            fill="#052e16"
            stroke="#86efac"
            strokeWidth="2"
          />
          {/* Formula Runes on Pages */}
          <line x1="-28" y1="-6" x2="-8" y2="-4" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="-28" y1="2" x2="-10" y2="4" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="8" y1="-4" x2="28" y2="-6" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="10" y1="4" x2="28" y2="2" stroke="#4ade80" strokeWidth="1.5" />
        </g>

        {/* Floating Scientific Formulas in the Emerald Sky */}
        <text x="125" y="145" fill="#dcfce7" fontSize="13" fontWeight="bold" fontFamily="serif" opacity="0.75">
          H₂O · CO₂
        </text>
        <text x="345" y="148" fill="#dcfce7" fontSize="13" fontWeight="bold" fontFamily="serif" opacity="0.75">
          NaCl · CH₄
        </text>

        {/* Grand Library & Space-Lab Viaduct Arches */}
        <g fill="#064e3b">
          <rect x="65" y="215" width="390" height="14" />
          <path d="M75,229 L445,229 L445,365 L418,365 L418,265 A34,34 0 0,0 350,265 L350,365 L322,365 L322,265 A34,34 0 0,0 254,265 L254,365 L226,365 L226,265 A34,34 0 0,0 158,265 L158,365 L130,365 L130,265 A34,34 0 0,0 75,265 Z" />
        </g>

        {/* Luminous Neon-Emerald Water Surface */}
        <rect x="60" y="365" width="400" height="210" fill="#16a34a" opacity="0.55" />
        <ellipse cx="268" cy="395" rx="95" ry="18" fill="#bbf7d0" opacity="0.7" />
        <line x1="165" y1="435" x2="355" y2="435" stroke="#bbf7d0" strokeWidth="2" opacity="0.6" />
        <line x1="205" y1="485" x2="315" y2="485" stroke="#bbf7d0" strokeWidth="1.5" opacity="0.4" />

        {/* "EL IMPOSTOR" EMERGENCY DEBATE HOLOGRAM & 4 CREWMATE SUSPECTS */}
        <g transform="translate(262, 382)">
          {/* Spotlight Cone from Moon */}
          <polygon points="0,-165 -55,15 55,15" fill="#bbf7d0" opacity="0.18" />
          {/* Emergency Debate Table */}
          <ellipse cx="0" cy="12" rx="46" ry="10" fill="#022c22" stroke="#4ade80" strokeWidth="1.5" />
          {/* Red Emergency Button */}
          <rect x="-6" y="6" width="12" height="5" rx="2" fill="#ef4444" />

          {/* 3 True Crewmates + 1 Impostor Silhouette Around Table */}
          {/* Suspect 1 */}
          <g transform="translate(-38, -10)">
            <rect x="0" y="2" width="10" height="16" rx="5" fill="#022c22" stroke="#4ade80" strokeWidth="1.2" />
            <rect x="4" y="5" width="7" height="4" rx="2" fill="#bbf7d0" />
          </g>
          {/* Suspect 2 */}
          <g transform="translate(-16, -14)">
            <rect x="0" y="2" width="10" height="16" rx="5" fill="#022c22" stroke="#4ade80" strokeWidth="1.2" />
            <rect x="4" y="5" width="7" height="4" rx="2" fill="#bbf7d0" />
          </g>
          {/* Suspect 3 (THE IMPOSTOR with glowing red visor & exclamation!) */}
          <g transform="translate(8, -14)">
            <rect x="0" y="2" width="11" height="17" rx="5" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="4" y="5" width="8" height="4" rx="2" fill="#f87171" />
            <text x="5.5" y="-2" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">!</text>
          </g>
          {/* Suspect 4 */}
          <g transform="translate(28, -10)">
            <rect x="0" y="2" width="10" height="16" rx="5" fill="#022c22" stroke="#4ade80" strokeWidth="1.2" />
            <rect x="3" y="5" width="7" height="4" rx="2" fill="#bbf7d0" />
          </g>
        </g>

        {/* Foreground Laboratory Pier with Round-Bottom Boiling Flask */}
        <g fill="#022c22">
          <rect x="335" y="405" width="88" height="8" rx="2" />
          <rect x="348" y="413" width="12" height="58" />
          <rect x="374" y="413" width="12" height="58" />
          <rect x="400" y="413" width="12" height="58" />
          <circle cx="365" cy="392" r="10" fill="#022c22" stroke="#4ade80" strokeWidth="1.5" />
          <rect x="362" y="376" width="6" height="8" fill="#022c22" stroke="#4ade80" strokeWidth="1.2" />
          <circle cx="365" cy="393" r="5" fill="#4ade80" opacity="0.85" />
          <path d="M135,425 L142,355 L148,355 L145,425 Z" />
          <path d="M144,382 L162,365 L166,368 L146,388 Z" />
          <circle cx="165" cy="365" r="5" fill="#bbf7d0" />
        </g>
      </g>
    </svg>
  );
});

