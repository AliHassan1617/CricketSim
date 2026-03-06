interface BackButtonProps {
  onClick: () => void;
  style?: React.CSSProperties;
}

/** Circular back button — consistent across all screens */
export function BackButton({ onClick, style }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.09)",
        border: "1px solid rgba(255,255,255,0.13)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.75)",
        fontSize: 20,
        lineHeight: 1,
        flexShrink: 0,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        ...style,
      }}
      className="active:scale-90 transition-transform duration-100"
    >
      ‹
    </button>
  );
}
