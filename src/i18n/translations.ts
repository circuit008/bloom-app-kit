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

  // Home page
  heroBadge: { en: "POD Compliance Validation Platform", fr: "Plateforme de validation de conformité POD" },
  heroTitle: { en: "Validate Your POD Designs", fr: "Validez vos designs POD" },
  heroTitleHighlight: { en: "Before Selling", fr: "Avant de vendre" },
  heroSubtitle: {
    en: "Scan your print-on-demand designs for IP issues, accessibility problems, quality defects, and listing compliance — all in one place.",
    fr: "Scannez vos designs d'impression à la demande pour des problèmes de PI, d'accessibilité, de qualité et de conformité — tout en un seul endroit.",
  },
  startFreeScan: { en: "Start Free Scan", fr: "Scan gratuit" },
  learnMore: { en: "Learn More", fr: "En savoir plus" },
  noCreditCard: { en: "No credit card required · 5 free scans per month", fr: "Aucune carte de crédit requise · 5 scans gratuits par mois" },
  fourPillars: { en: "Four pillars of", fr: "Les quatre piliers de la" },
  compliance: { en: "compliance", fr: "conformité" },
  fourPillarsDesc: {
    en: "Comprehensive validation covering every aspect of POD design compliance.",
    fr: "Validation complète couvrant tous les aspects de la conformité des designs POD.",
  },
  readyToProtect: { en: "Ready to protect your business?", fr: "Prêt à protéger votre entreprise ?" },
  joinSellers: {
    en: "Join thousands of POD sellers who validate their designs before listing.",
    fr: "Rejoignez des milliers de vendeurs POD qui valident leurs designs avant la mise en ligne.",
  },

  // Feature cards
  featureIPTitle: { en: "IP Check", fr: "Vérification PI" },
  featureIPDesc: {
    en: "Detect potential intellectual property conflicts including trademarks, copyrighted characters, and brand logos before listing.",
    fr: "Détectez les conflits potentiels de propriété intellectuelle, y compris les marques déposées, les personnages protégés et les logos de marques.",
  },
  featureAccessTitle: { en: "Accessibility", fr: "Accessibilité" },
  featureAccessDesc: {
    en: "Validate color contrast ratios, readability, and visual accessibility to ensure your designs reach every customer.",
    fr: "Validez les ratios de contraste, la lisibilité et l'accessibilité visuelle pour que vos designs atteignent chaque client.",
  },
  featureQualityTitle: { en: "Quality", fr: "Qualité" },
  featureQualityDesc: {
    en: "Check resolution, DPI requirements, bleed areas, and print-readiness to avoid costly reprints and returns.",
    fr: "Vérifiez la résolution, les exigences DPI, les zones de fond perdu et la préparation à l'impression.",
  },
  featureTransTitle: { en: "Transparency", fr: "Transparence" },
  featureTransDesc: {
    en: "Ensure listing compliance with platform guidelines, accurate descriptions, and proper content disclosures.",
    fr: "Assurez la conformité avec les directives des plateformes, les descriptions précises et les divulgations appropriées.",
  },

  // Scan page
  newDesignScan: { en: "New Design Scan", fr: "Nouveau scan de design" },
  uploadDesignDesc: { en: "Upload your design and check for compliance issues", fr: "Téléversez votre design et vérifiez les problèmes de conformité" },
  step1Title: { en: "Step 1: Upload Design & Keywords", fr: "Étape 1 : Téléverser le design et mots-clés" },
  scanConfirmLabel: {
    en: "I confirm that I have the right to scan this design and understand that results are informational only, not legal advice.",
    fr: "Je confirme avoir le droit de scanner ce design et comprends que les résultats sont informatifs uniquement, pas un avis juridique.",
  },
  seeTerms: { en: "See our Terms", fr: "Voir nos Conditions" },
  runningIPCheck: { en: "Running IP Copyright Check...", fr: "Vérification PI en cours..." },
  comparingKeywords: { en: "Comparing keywords against trademark database", fr: "Comparaison des mots-clés avec la base de données de marques" },
  continueAccessibility: { en: "Continue to Accessibility Check", fr: "Continuer vers la vérification d'accessibilité" },

  // Pricing page
  pricingTitle: { en: "Simple, transparent pricing", fr: "Tarification simple et transparente" },
  pricingSubtitle: {
    en: "Choose the plan that fits your needs. Upgrade or downgrade anytime.",
    fr: "Choisissez le plan qui correspond à vos besoins. Changez à tout moment.",
  },
  free: { en: "Free", fr: "Gratuit" },
  pro: { en: "Pro", fr: "Pro" },
  business: { en: "Business", fr: "Entreprise" },
  forever: { en: "forever", fr: "pour toujours" },
  perMonth: { en: "per month", fr: "par mois" },
  currentPlan: { en: "Current Plan", fr: "Plan actuel" },
  mostPopular: { en: "Most Popular", fr: "Le plus populaire" },
  upgradeToPro: { en: "Upgrade to Pro", fr: "Passer au Pro" },
  contactSales: { en: "Contact Sales", fr: "Contacter les ventes" },
  moneyBack: { en: "All plans include a 14-day money-back guarantee.", fr: "Tous les plans incluent une garantie de remboursement de 14 jours." },
  privacyPolicy: { en: "Privacy Policy", fr: "Politique de confidentialité" },
  termsOfService: { en: "Terms of Service", fr: "Conditions d'utilisation" },

  // Pricing features
  freeDesc: { en: "Perfect for getting started", fr: "Idéal pour commencer" },
  proDesc: { en: "For serious POD sellers", fr: "Pour les vendeurs POD sérieux" },
  businessDesc: { en: "For teams and agencies", fr: "Pour les équipes et agences" },
  feat5Scans: { en: "5 scans per month", fr: "5 scans par mois" },
  featBasicIP: { en: "Basic IP check", fr: "Vérification PI basique" },
  featQualityVal: { en: "Quality validation", fr: "Validation de qualité" },
  featAccessAudit: { en: "Accessibility audit", fr: "Audit d'accessibilité" },
  featEmailSupport: { en: "Email support", fr: "Support par e-mail" },
  featUnlimitedScans: { en: "Unlimited scans", fr: "Scans illimités" },
  featFull4Step: { en: "Full 4-step compliance", fr: "Conformité complète en 4 étapes" },
  featPDFReports: { en: "PDF compliance reports", fr: "Rapports de conformité PDF" },
  featPrioritySupport: { en: "Priority support", fr: "Support prioritaire" },
  featScanHistory: { en: "Scan history & analytics", fr: "Historique des scans et analytiques" },
  featSupplyChain: { en: "Supply chain transparency", fr: "Transparence de la chaîne d'approvisionnement" },
  featAffiliateTracking: { en: "Affiliate earnings tracking", fr: "Suivi des revenus d'affiliation" },
  featEverythingPro: { en: "Everything in Pro", fr: "Tout dans Pro" },
  featTeamCollab: { en: "Team collaboration", fr: "Collaboration d'équipe" },
  featBulkScan: { en: "Bulk scanning", fr: "Scan en masse" },
  featCustomRules: { en: "Custom trademark rules", fr: "Règles de marques personnalisées" },
  featDedicatedManager: { en: "Dedicated account manager", fr: "Gestionnaire de compte dédié" },
  featSSO: { en: "SSO & advanced security", fr: "SSO et sécurité avancée" },
  featAPI: { en: "API access", fr: "Accès API" },

  // Scan history
  scanHistoryTitle: { en: "Scan History", fr: "Historique des scans" },
  scanHistoryDesc: { en: "Review your past design compliance scans.", fr: "Consultez vos anciens scans de conformité." },
  searchByKeyword: { en: "Search by keyword...", fr: "Rechercher par mot-clé..." },
  noScansYet: { en: "No scans yet", fr: "Aucun scan encore" },
  noMatchingScans: { en: "No matching scans", fr: "Aucun scan correspondant" },
  firstScanDesc: {
    en: "Once you run your first design scan, it will appear here with a full compliance report.",
    fr: "Une fois votre premier scan effectué, il apparaîtra ici avec un rapport de conformité complet.",
  },
  tryDifferentSearch: { en: "Try a different search term.", fr: "Essayez un autre terme de recherche." },
  startFirstScan: { en: "Start Your First Scan", fr: "Lancez votre premier scan" },
  designScan: { en: "Design Scan", fr: "Scan de design" },

  // Final results
  finalResults: { en: "Final Compliance Results", fr: "Résultats de conformité finaux" },
  copyrightCheck: { en: "Copyright Check (Combined)", fr: "Vérification de droits d'auteur (combinée)" },
  copyrightRiskDetected: {
    en: "Copyright risk detected. This design may infringe existing artwork.",
    fr: "Risque de droits d'auteur détecté. Ce design pourrait enfreindre des œuvres existantes.",
  },
  scoreCappedCopyright: { en: "Score Capped — Copyright Risk", fr: "Score plafonné — Risque de droits d'auteur" },
  copyrightGatekeeper: {
    en: "Copyright Check (50%) is the gatekeeper — any copyright risk caps the overall score",
    fr: "La vérification de droits d'auteur (50%) est le gardien — tout risque plafonne le score global",
  },
  resultsSaved: { en: "Results saved to your account", fr: "Résultats sauvegardés dans votre compte" },
  shareResults: { en: "Share Results", fr: "Partager les résultats" },
  exportPDF: { en: "Export PDF", fr: "Exporter en PDF" },
  print: { en: "Print", fr: "Imprimer" },
  readyToPrint: { en: "Your design passed! Ready to print?", fr: "Votre design est validé ! Prêt à imprimer ?" },
  compareProviders: {
    en: "Compare print-on-demand providers and start selling your validated design.",
    fr: "Comparez les fournisseurs d'impression à la demande et commencez à vendre votre design validé.",
  },
  sortByPrice: { en: "Sort by Price", fr: "Trier par prix" },
  sortByEco: { en: "Sort by Eco-Score", fr: "Trier par éco-score" },
  provider: { en: "Provider", fr: "Fournisseur" },
  price: { en: "Price", fr: "Prix" },
  shipping: { en: "Shipping", fr: "Livraison" },
  ecoScore: { en: "Eco-Score", fr: "Éco-score" },
  action: { en: "Action", fr: "Action" },
  orderNow: { en: "Order Now", fr: "Commander" },
  affiliateDisclaimer: {
    en: "We may earn commission from partner links. Prices and availability subject to change.",
    fr: "Nous pouvons recevoir une commission des liens partenaires. Prix et disponibilité sujets à changement.",
  },
  fixIssues: { en: "Fix These Issues", fr: "Corriger ces problèmes" },
  scanAnother: { en: "Scan Another Design", fr: "Scanner un autre design" },
  allChecksPassed: { en: "All checks passed", fr: "Toutes les vérifications réussies" },
  someChecksFailed: { en: "Some checks need improvement", fr: "Certaines vérifications nécessitent des améliorations" },
} as const;

export type TranslationKey = keyof typeof t;
export default t;
