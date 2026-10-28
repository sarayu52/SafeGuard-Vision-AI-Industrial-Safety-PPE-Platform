export function getConstructionSceneSvg(annotated = false): string {
  const overlay = annotated ? `
    <!-- Annotated YOLOv8 Bounding Boxes -->
    <!-- Worker #1 [Track 01]: Missing Helmet Violation -->
    <g id="worker-0">
      <rect x="220" y="240" width="180" height="420" fill="rgba(239, 68, 68, 0.08)" stroke="#ef4444" stroke-width="3" rx="4" />
      <rect x="220" y="210" width="220" height="26" fill="rgba(239, 68, 68, 0.92)" rx="3" />
      <text x="228" y="227" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">
        Worker #1 [Track 01] · Violation (89%)
      </text>
      <!-- Head box: Missing Helmet -->
      <rect x="255" y="235" width="110" height="90" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,2" />
      <text x="260" y="250" fill="#ef4444" font-family="sans-serif" font-size="10" font-weight="bold">MISSING HELMET</text>
      <!-- Vest box: OK -->
      <rect x="240" y="330" width="140" height="180" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4,2" />
      <text x="245" y="348" fill="#10b981" font-family="sans-serif" font-size="10" font-weight="bold">HIGH-VIS VEST OK</text>
    </g>

    <!-- Worker #2 [Track 02]: Missing Vest Violation -->
    <g id="worker-1">
      <rect x="540" y="210" width="190" height="450" fill="rgba(239, 68, 68, 0.08)" stroke="#ef4444" stroke-width="3" rx="4" />
      <rect x="540" y="180" width="220" height="26" fill="rgba(239, 68, 68, 0.92)" rx="3" />
      <text x="548" y="197" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">
        Worker #2 [Track 02] · Violation (92%)
      </text>
      <!-- Helmet box: OK -->
      <rect x="580" y="205" width="110" height="90" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4,2" />
      <text x="585" y="222" fill="#10b981" font-family="sans-serif" font-size="10" font-weight="bold">HARDHAT OK</text>
      <!-- Vest box: Missing Vest -->
      <rect x="560" y="300" width="150" height="190" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,2" />
      <text x="565" y="320" fill="#ef4444" font-family="sans-serif" font-size="10" font-weight="bold">MISSING SAFETY VEST</text>
    </g>

    <!-- Worker #3 [Track 03]: 100% Compliant -->
    <g id="worker-2">
      <rect x="880" y="230" width="180" height="430" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" stroke-width="3" rx="4" />
      <rect x="880" y="200" width="220" height="26" fill="rgba(16, 185, 129, 0.92)" rx="3" />
      <text x="888" y="217" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">
        Worker #3 [Track 03] · Compliant (97%)
      </text>
      <!-- Helmet box: OK -->
      <rect x="915" y="225" width="110" height="90" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4,2" />
      <text x="920" y="242" fill="#10b981" font-family="sans-serif" font-size="10" font-weight="bold">HARDHAT OK</text>
      <!-- Vest box: OK -->
      <rect x="900" y="320" width="140" height="180" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4,2" />
      <text x="905" y="338" fill="#10b981" font-family="sans-serif" font-size="10" font-weight="bold">HIGH-VIS VEST OK</text>
    </g>
  ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#e0f2fe"/>
      </linearGradient>
      <linearGradient id="cDeck" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
    </defs>
    
    <!-- Background: Blue Daylight Construction Site -->
    <rect width="1280" height="420" fill="url(#cSky)" />
    
    <!-- Concrete Foundation & Steel Rebar Deck -->
    <rect y="420" width="1280" height="300" fill="url(#cDeck)" />
    <line x1="0" y1="420" x2="1280" y2="420" stroke="#f59e0b" stroke-width="8" stroke-dasharray="30,20" />
    
    <!-- Tower Crane Structure in Background -->
    <g opacity="0.45" stroke="#0284c7" stroke-width="3" fill="none">
      <rect x="120" y="40" width="50" height="400" />
      <line x1="120" y1="40" x2="170" y2="90" /><line x1="120" y1="90" x2="170" y2="140" />
      <line x1="120" y1="140" x2="170" y2="190" /><line x1="120" y1="190" x2="170" y2="240" />
      <line x1="120" y1="40" x2="700" y2="40" stroke-width="5" />
      <line x1="450" y1="40" x2="450" y2="280" stroke="#f59e0b" stroke-width="2" />
      <rect x="430" y="280" width="40" height="40" fill="#f59e0b" />
    </g>

    <!-- Structural Steel Beams & Scaffolding -->
    <g stroke="#475569" stroke-width="8" opacity="0.6">
      <line x1="40" y1="150" x2="1240" y2="150" />
      <line x1="80" y1="150" x2="80" y2="420" />
      <line x1="460" y1="150" x2="460" y2="420" />
      <line x1="840" y1="150" x2="840" y2="420" />
      <line x1="1200" y1="150" x2="1200" y2="420" />
    </g>

    <!-- Worker 1 Silhouette (Missing Helmet, Wearing High-Vis Vest) -->
    <g id="worker-figure-1">
      <!-- Head (Dark Hair, No Helmet) -->
      <circle cx="310" cy="275" r="32" fill="#3b2b23" />
      <!-- Torso with Neon Green/Yellow Vest -->
      <path d="M260,330 L360,330 L350,510 L270,510 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="2" />
      <!-- Reflective Silver Stripes on Vest -->
      <rect x="270" y="380" width="80" height="14" fill="#f1f5f9" />
      <rect x="270" y="440" width="80" height="14" fill="#f1f5f9" />
      <!-- Legs with Jeans -->
      <rect x="275" y="510" width="30" height="130" fill="#1e3a8a" />
      <rect x="315" y="510" width="30" height="130" fill="#1e3a8a" />
      <!-- Steel Boots -->
      <rect x="265" y="630" width="45" height="25" fill="#78350f" rx="4" />
      <rect x="315" y="630" width="45" height="25" fill="#78350f" rx="4" />
    </g>

    <!-- Worker 2 Silhouette (Wearing Hardhat, Missing Safety Vest) -->
    <g id="worker-figure-2">
      <!-- Yellow Hardhat -->
      <path d="M590,240 C590,215 670,215 670,240 Z" fill="#eab308" stroke="#ca8a04" stroke-width="3" />
      <rect x="585" y="238" width="90" height="10" fill="#ca8a04" rx="3" />
      <circle cx="630" cy="265" r="24" fill="#f5d0b5" />
      <!-- Plain Navy Blue Shirt (NO VEST - VIOLATION) -->
      <path d="M580,300 L680,300 L670,490 L590,490 Z" fill="#1e293b" />
      <!-- Work Pants -->
      <rect x="595" y="490" width="32" height="145" fill="#334155" />
      <rect x="635" y="490" width="32" height="145" fill="#334155" />
      <!-- Safety Boots -->
      <rect x="585" y="625" width="45" height="25" fill="#451a03" rx="4" />
      <rect x="635" y="625" width="45" height="25" fill="#451a03" rx="4" />
    </g>

    <!-- Worker 3 Silhouette (Fully Compliant: White Hardhat + Orange Safety Vest) -->
    <g id="worker-figure-3">
      <!-- White Hardhat -->
      <path d="M930,250 C930,225 1010,225 1010,250 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="3" />
      <rect x="925" y="248" width="90" height="10" fill="#e2e8f0" rx="3" />
      <circle cx="970" cy="275" r="24" fill="#d97706" />
      <!-- Fluorescent Orange Vest -->
      <path d="M920,310 L1020,310 L1010,500 L930,500 Z" fill="#f97316" stroke="#ea580c" stroke-width="2" />
      <!-- Silver Reflective Tape -->
      <line x1="935" y1="310" x2="960" y2="500" stroke="#ffffff" stroke-width="12" />
      <line x1="1005" y1="310" x2="980" y2="500" stroke="#ffffff" stroke-width="12" />
      <!-- Work Cargo Pants -->
      <rect x="935" y="500" width="30" height="135" fill="#374151" />
      <rect x="975" y="500" width="30" height="135" fill="#374151" />
      <!-- Steel Boots -->
      <rect x="925" y="625" width="45" height="25" fill="#292524" rx="4" />
      <rect x="975" y="625" width="45" height="25" fill="#292524" rx="4" />
    </g>

    <!-- Watermark / Site Overlay Banner -->
    <rect x="20" y="20" width="440" height="36" fill="rgba(15, 23, 42, 0.85)" rx="6" />
    <circle cx="38" cy="38" r="5" fill="#10b981" />
    <text x="52" y="42" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">
      APEX CONSTRUCTION SECTOR 4B · HIGH-RES CAMERA FEED
    </text>

    ${overlay}
  </svg>`;
}

export function getAutoAssemblySceneSvg(annotated = false): string {
  const overlay = annotated ? `
    <!-- Worker #1 [Track 04]: Missing Gloves Violation -->
    <g id="worker-0">
      <rect x="520" y="220" width="200" height="430" fill="rgba(245, 158, 11, 0.08)" stroke="#f59e0b" stroke-width="3" rx="4" />
      <rect x="520" y="190" width="230" height="26" fill="rgba(245, 158, 11, 0.92)" rx="3" />
      <text x="528" y="207" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">
        Operator [Track 04] · Warning (88%)
      </text>
      <!-- Helmet box: OK -->
      <rect x="560" y="215" width="120" height="85" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4,2" />
      <text x="565" y="232" fill="#10b981" font-family="sans-serif" font-size="10" font-weight="bold">BUMP CAP OK</text>
      <!-- Hands box: Missing Kevlar Gloves -->
      <rect x="510" y="410" width="220" height="70" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,2" />
      <text x="515" y="428" fill="#ef4444" font-family="sans-serif" font-size="10" font-weight="bold">MISSING KEVLAR GLOVES</text>
    </g>
  ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="1280" height="720" fill="#0f172a" />
    <!-- Epoxy Factory Floor -->
    <rect y="460" width="1280" height="260" fill="#1e293b" />
    <line x1="0" y1="460" x2="1280" y2="460" stroke="#eab308" stroke-width="6" stroke-dasharray="25,25" />

    <!-- Robotic Welding Arms in Background -->
    <path d="M180,460 L240,300 L340,240 L380,340" fill="none" stroke="#ea580c" stroke-width="16" stroke-linecap="round" />
    <circle cx="340" cy="240" r="18" fill="#c2410c" />
    <path d="M1020,460 L960,280 L860,220 L820,310" fill="none" stroke="#ea580c" stroke-width="16" stroke-linecap="round" />

    <!-- Vehicle Body Chassis on Conveyor -->
    <rect x="360" y="320" width="520" height="150" fill="#334155" stroke="#64748b" stroke-width="4" rx="10" />
    <rect x="420" y="340" width="140" height="70" fill="#1e293b" rx="4" />
    <rect x="620" y="340" width="140" height="70" fill="#1e293b" rx="4" />

    <!-- Assembly Operator Silhouette -->
    <g id="auto-operator">
      <path d="M580,245 C580,225 640,225 640,245 Z" fill="#3b82f6" />
      <circle cx="610" cy="265" r="22" fill="#fcd34d" />
      <!-- Company Work Uniform -->
      <path d="M560,295 L660,295 L650,480 L570,480 Z" fill="#1d4ed8" />
      <rect x="580" y="480" width="28" height="140" fill="#1e293b" />
      <rect x="620" y="480" width="28" height="140" fill="#1e293b" />
      <!-- Bare Hands handling sheet metal (VIOLATION) -->
      <circle cx="535" cy="430" r="12" fill="#fcd34d" />
      <circle cx="685" cy="430" r="12" fill="#fcd34d" />
    </g>

    <rect x="20" y="20" width="460" height="36" fill="rgba(15, 23, 42, 0.85)" rx="6" />
    <circle cx="38" cy="38" r="5" fill="#3b82f6" />
    <text x="52" y="42" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">
      DETROIT AUTO WORKS · ROBOTIC WELDING CELL 08 FEED
    </text>

    ${overlay}
  </svg>`;
}

export function getWarehouseSceneSvg(annotated = false): string {
  const overlay = annotated ? `
    <!-- Worker #1 [Track 01]: Compliant -->
    <g id="worker-0">
      <rect x="340" y="260" width="170" height="400" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" stroke-width="3" rx="4" />
      <rect x="340" y="230" width="210" height="26" fill="rgba(16, 185, 129, 0.92)" rx="3" />
      <text x="348" y="247" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">
        Worker #1 [Track 01] · Compliant (96%)
      </text>
    </g>
    <!-- Worker #2 [Track 02]: Compliant -->
    <g id="worker-1">
      <rect x="780" y="240" width="170" height="420" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" stroke-width="3" rx="4" />
      <rect x="780" y="210" width="210" height="26" fill="rgba(16, 185, 129, 0.92)" rx="3" />
      <text x="788" y="227" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">
        Worker #2 [Track 02] · Compliant (99%)
      </text>
    </g>
  ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="1280" height="720" fill="#1e293b" />
    <!-- High-Bay Racking Shelves -->
    <g stroke="#ea580c" stroke-width="6" opacity="0.8">
      <line x1="80" y1="40" x2="80" y2="700" /><line x1="280" y1="40" x2="280" y2="700" />
      <line x1="1000" y1="40" x2="1000" y2="700" /><line x1="1200" y1="40" x2="1200" y2="700" />
      <line x1="80" y1="160" x2="280" y2="160" stroke="#f97316" stroke-width="8" />
      <line x1="80" y1="320" x2="280" y2="320" stroke="#f97316" stroke-width="8" />
      <line x1="1000" y1="180" x2="1200" y2="180" stroke="#f97316" stroke-width="8" />
      <line x1="1000" y1="340" x2="1200" y2="340" stroke="#f97316" stroke-width="8" />
    </g>

    <!-- Stacked Wooden Pallets -->
    <rect x="100" y="100" width="160" height="50" fill="#ca8a04" rx="4" />
    <rect x="100" y="260" width="160" height="50" fill="#ca8a04" rx="4" />
    <rect x="1020" y="120" width="160" height="50" fill="#ca8a04" rx="4" />

    <!-- Yellow Floor Warning Striping -->
    <rect y="500" width="1280" height="220" fill="#334155" />
    <line x1="300" y1="500" x2="980" y2="500" stroke="#eab308" stroke-width="8" />
    <line x1="300" y1="700" x2="980" y2="700" stroke="#eab308" stroke-width="8" />

    <!-- Warehouse Forklift Silhouette -->
    <rect x="540" y="400" width="140" height="180" fill="#eab308" rx="8" />
    <rect x="520" y="340" width="80" height="120" fill="none" stroke="#000000" stroke-width="6" />
    <circle cx="560" cy="580" r="26" fill="#0f172a" />
    <circle cx="660" cy="580" r="26" fill="#0f172a" />

    <!-- Warehouse Workers with High-Vis -->
    <g id="warehouse-worker-1">
      <path d="M400,280 C400,260 450,260 450,280 Z" fill="#eab308" />
      <circle cx="425" cy="295" r="18" fill="#fbcfe8" />
      <path d="M390,320 L460,320 L450,470 L400,470 Z" fill="#84cc16" />
      <rect x="405" y="470" width="20" height="150" fill="#1e293b" />
      <rect x="435" y="470" width="20" height="150" fill="#1e293b" />
    </g>

    <g id="warehouse-worker-2">
      <path d="M840,260 C840,240 890,240 890,260 Z" fill="#eab308" />
      <circle cx="865" cy="275" r="18" fill="#fed7aa" />
      <path d="M830,300 L900,300 L890,460 L840,460 Z" fill="#f97316" />
      <rect x="845" y="460" width="20" height="160" fill="#1e293b" />
      <rect x="875" y="460" width="20" height="160" fill="#1e293b" />
    </g>

    <rect x="20" y="20" width="460" height="36" fill="rgba(15, 23, 42, 0.85)" rx="6" />
    <circle cx="38" cy="38" r="5" fill="#10b981" />
    <text x="52" y="42" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">
      CENTRAL LOGISTICS HUB · HIGH-BAY AISLE 12 SURVEILLANCE
    </text>

    ${overlay}
  </svg>`;
}
