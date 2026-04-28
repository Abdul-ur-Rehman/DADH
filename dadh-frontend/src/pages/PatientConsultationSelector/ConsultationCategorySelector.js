import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoDark from "../../assets/images/logo-dark.png";

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api";

const T = {
  teal:      "#0D7377",
  tealDark:  "#0A5F62",
  tealLight: "#F0FDFA",
  border:    "#D1E8E8",
  fg:        "#111E1F",
  muted:     "#4B7172",
  mutedBg:   "#E6F4F4",
  white:     "#ffffff",
};

const STYLES = `
  @keyframes cs-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

function CategoryCard({ category, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `2px solid ${isSelected ? T.teal : hovered ? T.teal : T.border}`,
        borderRadius: 12,
        padding: "18px 20px",
        cursor: "pointer",
        background: isSelected ? T.tealLight : hovered ? "#F8FFFE" : T.white,
        transition: "all 0.15s",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: isSelected ? T.mutedBg : "#F1F5F9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        flexShrink: 0,
      }}>
        🩺
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 15, color: isSelected ? T.teal : T.fg }}>
          {category.category}
        </p>
        {category.notes && (
          <p style={{ margin: 0, fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
            {category.notes}
          </p>
        )}
      </div>
      <div style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: `2px solid ${isSelected ? T.teal : T.border}`,
        background: isSelected ? T.teal : "transparent",
        flexShrink: 0,
        marginTop: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.white }} />}
      </div>
    </div>
  );
}

export default function ConsultationCategorySelector() {
  const navigate = useNavigate();
  const [categories, setCategories]           = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/consultationCategory/getAll`)
      .then((r) => r.json())
      .then((json) => { if (json.data) setCategories(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
    if (!selectedCategory) return;
    localStorage.setItem("selectedCategory", selectedCategory);
    navigate("/patient/descriptions", { state: { selectedCategory } });
  };

  return (
    <div
      className="dadh-tw-root"
      style={{ minHeight: "100vh", background: "#F8FFFE", padding: "32px 16px" }}
    >
      <style>{STYLES}</style>

      <div style={{ maxWidth: 620, margin: "0 auto", animation: "cs-fade-up 0.4s ease-out both" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={logoDark} alt="DADH" style={{ height: 40, marginBottom: 20 }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.fg, margin: "0 0 8px" }}>
            Book a Consultation
          </h1>
          <p style={{ fontSize: 14, color: T.muted, margin: 0, lineHeight: 1.6 }}>
            Select the category that best matches your needs.
          </p>
        </div>

        {/* Category list */}
        <div style={{
          background: T.white,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: "24px",
          boxShadow: "0 2px 12px rgba(13,115,119,0.07)",
          marginBottom: 24,
        }}>
          <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Select a category
          </p>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 74, background: "#F0FDFA", borderRadius: 12, opacity: 0.6 }} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p style={{ textAlign: "center", color: T.muted, fontSize: 14, padding: "24px 0" }}>
              No categories available at the moment.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {categories.map((cat) => (
                <CategoryCard
                  key={cat._id}
                  category={cat}
                  isSelected={selectedCategory === cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!selectedCategory}
          style={{
            width: "100%",
            padding: "14px",
            background: selectedCategory ? T.teal : "#D1E8E8",
            color: selectedCategory ? T.white : T.muted,
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: selectedCategory ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { if (selectedCategory) e.target.style.background = T.tealDark; }}
          onMouseLeave={(e) => { if (selectedCategory) e.target.style.background = T.teal; }}
        >
          Next: Describe Your Symptoms →
        </button>
      </div>
    </div>
  );
}
