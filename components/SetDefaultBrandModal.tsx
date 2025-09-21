import React from "react";
import ReactDOM from "react-dom";
import { SparklesIcon } from "./icons";
import type { Brand } from "../types";

interface SetDefaultBrandModalProps {
  brandName: Brand;
  onConfirm: () => void;
  onClose: () => void;
}

const SetDefaultBrandModal: React.FC<SetDefaultBrandModalProps> = ({
  brandName,
  onConfirm,
  onClose,
}) => {
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  const brandStyles: Record<
    Brand,
    { logoSrc: string; color: string; bg: string }
  > = {
    "Frank & Co": {
      logoSrc: "../assets/img/franknco.webp",
      color: "text-blue-800",
      bg: "bg-blue-100",
    },
    "The Palace": {
      logoSrc: "../assets/img/the-palace-logo-gold.png",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    Mondial: {
      logoSrc: "../assets/img/mondial-logo.png",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    "Laku Emas": {
      logoSrc: "../assets/img/lakuemas.png",
      color: "text-amber-500",
      bg: "bg-amber-100",
    },
  };

  const currentBrandStyle = brandStyles[brandName] || {
    logoSrc: "",
    color: "text-brand-blue",
    bg: "bg-blue-100",
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <div
            className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${currentBrandStyle.bg}`}
          >
            {currentBrandStyle.logoSrc ? (
              <img
                src={currentBrandStyle.logoSrc}
                alt={`${brandName} Logo`}
                className=""
              />
            ) : (
              <SparklesIcon className={`h-9 w-9 ${currentBrandStyle.color}`} />
            )}
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">
            Set Default Brand?
          </h3>
          <div className="mt-3">
            <p className="text-sm text-gray-600">
              Would you like to make{" "}
              <span className="font-bold text-brand-pink">{brandName}</span>{" "}
              your default brand?
            </p>
            <p className="mt-1 text-sm text-gray-500">
              You'll be taken here directly next time you visit.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors"
            onClick={onConfirm}
          >
            Yes, set as default
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm transition-colors"
            onClick={onClose}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default SetDefaultBrandModal;
