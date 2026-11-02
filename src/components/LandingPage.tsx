import React from 'react';
import { UserAccount } from '../types';
import { playBalatroSound } from '../lib/soundEffects';
import { AulaPlayLogo } from './AulaPlayLogo';

interface LandingPageProps {
  currentAccount: UserAccount | null;
  onOpenCreateAccount: () => void;
  onEnterGames: () => void;
  onLogoutAccount: () => void;
}

export function LandingPage({
  currentAccount,
  onOpenCreateAccount,
  onEnterGames,
  onLogoutAccount,
}: LandingPageProps) {
  const scrollToSection = (id: string) => {
    playBalatroSound('click');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen h-auto w-full bg-[#191332] text-white font-sans selection:bg-sky-500 selection:text-white">
      {/* =====================================================================
          1. HERO SECTION — "SPACED" NIGHT SKY & SILHOUETTE HORIZON
         ===================================================================== */}
      <section className="relative w-full h-auto min-h-[760px] lg:min-h-[840px] flex flex-col justify-between bg-gradient-to-b from-[#231d54] via-[#2b3595] to-[#1d63b8]">
        {/* Radial Sky Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 62%, rgba(56, 189, 248, 0.42) 0%, rgba(59, 130, 246, 0.28) 32%, rgba(35, 29, 84, 0.88) 74%, rgba(25, 19, 50, 1) 100%)',
          }}
        />

        {/* Subtle Starfield Dots & Shooting Star */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1440 840"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="45%" stopColor="#e0f2fe" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lampBeam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.55" />
              <stop offset="40%" stopColor="#fde047" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="shootingStar" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background Stars */}
          <g fill="#ffffff" opacity="0.45">
            <circle cx="140" cy="120" r="1.3" />
            <circle cx="280" cy="80" r="1" />
            <circle cx="420" cy="160" r="1.5" />
            <circle cx="580" cy="95" r="1.2" />
            <circle cx="760" cy="70" r="1.6" />
            <circle cx="940" cy="140" r="1" />
            <circle cx="1120" cy="90" r="1.5" />
            <circle cx="1290" cy="175" r="1.2" />
            <circle cx="190" cy="280" r="1" />
            <circle cx="1050" cy="260" r="1.4" />
            <circle cx="1220" cy="310" r="1.1" />
            <circle cx="95" cy="410" r="1.3" />
            <circle cx="1350" cy="390" r="1.4" />
            <circle cx="520" cy="230" r="1" />
            <circle cx="840" cy="210" r="1.2" />
          </g>

          {/* Cyan Shooting Star (top right of center) */}
          <line
            x1="855"
            y1="190"
            x2="965"
            y2="132"
            stroke="url(#shootingStar)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="855" cy="190" r="2.5" fill="#7dd3fc" />

          {/* Giant Glowing Full Moon */}
          <circle cx="620" cy="400" r="130" fill="url(#moonHalo)" />
          <circle cx="620" cy="400" r="74" fill="#ffffff" />
          {/* Moon subtle craters */}
          <circle cx="595" cy="385" r="10" fill="#e2e8f0" opacity="0.45" />
          <circle cx="642" cy="422" r="15" fill="#e2e8f0" opacity="0.35" />
          <circle cx="610" cy="435" r="7" fill="#e2e8f0" opacity="0.4" />

          {/* Streetlamp Warm Glow & Light Cone */}
          <polygon points="928,395 865,695 991,695" fill="url(#lampBeam)" />
          <circle cx="928" cy="395" r="36" fill="#fef08a" opacity="0.28" />
          <circle cx="928" cy="395" r="16" fill="#fef9c3" opacity="0.8" />

          {/* Distant Soft Hill Layer */}
          <path
            d="M0,690 Q240,635 510,670 T1020,660 T1440,680 L1440,840 L0,840 Z"
            fill="#1b184a"
            opacity="0.65"
          />

          {/* Main Silhouette Tree in front of Moon */}
          <g fill="#191332">
            {/* Trunk */}
            <path d="M685,665 C680,590 668,530 662,475 C655,425 605,380 550,350 C600,370 648,402 666,440 C672,390 658,340 638,295 C662,335 678,382 678,430 C698,385 740,348 790,325 C742,356 704,395 685,448 C722,430 765,425 805,432 C760,435 718,448 686,472 C694,530 708,595 726,665 Z" />
            {/* Secondary left branch */}
            <path d="M663,455 C620,455 582,442 548,418 C584,434 622,442 660,444 Z" />
            <path d="M612,388 C595,365 585,342 582,318 C590,342 602,364 620,384 Z" />
            {/* Secondary top twigs */}
            <path d="M655,335 C632,322 612,314 590,310 C614,311 636,318 658,330 Z" />
            <path d="M726,368 C740,345 752,320 758,296 C754,322 744,347 732,366 Z" />
          </g>

          {/* Silhouette Explorer / Student / Teacher under the Tree */}
          <g fill="#191332" transform="translate(730, 566)">
            {/* Head */}
            <circle cx="14" cy="12" r="9" />
            {/* Flowing coat / body */}
            <path d="M6,22 C2,42 -2,64 -4,82 L12,82 L15,58 L20,82 L30,82 C28,60 25,38 21,22 Z" />
            {/* Arm raised slightly looking at sky */}
            <path d="M18,25 L32,42 L28,46 L15,32 Z" />
          </g>

          {/* Park Bench on Left Hill */}
          <g fill="#191332" transform="translate(402, 628)">
            <rect x="0" y="12" width="76" height="4" rx="1" />
            <rect x="0" y="19" width="76" height="4" rx="1" />
            <rect x="-3" y="26" width="82" height="5" rx="1.5" />
            <rect x="8" y="8" width="5" height="34" />
            <rect x="63" y="8" width="5" height="34" />
            {/* Small bird perched on bench */}
            <path d="M12,8 C8,2 4,0 0,2 C4,5 6,8 8,9 Z" />
            <ellipse cx="12" cy="6" rx="5" ry="3.5" />
          </g>

          {/* Tall Vintage Streetlamp on Right */}
          <g fill="#191332">
            <rect x="925" y="408" width="5" height="275" />
            <rect x="921" y="665" width="13" height="20" rx="2" />
            {/* Lantern head */}
            <polygon points="914,382 942,382 936,410 920,410" fill="none" stroke="#191332" strokeWidth="3" />
            <polygon points="910,382 946,382 928,368" />
            <rect x="920" y="408" width="16" height="4" />
          </g>

          {/* Floating Leaves & Small Silhouette Foliage */}
          <g fill="#191332">
            <ellipse cx="478" cy="520" rx="6" ry="2.5" transform="rotate(-28 478 520)" />
            <ellipse cx="526" cy="585" rx="6" ry="2.5" transform="rotate(18 526 585)" />
            <ellipse cx="775" cy="525" rx="6" ry="2.5" transform="rotate(35 775 525)" />
            <ellipse cx="835" cy="495" rx="5.5" ry="2.2" transform="rotate(-22 835 495)" />
            <ellipse cx="860" cy="595" rx="6" ry="2.5" transform="rotate(15 860 595)" />
            <ellipse cx="998" cy="520" rx="5.5" ry="2.2" transform="rotate(40 998 520)" />
            <ellipse cx="1005" cy="582" rx="6" ry="2.5" transform="rotate(-18 1005 582)" />
            {/* Small bushes near tree & lamp */}
            <path d="M610,665 C605,648 595,642 590,645 C592,635 602,630 608,638 C612,628 622,630 620,644 C628,640 632,648 624,665 Z" />
            <path d="M895,682 C888,660 875,655 870,662 C875,646 888,644 894,654 C900,640 912,644 908,660 C916,655 922,664 912,682 Z" />
          </g>

          {/* Foreground Rolling Hills Silhouette (merges seamlessly into #191332 body) */}
          <path
            d="M0,695 Q110,662 240,685 T520,668 T790,665 T1120,688 T1440,672 L1440,845 L0,845 Z"
            fill="#191332"
          />
        </svg>

        {/* TOP NAVIGATION BAR */}
        <header className="relative z-30 max-w-6xl w-full mx-auto px-6 sm:px-10 pt-7 pb-4 flex items-center justify-between">
          {/* Left: SPACED-style Wide Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 cursor-pointer select-none group"
          >
            <span className="font-spaced-logo text-lg sm:text-xl font-extrabold tracking-[0.28em] text-white group-hover:text-sky-300 transition-colors">
              AUL
            </span>
            {/* Stylized triple-bar glyph like the E in SPACED */}
            <span className="inline-flex flex-col justify-between w-4 h-3.5 mr-1">
              <span className="w-full h-[2.5px] bg-white group-hover:bg-sky-300 transition-colors" />
              <span className="w-3/4 h-[2.5px] bg-sky-400" />
              <span className="w-full h-[2.5px] bg-white group-hover:bg-sky-300 transition-colors" />
            </span>
            <span className="font-spaced-logo text-lg sm:text-xl font-extrabold tracking-[0.28em] text-white group-hover:text-sky-300 transition-colors">
              PLAY
            </span>
          </div>

          {/* Right: Nav Links + Rectangular CTA */}
          <div className="flex items-center gap-5 sm:gap-8">
            <nav className="hidden md:flex items-center gap-7 text-xs font-spaced tracking-wider text-white/80">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Inicio
              </button>
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('select');
                  onOpenCreateAccount();
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Cuenta
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features-grid')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Minijuegos
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('teacher-section')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Docentes
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('mobile-section')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Estudiantes
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('subjects-section')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Materias
              </button>
            </nav>

            {currentAccount ? (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('select');
                    onOpenCreateAccount();
                  }}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-spaced tracking-wider text-sky-200 cursor-pointer transition-all"
                  title="Editar cuenta vinculada"
                >
                  <span>{currentAccount.avatar}</span>
                  <span>{currentAccount.username}</span>
                  <span className="text-[10px] opacity-75">
                    ({currentAccount.role === 'teacher' ? 'Docente' : 'Estudiante'})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onEnterGames();
                  }}
                  className="px-5 py-2 rounded bg-white/15 hover:bg-white/25 border border-white/20 text-[11px] font-spaced font-semibold tracking-[0.18em] uppercase text-white transition-all cursor-pointer backdrop-blur-sm"
                >
                  ENTRAR AL AULA
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('play');
                  onOpenCreateAccount();
                }}
                className="px-5 py-2 rounded bg-white/15 hover:bg-white/25 border border-white/20 text-[11px] font-spaced font-semibold tracking-[0.18em] uppercase text-white transition-all cursor-pointer backdrop-blur-sm"
              >
                CREAR CUENTA
              </button>
            )}
          </div>
        </header>

        {/* HERO TEXT CONTENT (Positioned Left-of-Center above the Moon & Tree like "Beyond The Naked Eye") */}
        <div className="relative z-20 max-w-5xl w-full mx-auto px-6 sm:px-12 pt-8 pb-44 sm:pb-52 flex flex-col items-start">
          <div className="max-w-md space-y-3">
            <span className="block font-spaced text-sm sm:text-base tracking-wide text-sky-200/90 font-normal">
              El Universo Didáctico
            </span>

            <h1 className="font-spaced font-light text-5xl sm:text-6xl md:text-[64px] text-white leading-[1.05] tracking-wide">
              Más Allá Del
              <br />
              Aula Tradicional
            </h1>

            <p className="text-xs sm:text-sm text-sky-100/80 font-sans leading-relaxed pt-1 max-w-sm">
              Vincula tu cuenta de Google, elige tu rol como Docente o Estudiante, selecciona las materias que deseas enseñar o aprender y explora nuestros minijuegos en tiempo real.
            </p>

            {/* Two Rectangular Translucent Buttons matching "GET STARTED" / "LEARN MORE" */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('play');
                  onOpenCreateAccount();
                }}
                className="px-6 py-2.5 rounded bg-white/20 hover:bg-white/30 border border-white/25 text-[11px] font-spaced font-semibold tracking-[0.16em] uppercase text-white transition-all cursor-pointer backdrop-blur-sm shadow-lg"
              >
                {currentAccount ? 'MI CUENTA GOOGLE' : 'CREAR CUENTA'}
              </button>

              <button
                type="button"
                onClick={() => {
                  playBalatroSound('play');
                  onEnterGames();
                }}
                className="px-6 py-2.5 rounded bg-[#1e2761]/60 hover:bg-[#1e2761]/90 border border-sky-300/25 text-[11px] font-spaced font-semibold tracking-[0.16em] uppercase text-sky-100 transition-all cursor-pointer backdrop-blur-sm"
              >
                IR A LOS JUEGOS
              </button>
            </div>

            {/* Active Account Status Strip if logged in */}
            {currentAccount && (
              <div className="pt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono text-sky-200/90">
                <span>✓ Google: {currentAccount.googleEmail}</span>
                <span>·</span>
                <span>
                  Rol: {currentAccount.role === 'teacher' ? '👨‍🏫 Docente (Espectador)' : '🧑‍🎓 Estudiante'}
                </span>
                <span>·</span>
                <button
                  type="button"
                  onClick={onLogoutAccount}
                  className="underline hover:text-white cursor-pointer"
                >
                  Cambiar cuenta
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. MUTED MONOCHROME DISCIPLINE EMBLEMS STRIP (Like Cricket/Sprint/Verizon row)
         ===================================================================== */}
      <section
        id="subjects-section"
        className="w-full bg-[#191332] py-8 px-6 border-b border-white/5"
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-8 sm:gap-6 opacity-35 hover:opacity-65 transition-opacity">
          <div className="flex items-center gap-2 font-spaced text-xl sm:text-2xl font-bold tracking-wider text-white">
            <span>⚗️</span>
            <span>QUÍMICA</span>
          </div>
          <div className="flex items-center gap-2 font-spaced text-xl sm:text-2xl font-bold tracking-wider text-white">
            <span>⚡</span>
            <span>FÍSICA</span>
          </div>
          <div className="flex items-center gap-2 font-spaced text-xl sm:text-2xl font-bold tracking-wider text-white">
            <span>📐</span>
            <span>MATEMÁTICAS</span>
          </div>
          <div className="flex items-center gap-2 font-spaced text-xl sm:text-2xl font-bold tracking-wider text-white">
            <span>🧬</span>
            <span>BIOLOGÍA</span>
          </div>
          <div className="flex items-center gap-2 font-spaced text-xl sm:text-2xl font-bold tracking-wider text-white">
            <span>🏛️</span>
            <span>HISTORIA</span>
          </div>
          <div className="flex items-center gap-2 font-spaced text-xl sm:text-2xl font-bold tracking-wider text-white">
            <span>📚</span>
            <span>LENGUAJE</span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SIX-FEATURE GRID SECTION ("EXPERIENCE THE EXTRAORDINARY")
         ===================================================================== */}
      <section id="features-grid" className="w-full bg-[#191332] py-20 sm:py-24 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto space-y-14">
          {/* Section Header */}
          <div className="text-center space-y-2.5 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-2 font-spaced text-sm sm:text-base tracking-wide text-[#3b82f6]">
              <span>El Ecosistema de</span>
              <AulaPlayLogo size="sm" theme="light" />
            </span>
            <h2 className="font-spaced font-normal text-3xl sm:text-4xl tracking-[0.06em] uppercase text-white">
              EXPERIMENTA LO EXTRAORDINARIO
            </h2>
            <p className="text-xs sm:text-sm text-[#7c739e] leading-relaxed">
              ¿Alguna vez imaginaste transformar tu clase en una expedición interactiva donde el aprendizaje, la emoción y la evaluación ocurren al mismo tiempo?
            </p>
          </div>

          {/* 2x3 Grid with Custom Glowing Blue/Indigo Vector Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {/* Item 1: Escape Room */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] p-2.5 shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.35)] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-spaced text-lg font-medium tracking-wide text-white">
                  Escape Room de 10 Cámaras
                </h3>
                <p className="text-xs text-[#7c739e] leading-relaxed">
                  Los alumnos resuelven 10 acertijos curriculares antes de que el reloj dinámico se agote. Incluye generador con IA.
                </p>
              </div>
            </div>

            {/* Item 2: 100 Latinos Dicen */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#38bdf8] to-[#2563eb] p-2.5 shrink-0 shadow-[0_0_20px_rgba(56,189,248,0.35)] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-spaced text-lg font-medium tracking-wide text-white">
                  100 Latinos Dicen Escolar
                </h3>
                <p className="text-xs text-[#7c739e] leading-relaxed">
                  Competencia por equipos con barra de progreso de 10 segundos reactiva, strikes en vivo y robo de puntos.
                </p>
              </div>
            </div>

            {/* Item 3: Póker Químico */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#2563eb] p-2.5 shrink-0 shadow-[0_0_20px_rgba(79,70,229,0.35)] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 2v7.31L4.72 18.55A2 2 0 0 0 6.45 21.5h11.1a2 2 0 0 0 1.73-2.95L14 9.31V2" />
                  <path d="M8.5 2h7" />
                  <path d="M7 16h10" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-spaced text-lg font-medium tracking-wide text-white">
                  Póker Químico del Octeto
                </h3>
                <p className="text-xs text-[#7c739e] leading-relaxed">
                  Combina elementos de la tabla periódica para sintetizar compuestos estables y explora sus estructuras de Lewis.
                </p>
              </div>
            </div>

            {/* Item 4: Vinculación con Google */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#1e40af] p-2.5 shrink-0 shadow-[0_0_20px_rgba(2,132,199,0.35)] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-spaced text-lg font-medium tracking-wide text-white">
                  Cuenta Google & Nombre de Usuario
                </h3>
                <p className="text-xs text-[#7c739e] leading-relaxed">
                  Crea tu perfil vinculando tu correo de Google, personaliza tu nombre de usuario y selecciona tu avatar académico.
                </p>
              </div>
            </div>

            {/* Item 5: Docente Espectador */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#3730a3] p-2.5 shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.35)] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-spaced text-lg font-medium tracking-wide text-white">
                  Docente Exclusivamente Espectador
                </h3>
                <p className="text-xs text-[#7c739e] leading-relaxed">
                  El profesor supervisa las jugadas y modera el aula en vivo sin aparecer nunca sentado como jugador en la mesa.
                </p>
              </div>
            </div>

            {/* Item 6: Materias y Notas 0-100 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#312e81] p-2.5 shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.35)] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-spaced text-lg font-medium tracking-wide text-white">
                  Materias & Notas de 0 a 100
                </h3>
                <p className="text-xs text-[#7c739e] leading-relaxed">
                  Elige qué materias enseñar o aprender y consulta el historial detallado de calificaciones con fecha y estadísticas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. SPLIT SECTION 1 — LEFT TEXT + RIGHT ASTRONAUT & PLANET ILLUSTRATION
             ("See More Than Your Eye Does")
         ===================================================================== */}
      <section id="teacher-section" className="w-full bg-[#191332] py-16 sm:py-24 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text & Button */}
          <div className="space-y-5 max-w-md">
            <span className="block font-spaced text-sm sm:text-base tracking-wide text-[#3b82f6]">
              Modo Docente & Estudiante
            </span>

            <h2 className="font-spaced font-light text-4xl sm:text-5xl text-white tracking-wide leading-tight">
              Ve Más Allá De Lo Que Imaginas
            </h2>

            <p className="text-xs sm:text-sm text-[#7c739e] leading-relaxed">
              Al crear tu cuenta y vincularla con Google, decides si eres Docente o Estudiante y seleccionas tus materias favoritas (Química, Física, Matemáticas, Biología, Historia, Lenguaje y más).
            </p>

            <p className="text-xs sm:text-sm text-[#7c739e] leading-relaxed">
              Como docente tendrás un panel de supervisión en vivo, generador de bancos de preguntas con IA y registro automático de calificaciones de tus alumnos sin ocupar asientos en ningún minijuego.
            </p>

            <div className="pt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('play');
                  onOpenCreateAccount();
                }}
                className="px-7 py-3 rounded bg-[#282048] hover:bg-[#362b60] border border-white/10 text-[11px] font-spaced font-semibold tracking-[0.18em] uppercase text-white transition-all cursor-pointer shadow-lg"
              >
                CONFIGURAR CUENTA
              </button>
            </div>
          </div>

          {/* Right Column: Astronaut Standing Before Striped Planet & Star Beam SVG */}
          <div className="relative flex items-center justify-center">
            <svg className="w-full max-w-[420px] h-auto" viewBox="0 0 440 400">
              <defs>
                <linearGradient id="starSpotlight" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.65" />
                  <stop offset="35%" stopColor="#93c5fd" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#191332" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="planetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5b4bc4" />
                  <stop offset="100%" stopColor="#2e236c" />
                </linearGradient>
                <clipPath id="planetClip">
                  <circle cx="220" cy="215" r="108" />
                </clipPath>
              </defs>

              {/* Decorative + and dot stars */}
              <g stroke="#4c4175" strokeWidth="1.5">
                <line x1="65" y1="90" x2="73" y2="90" />
                <line x1="69" y1="86" x2="69" y2="94" />
                <line x1="115" y1="240" x2="123" y2="240" />
                <line x1="119" y1="236" x2="119" y2="244" />
                <line x1="365" y1="255" x2="373" y2="255" />
                <line x1="369" y1="251" x2="369" y2="259" />
              </g>
              <circle cx="155" cy="70" r="2.5" fill="#3b82f6" opacity="0.6" />
              <circle cx="380" cy="145" r="2" fill="#60a5fa" opacity="0.5" />
              <circle cx="80" cy="310" r="2" fill="#4c4175" />

              {/* Diagonal Star Spotlight Beam */}
              <polygon points="345,58 145,190 275,315" fill="url(#starSpotlight)" />

              {/* Striped Indigo Planet */}
              <g clipPath="url(#planetClip)">
                <circle cx="220" cy="215" r="108" fill="url(#planetGrad)" />
                {/* Diagonal Wavy Bands across Planet */}
                <path
                  d="M100,150 Q180,120 260,90 L290,115 Q200,155 110,185 Z"
                  fill="#43359e"
                  opacity="0.7"
                />
                <path
                  d="M95,215 Q200,175 320,125 L340,165 Q220,215 110,255 Z"
                  fill="#372a87"
                  opacity="0.8"
                />
                <path
                  d="M120,295 Q230,245 345,195 L360,235 Q245,285 140,325 Z"
                  fill="#291e69"
                  opacity="0.85"
                />
              </g>

              {/* Glowing Star Source at Top Right */}
              <circle cx="332" cy="72" r="26" fill="#fef08a" opacity="0.22" />
              <circle cx="332" cy="72" r="9" fill="#fef08a" />

              {/* Astronaut / Explorer Silhouette Standing at Bottom of Planet */}
              <g transform="translate(192, 232)">
                {/* Shadow */}
                <ellipse cx="28" cy="112" rx="34" ry="4" fill="#0f0b21" />
                {/* Backpack */}
                <rect x="10" y="28" width="36" height="40" rx="8" fill="#130e29" stroke="#60a5fa" strokeWidth="1.2" />
                {/* Helmet */}
                <circle cx="28" cy="18" r="14" fill="#130e29" stroke="#93c5fd" strokeWidth="1.5" />
                {/* Body & Suit */}
                <path
                  d="M12,32 C6,45 4,62 8,72 L14,72 L14,108 L25,108 L27,78 L30,78 L32,108 L43,108 L43,72 L49,72 C53,62 51,45 44,32 Z"
                  fill="#130e29"
                  stroke="#60a5fa"
                  strokeWidth="1.2"
                />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. SPLIT SECTION 2 — LEFT GIANT MOBILE ILLUSTRATION + RIGHT TEXT
             ("FINDING THE HAPPYNESS IS NOT THAT HARD IN MOBILE")
         ===================================================================== */}
      <section id="mobile-section" className="w-full bg-[#191332] py-16 sm:py-24 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Giant Vertical Mobile Screen & Explorer Climbing Ladder to Touch Glowing Pin */}
          <div className="relative flex items-center justify-center order-2 md:order-1">
            <svg className="w-full max-w-[400px] h-auto" viewBox="0 0 420 460">
              <defs>
                <linearGradient id="phoneBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#352f78" />
                  <stop offset="100%" stopColor="#262059" />
                </linearGradient>
                <radialGradient id="pinHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
                  <stop offset="55%" stopColor="#fde047" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Sparkles around Phone */}
              <g stroke="#4c4175" strokeWidth="1.5">
                <line x1="52" y1="150" x2="60" y2="150" />
                <line x1="56" y1="146" x2="56" y2="154" />
                <line x1="350" y1="220" x2="358" y2="220" />
                <line x1="354" y1="216" x2="354" y2="224" />
                <line x1="42" y1="340" x2="50" y2="340" />
                <line x1="46" y1="336" x2="46" y2="344" />
              </g>
              <circle cx="80" cy="85" r="2" fill="#60a5fa" opacity="0.5" />
              <circle cx="340" cy="120" r="2.5" fill="#38bdf8" opacity="0.5" />

              {/* Giant Smartphone Frame */}
              <rect
                x="95"
                y="40"
                width="205"
                height="365"
                rx="16"
                fill="url(#phoneBody)"
                stroke="#483f94"
                strokeWidth="3"
              />
              {/* Inner Screen */}
              <rect x="105" y="56" width="185" height="332" rx="8" fill="#2c2566" />

              {/* Subtle Perspective Map Grid Lines inside Phone Screen */}
              <g stroke="#3e3582" strokeWidth="1" opacity="0.7">
                <line x1="105" y1="115" x2="290" y2="95" />
                <line x1="105" y1="175" x2="290" y2="155" />
                <line x1="105" y1="235" x2="290" y2="215" />
                <line x1="105" y1="295" x2="290" y2="275" />
                <line x1="105" y1="355" x2="290" y2="335" />
                <line x1="150" y1="56" x2="130" y2="388" />
                <line x1="205" y1="56" x2="185" y2="388" />
                <line x1="260" y1="56" x2="240" y2="388" />
              </g>

              {/* Glowing Yellow Discovery Pin on the Phone Screen */}
              <circle cx="228" cy="195" r="78" fill="url(#pinHalo)" />
              <path
                d="M228,135 C206,135 188,153 188,175 C188,204 228,242 228,242 C228,242 268,204 268,175 C268,153 250,135 228,135 Z"
                fill="#fef08a"
              />
              <circle cx="228" cy="173" r="14" fill="#fde047" opacity="0.65" />

              {/* Small Ladder leaning at bottom left of Phone */}
              <g stroke="#4f46a8" strokeWidth="4" strokeLinecap="round">
                <line x1="92" y1="402" x2="128" y2="310" />
                <line x1="116" y1="402" x2="152" y2="310" />
                <line x1="98" y1="385" x2="122" y2="385" />
                <line x1="106" y1="363" x2="130" y2="363" />
                <line x1="114" y1="341" x2="138" y2="341" />
                <line x1="122" y1="320" x2="146" y2="320" />
              </g>

              {/* Student Character on Ladder Reaching the Glowing Pin */}
              <g transform="translate(122, 215)">
                {/* Head */}
                <circle cx="42" cy="18" r="11" fill="#191332" />
                {/* Right Arm reaching up to touch the pin */}
                <path d="M54,34 L94,25 L96,32 L58,45 Z" fill="#c7d2fe" />
                {/* Left Arm */}
                <path d="M26,36 L8,68 L15,72 L32,46 Z" fill="#c7d2fe" />
                {/* White T-Shirt Torso */}
                <path d="M26,32 L58,32 L54,82 L26,82 Z" fill="#eef2ff" />
                {/* Shorts */}
                <path d="M26,82 L54,82 L56,114 L42,114 L40,95 L38,114 L24,114 Z" fill="#433894" />
                {/* Legs on ladder */}
                <rect x="26" y="114" width="9" height="42" rx="3" fill="#c7d2fe" />
                <rect x="44" y="114" width="9" height="54" rx="3" fill="#c7d2fe" />
                {/* Shoes */}
                <rect x="23" y="154" width="15" height="6" rx="3" fill="#ffffff" />
                <rect x="42" y="166" width="15" height="6" rx="3" fill="#ffffff" />
              </g>
            </svg>
          </div>

          {/* Right Column: Text & Button */}
          <div className="space-y-5 max-w-md order-1 md:order-2">
            <span className="block font-spaced text-sm sm:text-base tracking-wide text-[#3b82f6]">
              Conexión Instantánea Sin Descargas
            </span>

            <h2 className="font-spaced font-normal text-3xl sm:text-4xl tracking-[0.04em] uppercase text-white leading-tight">
              APRENDER JUGANDO NO ES
              <br />
              TAN DIFÍCIL EN TU MÓVIL O PC
            </h2>

            <p className="text-xs sm:text-sm text-[#7c739e] leading-relaxed">
              Los estudiantes se conectan en segundos ingresando el PIN proyectado por el docente o escaneando el código QR desde su teléfono, tablet o computador.
            </p>

            <p className="text-xs sm:text-sm text-[#7c739e] leading-relaxed">
              Además, cada estudiante puede revisar su propio historial de partidas con fecha y nota obtenida, mientras que el docente visualiza las estadísticas completas de toda su clase.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('play');
                  onEnterGames();
                }}
                className="px-7 py-3 rounded bg-[#282048] hover:bg-[#362b60] border border-white/10 text-[11px] font-spaced font-semibold tracking-[0.18em] uppercase text-white transition-all cursor-pointer shadow-lg"
              >
                EXPLORAR JUEGOS
              </button>

              {!currentAccount && (
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('select');
                    onOpenCreateAccount();
                  }}
                  className="px-6 py-3 rounded bg-transparent hover:bg-white/5 border border-[#3b82f6]/40 text-[11px] font-spaced font-semibold tracking-[0.18em] uppercase text-[#60a5fa] transition-all cursor-pointer"
                >
                  VINCULAR GOOGLE
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. FOOTER + TWILIGHT HORIZON SILHOUETTE (Exact match to bottom of SPACED)
         ===================================================================== */}
      <footer className="relative w-full h-auto bg-gradient-to-b from-[#191332] via-[#1b215e] to-[#1d569e] pt-16">
        {/* Footer 4-Column Links */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 sm:px-10 pb-28 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 select-none">
              <span className="font-spaced-logo text-lg font-extrabold tracking-[0.28em] text-white">
                AUL
              </span>
              <span className="inline-flex flex-col justify-between w-4 h-3.5 mr-1">
                <span className="w-full h-[2.5px] bg-white" />
                <span className="w-3/4 h-[2.5px] bg-sky-400" />
                <span className="w-full h-[2.5px] bg-white" />
              </span>
              <span className="font-spaced-logo text-lg font-extrabold tracking-[0.28em] text-white">
                PLAY
              </span>
            </div>
            <p className="font-spaced text-xs tracking-wider uppercase text-[#7c739e]">
              APRENDIZAJE INFINITO TE ESPERA EN CLASE
            </p>
          </div>

          {/* Column 2: Explorar */}
          <div className="space-y-2.5 text-xs">
            <span className="block font-spaced text-sm text-[#3b82f6] tracking-wide">
              Explorar
            </span>
            <ul className="space-y-1.5 text-white/80 font-spaced tracking-wider">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-white cursor-pointer"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={onOpenCreateAccount} className="hover:text-white cursor-pointer">
                  Crear Cuenta con Google
                </button>
              </li>
              <li>
                <button onClick={onEnterGames} className="hover:text-white cursor-pointer">
                  Catálogo de Minijuegos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('features-grid')}
                  className="hover:text-white cursor-pointer"
                >
                  Características
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Perfiles */}
          <div className="space-y-2.5 text-xs">
            <span className="block font-spaced text-sm text-[#3b82f6] tracking-wide">
              Perfiles
            </span>
            <ul className="space-y-1.5 text-white/80 font-spaced tracking-wider">
              <li>
                <button onClick={onOpenCreateAccount} className="hover:text-white cursor-pointer">
                  Soy Docente (Espectador)
                </button>
              </li>
              <li>
                <button onClick={onOpenCreateAccount} className="hover:text-white cursor-pointer">
                  Soy Estudiante (Jugador)
                </button>
              </li>
              <li>
                <button onClick={onOpenCreateAccount} className="hover:text-white cursor-pointer">
                  Elegir Materias
                </button>
              </li>
              <li>
                <button onClick={onEnterGames} className="hover:text-white cursor-pointer">
                  Historial y Notas 0-100
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Minijuegos */}
          <div className="space-y-2.5 text-xs">
            <span className="block font-spaced text-sm text-[#3b82f6] tracking-wide">
              Minijuegos
            </span>
            <ul className="space-y-1.5 text-white/80 font-spaced tracking-wider">
              <li>
                <button onClick={onEnterGames} className="hover:text-white cursor-pointer">
                  Escape Room (10 Cámaras)
                </button>
              </li>
              <li>
                <button onClick={onEnterGames} className="hover:text-white cursor-pointer">
                  100 Latinos Dicen (Equipos)
                </button>
              </li>
              <li>
                <button onClick={onEnterGames} className="hover:text-white cursor-pointer">
                  Póker Químico del Octeto
                </button>
              </li>
              <li>
                <button onClick={onEnterGames} className="hover:text-white cursor-pointer">
                  Colección y Jerarquía
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Twilight Horizon Glow & Silhouette Bench/Hills */}
        <svg
          className="w-full h-24 sm:h-32 block pointer-events-none"
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
        >
          {/* Park Bench Silhouette on Horizon */}
          <g fill="#191332" transform="translate(402, 48)">
            <rect x="0" y="10" width="72" height="3.5" rx="1" />
            <rect x="0" y="16" width="72" height="3.5" rx="1" />
            <rect x="-3" y="22" width="78" height="4.5" rx="1.5" />
            <rect x="8" y="7" width="4.5" height="30" />
            <rect x="59" y="7" width="4.5" height="30" />
          </g>

          {/* Small foliage silhouettes */}
          <g fill="#191332">
            <path d="M610,85 C605,68 595,62 590,65 C592,55 602,50 608,58 C612,48 622,50 620,64 C628,60 632,68 624,85 Z" />
            <path d="M895,95 C888,75 875,70 870,76 C875,62 888,60 894,68 C900,56 912,60 908,74 C916,70 922,78 912,95 Z" />
          </g>

          {/* Rolling Horizon Hills */}
          <path
            d="M0,95 Q150,62 310,82 T650,68 T980,88 T1440,72 L1440,145 L0,145 Z"
            fill="#191332"
          />
        </svg>
      </footer>
    </div>
  );
}
