import React, { useState, useRef, useEffect } from "react";
import { BellIcon, HelpCircleIcon, ChevronDownIcon, LogOutIcon } from "./icons";
import type { Brand } from "../types";
import { BRAND_CONFIG } from "../types";
import { supabase } from "@/lib/supabase";

interface HeaderProps {
  selectedBrand: Brand | null;
  onBrandSelect: (brand: Brand) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  selectedBrand,
  onBrandSelect,
  onLogout,
}) => {
  const [isBrandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState(null);

  const [userData, setUserData] = useState({
    email: "",
    name: "",
    photo: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setError("User not found or not authenticated.");
        return;
      }

      const email = user.email || "Email not provided";
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "Authenticated User";
      const photo =
        user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

      setUserData({ email, name, photo });
    };

    getUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setBrandDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBrandSelect = (brand: Brand) => {
    onBrandSelect(brand);
    setBrandDropdownOpen(false);
  };

  return (
    <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 relative z-20">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="relative" ref={brandDropdownRef}>
          <button
            onClick={() => setBrandDropdownOpen(!isBrandDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-gray-700 font-semibold bg-white hover:bg-gray-50 transition-colors"
          >
            <span>
              {selectedBrand 
                ? BRAND_CONFIG.find(config => config.id === selectedBrand)?.displayName 
                : "Select a Brand"
              }
            </span>
            <ChevronDownIcon
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isBrandDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isBrandDropdownOpen && (
            <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
              {BRAND_CONFIG.map((brandConfig) => (
                <button
                  key={brandConfig.id}
                  onClick={() => handleBrandSelect(brandConfig.id)}
                  className={`w-full text-left px-4 py-2 text-sm font-medium ${
                    selectedBrand === brandConfig.id
                      ? "bg-blue-50 text-brand-pink"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {brandConfig.displayName}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-700">
            <BellIcon className="w-6 h-6" />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <HelpCircleIcon className="w-6 h-6" />
          </button>
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              <img
                className="w-10 h-10 rounded-full object-cover"
                src={
                  userData.photo ||
                  "https://randomuser.me/api/portraits/women/44.jpg"
                }
                alt="User profile"
              />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold text-gray-900">
                    {userData.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    <LogOutIcon className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
