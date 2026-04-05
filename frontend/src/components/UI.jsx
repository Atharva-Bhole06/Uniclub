import React from 'react';
import styles from './UI.module.css';

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className={styles.spinnerWrap}>
      <div className={styles.spinner} />
      <p className={styles.spinnerText}>{text}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className={styles.emptyState}>
      {Icon && <Icon size={48} className={styles.emptyIcon} />}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {description && <p className={styles.emptyDesc}>{description}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.pageAction}>{action}</div>}
    </div>
  );
}

export function FormInput({ label, error, ...props }) {
  return (
    <div className={styles.formGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={`${styles.input} ${error ? styles.inputError : ''}`} {...props} />
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}

export function FormTextarea({ label, error, ...props }) {
  return (
    <div className={styles.formGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''}`} {...props} />
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}

export function FormSelect({ label, error, options = [], ...props }) {
  return (
    <div className={styles.formGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <select className={`${styles.input} ${error ? styles.inputError : ''}`} {...props}>
        <option value="">Select...</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}

export function Button({ children, variant = 'primary', loading, ...props }) {
  return (
    <button
      className={`${styles.btn} ${styles[`btn_${variant}`]}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className={styles.btnSpinner} /> : children}
    </button>
  );
}

export function StatusBadge({ status }) {
  const map = {
    PENDING:  { label: 'Pending',  color: '#f59e0b' },
    APPROVED: { label: 'Approved', color: '#c9f28f' },
    REJECTED: { label: 'Rejected', color: '#ef4444' },
    ATTENDED: { label: 'Attended', color: '#c9f28f' },
    ABSENT:   { label: 'Absent',   color: '#ef4444' },
  };
  const s = map[status] || { label: status, color: '#9ca3af' };
  return (
    <span className={styles.badge} style={{ color: s.color, borderColor: s.color }}>
      {s.label}
    </span>
  );
}
