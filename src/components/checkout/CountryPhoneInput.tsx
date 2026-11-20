'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  CheckCircle2,
  AlertCircle,
  Globe,
} from 'lucide-react';
import {
  CountryConfig,
  SUPPORTED_COUNTRIES,
  detectCountryFromInput,
  normalizePhoneForCountry,
} from '@/data/countries';

interface CountryPhoneInputProps {
  selectedCountry: CountryConfig;
  onSelectCountry: (country: CountryConfig) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  phoneError: string | null;
  isTouched: boolean;
  onBlur: () => void;
}

export default function CountryPhoneInput({
  selectedCountry,
  onSelectCountry,
  phone,
  onPhoneChange,
  phoneError,
  isTouched,
  onBlur,
}: CountryPhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredCountries = SUPPORTED_COUNTRIES.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.dialCode.toLowerCase().includes(query)
    );
  });

  const handleCountrySelect = (country: CountryConfig) => {
    onSelectCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    // Re-normalize existing phone input for newly selected country
    if (phone) {
      const normalized = normalizePhoneForCountry(phone, country);
      onPhoneChange(normalized);
    }
    setTimeout(() => phoneInputRef.current?.focus(), 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Check if user pasted an international number starting with +
    if (raw.trim().startsWith('+')) {
      const detected = detectCountryFromInput(raw);
      if (detected.country) {
        onSelectCountry(detected.country);
        onPhoneChange(detected.nationalDigits);
        return;
      }
    }

    const normalized = normalizePhoneForCountry(raw, selectedCountry);
    onPhoneChange(normalized);
  };

  const maxLen = selectedCountry.maxDigits || selectedCountry.digits;
  const targetLen = selectedCountry.digits;
  const isLengthMatched = selectedCountry.minDigits && selectedCountry.maxDigits
    ? phone.length >= selectedCountry.minDigits && phone.length <= selectedCountry.maxDigits
    : phone.length === targetLen;
  const isValid = isLengthMatched && !phoneError;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-slate-700">
          WhatsApp / Phone Number ({targetLen} Digits) <span className="text-red-500">*</span>
        </label>
        <span
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded transition-colors ${
            isValid
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {phone.length}/{targetLen} Digits
        </span>
      </div>

      {/* Input Group with Country Dropdown */}
      <div
        className={`flex items-center rounded-xl border overflow-visible transition-colors focus-within:ring-2 ${
          (isTouched || phone.length > 0) && phoneError
            ? 'border-red-400 bg-red-50/30 focus-within:ring-red-400'
            : isValid
            ? 'border-emerald-400 bg-emerald-50/20 focus-within:ring-emerald-400'
            : 'border-slate-200 bg-white focus-within:ring-red-500/30 focus-within:border-red-500'
        }`}
      >
        {/* Country Selector Trigger */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={`Select country code, current is ${selectedCountry.name} (${selectedCountry.dialCode})`}
            className="flex items-center gap-1.5 px-3 py-3 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 text-xs sm:text-sm font-extrabold text-slate-800 select-none shrink-0 transition-colors cursor-pointer rounded-l-xl"
          >
            <span className="text-base leading-none" role="img" aria-label={selectedCountry.name}>
              {selectedCountry.flag}
            </span>
            <span>{selectedCountry.dialCode}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Accessible Country Dropdown Popup */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Search Bar */}
              <div className="px-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search country or code (e.g. Morocco, 212)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-slate-800 font-semibold focus:outline-none placeholder:text-slate-400 text-xs"
                  />
                </div>
              </div>

              {/* Country List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 py-1 text-xs">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => {
                    const isSelected = c.code === selectedCountry.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCountrySelect(c)}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-red-50/80 transition-colors cursor-pointer ${
                          isSelected ? 'bg-red-50 font-bold text-red-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <span className="text-base shrink-0">{c.flag}</span>
                          <span className="truncate font-semibold">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-slate-500 text-[11px]">{c.dialCode}</span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                            {c.digits} digits
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-4 text-center text-xs text-slate-400">
                    No country found matching &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* National Number Input */}
        <input
          ref={phoneInputRef}
          type="tel"
          required
          inputMode="numeric"
          maxLength={maxLen}
          autoComplete="tel-national"
          placeholder={selectedCountry.placeholder}
          value={phone}
          onBlur={onBlur}
          onChange={handleInputChange}
          className="w-full px-3.5 py-3 bg-transparent text-base sm:text-sm font-bold text-slate-950 tracking-wide focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
        />
      </div>

      {/* Validation Feedback Messages */}
      {(isTouched || phone.length > 0) && phoneError ? (
        <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{phoneError}</span>
        </p>
      ) : isValid ? (
        <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>
            Valid {selectedCountry.name} WhatsApp number verified ({selectedCountry.dialCode} {phone}).
          </span>
        </p>
      ) : (
        <span className="text-[11px] text-slate-400 mt-1 block">
          Order updates & instant access link will also be delivered to this WhatsApp number.
        </span>
      )}
    </div>
  );
}
