const c = "currentColor";

const SVGS = {
  1: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="8" cy="10" r="1.7" fill={c}/><circle cx="12" cy="6.5" r="1.7" fill={c}/><circle cx="16" cy="10" r="1.7" fill={c}/><path d="M9 18c1.2-0.9 4.8-0.9 6 0" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  2: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 6h8l-1 14H9L8 6z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round"/><path d="M9 6l-1-2h8l-1 2" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 10H6a3 3 0 0 0 3 3" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  3: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5h6l-1 16H10L9 5z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round"/><path d="M9 9h6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M8 5l-2-2" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  4: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 7a7 7 0 0 1 11 2" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M18 9l1 2-2-1" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 17a7 7 0 0 1-11-2" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M6 15l-1-2 2 1" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  5: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 7h10v3a2 2 0 0 0 0 4v3H7V7z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round"/><text x="12" y="14.5" textAnchor="middle" fontSize="8" fontWeight="900" fill={c} fontFamily="system-ui, sans-serif">S$5</text></svg>,
  6: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10" cy="10" r="3" fill="none" stroke={c} strokeWidth="2"/><circle cx="14.5" cy="14" r="3" fill="none" stroke={c} strokeWidth="2"/></svg>,
  7: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="8" cy="9" r="1.7" fill={c}/><circle cx="16" cy="9" r="1.7" fill={c}/><circle cx="12" cy="13.5" r="1.7" fill={c}/><path d="M9 18c1.2-0.9 4.8-0.9 6 0" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  8: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 7h10v3a2 2 0 0 0 0 4v3H7V7z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round"/><text x="12" y="14.5" textAnchor="middle" fontSize="8" fontWeight="900" fill={c} fontFamily="system-ui, sans-serif">S$10</text></svg>,
  9: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9.2 9a3.2 3.2 0 0 1 6.2 1c0 2-2 2.4-2 3.8" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="17.2" r="1.2" fill={c}/></svg>,
  10: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2l3.1 7.2 7.9.7-6 5.1 1.8 7.6-6.8-4-6.8 4 1.8-7.6-6-5.1 7.9-.7L12 2z" fill={c}/></svg>,
};

export default function StampSymbol({ stamp }) {
  return SVGS[stamp] || null;
}
