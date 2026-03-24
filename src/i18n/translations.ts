export type Lang = "en" | "fr";

const t = {
  // Nav & common
  home: { en: "Home", fr: "Accueil" },
  dashboard: { en: "Dashboard", fr: "Tableau de bord" },
  newScan: { en: "New Scan", fr: "Nouveau Scan" },
  batchScan: { en: "Batch Scan", fr: "Scan par lot" },
  scanHistory: { en: "Scan History", fr: "Historique des scans" },
  designHistory: { en: "Design History", fr: "Historique des designs" },
  pricing: { en: "Pricing", fr: "Tarifs" },
  about: { en: "About", fr: "À propos" },
  signIn: { en: "Sign In", fr: "Se connecter" },
  signOut: { en: "Sign out", fr: "Déconnexion" },
  getStarted: { en: "Get Started", fr: "Commencer" },

  // Scan
  scan: { en: "Scan Design", fr: "Scanner le Design" },
  pass: { en: "Pass", fr: "Réussi" },
  fail: { en: "Fail", fr: "Échec" },
  upload: { en: "Upload", fr: "Téléverser" },
  startScan: { en: "Start Scan", fr: "Lancer le Scan" },
  imageSearch: { en: "Image Search", fr: "Recherche d'image" },
  ocrCheck: { en: "OCR Check", fr: "Vérification OCR" },
  ipCheck: { en: "IP Check", fr: "Vérification PI" },
  accessibility: { en: "Accessibility", fr: "Accessibilité" },
  quality: { en: "Quality", fr: "Qualité" },
  transparency: { en: "Transparency", fr: "Transparence" },
  results: { en: "Results", fr: "Résultats" },

  // Risk levels
  highRisk: { en: "High Risk", fr: "Risque Élevé" },
  mediumRisk: { en: "Medium Risk", fr: "Risque Moyen" },
  lowRisk: { en: "Low Risk", fr: "Risque Faible" },
  safe: { en: "Safe to Use", fr: "Sûr à utiliser" },
  critical: { en: "CRITICAL - Do Not Use", fr: "CRITIQUE - Ne pas utiliser" },
  caution: { en: "Caution - Review Required", fr: "Attention - Révision requise" },

  // Batch scan
  batchScanTitle: { en: "Batch Design Scan", fr: "Scan par lot de designs" },
  batchScanDesc: { en: "Upload multiple designs to validate them at once", fr: "Téléversez plusieurs designs pour les valider en une fois" },
  imagesSelected: { en: "images selected", fr: "images sélectionnées" },
  scanningOf: { en: "Scanning", fr: "Scan en cours" },
  of: { en: "of", fr: "de" },
  exportCSV: { en: "Export All Results", fr: "Exporter tous les résultats" },
  retryFailed: { en: "Retry Failed Scans", fr: "Réessayer les scans échoués" },
  downloadAll: { en: "Download All Reports", fr: "Télécharger tous les rapports" },
  maxImagesWarning: { en: "Maximum 10 images per batch (free tier)", fr: "Maximum 10 images par lot (version gratuite)" },

  // Design history
  designHistoryTitle: { en: "Design History & Trends", fr: "Historique et tendances des designs" },
  avgScoreOverTime: { en: "Average Score Over Time", fr: "Score moyen au fil du temps" },
  passVsFail: { en: "Pass vs Fail", fr: "Réussi vs Échec" },
  commonIssues: { en: "Most Common Issues", fr: "Problèmes les plus fréquents" },
  insights: { en: "Insights", fr: "Aperçus" },
  deleteHistory: { en: "Delete All History", fr: "Supprimer tout l'historique" },
  deleteScan: { en: "Delete Scan", fr: "Supprimer le scan" },
  exportHistory: { en: "Export History as CSV", fr: "Exporter l'historique en CSV" },

  // Dashboard
  welcomeBack: { en: "Welcome back", fr: "Bon retour" },
  totalScans: { en: "Total Scans", fr: "Scans totaux" },
  passRate: { en: "Pass Rate", fr: "Taux de réussite" },
  avgScore: { en: "Avg Score", fr: "Score moyen" },
  lastScan: { en: "Last Scan", fr: "Dernier scan" },
  startNewScan: { en: "Start a New Scan", fr: "Lancer un nouveau scan" },
  recentScans: { en: "Recent Scans", fr: "Scans récents" },
  viewAllHistory: { en: "View All History", fr: "Voir tout l'historique" },

  // Footer
  bill96Badge: { en: "✓ Bill 96 Compliant", fr: "✓ Conforme à la Loi 96" },
  builtInMontreal: { en: "Built in Montréal 🇨🇦", fr: "Développé à Montréal 🇨🇦" },

  // Common
  score: { en: "Score", fr: "Score" },
  status: { en: "Status", fr: "Statut" },
  issues: { en: "Issues", fr: "Problèmes" },
  actions: { en: "Actions", fr: "Actions" },
  imageName: { en: "Image Name", fr: "Nom de l'image" },
  summary: { en: "Summary", fr: "Résumé" },
  filter: { en: "Filter", fr: "Filtrer" },
  search: { en: "Search", fr: "Rechercher" },
  loading: { en: "Loading...", fr: "Chargement..." },
  noData: { en: "No data available", fr: "Aucune donnée disponible" },
  cancel: { en: "Cancel", fr: "Annuler" },
  confirm: { en: "Confirm", fr: "Confirmer" },
  back: { en: "Back", fr: "Retour" },
  next: { en: "Next", fr: "Suivant" },
} as const;

export type TranslationKey = keyof typeof t;
export default t;
