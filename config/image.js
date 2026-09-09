module.exports = {
  // Company Logos (Wikimedia Commons - Free)
  companyLogos: {
    apple: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    microsoft: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    google: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    amazon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    meta: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    ibm: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
    samsung: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Samsung_Global_Logo_Lettermark.svg',
    tesla: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Tesla_T_symbol.svg',
    intel: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Intel_logo_2023.svg',
    oracle: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
    sony: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
    tata: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg',
    infosys: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Infosys_Technologies_logo.svg',
    sap: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/SAP_Logo_2014.svg',
    nestle: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Nestl%C3%A9_textlogo.svg',
    cocaCola: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Coca-Cola_bottle_cap.svg',
    mcdonalds: 'https://upload.wikimedia.org/wikipedia/commons/0/05/McDonald%27s_square_2020.svg',
    unilever: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Unilever_text_logo.svg',
    honda: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Logo_Honda_F1.svg',
    accenture: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Accenture_logo.svg'
  },

  // Hero Images (Unsplash - Free)
  hero: {
    main: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1920&q=80',
    jobSearch: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
    teamWork: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'
  },

  // Category Images (Unsplash - Free)
  categories: {
    softwareDev: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
    design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    dataAnalytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    marketing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    finance: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    engineering: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'
  },

  // Job/Career Images (Unsplash - Free)
  jobs: {
    interview: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    meeting: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    coding: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    workspace: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80'
  },

  // Placeholder Images
  placeholders: {
    avatar: 'https://placehold.co/200x200?text=Avatar',
    companyLogo: 'https://placehold.co/100x100?text=Company',
    noImage: 'https://placehold.co/600x400?text=No+Image',
    jobImage: 'https://placehold.co/400x300?text=Job+Opening'
  },

  // Helper function to get company logo
  getCompanyLogo: function(companyName) {
    const key = companyName.toLowerCase().replace(/\s+/g, '');
    return this.companyLogos[key] || this.placeholders.companyLogo;
  },

  // Helper function to get category image
  getCategoryImage: function(category) {
    const key = category.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
    return this.categories[key] || this.placeholders.jobImage;
  },

  // Clearbit Logo API fallback
  getClearbitLogo: function(domain) {
    return `https://logo.clearbit.com/${domain}`;
  }
};
