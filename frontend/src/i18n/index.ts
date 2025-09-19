import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      welcome: 'Welcome',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      username: 'Username',
      fullName: 'Full Name',
      role: 'Role',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      refresh: 'Refresh',
      
      // Roles
      tourist: 'Tourist',
      police: 'Police',
      tourismAuthority: 'Tourism Authority',
      
      // Navigation
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      
      // Tourist Dashboard
      touristDashboard: 'Tourist Dashboard',
      digitalId: 'Digital Tourist ID',
      safetyScore: 'Safety Score',
      locationTracker: 'Location Tracker',
      itinerary: 'My Itinerary',
      panicButton: 'Emergency',
      quickActions: 'Quick Actions',
      viewItinerary: 'View Itinerary',
      shareLocation: 'Share Location',
      safetyTips: 'Safety Tips',
      
      // Police Dashboard
      policeDashboard: 'Police Dashboard',
      realTimeMonitoring: 'Real-time Tourism Safety Monitoring',
      activeTourists: 'Active Tourists',
      activeAlerts: 'Active Alerts',
      highRiskZones: 'High Risk Zones',
      resolvedToday: 'Resolved Today',
      touristLocations: 'Tourist Locations',
      liveAlerts: 'Live Alerts',
      riskHeatmap: 'Risk Heatmap',
      recentAlerts: 'Recent Alerts',
      
      // Safety & Security
      verified: 'Verified',
      safetyScoreExcellent: 'Excellent',
      safetyScoreGood: 'Good',
      safetyScoreFair: 'Fair',
      safetyScorePoor: 'Poor',
      emergencyAlert: 'Emergency Alert',
      allClear: 'All Clear!',
      
      // Location & Geofencing
      currentLocation: 'Current Location',
      lastKnownLocation: 'Last Known Location',
      getCurrentLocation: 'Get Current Location',
      startTracking: 'Start Tracking',
      locationActive: 'Location Active',
      locationInactive: 'Location Inactive',
      gettingLocation: 'Getting Location...',
      
      // Alerts & Messages
      noActiveAlerts: 'No active alerts at this time',
      emergencyContactNotified: 'Emergency services notified',
      alertSentSuccessfully: 'Emergency alert sent successfully',
      helpIsOnTheWay: 'Help is on the way',
      
      // Errors
      loginFailed: 'Login failed. Please try again.',
      registrationFailed: 'Registration failed. Please try again.',
      invalidCredentials: 'Invalid email or password',
      locationError: 'Unable to get your location',
      locationDenied: 'Location access denied by user',
      locationUnavailable: 'Location information is unavailable',
      locationTimeout: 'Location request timed out',
      
      // Geofencing Messages
      enteredRestrictedArea: 'WARNING: You have entered a restricted area ({{zoneName}}). Please exit immediately for your safety.',
      enteredSafeZone: 'You have entered a safe zone ({{zoneName}}). Enjoy your visit!',
      nearEmergencyServices: 'You are near emergency services ({{zoneName}}). Help is available if needed.',
      enteredMonitoredArea: 'You have entered a monitored area ({{zoneName}}).',
      
      // Demo Accounts
      demoAccounts: 'Demo Accounts',
      
      // Time
      justNow: 'Just now',
      minutesAgo: '{{count}} minutes ago',
      hoursAgo: '{{count}} hours ago',
      daysAgo: '{{count}} days ago',
      
      // Security
      blockchainSecured: 'This ID is secured by blockchain technology and verified by tourism authorities.',
      locationMonitored: 'Your location is being monitored for safety purposes. You can disable tracking in settings.',
      realTimeData: 'Real-time tourist locations with clustering. Click on clusters to see individual tourists.',
      heatmapDescription: 'Areas with higher security risks based on historical data and current conditions',
      
      // New Features
      comingSoon: 'Coming Soon',
      stayTuned: 'Stay tuned for exciting updates!',
      goBack: 'Go Back',
      addItem: 'Add Item',
      viewOnMap: 'View on Map',
      yourTripPlan: 'Your personalized trip plan',
      complete: 'Complete',
      safetyMonitoring: 'Safety Monitoring',
      itineraryMonitoringMessage: 'Your itinerary is monitored for safety. Significant deviations will trigger alerts to ensure your wellbeing.',
      kycVerification: 'KYC Verification',
      aadhaarCard: 'Aadhaar Card',
      passport: 'Passport',
      personalInformation: 'Personal Information',
      visitInformation: 'Visit Information',
      issueDate: 'Issue Date',
      validUntil: 'Valid Until',
      issuePoint: 'Issue Point',
      showQR: 'Show QR',
      digitalIdQR: 'Digital ID QR Code',
      qrCodeMessage: 'Scan this QR code for instant verification by authorities',
      tripItinerary: 'Trip Itinerary',
      completed: 'Completed',
      upcoming: 'Upcoming',
      nearbyAreas: 'Nearby Areas & Points of Interest',
      mapIntegrationDesc: 'Interactive map with real-time location tracking, nearby attractions, and safety zones will be available soon.',
      itineraryDesc: 'Detailed trip itinerary with timeline, attractions, bookings, and real-time updates will be available soon.',
      notifications: 'Notifications',
      updating: 'Updating...',
      realTimeLocation: 'Real-time location monitoring',
      accuracy: 'Accuracy',
      lastUpdate: 'Last updated',
      interactiveMap: 'Interactive Map',
      mapComingSoon: 'Enhanced map view with real-time location tracking coming soon',
      locationNotSupported: 'Geolocation is not supported by this browser.',
      touristId: 'Tourist ID',
      blockchainId: 'Blockchain ID',
      viewQRCode: 'View QR Code',
      emergencyContact: 'Emergency Contact',
      nationality: 'Nationality',
      pending: 'Pending',
    }
  },
  es: {
    translation: {
      // Common
      welcome: 'Bienvenido',
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      register: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      username: 'Nombre de Usuario',
      fullName: 'Nombre Completo',
      role: 'Rol',
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      submit: 'Enviar',
      refresh: 'Actualizar',
      
      // Roles
      tourist: 'Turista',
      police: 'Policía',
      tourismAuthority: 'Autoridad de Turismo',
      
      // Navigation
      dashboard: 'Panel Principal',
      profile: 'Perfil',
      settings: 'Configuración',
      
      // Tourist Dashboard
      touristDashboard: 'Panel del Turista',
      digitalId: 'ID Digital del Turista',
      safetyScore: 'Puntuación de Seguridad',
      locationTracker: 'Rastreador de Ubicación',
      itinerary: 'Mi Itinerario',
      panicButton: 'Emergencia',
      quickActions: 'Acciones Rápidas',
      viewItinerary: 'Ver Itinerario',
      shareLocation: 'Compartir Ubicación',
      safetyTips: 'Consejos de Seguridad',
      
      // Police Dashboard
      policeDashboard: 'Panel de Policía',
      realTimeMonitoring: 'Monitoreo de Seguridad Turística en Tiempo Real',
      activeTourists: 'Turistas Activos',
      activeAlerts: 'Alertas Activas',
      highRiskZones: 'Zonas de Alto Riesgo',
      resolvedToday: 'Resueltas Hoy',
      touristLocations: 'Ubicaciones de Turistas',
      liveAlerts: 'Alertas en Vivo',
      riskHeatmap: 'Mapa de Calor de Riesgos',
      recentAlerts: 'Alertas Recientes',
      
      // Safety & Security
      verified: 'Verificado',
      safetyScoreExcellent: 'Excelente',
      safetyScoreGood: 'Bueno',
      safetyScoreFair: 'Regular',
      safetyScorePoor: 'Malo',
      emergencyAlert: 'Alerta de Emergencia',
      allClear: '¡Todo Despejado!',
      
      // Location & Geofencing
      currentLocation: 'Ubicación Actual',
      lastKnownLocation: 'Última Ubicación Conocida',
      getCurrentLocation: 'Obtener Ubicación Actual',
      startTracking: 'Iniciar Rastreo',
      locationActive: 'Ubicación Activa',
      locationInactive: 'Ubicación Inactiva',
      gettingLocation: 'Obteniendo Ubicación...',
      
      // Alerts & Messages
      noActiveAlerts: 'No hay alertas activas en este momento',
      emergencyContactNotified: 'Servicios de emergencia notificados',
      alertSentSuccessfully: 'Alerta de emergencia enviada exitosamente',
      helpIsOnTheWay: 'La ayuda está en camino',
      
      // Errors
      loginFailed: 'Inicio de sesión fallido. Por favor intente de nuevo.',
      registrationFailed: 'Registro fallido. Por favor intente de nuevo.',
      invalidCredentials: 'Correo electrónico o contraseña inválidos',
      locationError: 'No se puede obtener su ubicación',
      locationDenied: 'Acceso a la ubicación denegado por el usuario',
      locationUnavailable: 'Información de ubicación no disponible',
      locationTimeout: 'Solicitud de ubicación agotó el tiempo',
      
      // Geofencing Messages
      enteredRestrictedArea: 'ADVERTENCIA: Ha ingresado a un área restringida ({{zoneName}}). Por favor salga inmediatamente por su seguridad.',
      enteredSafeZone: 'Ha ingresado a una zona segura ({{zoneName}}). ¡Disfrute su visita!',
      nearEmergencyServices: 'Está cerca de servicios de emergencia ({{zoneName}}). Hay ayuda disponible si la necesita.',
      enteredMonitoredArea: 'Ha ingresado a un área monitoreada ({{zoneName}}).',
      
      // Demo Accounts
      demoAccounts: 'Cuentas de Demostración',
      
      // Time
      justNow: 'Ahora mismo',
      minutesAgo: 'hace {{count}} minutos',
      hoursAgo: 'hace {{count}} horas',
      daysAgo: 'hace {{count}} días',
      
      // Security
      blockchainSecured: 'Esta ID está asegurada por tecnología blockchain y verificada por autoridades de turismo.',
      locationMonitored: 'Su ubicación está siendo monitoreada por razones de seguridad. Puede desactivar el rastreo en la configuración.',
      realTimeData: 'Ubicaciones de turistas en tiempo real con agrupación. Haga clic en los grupos para ver turistas individuales.',
      heatmapDescription: 'Áreas con mayores riesgos de seguridad basados en datos históricos y condiciones actuales',
    }
  },
  fr: {
    translation: {
      // Common
      welcome: 'Bienvenue',
      login: 'Se Connecter',
      logout: 'Se Déconnecter',
      register: 'S\'inscrire',
      email: 'E-mail',
      password: 'Mot de Passe',
      username: 'Nom d\'Utilisateur',
      fullName: 'Nom Complet',
      role: 'Rôle',
      loading: 'Chargement...',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      submit: 'Soumettre',
      refresh: 'Actualiser',
      
      // Roles
      tourist: 'Touriste',
      police: 'Police',
      tourismAuthority: 'Autorité du Tourisme',
      
      // Navigation
      dashboard: 'Tableau de Bord',
      profile: 'Profil',
      settings: 'Paramètres',
      
      // Tourist Dashboard
      touristDashboard: 'Tableau de Bord Touriste',
      digitalId: 'ID Numérique du Touriste',
      safetyScore: 'Score de Sécurité',
      locationTracker: 'Suivi de Localisation',
      itinerary: 'Mon Itinéraire',
      panicButton: 'Urgence',
      quickActions: 'Actions Rapides',
      viewItinerary: 'Voir l\'Itinéraire',
      shareLocation: 'Partager la Localisation',
      safetyTips: 'Conseils de Sécurité',
      
      // Police Dashboard
      policeDashboard: 'Tableau de Bord Police',
      realTimeMonitoring: 'Surveillance de la Sécurité Touristique en Temps Réel',
      activeTourists: 'Touristes Actifs',
      activeAlerts: 'Alertes Actives',
      highRiskZones: 'Zones à Haut Risque',
      resolvedToday: 'Résolues Aujourd\'hui',
      touristLocations: 'Localisations des Touristes',
      liveAlerts: 'Alertes en Direct',
      riskHeatmap: 'Carte de Chaleur des Risques',
      recentAlerts: 'Alertes Récentes',
      
      // Safety & Security
      verified: 'Vérifié',
      safetyScoreExcellent: 'Excellent',
      safetyScoreGood: 'Bon',
      safetyScoreFair: 'Acceptable',
      safetyScorePoor: 'Pauvre',
      emergencyAlert: 'Alerte d\'Urgence',
      allClear: 'Tout va Bien!',
      
      // Location & Geofencing
      currentLocation: 'Localisation Actuelle',
      lastKnownLocation: 'Dernière Localisation Connue',
      getCurrentLocation: 'Obtenir la Localisation Actuelle',
      startTracking: 'Commencer le Suivi',
      locationActive: 'Localisation Active',
      locationInactive: 'Localisation Inactive',
      gettingLocation: 'Obtention de la Localisation...',
      
      // Alerts & Messages
      noActiveAlerts: 'Aucune alerte active en ce moment',
      emergencyContactNotified: 'Services d\'urgence notifiés',
      alertSentSuccessfully: 'Alerte d\'urgence envoyée avec succès',
      helpIsOnTheWay: 'L\'aide est en route',
      
      // Errors
      loginFailed: 'Connexion échouée. Veuillez réessayer.',
      registrationFailed: 'Inscription échouée. Veuillez réessayer.',
      invalidCredentials: 'E-mail ou mot de passe invalide',
      locationError: 'Impossible d\'obtenir votre localisation',
      locationDenied: 'Accès à la localisation refusé par l\'utilisateur',
      locationUnavailable: 'Informations de localisation non disponibles',
      locationTimeout: 'Demande de localisation expirée',
      
      // Geofencing Messages
      enteredRestrictedArea: 'ATTENTION: Vous avez entré une zone restreinte ({{zoneName}}). Veuillez sortir immédiatement pour votre sécurité.',
      enteredSafeZone: 'Vous avez entré une zone sûre ({{zoneName}}). Profitez de votre visite!',
      nearEmergencyServices: 'Vous êtes près des services d\'urgence ({{zoneName}}). De l\'aide est disponible si nécessaire.',
      enteredMonitoredArea: 'Vous avez entré une zone surveillée ({{zoneName}}).',
      
      // Demo Accounts
      demoAccounts: 'Comptes de Démonstration',
      
      // Time
      justNow: 'À l\'instant',
      minutesAgo: 'il y a {{count}} minutes',
      hoursAgo: 'il y a {{count}} heures',
      daysAgo: 'il y a {{count}} jours',
      
      // Security
      blockchainSecured: 'Cette ID est sécurisée par la technologie blockchain et vérifiée par les autorités du tourisme.',
      locationMonitored: 'Votre localisation est surveillée pour des raisons de sécurité. Vous pouvez désactiver le suivi dans les paramètres.',
      realTimeData: 'Localisations des touristes en temps réel avec regroupement. Cliquez sur les groupes pour voir les touristes individuels.',
      heatmapDescription: 'Zones avec des risques de sécurité plus élevés basés sur les données historiques et les conditions actuelles',
    }
  },
  hi: {
    translation: {
      // Common
      welcome: 'स्वागत है',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      register: 'पंजीकरण',
      email: 'ईमेल',
      password: 'पासवर्ड',
      username: 'उपयोगकर्ता नाम',
      fullName: 'पूरा नाम',
      role: 'भूमिका',
      loading: 'लोड हो रहा है...',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      submit: 'जमा करें',
      refresh: 'रीफ्रेश',
      
      // Roles
      tourist: 'पर्यटक',
      police: 'पुलिस',
      tourismAuthority: 'पर्यटन प्राधिकरण',
      
      // Navigation
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्स',
      
      // Tourist Dashboard
      touristDashboard: 'पर्यटक डैशबोर्ड',
      digitalId: 'डिजिटल पर्यटक आईडी',
      safetyScore: 'सुरक्षा स्कोर',
      locationTracker: 'स्थान ट्रैकर',
      itinerary: 'मेरी यात्रा',
      panicButton: 'आपातकाल',
      quickActions: 'त्वरित कार्य',
      viewItinerary: 'यात्रा देखें',
      shareLocation: 'स्थान साझा करें',
      safetyTips: 'सुरक्षा सुझाव',
      
      // Police Dashboard
      policeDashboard: 'पुलिस डैशबोर्ड',
      realTimeMonitoring: 'रीयल-टाइम पर्यटन सुरक्षा निगरानी',
      activeTourists: 'सक्रिय पर्यटक',
      activeAlerts: 'सक्रिय अलर्ट',
      highRiskZones: 'उच्च जोखिम क्षेत्र',
      resolvedToday: 'आज हल किए गए',
      touristLocations: 'पर्यटक स्थान',
      liveAlerts: 'लाइव अलर्ट',
      riskHeatmap: 'जोखिम हीटमैप',
      recentAlerts: 'हालिया अलर्ट',
      
      // Safety & Security
      verified: 'सत्यापित',
      safetyScoreExcellent: 'उत्कृष्ट',
      safetyScoreGood: 'अच्छा',
      safetyScoreFair: 'ठीक',
      safetyScorePoor: 'खराब',
      emergencyAlert: 'आपातकालीन अलर्ट',
      allClear: 'सब ठीक है!',
      
      // Location & Geofencing
      currentLocation: 'वर्तमान स्थान',
      lastKnownLocation: 'अंतिम ज्ञात स्थान',
      getCurrentLocation: 'वर्तमान स्थान प्राप्त करें',
      startTracking: 'ट्रैकिंग शुरू करें',
      locationActive: 'स्थान सक्रिय',
      locationInactive: 'स्थान निष्क्रिय',
      gettingLocation: 'स्थान प्राप्त कर रहे हैं...',
      
      // Alerts & Messages
      noActiveAlerts: 'इस समय कोई सक्रिय अलर्ट नहीं',
      emergencyContactNotified: 'आपातकालीन सेवाएं सूचित',
      alertSentSuccessfully: 'आपातकालीन अलर्ट सफलतापूर्वक भेजा गया',
      helpIsOnTheWay: 'मदद आ रही है',
      
      // Errors
      loginFailed: 'लॉगिन असफल। कृपया पुनः प्रयास करें।',
      registrationFailed: 'पंजीकरण असफल। कृपया पुनः प्रयास करें।',
      invalidCredentials: 'अमान्य ईमेल या पासवर्ड',
      locationError: 'आपका स्थान प्राप्त करने में असमर्थ',
      locationDenied: 'उपयोगकर्ता द्वारा स्थान पहुंच से इनकार',
      locationUnavailable: 'स्थान जानकारी अनुपलब्ध',
      locationTimeout: 'स्थान अनुरोध समय समाप्त',
      
      // Geofencing Messages
      enteredRestrictedArea: 'चेतावनी: आप प्रतिबंधित क्षेत्र ({{zoneName}}) में प्रवेश कर गए हैं। कृपया अपनी सुरक्षा के लिए तुरंत बाहर निकलें।',
      enteredSafeZone: 'आप सुरक्षित क्षेत्र ({{zoneName}}) में प्रवेश कर गए हैं। अपनी यात्रा का आनंद लें!',
      nearEmergencyServices: 'आप आपातकालीन सेवाओं ({{zoneName}}) के पास हैं। यदि आवश्यक हो तो सहायता उपलब्ध है।',
      enteredMonitoredArea: 'आप निगरानी क्षेत्र ({{zoneName}}) में प्रवेश कर गए हैं।',
      
      // Demo Accounts
      demoAccounts: 'डेमो खाते',
      
      // Time
      justNow: 'अभी',
      minutesAgo: '{{count}} मिनट पहले',
      hoursAgo: '{{count}} घंटे पहले',
      daysAgo: '{{count}} दिन पहले',
      
      // Security
      blockchainSecured: 'यह आईडी ब्लॉकचेन तकनीक द्वारा सुरक्षित है और पर्यटन अधिकारियों द्वारा सत्यापित है।',
      locationMonitored: 'सुरक्षा कारणों से आपका स्थान निगरानी में है। आप सेटिंग्स में ट्रैकिंग अक्षम कर सकते हैं।',
      realTimeData: 'क्लस्टरिंग के साथ रीयल-टाइम पर्यटक स्थान। व्यक्तिगत पर्यटकों को देखने के लिए क्लस्टर पर क्लिक करें।',
      heatmapDescription: 'ऐतिहासिक डेटा और वर्तमान स्थितियों के आधार पर उच्च सुरक्षा जोखिम वाले क्षेत्र',
      
      // New Features
      comingSoon: 'जल्द आ रहा है',
      stayTuned: 'रोमांचक अपडेट के लिए तैयार रहें!',
      goBack: 'वापस जाएं',
      addItem: 'आइटम जोड़ें',
      viewOnMap: 'मैप पर देखें',
      yourTripPlan: 'आपकी व्यक्तिगत यात्रा योजना',
      complete: 'पूर्ण',
      safetyMonitoring: 'सुरक्षा निगरानी',
      itineraryMonitoringMessage: 'आपकी यात्रा की सुरक्षा के लिए निगरानी की जाती है। महत्वपूर्ण बदलाव आपके कल्याण को सुनिश्चित करने के लिए अलर्ट ट्रिगर करेंगे।',
      kycVerification: 'केवाईसी सत्यापन',
      aadhaarCard: 'आधार कार्ड',
      passport: 'पासपोर्ट',
      personalInformation: 'व्यक्तिगत जानकारी',
      visitInformation: 'यात्रा जानकारी',
      issueDate: 'जारी करने की तारीख',
      validUntil: 'तक वैध',
      issuePoint: 'जारी करने का स्थान',
      showQR: 'क्यूआर दिखाएं',
      digitalIdQR: 'डिजिटल आईडी क्यूआर कोड',
      qrCodeMessage: 'अधिकारियों द्वारा तुरंत सत्यापन के लिए इस क्यूआर कोड को स्कैन करें',
      tripItinerary: 'यात्रा कार्यक्रम',
      completed: 'पूरा हो गया',
      upcoming: 'आगामी',
      nearbyAreas: 'नजदीकी क्षेत्र और रुचि के बिंदु',
      mapIntegrationDesc: 'रीयल-टाइम लोकेशन ट्रैकिंग, नजदीकी आकर्षण और सुरक्षा क्षेत्रों के साथ इंटरैक्टिव मैप जल्द उपलब्ध होगा।',
      itineraryDesc: 'टाइमलाइन, आकर्षण, बुकिंग और रीयल-टाइम अपडेट के साथ विस्तृत यात्रा कार्यक्रम जल्द उपलब्ध होगा।',
      notifications: 'सूचनाएं',
      updating: 'अपडेट हो रहा है...',
      realTimeLocation: 'रीयल-टाइम लोकेशून मॉनिटरिंग',
      accuracy: 'सटीकता',
      lastUpdate: 'अंतिम अपडेट',
      interactiveMap: 'इंटरैक्टिव मैप',
      mapComingSoon: 'रीयल-टाइम लोकेशन ट्रैकिंग के साथ इन्हांस्ड मैप व्यू जल्द आ रहा है',
      locationNotSupported: 'यह ब्राउज़र जियोलोकेशन का समर्थन नहीं करता।',
      touristId: 'पर्यटक आईडी',
      blockchainId: 'ब्लॉकचेन आईडी',
      viewQRCode: 'क्यूआर कोड देखें',
      emergencyContact: 'आपातकालीन संपर्क',
      nationality: 'राष्ट्रीयता',
      pending: 'लंबित',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;