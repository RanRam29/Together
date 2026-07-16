/* @ds-bundle: {"format":4,"namespace":"TogetherDesignSystem_068592","components":[{"name":"Card","sourcePath":"components/cards/Card.jsx"},{"name":"LetterCard","sourcePath":"components/cards/LetterCard.jsx"},{"name":"MatchCard","sourcePath":"components/cards/MatchCard.jsx"},{"name":"MetricCard","sourcePath":"components/cards/MetricCard.jsx"},{"name":"PlaceholderCard","sourcePath":"components/cards/PlaceholderCard.jsx"},{"name":"RequestCard","sourcePath":"components/cards/RequestCard.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"StarRating","sourcePath":"components/feedback/StarRating.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"OtpInput","sourcePath":"components/forms/OtpInput.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"ChildSelector","sourcePath":"components/layout/ChildSelector.jsx"},{"name":"RoleCard","sourcePath":"components/layout/RoleCard.jsx"},{"name":"ScreenHeader","sourcePath":"components/layout/ScreenHeader.jsx"},{"name":"ChipSelect","sourcePath":"components/selection/ChipSelect.jsx"},{"name":"MultiChipSelect","sourcePath":"components/selection/MultiChipSelect.jsx"},{"name":"SwitchToggle","sourcePath":"components/selection/SwitchToggle.jsx"}],"sourceHashes":{"components/cards/Card.jsx":"82d3967ed3ec","components/cards/LetterCard.jsx":"88a0425e83b2","components/cards/MatchCard.jsx":"e0338ad4759c","components/cards/MetricCard.jsx":"8eec87425fce","components/cards/PlaceholderCard.jsx":"9ba0a5bed666","components/cards/RequestCard.jsx":"e25b06cdee6c","components/feedback/Badge.jsx":"f9b88e946915","components/feedback/Banner.jsx":"1404a358b2a4","components/feedback/StarRating.jsx":"0b5644605b0f","components/forms/Button.jsx":"0c98cb87d1c1","components/forms/OtpInput.jsx":"17755f9d6d77","components/forms/TextField.jsx":"12b930944fe2","components/layout/ChildSelector.jsx":"7c7d07937ff3","components/layout/RoleCard.jsx":"0ebdbb9081fd","components/layout/ScreenHeader.jsx":"e0a145376f55","components/selection/ChipSelect.jsx":"2780544790aa","components/selection/MultiChipSelect.jsx":"55b797276b7f","components/selection/SwitchToggle.jsx":"ce54f2a5e6e6","ui_kits/parent-app/ParentApp.jsx":"ce15b5661059","ui_kits/professional-app/ProfessionalApp.jsx":"a619de5c38b1"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TogetherDesignSystem_068592 = window.TogetherDesignSystem_068592 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/cards/Card.jsx
try { (() => {
function Card({
  children,
  padding = 20
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-card)",
      padding,
      fontFamily: "var(--font-rubik)"
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/Card.jsx", error: String((e && e.message) || e) }); }

// components/cards/LetterCard.jsx
try { (() => {
function LetterCard({
  professionalName,
  photoUrl,
  childName,
  letter,
  onApprove,
  onDismiss
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-surface-2)",
      border: "2px solid var(--color-purple)",
      borderRadius: "var(--radius-card)",
      padding: 20,
      fontFamily: "var(--font-rubik)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12
    }
  }, photoUrl ? /*#__PURE__*/React.createElement("img", {
    src: photoUrl,
    alt: professionalName,
    style: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      objectFit: "cover"
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-base)",
      fontWeight: 700,
      color: "var(--color-purple)"
    }
  }, professionalName, " \u05DE\u05E2\u05D5\u05E0\u05D9\u05D9\u05E0\u05EA \u05D1", childName, "!")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-base)",
      color: "var(--text-primary)",
      lineHeight: "var(--leading-relaxed)",
      fontStyle: "italic",
      marginBottom: 16
    }
  }, "\xAB ", letter, " \xBB"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      marginBottom: 20
    }
  }, "\u2014 ", professionalName), /*#__PURE__*/React.createElement("button", {
    onClick: onApprove,
    style: {
      width: "100%",
      background: "var(--color-purple)",
      border: "none",
      borderRadius: "var(--radius-card)",
      padding: "16px 24px",
      color: "#FFFFFF",
      fontFamily: "var(--font-rubik)",
      fontWeight: 600,
      fontSize: "var(--text-base)",
      cursor: "pointer"
    }
  }, "\u05D0\u05E9\u05E8\u05D5 \u05D5\u05D4\u05DE\u05E9\u05D9\u05DB\u05D5 \u05DC\u05D4\u05D9\u05DB\u05E8\u05D5\u05EA"), onDismiss ? /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    style: {
      display: "block",
      width: "100%",
      background: "none",
      border: "none",
      marginTop: 12,
      padding: 8,
      color: "var(--text-tertiary)",
      fontFamily: "var(--font-rubik)",
      fontSize: "var(--text-sm)",
      cursor: "pointer"
    }
  }, "\u05DC\u05D0 \u05E2\u05DB\u05E9\u05D9\u05D5") : null);
}
Object.assign(__ds_scope, { LetterCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/LetterCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/MatchCard.jsx
try { (() => {
function MatchCard({
  name,
  photoUrl,
  bio,
  matchReason,
  score = 80,
  distanceLabel,
  ratingAvg,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-card)",
      padding: 20,
      fontFamily: "var(--font-rubik)",
      cursor: onClick ? "pointer" : "default"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 8
    }
  }, photoUrl ? /*#__PURE__*/React.createElement("img", {
    src: photoUrl,
    alt: name,
    style: {
      width: 48,
      height: 48,
      borderRadius: "50%",
      objectFit: "cover",
      flexShrink: 0
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: "50%",
      background: "var(--color-purple-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-purple-ink)",
      fontWeight: 700
    }
  }, name.slice(0, 2))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-lg)",
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, name), bio ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      marginTop: 4,
      lineHeight: "var(--leading-normal)"
    }
  }, bio) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      background: "var(--color-teal-bg)",
      color: "var(--color-teal-ink)",
      borderRadius: "var(--radius-full)",
      padding: "4px 12px",
      fontSize: "var(--text-xs)",
      fontWeight: 700
    }
  }, score, "% \u05D4\u05EA\u05D0\u05DE\u05D4")), matchReason ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(15,110,86,0.1)",
      borderRadius: 8,
      padding: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--color-teal)",
      fontWeight: 500,
      lineHeight: "var(--leading-normal)"
    }
  }, matchReason)) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, distanceLabel ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)"
    }
  }, distanceLabel) : null, ratingAvg ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)"
    }
  }, "\u2605 ", ratingAvg.toFixed(1)) : null));
}
Object.assign(__ds_scope, { MatchCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/MatchCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/MetricCard.jsx
try { (() => {
const HIGHLIGHT = {
  default: "var(--text-primary)",
  warning: "var(--color-coral)",
  success: "var(--color-teal)"
};
function MetricCard({
  label,
  value,
  highlight = "default",
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-card)",
      padding: 16,
      width: 148,
      fontFamily: "var(--font-rubik)",
      cursor: onClick ? "pointer" : "default"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-2xl)",
      fontWeight: 700,
      color: HIGHLIGHT[highlight],
      textAlign: "right",
      marginBottom: 4
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      textAlign: "right",
      lineHeight: "var(--leading-normal)"
    }
  }, label));
}
Object.assign(__ds_scope, { MetricCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/MetricCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/PlaceholderCard.jsx
try { (() => {
function PlaceholderCard({
  text
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-card)",
      padding: 20,
      fontFamily: "var(--font-rubik)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: "var(--text-secondary)",
      textAlign: "center",
      lineHeight: "var(--leading-relaxed)"
    }
  }, text));
}
Object.assign(__ds_scope, { PlaceholderCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/PlaceholderCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/RequestCard.jsx
try { (() => {
const STATUS_TONE = {
  pending: "var(--color-amber)",
  interested: "var(--color-teal)",
  rejected: "var(--color-coral)"
};
function RequestCard({
  childName,
  photoUrl,
  tags = [],
  statusLabel,
  statusTone = "pending",
  message,
  canRespond,
  onAccept,
  onReject,
  onViewProfile
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-card)",
      padding: 20,
      fontFamily: "var(--font-rubik)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onViewProfile,
    style: {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, photoUrl ? /*#__PURE__*/React.createElement("img", {
    src: photoUrl,
    alt: childName,
    style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      objectFit: "cover"
    }
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-lg)",
      fontWeight: 700,
      color: "var(--color-teal)"
    }
  }, childName)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: STATUS_TONE[statusTone] || STATUS_TONE.pending
    }
  }, statusLabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8
    }
  }, tags.map((tag, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      background: "var(--color-surface-2)",
      borderRadius: "var(--radius-full)",
      padding: "4px 12px",
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)"
    }
  }, tag))), message ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-normal)",
      marginTop: 12
    }
  }, message) : null, canRespond ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onAccept,
    style: {
      flex: 1,
      background: "var(--color-teal)",
      border: "none",
      borderRadius: "var(--radius-card)",
      padding: "14px",
      color: "#FFF",
      fontFamily: "var(--font-rubik)",
      fontWeight: 600,
      cursor: "pointer"
    }
  }, "\u05DE\u05E2\u05D5\u05E0\u05D9\u05D9\u05E0\u05EA"), /*#__PURE__*/React.createElement("button", {
    onClick: onReject,
    style: {
      flex: 1,
      background: "var(--color-surface)",
      border: "1px solid var(--color-coral)",
      borderRadius: "var(--radius-card)",
      padding: "14px",
      color: "var(--color-coral)",
      fontFamily: "var(--font-rubik)",
      fontWeight: 600,
      cursor: "pointer"
    }
  }, "\u05D3\u05D7\u05D9\u05D9\u05D4")) : null);
}
Object.assign(__ds_scope, { RequestCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/RequestCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
const TONES = {
  purple: {
    bg: "var(--color-purple-bg)",
    text: "var(--color-purple-ink)"
  },
  slate: {
    bg: "var(--color-slate-bg)",
    text: "var(--color-slate-ink)"
  },
  teal: {
    bg: "var(--color-teal-bg)",
    text: "var(--color-teal-ink)"
  },
  amber: {
    bg: "var(--color-amber-bg)",
    text: "var(--color-amber-ink)"
  },
  coral: {
    bg: "var(--color-coral-bg)",
    text: "var(--color-coral-ink)"
  },
  neutral: {
    bg: "var(--color-surface-2)",
    text: "var(--text-secondary)"
  }
};
function Badge({
  children,
  tone = "purple"
}) {
  const c = TONES[tone] || TONES.purple;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      borderRadius: "var(--radius-full)",
      padding: "4px 12px",
      fontFamily: "var(--font-rubik)",
      fontSize: "var(--text-xs)",
      fontWeight: 700,
      background: c.bg,
      color: c.text,
      whiteSpace: "nowrap"
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
function Banner({
  variant = "active",
  eyebrow,
  title,
  actionLabel,
  onAction,
  message
}) {
  if (variant === "offline") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--color-amber)",
        padding: "8px 16px",
        textAlign: "center",
        fontFamily: "var(--font-rubik)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        color: "#FFFFFF"
      }
    }, message);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-teal)",
      borderRadius: "var(--radius-card)",
      padding: 20,
      fontFamily: "var(--font-rubik)"
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-widest)",
      color: "var(--color-teal-bg)",
      marginBottom: 4
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-lg)",
      fontWeight: 700,
      color: "#FFFFFF"
    }
  }, title), actionLabel ? /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      flexShrink: 0,
      background: "rgba(255,255,255,0.2)",
      border: "none",
      borderRadius: "var(--radius-full)",
      padding: "8px 16px",
      color: "#FFFFFF",
      fontFamily: "var(--font-rubik)",
      fontWeight: 600,
      fontSize: "var(--text-sm)",
      cursor: "pointer"
    }
  }, actionLabel, " \u2039") : null));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StarRating.jsx
try { (() => {
function StarRating({
  label,
  value,
  onChange,
  readOnly = false,
  max = 5
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      fontFamily: "var(--font-rubik)"
    }
  }, label ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      color: "var(--text-secondary)",
      marginBottom: 8
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, Array.from({
    length: max
  }).map((_, i) => {
    const starValue = i + 1;
    const active = starValue <= value;
    return /*#__PURE__*/React.createElement("div", {
      key: starValue,
      onClick: () => !readOnly && onChange && onChange(starValue),
      style: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: readOnly ? "default" : "pointer",
        border: `1px solid ${active ? "var(--color-amber)" : "var(--color-border)"}`,
        background: active ? "var(--color-amber-bg)" : "var(--color-surface)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        opacity: active ? 1 : 0.4
      }
    }, "\u2605"));
  })));
}
Object.assign(__ds_scope, { StarRating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StarRating.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
/**
 * Primary/outline action button. Purple is the default brand action color;
 * teal is used for the professional-facing accept/positive action; coral for destructive.
 */
function Button({
  children,
  variant = "solid",
  tone = "purple",
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = "button"
}) {
  const toneSolidBg = {
    purple: "var(--color-purple)",
    teal: "var(--color-teal)",
    coral: "var(--color-coral)"
  }[tone];
  const toneOutlineBorder = {
    purple: "var(--color-border)",
    teal: "var(--color-teal)",
    coral: "var(--color-coral)"
  }[tone];
  const toneOutlineText = {
    purple: "var(--text-secondary)",
    teal: "var(--color-teal)",
    coral: "var(--color-coral)"
  }[tone];
  const base = {
    fontFamily: "var(--font-rubik)",
    fontWeight: 600,
    fontSize: "var(--text-base)",
    borderRadius: "var(--radius-card)",
    padding: "16px 24px",
    width: fullWidth ? "100%" : "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: disabled || loading ? "default" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    border: variant === "solid" ? "none" : `1px solid ${toneOutlineBorder}`,
    background: variant === "solid" ? toneSolidBg : "var(--color-surface)",
    color: variant === "solid" ? "#FFFFFF" : toneOutlineText,
    transition: "opacity 0.15s ease"
  };
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled || loading,
    onClick: onClick,
    style: base,
    onMouseDown: e => {
      if (!disabled && !loading) e.currentTarget.style.opacity = 0.9;
    },
    onMouseUp: e => {
      e.currentTarget.style.opacity = base.opacity;
    },
    onMouseLeave: e => {
      e.currentTarget.style.opacity = base.opacity;
    }
  }, loading ? "…" : children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/OtpInput.jsx
try { (() => {
function OtpInput({
  value,
  onChange,
  length = 6
}) {
  return /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: e => onChange && onChange(e.target.value.replace(/\D/g, "").slice(0, length)),
    placeholder: "•".repeat(length),
    inputMode: "numeric",
    style: {
      width: "100%",
      boxSizing: "border-box",
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-card)",
      padding: "20px 16px",
      color: "var(--text-primary)",
      fontSize: "var(--text-2xl)",
      textAlign: "center",
      letterSpacing: "12px",
      fontFamily: "var(--font-rubik)"
    }
  });
}
Object.assign(__ds_scope, { OtpInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/OtpInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
const {
  useState
} = React;
function TextField({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  showPasswordToggle = false
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPasswordToggle ? visible ? "text" : "password" : type;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      fontFamily: "var(--font-rubik)"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      color: "var(--text-secondary)",
      marginBottom: 8
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      background: "var(--color-surface)",
      border: `1px solid ${error ? "var(--color-coral)" : "var(--color-border)"}`,
      borderRadius: "var(--radius-card)"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: inputType,
    value: value,
    placeholder: placeholder,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      flex: 1,
      border: "none",
      background: "transparent",
      outline: "none",
      padding: "16px",
      fontSize: "var(--text-base)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-rubik)",
      borderRadius: "var(--radius-card)"
    }
  }), isPassword && showPasswordToggle ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setVisible(v => !v),
    style: {
      background: "none",
      border: "none",
      padding: "0 16px",
      cursor: "pointer",
      color: "var(--text-tertiary)",
      fontSize: 18
    },
    "aria-label": visible ? "Hide password" : "Show password"
  }, visible ? "🙈" : "👁") : null), error ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--color-coral)",
      fontSize: "var(--text-sm)",
      marginTop: 4
    }
  }, error) : null);
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/layout/ChildSelector.jsx
try { (() => {
function ChildSelector({
  children,
  selectedId,
  onSelect,
  addLabel,
  onAdd
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      fontFamily: "var(--font-rubik)"
    }
  }, children.map(child => {
    const selected = child.id === selectedId;
    return /*#__PURE__*/React.createElement("button", {
      key: child.id,
      onClick: () => onSelect && onSelect(child.id),
      style: {
        borderRadius: "var(--radius-full)",
        padding: "10px 20px",
        cursor: "pointer",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        fontFamily: "var(--font-rubik)",
        border: "1px solid",
        borderColor: selected ? "var(--color-purple)" : "var(--color-border)",
        background: selected ? "var(--color-purple)" : "var(--color-surface)",
        color: selected ? "#FFFFFF" : "var(--text-primary)"
      }
    }, child.name);
  }), onAdd && addLabel ? /*#__PURE__*/React.createElement("button", {
    onClick: onAdd,
    style: {
      borderRadius: "var(--radius-full)",
      padding: "10px 20px",
      cursor: "pointer",
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      fontFamily: "var(--font-rubik)",
      border: "1px dashed var(--color-purple)",
      background: "var(--color-purple-bg)",
      color: "var(--color-purple-ink)"
    }
  }, "+ ", addLabel) : null);
}
Object.assign(__ds_scope, { ChildSelector });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/ChildSelector.jsx", error: String((e && e.message) || e) }); }

// components/layout/RoleCard.jsx
try { (() => {
function RoleCard({
  title,
  description,
  selected = false,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      borderRadius: "var(--radius-card)",
      padding: 20,
      cursor: "pointer",
      fontFamily: "var(--font-rubik)",
      border: `1px solid ${selected ? "var(--color-purple)" : "var(--color-border)"}`,
      background: selected ? "var(--color-purple-bg)" : "var(--color-surface)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-lg)",
      fontWeight: 600,
      marginBottom: 8,
      color: selected ? "var(--color-purple-ink)" : "var(--text-primary)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-normal)"
    }
  }, description));
}
Object.assign(__ds_scope, { RoleCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/RoleCard.jsx", error: String((e && e.message) || e) }); }

// components/layout/ScreenHeader.jsx
try { (() => {
function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  showBack = false,
  onBack,
  headerRight
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-rubik)"
    }
  }, showBack ? /*#__PURE__*/React.createElement("div", {
    onClick: onBack,
    style: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      cursor: onBack ? "pointer" : "default"
    }
  }, "\u2039") : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: 700,
      color: "var(--color-purple)",
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-widest)",
      marginBottom: 12
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-3xl)",
      fontWeight: 700,
      color: "var(--text-primary)",
      marginBottom: 8
    }
  }, title)), headerRight ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, headerRight) : null), subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-base)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-normal)"
    }
  }, subtitle) : null);
}
Object.assign(__ds_scope, { ScreenHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/ScreenHeader.jsx", error: String((e && e.message) || e) }); }

// components/selection/ChipSelect.jsx
try { (() => {
function ChipSelect({
  label,
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      fontFamily: "var(--font-rubik)"
    }
  }, label ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      color: "var(--text-secondary)",
      marginBottom: 8
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, options.map(opt => {
    const selected = value === opt.value;
    return /*#__PURE__*/React.createElement("button", {
      key: String(opt.value),
      onClick: () => onChange && onChange(opt.value),
      style: {
        borderRadius: "var(--radius-full)",
        padding: "8px 16px",
        cursor: "pointer",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        fontFamily: "var(--font-rubik)",
        border: `1px solid ${selected ? "var(--color-purple)" : "var(--color-border)"}`,
        background: selected ? "var(--color-purple-bg)" : "var(--color-surface)",
        color: selected ? "var(--color-purple-ink)" : "var(--text-secondary)"
      }
    }, opt.label);
  })));
}
Object.assign(__ds_scope, { ChipSelect });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/ChipSelect.jsx", error: String((e && e.message) || e) }); }

// components/selection/MultiChipSelect.jsx
try { (() => {
function MultiChipSelect({
  label,
  options,
  values,
  onChange
}) {
  function toggle(v) {
    if (!onChange) return;
    onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      fontFamily: "var(--font-rubik)"
    }
  }, label ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      color: "var(--text-secondary)",
      marginBottom: 8
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, options.map(opt => {
    const selected = values.includes(opt.value);
    return /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      onClick: () => toggle(opt.value),
      style: {
        borderRadius: "var(--radius-full)",
        padding: "8px 16px",
        cursor: "pointer",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        fontFamily: "var(--font-rubik)",
        border: `1px solid ${selected ? "var(--color-teal)" : "var(--color-border)"}`,
        background: selected ? "var(--color-teal-bg)" : "var(--color-surface)",
        color: selected ? "var(--color-teal)" : "var(--text-secondary)"
      }
    }, opt.label);
  })));
}
Object.assign(__ds_scope, { MultiChipSelect });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/MultiChipSelect.jsx", error: String((e && e.message) || e) }); }

// components/selection/SwitchToggle.jsx
try { (() => {
function SwitchToggle({
  label,
  description,
  value,
  onChange,
  disabled = false
}) {
  const track = /*#__PURE__*/React.createElement("div", {
    onClick: () => !disabled && onChange && onChange(!value),
    style: {
      width: 48,
      height: 28,
      borderRadius: "var(--radius-full)",
      cursor: disabled ? "default" : "pointer",
      background: value ? "var(--color-purple)" : "var(--color-border)",
      display: "flex",
      alignItems: "center",
      padding: 4,
      opacity: disabled ? 0.5 : 1,
      justifyContent: value ? "flex-end" : "flex-start",
      flexShrink: 0,
      transition: "background 0.15s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "#FFFFFF"
    }
  }));
  if (!label) return track;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-card)",
      padding: 16,
      fontFamily: "var(--font-rubik)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-base)",
      fontWeight: 500,
      color: "var(--text-primary)"
    }
  }, label), description ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      marginTop: 4
    }
  }, description) : null), track);
}
Object.assign(__ds_scope, { SwitchToggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/SwitchToggle.jsx", error: String((e && e.message) || e) }); }

// ui_kits/parent-app/ParentApp.jsx
try { (() => {
const {
  Button,
  TextField,
  OtpInput,
  ChipSelect,
  MultiChipSelect,
  SwitchToggle,
  Badge,
  StarRating,
  Banner,
  Card,
  PlaceholderCard,
  MetricCard,
  MatchCard,
  LetterCard,
  RequestCard,
  ScreenHeader,
  RoleCard,
  ChildSelector
} = window.TogetherDesignSystem_068592;
function Phone({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 390,
      height: 780,
      background: "var(--color-bg)",
      borderRadius: 36,
      border: "10px solid #1a1a1a",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-rubik)",
      position: "relative",
      boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
    }
  }, children);
}
function NotificationBell({
  onClick,
  count = 2
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      position: "relative",
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer"
    }
  }, "\uD83D\uDD14", count > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -2,
      insetInlineStart: -2,
      background: "var(--color-coral)",
      color: "#fff",
      borderRadius: "50%",
      width: 16,
      height: 16,
      fontSize: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700
    }
  }, count) : null);
}
function MessagesTab() {
  const messages = [{
    name: "דנה כהן",
    preview: "מצוין, נתאם מחר ב-16:00?",
    time: "10:30",
    unread: 2
  }, {
    name: "שירה לוי",
    preview: "ראיתי את הפרופיל של נועם...",
    time: "אתמול",
    unread: 1
  }, {
    name: "רותם כהן",
    preview: "תודה על המידע הנוסף!",
    time: "09:15",
    unread: 0
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "\u05D4\u05D5\u05D3\u05E2\u05D5\u05EA",
    subtitle: "\u05E9\u05D9\u05D7\u05D5\u05EA \u05E2\u05DD \u05DE\u05E9\u05DC\u05D1\u05D5\u05EA"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 20
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, messages.map((m, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    padding: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      background: "var(--color-purple-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-purple-ink)",
      fontWeight: 700
    }
  }, m.name.slice(0, 2))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, m.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-tertiary)"
    }
  }, m.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)",
      marginTop: 2,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, m.preview)), m.unread > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      background: "var(--color-purple)",
      color: "#fff",
      borderRadius: "50%",
      width: 20,
      height: 20,
      fontSize: 11,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, m.unread) : null)))));
}
function TabBar({
  active,
  onChange
}) {
  const tabs = [{
    key: "matches",
    label: "התאמות"
  }, {
    key: "child",
    label: "פרופיל"
  }, {
    key: "requests",
    label: "בקשות"
  }, {
    key: "messages",
    label: "הודעות"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderTop: "1px solid var(--color-border)",
      background: "var(--color-surface)",
      flexShrink: 0
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.key,
    onClick: () => onChange(t.key),
    style: {
      flex: 1,
      border: "none",
      background: "none",
      padding: "12px 0",
      cursor: "pointer",
      color: active === t.key ? "var(--color-purple)" : "var(--color-ink-3)",
      fontFamily: "var(--font-rubik)",
      fontWeight: 600,
      fontSize: 12
    }
  }, t.label)));
}
function LoginScreen({
  onNext
}) {
  const [phone, setPhone] = React.useState("");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 24px 24px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.png",
    style: {
      height: 88
    },
    alt: "logo"
  })), /*#__PURE__*/React.createElement(ScreenHeader, {
    eyebrow: "\u05D4\u05EA\u05D7\u05D1\u05E8\u05D5\u05EA",
    title: "\u05D1\u05E8\u05D5\u05DB\u05D9\u05DD \u05D4\u05D1\u05D0\u05D9\u05DD \u05DC-Together",
    subtitle: "\u05D4\u05EA\u05D7\u05D1\u05E8\u05D5 \u05E2\u05DD \u05DE\u05E1\u05E4\u05E8 \u05D4\u05D8\u05DC\u05E4\u05D5\u05DF \u05E9\u05DC\u05DB\u05DD"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 32
    }
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "\u05DE\u05E1\u05E4\u05E8 \u05D8\u05DC\u05E4\u05D5\u05DF",
    placeholder: "050-1234567",
    value: phone,
    onChange: setPhone
  }), /*#__PURE__*/React.createElement(Button, {
    tone: "purple",
    fullWidth: true,
    onClick: onNext
  }, "\u05E9\u05DC\u05D9\u05D7\u05EA \u05E7\u05D5\u05D3"));
}
function OtpScreen({
  onNext
}) {
  const [code, setCode] = React.useState("");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 24px 24px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    eyebrow: "\u05D0\u05D9\u05DE\u05D5\u05EA",
    title: "\u05D4\u05D6\u05D9\u05E0\u05D5 \u05D0\u05EA \u05D4\u05E7\u05D5\u05D3",
    subtitle: "\u05E9\u05DC\u05D7\u05E0\u05D5 \u05E7\u05D5\u05D3 SMS \u05DC-050-1234567",
    showBack: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 32
    }
  }), /*#__PURE__*/React.createElement(OtpInput, {
    value: code,
    onChange: setCode
  }), /*#__PURE__*/React.createElement(Button, {
    tone: "purple",
    fullWidth: true,
    onClick: onNext
  }, "\u05D0\u05D9\u05DE\u05D5\u05EA \u05D5\u05D4\u05DE\u05E9\u05DA"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 16,
      color: "var(--color-purple)",
      fontSize: 14,
      fontWeight: 500
    }
  }, "\u05E9\u05DC\u05D9\u05D7\u05D4 \u05DE\u05D7\u05D3\u05E9"));
}
function RoleScreen({
  onNext
}) {
  const [role, setRole] = React.useState("parent");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 24px 24px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    eyebrow: "\u05D4\u05E8\u05E9\u05DE\u05D4",
    title: "\u05D0\u05D9\u05DA \u05EA\u05E8\u05E6\u05D5 \u05DC\u05D4\u05E9\u05EA\u05DE\u05E9 \u05D1\u05E4\u05DC\u05D8\u05E4\u05D5\u05E8\u05DE\u05D4?",
    subtitle: "\u05D1\u05D7\u05E8\u05D5 \u05D0\u05EA \u05D4\u05EA\u05E4\u05E7\u05D9\u05D3 \u05E9\u05DC\u05DB\u05DD \u05DB\u05D3\u05D9 \u05E9\u05E0\u05EA\u05D0\u05D9\u05DD \u05D0\u05EA \u05D4\u05D7\u05D5\u05D5\u05D9\u05D4"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(RoleCard, {
    title: "\u05D0\u05E0\u05D9 \u05D4\u05D5\u05E8\u05D4",
    description: "\u05DE\u05D7\u05E4\u05E9/\u05EA \u05DE\u05E9\u05DC\u05D1\u05EA \u05DE\u05EA\u05D0\u05D9\u05DE\u05D4 \u05DC\u05D9\u05DC\u05D3/\u05D4 \u05E9\u05DC\u05D9",
    selected: role === "parent",
    onClick: () => setRole("parent")
  }), /*#__PURE__*/React.createElement(RoleCard, {
    title: "\u05D0\u05E0\u05D9 \u05DE\u05E9\u05DC\u05D1\u05EA",
    description: "\u05DE\u05D7\u05E4\u05E9\u05EA \u05E2\u05D1\u05D5\u05D3\u05D4 \u05E2\u05DD \u05D9\u05DC\u05D3\u05D9\u05DD \u05E2\u05DD \u05E6\u05E8\u05DB\u05D9\u05DD \u05DE\u05D9\u05D5\u05D7\u05D3\u05D9\u05DD",
    selected: role === "pro",
    onClick: () => setRole("pro")
  })), /*#__PURE__*/React.createElement(Button, {
    tone: "purple",
    fullWidth: true,
    onClick: onNext
  }, "\u05D4\u05DE\u05E9\u05DA"));
}
function AideProfileScreen({
  onBack,
  onSend
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    eyebrow: "\u05E4\u05E8\u05D5\u05E4\u05D9\u05DC \u05DE\u05E9\u05DC\u05D1\u05EA",
    title: "\u05D3\u05E0\u05D4 \u05DB\u05D4\u05DF",
    subtitle: "4 \u05E9\u05E0\u05D5\u05EA \u05E0\u05D9\u05E1\u05D9\u05D5\u05DF \xB7 \u05DE\u05EA\u05DE\u05D7\u05D4 \u05D1\u05E1\u05E4\u05E7\u05D8\u05E8\u05D5\u05DD",
    showBack: true,
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "teal"
  }, "\u05DE\u05D0\u05D5\u05DE\u05EA\u05EA \u2713"), /*#__PURE__*/React.createElement(Badge, {
    tone: "teal"
  }, "85% \u05D4\u05EA\u05D0\u05DE\u05D4")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--text-primary)",
      lineHeight: 1.6,
      marginBottom: 16
    }
  }, "\u05E2\u05D5\u05D1\u05D3\u05EA \u05E2\u05DD \u05D9\u05DC\u05D3\u05D9\u05DD \u05E2\u05DC \u05D4\u05E1\u05E4\u05E7\u05D8\u05E8\u05D5\u05DD \u05DB\u05D1\u05E8 4 \u05E9\u05E0\u05D9\u05DD, \u05DE\u05EA\u05DE\u05D7\u05D4 \u05D1\u05EA\u05E7\u05E9\u05D5\u05E8\u05EA \u05D7\u05DC\u05D5\u05E4\u05D9\u05EA \u05D5\u05D1\u05E2\u05D1\u05D5\u05D3\u05D4 \u05D1\u05D2\u05E0\u05D9 \u05E9\u05D9\u05DC\u05D5\u05D1. \u05D0\u05D5\u05D4\u05D1\u05EA \u05D2\u05D9\u05E9\u05D4 \u05E1\u05D1\u05DC\u05E0\u05D9\u05EA \u05D5\u05D7\u05DE\u05D4."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 16
    }
  }, ["אוטיזם", "ABA", "אוטיזם"].map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      background: "var(--color-surface-2)",
      borderRadius: 999,
      padding: "4px 12px",
      fontSize: 12,
      color: "var(--text-secondary)"
    }
  }, t))), /*#__PURE__*/React.createElement(StarRating, {
    value: 4.8,
    readOnly: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "\u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA \u05D0\u05D7\u05E8\u05D5\u05E0\u05D5\u05EA"), /*#__PURE__*/React.createElement(Card, {
    padding: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, "\u05DE\u05E9\u05E4\u05D7\u05EA \u05DC\u05D5\u05D9"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-tertiary)"
    }
  }, "\u05DC\u05E4\u05E0\u05D9 \u05D7\u05D5\u05D3\u05E9")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, "\u05D3\u05E0\u05D4 \u05DE\u05D3\u05D4\u05D9\u05DE\u05D4, \u05D4\u05D1\u05DF \u05E9\u05DC\u05E0\u05D5 \u05D4\u05EA\u05D7\u05D1\u05E8 \u05D0\u05DC\u05D9\u05D4 \u05DE\u05D4\u05D9\u05D5\u05DD \u05D4\u05E8\u05D0\u05E9\u05D5\u05DF.")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24
    }
  }), /*#__PURE__*/React.createElement(Button, {
    tone: "purple",
    fullWidth: true,
    onClick: onSend
  }, "\u05E9\u05DC\u05D9\u05D7\u05EA \u05D1\u05E7\u05E9\u05EA \u05D4\u05D9\u05DB\u05E8\u05D5\u05EA"));
}
function ActiveMatchScreen({
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    eyebrow: "\u05E2\u05D1\u05D5\u05D3\u05D4 \u05DE\u05E9\u05D5\u05EA\u05E4\u05EA",
    title: "\u05D3\u05E0\u05D4 \u05D5\u05E0\u05D5\u05E2\u05DD",
    subtitle: "\u05D3\u05E0\u05D4 \u05D4\u05D2\u05D9\u05E2\u05D4 \u2713 08:03",
    showBack: true,
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(MetricCard, {
    label: "\u05D9\u05DE\u05D9 \u05E2\u05D1\u05D5\u05D3\u05D4",
    value: 12,
    highlight: "success"
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "\u05D9\u05D5\u05DE\u05E0\u05D9\u05DD \u05D4\u05E9\u05D1\u05D5\u05E2",
    value: 5
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "\u05E1\u05D9\u05DB\u05D5\u05DD \u05D4\u05D9\u05D5\u05DD"), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)",
      lineHeight: 1.6
    }
  }, "\u05E0\u05D5\u05E2\u05DD \u05D4\u05D9\u05D4 \u05D1\u05E7\u05E9\u05E8 \u05D8\u05D5\u05D1 \u05D4\u05D9\u05D5\u05DD, \u05D4\u05E9\u05EA\u05EA\u05E3 \u05D1\u05E4\u05E2\u05D9\u05DC\u05D5\u05EA \u05E7\u05D1\u05D5\u05E6\u05EA\u05D9\u05EA \u05D5\u05D9\u05D6\u05DD \u05E9\u05EA\u05D9 \u05D0\u05D9\u05E0\u05D8\u05E8\u05D0\u05E7\u05E6\u05D9\u05D5\u05EA \u05D7\u05D1\u05E8\u05EA\u05D9\u05D5\u05EA. \u05D4\u05EA\u05E7\u05E9\u05D4 \u05DE\u05E2\u05D8 \u05D1\u05DE\u05E2\u05D1\u05E8 \u05D1\u05D9\u05DF \u05E4\u05E2\u05D9\u05DC\u05D5\u05D9\u05D5\u05EA.")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(SwitchToggle, {
    label: "\u05DE\u05D9 \u05E6\u05E4\u05D4 \u05D1\u05EA\u05D9\u05E7",
    description: "\u05D3\u05E0\u05D4 \u05E6\u05E4\u05EA\u05D4 \u05DC\u05D0\u05D7\u05E8\u05D5\u05E0\u05D4 \u05D4\u05D9\u05D5\u05DD \u05D1-07:50",
    value: true,
    disabled: true
  }));
}
function MatchesTab({
  onOpenProfile,
  onOpenActiveMatch
}) {
  const [childId, setChildId] = React.useState("1");
  const [approved, setApproved] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(NotificationBell, null), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.png",
    style: {
      height: 32
    },
    alt: "logo"
  })), /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "\u05D4\u05DE\u05E9\u05DC\u05D1\u05D5\u05EA \u05E9\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA",
    subtitle: "\u05D4\u05EA\u05D0\u05DE\u05D5\u05EA \u05E2\u05D1\u05D5\u05E8 \u05E0\u05D5\u05E2\u05DD",
    headerRight: /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, "\u2699")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(Banner, {
    variant: "active",
    eyebrow: "\u05D4\u05EA\u05D0\u05DE\u05D4 \u05E4\u05E2\u05D9\u05DC\u05D4",
    title: "\u05E2\u05D5\u05D1\u05D3\u05D9\u05DD \u05E2\u05DD \u05D3\u05E0\u05D4",
    actionLabel: "\u05E4\u05EA\u05D7\u05D5 \u05DC\u05D5\u05D7 \u05D1\u05E7\u05E8\u05D4",
    onAction: onOpenActiveMatch
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), !approved ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(LetterCard, {
    professionalName: "\u05D3\u05E0\u05D4",
    childName: "\u05E0\u05D5\u05E2\u05DD",
    letter: "\u05D9\u05E9 \u05DC\u05D9 4 \u05E9\u05E0\u05D5\u05EA \u05E0\u05D9\u05E1\u05D9\u05D5\u05DF \u05E2\u05DD \u05D9\u05DC\u05D3\u05D9\u05DD \u05E2\u05DC \u05D4\u05E1\u05E4\u05E7\u05D8\u05E8\u05D5\u05DD, \u05D5\u05D0\u05E0\u05D9 \u05DE\u05D0\u05DE\u05D9\u05E0\u05D4 \u05E9\u05D2\u05DD \u05E0\u05D5\u05E2\u05DD \u05D9\u05E8\u05D2\u05D9\u05E9 \u05D1\u05E0\u05D5\u05D7 \u05D0\u05D9\u05EA\u05D9.",
    onApprove: () => setApproved(true),
    onDismiss: () => setApproved(true)
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(ChildSelector, {
    children: [{
      id: "1",
      name: "נועם"
    }, {
      id: "2",
      name: "מאיה"
    }],
    selectedId: childId,
    onSelect: setChildId,
    addLabel: "\u05D9\u05DC\u05D3/\u05D4 \u05E0\u05D5\u05E1\u05E3/\u05EA"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(MatchCard, {
    name: "\u05D3\u05E0\u05D4 \u05DB\u05D4\u05DF",
    bio: "4 \u05E9\u05E0\u05D5\u05EA \u05E0\u05D9\u05E1\u05D9\u05D5\u05DF, \u05DE\u05EA\u05DE\u05D7\u05D4 \u05D1\u05E1\u05E4\u05E7\u05D8\u05E8\u05D5\u05DD",
    matchReason: "\u05E7\u05E8\u05D1\u05D4 \u05DC\u05DE\u05D2\u05D5\u05E8\u05D9\u05DD + \u05E0\u05D9\u05E1\u05D9\u05D5\u05DF \u05E2\u05DD \u05D0\u05D5\u05D8\u05D9\u05D6\u05DD",
    score: 85,
    distanceLabel: "2.3 \u05E7\"\u05DE",
    ratingAvg: 4.8,
    onClick: onOpenProfile
  }), /*#__PURE__*/React.createElement(MatchCard, {
    name: "\u05E9\u05D9\u05E8\u05D4 \u05DC\u05D5\u05D9",
    bio: "\u05DE\u05E8\u05E4\u05D0\u05D4 \u05D1\u05E2\u05D9\u05E1\u05D5\u05E7, \u05E2\u05D5\u05D1\u05D3\u05EA \u05E2\u05DD \u05D2\u05E0\u05D9 \u05E9\u05D9\u05DC\u05D5\u05D1",
    matchReason: "\u05E0\u05D9\u05E1\u05D9\u05D5\u05DF \u05D1\u05EA\u05E7\u05E9\u05D5\u05E8\u05EA \u05D7\u05DC\u05D5\u05E4\u05D9\u05EA",
    score: 68,
    distanceLabel: "4.1 \u05E7\"\u05DE",
    onClick: onOpenProfile
  })));
}
function ChildTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "\u05E4\u05E8\u05D5\u05E4\u05D9\u05DC \u05D9\u05DC\u05D3",
    subtitle: "\u05E0\u05D5\u05E2\u05DD, 6 \xB7 \u05D2\u05DF \u05EA\u05E7\u05E9\u05D5\u05E8\u05EA"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 20
    }
  }), /*#__PURE__*/React.createElement(SwitchToggle, {
    label: "\u05E4\u05E8\u05E1\u05D5\u05DD \u05E4\u05E8\u05D5\u05E4\u05D9\u05DC",
    description: "\u05E4\u05E8\u05D5\u05E4\u05D9\u05DC \u05DE\u05E4\u05D5\u05E8\u05E1\u05DD \u05E0\u05D3\u05E8\u05E9 \u05DB\u05D3\u05D9 \u05DC\u05E7\u05D1\u05DC \u05D4\u05EA\u05D0\u05DE\u05D5\u05EA",
    value: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  }), /*#__PURE__*/React.createElement(ChipSelect, {
    label: "\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D9\u05EA \u05E6\u05D5\u05E8\u05DA \u05E2\u05D9\u05E7\u05E8\u05D9\u05EA",
    options: [{
      value: "autism",
      label: "אוטיזם"
    }, {
      value: "adhd",
      label: "ADHD"
    }, {
      value: "speech",
      label: "דיבור ושפה"
    }],
    value: "autism"
  }), /*#__PURE__*/React.createElement(MultiChipSelect, {
    label: "\u05DE\u05E1\u05D2\u05E8\u05EA \u05D7\u05D9\u05E0\u05D5\u05DB\u05D9\u05EA",
    options: [{
      value: "k",
      label: "גן מיוחד"
    }, {
      value: "s",
      label: "בית ספר רגיל"
    }],
    values: ["k"]
  }), /*#__PURE__*/React.createElement(Button, {
    tone: "purple",
    fullWidth: true
  }, "\u05E9\u05DE\u05D9\u05E8\u05EA \u05E4\u05E8\u05D5\u05E4\u05D9\u05DC"));
}
function RequestsTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "\u05D1\u05E7\u05E9\u05D5\u05EA",
    subtitle: "\u05DE\u05E2\u05E7\u05D1 \u05D0\u05D7\u05E8 \u05D1\u05E7\u05E9\u05D5\u05EA \u05E9\u05E0\u05E9\u05DC\u05D7\u05D5 \u05DC\u05DE\u05E9\u05DC\u05D1\u05D5\u05EA"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 20
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, "\u05E9\u05D9\u05E8\u05D4 \u05DC\u05D5\u05D9"), /*#__PURE__*/React.createElement(Badge, {
    tone: "amber"
  }, "\u05DE\u05DE\u05EA\u05D9\u05DF")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)",
      marginTop: 6
    }
  }, "\u05E2\u05D1\u05D5\u05E8 \u05E0\u05D5\u05E2\u05DD")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, "\u05DE\u05D0\u05D9\u05D4 \u05D0\u05D1\u05D9\u05D1"), /*#__PURE__*/React.createElement(Badge, {
    tone: "coral"
  }, "\u05DC\u05D0 \u05D6\u05DE\u05D9\u05E0\u05D4")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)",
      marginTop: 6
    }
  }, "\u05E2\u05D1\u05D5\u05E8 \u05E0\u05D5\u05E2\u05DD")), /*#__PURE__*/React.createElement(PlaceholderCard, {
    text: "\u05E2\u05D3\u05D9\u05D9\u05DF \u05D0\u05D9\u05DF \u05D1\u05E7\u05E9\u05D5\u05EA \u05E0\u05D5\u05E1\u05E4\u05D5\u05EA"
  })));
}
function Home() {
  const [tab, setTab] = React.useState("matches");
  const [detail, setDetail] = React.useState(null);
  if (detail === "profile") return /*#__PURE__*/React.createElement(AideProfileScreen, {
    onBack: () => setDetail(null),
    onSend: () => setDetail(null)
  });
  if (detail === "activeMatch") return /*#__PURE__*/React.createElement(ActiveMatchScreen, {
    onBack: () => setDetail(null)
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }
  }, tab === "matches" ? /*#__PURE__*/React.createElement(MatchesTab, {
    onOpenProfile: () => setDetail("profile"),
    onOpenActiveMatch: () => setDetail("activeMatch")
  }) : tab === "child" ? /*#__PURE__*/React.createElement(ChildTab, null) : tab === "requests" ? /*#__PURE__*/React.createElement(RequestsTab, null) : /*#__PURE__*/React.createElement(MessagesTab, null), /*#__PURE__*/React.createElement(TabBar, {
    active: tab,
    onChange: setTab
  }));
}
function ParentApp() {
  const [screen, setScreen] = React.useState("login");
  return /*#__PURE__*/React.createElement(Phone, null, screen === "login" ? /*#__PURE__*/React.createElement(LoginScreen, {
    onNext: () => setScreen("otp")
  }) : null, screen === "otp" ? /*#__PURE__*/React.createElement(OtpScreen, {
    onNext: () => setScreen("role")
  }) : null, screen === "role" ? /*#__PURE__*/React.createElement(RoleScreen, {
    onNext: () => setScreen("home")
  }) : null, screen === "home" ? /*#__PURE__*/React.createElement(Home, null) : null);
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ParentApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/parent-app/ParentApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/professional-app/ProfessionalApp.jsx
try { (() => {
const {
  Button,
  TextField,
  OtpInput,
  ChipSelect,
  MultiChipSelect,
  SwitchToggle,
  Badge,
  StarRating,
  Banner,
  Card,
  PlaceholderCard,
  MetricCard,
  MatchCard,
  LetterCard,
  RequestCard,
  ScreenHeader,
  RoleCard,
  ChildSelector
} = window.TogetherDesignSystem_068592;
function Phone({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 390,
      height: 780,
      background: "var(--color-bg)",
      borderRadius: 36,
      border: "10px solid #1a1a1a",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-rubik)",
      position: "relative",
      boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
    }
  }, children);
}
function NotificationBell({
  onClick,
  count = 1
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      position: "relative",
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer"
    }
  }, "\uD83D\uDD14", count > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -2,
      insetInlineStart: -2,
      background: "var(--color-coral)",
      color: "#fff",
      borderRadius: "50%",
      width: 16,
      height: 16,
      fontSize: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700
    }
  }, count) : null);
}
function MessagesTab() {
  const messages = [{
    name: "משפחת נועם",
    preview: "תודה רבה על היום המדהים!",
    time: "13:20",
    unread: 1
  }, {
    name: "התמיכה של Together",
    preview: "המסמך אושר בהצלחה ✓",
    time: "אתמול",
    unread: 0
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "\u05D4\u05D5\u05D3\u05E2\u05D5\u05EA",
    subtitle: "\u05E9\u05D9\u05D7\u05D5\u05EA \u05E2\u05DD \u05D4\u05D5\u05E8\u05D9\u05DD \u05D5\u05EA\u05DE\u05D9\u05DB\u05D4"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 20
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, messages.map((m, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    padding: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      background: "var(--color-teal-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-teal-ink)",
      fontWeight: 700
    }
  }, m.name.slice(0, 2))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, m.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-tertiary)"
    }
  }, m.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)",
      marginTop: 2,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, m.preview)), m.unread > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      background: "var(--color-purple)",
      color: "#fff",
      borderRadius: "50%",
      width: 20,
      height: 20,
      fontSize: 11,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, m.unread) : null)))));
}
function TabBar({
  active,
  onChange
}) {
  const tabs = [{
    key: "home",
    label: "בית"
  }, {
    key: "browse",
    label: "עיון"
  }, {
    key: "documents",
    label: "מסמכים"
  }, {
    key: "messages",
    label: "הודעות"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderTop: "1px solid var(--color-border)",
      background: "var(--color-surface)",
      flexShrink: 0
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.key,
    onClick: () => onChange(t.key),
    style: {
      flex: 1,
      border: "none",
      background: "none",
      padding: "12px 0",
      cursor: "pointer",
      color: active === t.key ? "var(--color-teal)" : "var(--color-ink-3)",
      fontFamily: "var(--font-rubik)",
      fontWeight: 600,
      fontSize: 12
    }
  }, t.label)));
}
function PendingScreen({
  onNext
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 24px 24px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    eyebrow: "\u05D0\u05D9\u05DE\u05D5\u05EA \u05DE\u05E7\u05E6\u05D5\u05E2\u05D9",
    title: "\u05DE\u05DE\u05EA\u05D9\u05E0\u05D4 \u05DC\u05D0\u05D9\u05DE\u05D5\u05EA",
    subtitle: "\u05D4\u05E4\u05E8\u05D5\u05E4\u05D9\u05DC \u05E9\u05DC\u05DA \u05D1\u05D1\u05D3\u05D9\u05E7\u05D4 \u2014 \u05D1\u05D3\u05E8\u05DA \u05DB\u05DC\u05DC \u05E2\u05D3 2 \u05D9\u05DE\u05D9 \u05E2\u05E1\u05E7\u05D9\u05DD. \u05E0\u05E2\u05D3\u05DB\u05DF \u05D0\u05D5\u05EA\u05DA \u05DE\u05D9\u05D3 \u05DB\u05E9\u05E0\u05E1\u05D9\u05D9\u05DD."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24
    }
  }), /*#__PURE__*/React.createElement(Badge, {
    tone: "amber"
  }, "SLA \u05D1\u05D9\u05E0\u05D5\u05E0\u05D9"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24
    }
  }), /*#__PURE__*/React.createElement(Button, {
    tone: "purple",
    fullWidth: true,
    onClick: onNext
  }, "\u05D4\u05E9\u05DC\u05DE\u05EA \u05E4\u05E8\u05D5\u05E4\u05D9\u05DC"));
}
function TodayScreen({
  onBack
}) {
  const [checkedIn, setCheckedIn] = React.useState(false);
  const [mood, setMood] = React.useState(4);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    eyebrow: "\u05D4\u05D9\u05D5\u05DD \u05E9\u05DC\u05D9",
    title: "\u05E2\u05D5\u05D1\u05D3\u05D9\u05DD \u05E2\u05DD \u05DE\u05E9\u05E4\u05D7\u05EA \u05E0\u05D5\u05E2\u05DD",
    subtitle: "צ'ק-אין בוקר ושאלון אחה\"צ",
    showBack: true,
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 8
    }
  }, checkedIn ? "צ'ק-אין בוצע בשעה 08:03 ✓" : "בוקר טוב — הגעת למסגרת?"), !checkedIn ? /*#__PURE__*/React.createElement(Button, {
    tone: "teal",
    fullWidth: true,
    onClick: () => setCheckedIn(true)
  }, "\u05D1\u05E6\u05E2 \u05E6'\u05E7-\u05D0\u05D9\u05DF") : /*#__PURE__*/React.createElement(Badge, {
    tone: "teal"
  }, "\u05E6'\u05E7-\u05D0\u05D9\u05DF \u05EA\u05E7\u05D9\u05DF")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "\u05D0\u05D9\u05DA \u05D4\u05D9\u05D4 \u05D4\u05D9\u05D5\u05DD?"), /*#__PURE__*/React.createElement(StarRating, {
    label: "\u05DE\u05E6\u05D1 \u05E8\u05D5\u05D7 \u05DB\u05DC\u05DC\u05D9",
    value: mood,
    onChange: setMood,
    max: 5
  }), /*#__PURE__*/React.createElement(Button, {
    tone: "purple",
    fullWidth: true
  }, "\u05E9\u05DE\u05D9\u05E8\u05EA \u05D9\u05D5\u05DE\u05DF"));
}
function ProfileScreen({
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    eyebrow: "\u05D4\u05E4\u05E8\u05D5\u05E4\u05D9\u05DC \u05E9\u05DC\u05D9",
    title: "\u05D3\u05E0\u05D4 \u05DB\u05D4\u05DF",
    subtitle: "4 \u05E9\u05E0\u05D5\u05EA \u05E0\u05D9\u05E1\u05D9\u05D5\u05DF \xB7 \u05DE\u05EA\u05DE\u05D7\u05D4 \u05D1\u05E1\u05E4\u05E7\u05D8\u05E8\u05D5\u05DD",
    showBack: true,
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "teal"
  }, "\u05DE\u05D0\u05D5\u05DE\u05EA\u05EA \u2713")), /*#__PURE__*/React.createElement(StarRating, {
    value: 4.8,
    readOnly: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(SwitchToggle, {
    label: "\u05E4\u05E0\u05D5\u05D9\u05D4 \u05DC\u05D4\u05D7\u05DC\u05E4\u05D5\u05EA",
    value: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8
    }
  }), /*#__PURE__*/React.createElement(SwitchToggle, {
    label: "\u05D4\u05EA\u05E8\u05D0\u05D5\u05EA \u05E4\u05D5\u05E9",
    value: true
  }));
}
function HomeTab({
  onOpenToday
}) {
  const [responded, setResponded] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(NotificationBell, null), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.png",
    style: {
      height: 32
    },
    alt: "logo"
  })), /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "\u05D1\u05E7\u05E9\u05D5\u05EA \u05D5\u05D9\u05DC\u05D3\u05D9\u05DD \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD",
    subtitle: "\u05D1\u05E7\u05E9\u05D5\u05EA \u05D7\u05D3\u05E9\u05D5\u05EA \u05DE\u05D4\u05D5\u05E8\u05D9\u05DD \u05D5\u05E2\u05D1\u05D5\u05D3\u05D4 \u05E9\u05D5\u05D8\u05E4\u05EA",
    headerRight: /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, "\u2699")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 20
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    variant: "active",
    eyebrow: "\u05D4\u05EA\u05D0\u05DE\u05D4 \u05E4\u05E2\u05D9\u05DC\u05D4",
    title: "\u05E2\u05D5\u05D1\u05D3\u05D9\u05DD \u05E2\u05DD \u05DE\u05E9\u05E4\u05D7\u05EA \u05E0\u05D5\u05E2\u05DD",
    actionLabel: "\u05D4\u05D9\u05D5\u05DD \u05E9\u05DC\u05D9",
    onAction: onOpenToday
  })), /*#__PURE__*/React.createElement(RequestCard, {
    childName: "\u05DE\u05D0\u05D9\u05D4",
    tags: ["5", "ADHD", "גן רגיל", "תמיכה בינונית"],
    statusLabel: responded ? "העניין נשלח להורה" : "ממתין",
    statusTone: responded ? "interested" : "pending",
    message: "\u05DE\u05D7\u05E4\u05E9\u05D9\u05DD \u05DE\u05D9\u05E9\u05D4\u05D9 \u05E1\u05D1\u05DC\u05E0\u05D9\u05EA \u05D5\u05D7\u05DE\u05D4, \u05E9\u05D9\u05D5\u05D3\u05E2\u05EA \u05DC\u05E2\u05D1\u05D5\u05D3 \u05E2\u05DD \u05D9\u05DC\u05D3 \u05D0\u05E0\u05E8\u05D2\u05D8\u05D9.",
    canRespond: !responded,
    onAccept: () => setResponded(true),
    onReject: () => setResponded(true)
  }));
}
function BrowseTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "\u05E2\u05D9\u05D5\u05DF",
    subtitle: "\u05DB\u05E8\u05D8\u05D9\u05E1\u05D9 \u05D9\u05DC\u05D3\u05D9\u05DD \u05D6\u05DE\u05D9\u05E0\u05D9\u05DD \u05D1\u05D0\u05D6\u05D5\u05E8 \u05E9\u05DC\u05DA"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 20
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 18,
      marginBottom: 8
    }
  }, "\u05E0\u05D5\u05E2\u05DD"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 16
    }
  }, ["6", "אוטיזם", "גן תקשורת", "תמיכה בינונית"].map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      background: "var(--color-surface-2)",
      borderRadius: 999,
      padding: "4px 12px",
      fontSize: 12,
      color: "var(--text-secondary)"
    }
  }, t))), /*#__PURE__*/React.createElement(Button, {
    tone: "teal"
  }, "\u05D0\u05E9\u05DE\u05D7 \u05DC\u05D4\u05DB\u05D9\u05E8 \uD83D\uDC9C")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 18,
      marginBottom: 8
    }
  }, "\u05D0\u05D9\u05EA\u05D9"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 16
    }
  }, ["8", "לקות למידה", "בית ספר רגיל", "עצמאי/ת יחסית"].map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      background: "var(--color-surface-2)",
      borderRadius: 999,
      padding: "4px 12px",
      fontSize: 12,
      color: "var(--text-secondary)"
    }
  }, t))), /*#__PURE__*/React.createElement(Button, {
    tone: "teal"
  }, "\u05D0\u05E9\u05DE\u05D7 \u05DC\u05D4\u05DB\u05D9\u05E8 \uD83D\uDC9C"))));
}
function DocumentsTab() {
  const items = [{
    label: "תעודת זהות",
    status: "approved"
  }, {
    label: "תעודת יושר",
    status: "uploaded"
  }, {
    label: "תעודת הכשרה",
    status: "missing"
  }];
  const toneFor = {
    approved: "teal",
    uploaded: "amber",
    missing: "neutral"
  };
  const labelFor = {
    approved: "מאומת",
    uploaded: "בבדיקה",
    missing: "חסר"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px",
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    eyebrow: "\u05D0\u05D9\u05DE\u05D5\u05EA \u05DE\u05E7\u05E6\u05D5\u05E2\u05D9",
    title: "\u05DE\u05E1\u05DE\u05DB\u05D9 \u05D0\u05D9\u05DE\u05D5\u05EA",
    subtitle: "\u05D4\u05E2\u05DC\u05D5 \u05D0\u05EA \u05D4\u05DE\u05E1\u05DE\u05DB\u05D9\u05DD \u05D4\u05E0\u05D3\u05E8\u05E9\u05D9\u05DD \u05DC\u05D0\u05D9\u05DE\u05D5\u05EA \u05E4\u05E8\u05D5\u05E4\u05D9\u05DC"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 20
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, items.map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.label,
    padding: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, it.label), /*#__PURE__*/React.createElement(Badge, {
    tone: toneFor[it.status]
  }, labelFor[it.status]))))));
}
function Home() {
  const [tab, setTab] = React.useState("home");
  const [detail, setDetail] = React.useState(null);
  if (detail === "today") return /*#__PURE__*/React.createElement(TodayScreen, {
    onBack: () => setDetail(null)
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }
  }, tab === "home" ? /*#__PURE__*/React.createElement(HomeTab, {
    onOpenToday: () => setDetail("today")
  }) : tab === "browse" ? /*#__PURE__*/React.createElement(BrowseTab, null) : tab === "documents" ? /*#__PURE__*/React.createElement(DocumentsTab, null) : /*#__PURE__*/React.createElement(MessagesTab, null), /*#__PURE__*/React.createElement(TabBar, {
    active: tab,
    onChange: setTab
  }));
}
function ProfessionalApp() {
  const [screen, setScreen] = React.useState("pending");
  return /*#__PURE__*/React.createElement(Phone, null, screen === "pending" ? /*#__PURE__*/React.createElement(PendingScreen, {
    onNext: () => setScreen("home")
  }) : null, screen === "home" ? /*#__PURE__*/React.createElement(Home, null) : null);
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ProfessionalApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/professional-app/ProfessionalApp.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Card = __ds_scope.Card;

__ds_ns.LetterCard = __ds_scope.LetterCard;

__ds_ns.MatchCard = __ds_scope.MatchCard;

__ds_ns.MetricCard = __ds_scope.MetricCard;

__ds_ns.PlaceholderCard = __ds_scope.PlaceholderCard;

__ds_ns.RequestCard = __ds_scope.RequestCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.StarRating = __ds_scope.StarRating;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.OtpInput = __ds_scope.OtpInput;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.ChildSelector = __ds_scope.ChildSelector;

__ds_ns.RoleCard = __ds_scope.RoleCard;

__ds_ns.ScreenHeader = __ds_scope.ScreenHeader;

__ds_ns.ChipSelect = __ds_scope.ChipSelect;

__ds_ns.MultiChipSelect = __ds_scope.MultiChipSelect;

__ds_ns.SwitchToggle = __ds_scope.SwitchToggle;

})();
