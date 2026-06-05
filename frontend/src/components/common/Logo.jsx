/**
 * Brand logo for CourseAI.
 *
 * Renders an SVG combining an open book silhouette with
 * interconnected nodes (representing AI / knowledge graph).
 *
 * @param {{ size?: 'sm' | 'md' | 'lg', className?: string }} props
 */
export default function Logo({ size = 'md', className = '' }) {
  const dimensions = { sm: 28, md: 36, lg: 48 };
  const px = dimensions[size] || dimensions.md;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CourseAI logo"
    >
      {/* Book base */}
      <path
        d="M6 38V12a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v26"
        stroke="url(#logo-grad-left)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M42 38V12a4 4 0 0 0-4-4H28a4 4 0 0 0-4 4v26"
        stroke="url(#logo-grad-right)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Spine */}
      <line
        x1="24" y1="8" x2="24" y2="38"
        stroke="#818cf8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Knowledge nodes — left page */}
      <circle cx="14" cy="17" r="2.5" fill="#818cf8" />
      <circle cx="18" cy="24" r="2"   fill="#a78bfa" />
      <circle cx="12" cy="28" r="2"   fill="#c084fc" />
      <line x1="14" y1="17" x2="18" y2="24" stroke="#818cf8" strokeWidth="1.2" opacity="0.6" />
      <line x1="18" y1="24" x2="12" y2="28" stroke="#a78bfa" strokeWidth="1.2" opacity="0.6" />
      <line x1="14" y1="17" x2="12" y2="28" stroke="#c084fc" strokeWidth="1"   opacity="0.3" />

      {/* Knowledge nodes — right page */}
      <circle cx="34" cy="16" r="2.5" fill="#6366f1" />
      <circle cx="30" cy="22" r="2"   fill="#818cf8" />
      <circle cx="36" cy="28" r="2"   fill="#a78bfa" />
      <line x1="34" y1="16" x2="30" y2="22" stroke="#6366f1" strokeWidth="1.2" opacity="0.6" />
      <line x1="30" y1="22" x2="36" y2="28" stroke="#818cf8" strokeWidth="1.2" opacity="0.6" />
      <line x1="34" y1="16" x2="36" y2="28" stroke="#a78bfa" strokeWidth="1"   opacity="0.3" />

      {/* Cross-spine connection */}
      <line x1="18" y1="24" x2="30" y2="22" stroke="#818cf8" strokeWidth="1" opacity="0.25" strokeDasharray="2 2" />

      {/* Bottom cover */}
      <path
        d="M6 38c0 0 5-3 18-3s18 3 18 3"
        stroke="#64748b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="logo-grad-left" x1="6" y1="8" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="logo-grad-right" x1="42" y1="8" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}
