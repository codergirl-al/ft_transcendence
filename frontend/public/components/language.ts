const languages = ["English", "Spanish", "French", "German"];
let currentLanguageIndex = 0;

export function toggleLanguage() {
  currentLanguageIndex = (currentLanguageIndex + 1) % languages.length;
  alert(`Language changed to: ${languages[currentLanguageIndex]}`);
  localStorage.setItem("language", languages[currentLanguageIndex]);
}

export function applySavedLanguage() {
  const savedLanguage = localStorage.getItem("language");
  if (savedLanguage) {
    alert(`Loaded language: ${savedLanguage}`);
  }
}

// Apply saved language on load
applySavedLanguage();