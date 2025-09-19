import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Language } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  variant?: 'full' | 'icon';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'full' }) => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  if (variant === 'icon') {
    return (
      <Box sx={{ position: 'relative' }}>
        <IconButton
          color="inherit"
          aria-label="change language"
        >
          <Language />
        </IconButton>
        {/* Add menu functionality here if needed */}
      </Box>
    );
  }

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Language</InputLabel>
      <Select
        value={i18n.language}
        label="Language"
        onChange={(e) => handleLanguageChange(e.target.value)}
      >
        {languages.map((language) => (
          <MenuItem key={language.code} value={language.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;