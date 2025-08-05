import React from "react";

const Loader: React.FC = () => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1a0033, #3f006f)",
    fontFamily: "Arial, sans-serif"
  }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 40,
              background: "#ff5bf0",
              borderRadius: 5,
              animation: `bounce 1s infinite ease-in-out`,
              animationDelay: `${i * 0.1}s`,
              transformOrigin: "bottom"
            }}
            className="loader-bar"
          />
        ))}
      </div>
      <div style={{ color: "rgba(255,255,255,0.4)", letterSpacing: 4, fontSize: 14 }}>LOADING</div>
    </div>
    <style>{`
      @keyframes bounce {
        0%, 100% {
          transform: scaleY(0.4);
          opacity: 0.6;
        }
        50% {
          transform: scaleY(1);
          opacity: 1;
        }
      }
      .loader-bar {
        display: block;
      }
    `}</style>
  </div>
);

export default Loader;
