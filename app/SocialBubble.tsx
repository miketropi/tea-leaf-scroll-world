"use client";

import { useState } from "react";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100068020483283";

export function SocialBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger link */}
      <button
        type="button"
        className="journey-follow"
        onClick={() => setOpen(true)}
      >
        Follow Us on Facebook
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="social-modal-overlay" onClick={() => setOpen(false)}>
          <div
            className="social-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="social-modal-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="social-modal-body">
              <span className="social-modal-hand">👋</span>
              <p className="social-modal-message">
                like &amp; follow để xem những thứ hay ho mỗi ngày nha nha nha!
              </p>
              <span className="social-modal-arrow">👇</span>
            </div>

            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="social-modal-link"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              Ghé thăm Fanpage
            </a>
          </div>
        </div>
      )}
    </>
  );
}
