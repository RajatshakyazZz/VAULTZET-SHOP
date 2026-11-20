export interface CountryConfig {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  digits: number; // Exact expected number of national digits (fixed!)
  minDigits?: number;
  maxDigits?: number;
  placeholder: string;
  patternDesc: string;
  prefixPattern?: RegExp;
}

export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    digits: 10,
    placeholder: '9876543210 (10 digits)',
    patternDesc: '10-digit Indian mobile number starting with 6, 7, 8, or 9',
    prefixPattern: /^[6-9]/,
  },
  {
    code: 'MA',
    name: 'Morocco',
    dialCode: '+212',
    flag: '🇲🇦',
    digits: 9,
    placeholder: '612345678 (9 digits)',
    patternDesc: '9-digit Moroccan mobile number (starts with 6 or 7)',
    prefixPattern: /^[5-7]/,
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    digits: 10,
    placeholder: '5551234567 (10 digits)',
    patternDesc: '10-digit US phone number',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    digits: 10,
    placeholder: '7911123456 (10 digits)',
    patternDesc: '10-digit UK phone number',
    prefixPattern: /^7/,
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    digits: 9,
    placeholder: '501234567 (9 digits)',
    patternDesc: '9-digit UAE mobile number (starts with 5)',
    prefixPattern: /^5/,
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    flag: '🇸🇦',
    digits: 9,
    placeholder: '512345678 (9 digits)',
    patternDesc: '9-digit Saudi mobile number (starts with 5)',
    prefixPattern: /^5/,
  },
  {
    code: 'NP',
    name: 'Nepal',
    dialCode: '+977',
    flag: '🇳🇵',
    digits: 10,
    placeholder: '9812345678 (10 digits)',
    patternDesc: '10-digit Nepal mobile number (starts with 97 or 98)',
    prefixPattern: /^9/,
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    dialCode: '+880',
    flag: '🇧🇩',
    digits: 10,
    placeholder: '1712345678 (10 digits)',
    patternDesc: '10-digit Bangladesh mobile number (starts with 1)',
    prefixPattern: /^1/,
  },
  {
    code: 'PK',
    name: 'Pakistan',
    dialCode: '+92',
    flag: '🇵🇰',
    digits: 10,
    placeholder: '3001234567 (10 digits)',
    patternDesc: '10-digit Pakistan mobile number (starts with 3)',
    prefixPattern: /^3/,
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    digits: 10,
    placeholder: '5551234567 (10 digits)',
    patternDesc: '10-digit Canadian phone number',
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    digits: 9,
    placeholder: '412345678 (9 digits)',
    patternDesc: '9-digit Australian mobile number (starts with 4)',
    prefixPattern: /^4/,
  },
  {
    code: 'KW',
    name: 'Kuwait',
    dialCode: '+965',
    flag: '🇰🇼',
    digits: 8,
    placeholder: '51234567 (8 digits)',
    patternDesc: '8-digit Kuwait phone number',
  },
  {
    code: 'QA',
    name: 'Qatar',
    dialCode: '+974',
    flag: '🇶🇦',
    digits: 8,
    placeholder: '33123456 (8 digits)',
    patternDesc: '8-digit Qatar phone number',
  },
  {
    code: 'OM',
    name: 'Oman',
    dialCode: '+968',
    flag: '🇴🇲',
    digits: 8,
    placeholder: '91234567 (8 digits)',
    patternDesc: '8-digit Oman phone number',
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    digits: 10,
    minDigits: 10,
    maxDigits: 11,
    placeholder: '15112345678 (10-11 digits)',
    patternDesc: 'German phone number',
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    digits: 9,
    placeholder: '612345678 (9 digits)',
    patternDesc: '9-digit French mobile number (starts with 6 or 7)',
    prefixPattern: /^[67]/,
  },
  {
    code: 'ES',
    name: 'Spain',
    dialCode: '+34',
    flag: '🇪🇸',
    digits: 9,
    placeholder: '612345678 (9 digits)',
    patternDesc: '9-digit Spanish mobile number',
    prefixPattern: /^[67]/,
  },
  {
    code: 'IT',
    name: 'Italy',
    dialCode: '+39',
    flag: '🇮🇹',
    digits: 10,
    placeholder: '3123456789 (10 digits)',
    patternDesc: '10-digit Italian mobile number',
    prefixPattern: /^3/,
  },
  {
    code: 'RU',
    name: 'Russia',
    dialCode: '+7',
    flag: '🇷🇺',
    digits: 10,
    placeholder: '9123456789 (10 digits)',
    patternDesc: '10-digit Russian phone number',
    prefixPattern: /^9/,
  },
  {
    code: 'BR',
    name: 'Brazil',
    dialCode: '+55',
    flag: '🇧🇷',
    digits: 11,
    placeholder: '11912345678 (11 digits)',
    patternDesc: '11-digit Brazilian phone number',
  },
  {
    code: 'ZA',
    name: 'South Africa',
    dialCode: '+27',
    flag: '🇿🇦',
    digits: 9,
    placeholder: '712345678 (9 digits)',
    patternDesc: '9-digit South African mobile number',
    prefixPattern: /^[6-8]/,
  },
  {
    code: 'NG',
    name: 'Nigeria',
    dialCode: '+234',
    flag: '🇳🇬',
    digits: 10,
    placeholder: '8012345678 (10 digits)',
    patternDesc: '10-digit Nigerian mobile number',
    prefixPattern: /^[7-9]/,
  },
  {
    code: 'EG',
    name: 'Egypt',
    dialCode: '+20',
    flag: '🇪🇬',
    digits: 10,
    placeholder: '1012345678 (10 digits)',
    patternDesc: '10-digit Egyptian mobile number',
    prefixPattern: /^1/,
  },
  {
    code: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    flag: '🇸🇬',
    digits: 8,
    placeholder: '81234567 (8 digits)',
    patternDesc: '8-digit Singapore phone number',
    prefixPattern: /^[89]/,
  },
  {
    code: 'MY',
    name: 'Malaysia',
    dialCode: '+60',
    flag: '🇲🇾',
    digits: 10,
    minDigits: 9,
    maxDigits: 10,
    placeholder: '1234567890 (9-10 digits)',
    patternDesc: 'Malaysian mobile number',
    prefixPattern: /^1/,
  },
  {
    code: 'ID',
    name: 'Indonesia',
    dialCode: '+62',
    flag: '🇮🇩',
    digits: 10,
    minDigits: 9,
    maxDigits: 12,
    placeholder: '81234567890 (9-12 digits)',
    patternDesc: 'Indonesian mobile number',
    prefixPattern: /^8/,
  },
  {
    code: 'PH',
    name: 'Philippines',
    dialCode: '+63',
    flag: '🇵🇭',
    digits: 10,
    placeholder: '9123456789 (10 digits)',
    patternDesc: '10-digit Philippine mobile number',
    prefixPattern: /^9/,
  },
  {
    code: 'OTHER',
    name: 'Other International',
    dialCode: '+',
    flag: '🌍',
    digits: 10,
    minDigits: 8,
    maxDigits: 15,
    placeholder: '212612345678 (Country code + Number)',
    patternDesc: 'International phone number (8 to 15 digits)',
  },
];

export const DEFAULT_COUNTRY = SUPPORTED_COUNTRIES[0]; // India (+91)

export function findCountryByCode(code: string): CountryConfig {
  return (
    SUPPORTED_COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) ||
    DEFAULT_COUNTRY
  );
}

export function findCountryByDialCode(dialCode: string): CountryConfig | undefined {
  const clean = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  return SUPPORTED_COUNTRIES.find((c) => c.dialCode === clean && c.code !== 'OTHER');
}

/**
 * Auto-detects if the user pasted a phone number starting with + or a known country code
 */
export function detectCountryFromInput(raw: string): { country?: CountryConfig; nationalDigits: string } {
  const trimmed = raw.trim();
  
  if (trimmed.startsWith('+')) {
    const digitsOnly = trimmed.slice(1).replace(/\D/g, '');
    // Check known dial codes from longest to shortest
    const sorted = [...SUPPORTED_COUNTRIES]
      .filter((c) => c.code !== 'OTHER')
      .sort((a, b) => b.dialCode.length - a.dialCode.length);

    for (const c of sorted) {
      const codeDigits = c.dialCode.replace(/\D/g, '');
      if (digitsOnly.startsWith(codeDigits)) {
        let national = digitsOnly.slice(codeDigits.length);
        // Strip leading 0 if present (e.g. Morocco 0612345678 -> 612345678)
        if (national.startsWith('0') && national.length > c.digits) {
          national = national.slice(1);
        }
        return { country: c, nationalDigits: national.slice(0, c.maxDigits || c.digits) };
      }
    }

    // Fallback to OTHER international
    return { country: SUPPORTED_COUNTRIES.find((c) => c.code === 'OTHER'), nationalDigits: digitsOnly.slice(0, 15) };
  }

  return { nationalDigits: raw.replace(/\D/g, '') };
}

/**
 * Normalizes phone digits based on the selected country:
 * - Strips leading zero if user typed e.g. 0612345678 for Morocco or 09876543210 for India
 * - Clamps to exact maxDigits / digits for that country
 */
export function normalizePhoneForCountry(raw: string, country: CountryConfig): string {
  let digits = raw.replace(/\D/g, '');

  if (country.code !== 'OTHER') {
    // If user pasted with dial code, strip it
    const codeDigits = country.dialCode.replace(/\D/g, '');
    if (digits.length > country.digits && digits.startsWith(codeDigits)) {
      digits = digits.slice(codeDigits.length);
    }

    // Strip leading 0 commonly typed in Morocco/Europe/India
    if (digits.length > country.digits && digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    const max = country.maxDigits || country.digits;
    return digits.slice(0, max);
  }

  return digits.slice(0, 15);
}

/**
 * Validates the national phone digits for the selected country:
 * Checks exact digit count ("fixed digit na kam na jyada"), anti-fake repetitive sequences,
 * and valid prefix patterns.
 */
export function validatePhoneForCountry(phone: string, country: CountryConfig): string | null {
  const clean = phone.trim().replace(/\D/g, '');

  if (!clean) {
    return `${country.name} phone number is required.`;
  }

  // Common fake number checks across all countries
  const fakeSequences = new Set([
    '9876543210', '1234567890', '0123456789', '9123456789', '8765432109',
    '1111111111', '2222222222', '3333333333', '4444444444', '5555555555',
    '6666666666', '7777777777', '8888888888', '9999999999', '0000000000',
    '123456789', '987654321', '000000000', '111111111', '999999999',
  ]);

  if (fakeSequences.has(clean) || /^(\d)\1{5,}$/.test(clean)) {
    return `Fake phone number detected! Please enter your real WhatsApp / mobile number.`;
  }

  // Exact fixed digit check
  if (country.minDigits && country.maxDigits) {
    if (clean.length < country.minDigits) {
      return `${country.name} phone number must be at least ${country.minDigits} digits (${clean.length}/${country.minDigits} entered).`;
    }
    if (clean.length > country.maxDigits) {
      return `${country.name} phone number cannot exceed ${country.maxDigits} digits.`;
    }
  } else {
    // Strict exact digit count: "fixed digit na kam na jyada"
    if (clean.length < country.digits) {
      return `${country.name} phone number must be exactly ${country.digits} digits (${clean.length}/${country.digits} entered).`;
    }
    if (clean.length > country.digits) {
      return `${country.name} phone number cannot be more than ${country.digits} digits.`;
    }
  }

  // Country-specific prefix checks
  if (country.code === 'IN') {
    if (!/^[6-9]\d{9}$/.test(clean)) {
      return 'Invalid Indian mobile number! Must start with 6, 7, 8, or 9.';
    }
  } else if (country.code === 'MA') {
    // Morocco mobile numbers start with 6 or 7 (or 5 for fixed-wireless)
    if (!/^[5-7]\d{8}$/.test(clean)) {
      return 'Invalid Moroccan mobile number! Must start with 6, 7, or 5.';
    }
  } else if (country.prefixPattern && !country.prefixPattern.test(clean)) {
    return `Invalid ${country.name} number format! Please check the starting digits.`;
  }

  return null;
}
