/**
 * Pet Care Resources Platform - Storage Manager
 * Handles local storage persistence, CRUD operations, and auto-seeding.
 */

const STORAGE_KEYS = {
  PETS: 'petCare_pets',
  VACCINES: 'petCare_vaccines',
  ARTICLES: 'petCare_articles',
  INITIALIZED: 'petCare_initialized_v2'
};

const StorageManager = {
  /**
   * Initializes localStorage with default seed data if not previously initialized.
   */
  init() {
    try {
      const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isInitialized) {
        this.resetToDefaults();
      }
    } catch (e) {
      console.error('LocalStorage initialization error:', e);
    }
  },

  /**
   * Resets all storage back to default SEED data
   */
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(SEED_PETS));
    localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(SEED_VACCINES));
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(SEED_ARTICLES));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },

  /* ---------------- PET PROFILES ---------------- */

  getPets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PETS);
      let list = data ? JSON.parse(data) : [];
      // Ensure every pet has an adorable photoUrl
      list = list.map(pet => {
        if (!pet.photoUrl) {
          pet.photoUrl = (typeof DEFAULT_SPECIES_PHOTOS !== 'undefined' && DEFAULT_SPECIES_PHOTOS[pet.species]) 
            ? DEFAULT_SPECIES_PHOTOS[pet.species] 
            : 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80';
        }
        return pet;
      });
      return list;
    } catch (e) {
      console.error('Error fetching pets:', e);
      return [];
    }
  },

  getPetById(id) {
    const pets = this.getPets();
    return pets.find(p => p.id === id) || null;
  },

  savePet(pet) {
    const pets = this.getPets();
    if (!pet.id) {
      pet.id = 'pet-' + Date.now();
    }
    
    // Auto-calculate age text if DOB provided
    if (pet.dob) {
      pet.ageText = this.calculateAge(pet.dob);
    }

    // Set avatar photo fallback if none provided
    if (!pet.photoUrl) {
      pet.photoUrl = (typeof DEFAULT_SPECIES_PHOTOS !== 'undefined' && DEFAULT_SPECIES_PHOTOS[pet.species]) 
        ? DEFAULT_SPECIES_PHOTOS[pet.species] 
        : 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80';
    }

    // Set avatar stylings based on species
    if (!pet.avatarBg) {
      pet.avatarBg = this.getAvatarBgForSpecies(pet.species);
    }

    pets.unshift(pet);
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
    return pet;
  },

  updatePet(id, updatedFields) {
    const pets = this.getPets();
    const index = pets.findIndex(p => p.id === id);
    if (index !== -1) {
      if (updatedFields.dob) {
        updatedFields.ageText = this.calculateAge(updatedFields.dob);
      }
      pets[index] = { ...pets[index], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));

      // Also update petName across vaccine trackers if name changed
      if (updatedFields.name) {
        this.syncPetNameInVaccines(id, updatedFields.name);
      }
      return pets[index];
    }
    return null;
  },

  deletePet(id) {
    let pets = this.getPets();
    pets = pets.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));

    // Also remove associated vaccine records for clean referential integrity
    let vaccines = this.getVaccines();
    vaccines = vaccines.filter(v => v.petId !== id);
    localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(vaccines));
    return true;
  },

  syncPetNameInVaccines(petId, newName) {
    const vaccines = this.getVaccines();
    let updated = false;
    vaccines.forEach(v => {
      if (v.petId === petId) {
        v.petName = newName;
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(vaccines));
    }
  },

  /* ---------------- VACCINATION & HEALTH TRACKER ---------------- */

  getVaccines() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VACCINES);
      let list = data ? JSON.parse(data) : [];
      // Re-evaluate overdue status dynamically against today's date
      list = list.map(item => this.computeVaccineStatus(item));
      return list;
    } catch (e) {
      console.error('Error fetching vaccines:', e);
      return [];
    }
  },

  computeVaccineStatus(item) {
    // If user explicitly marked it as completed, keep it completed
    if (item.status === 'Completed') {
      return item;
    }

    if (!item.dueDate) {
      return item;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = item.dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    due.setHours(0, 0, 0, 0);

    if (due < today) {
      item.status = 'Overdue';
    } else {
      item.status = 'Upcoming';
    }
    return item;
  },

  saveVaccine(vaccine) {
    const list = this.getVaccines();
    if (!vaccine.id) {
      vaccine.id = 'vac-' + Date.now();
    }
    const evaluated = this.computeVaccineStatus(vaccine);
    list.unshift(evaluated);
    localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(list));
    return evaluated;
  },

  updateVaccine(id, updatedFields) {
    const list = this.getVaccines();
    const index = list.findIndex(v => v.id === id);
    if (index !== -1) {
      let merged = { ...list[index], ...updatedFields };
      merged = this.computeVaccineStatus(merged);
      list[index] = merged;
      localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(list));
      return list[index];
    }
    return null;
  },

  toggleVaccineStatus(id) {
    const list = this.getVaccines();
    const index = list.findIndex(v => v.id === id);
    if (index !== -1) {
      const current = list[index].status;
      if (current === 'Completed') {
        // Toggle back to Upcoming or Overdue
        list[index].status = 'Upcoming';
        list[index] = this.computeVaccineStatus(list[index]);
      } else {
        list[index].status = 'Completed';
        list[index].dateAdministered = new Date().toISOString().split('T')[0];
      }
      localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(list));
      return list[index];
    }
    return null;
  },

  deleteVaccine(id) {
    let list = this.getVaccines();
    list = list.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(list));
    return true;
  },

  /* ---------------- CARE GUIDES & ARTICLES (ADMIN) ---------------- */

  getArticles() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error fetching articles:', e);
      return [];
    }
  },

  saveArticle(article) {
    const list = this.getArticles();
    if (!article.id) {
      article.id = 'art-' + Date.now();
    }
    if (!article.createdAt) {
      article.createdAt = new Date().toISOString().split('T')[0];
    }
    list.unshift(article);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(list));
    return article;
  },

  updateArticle(id, updatedFields) {
    const list = this.getArticles();
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(list));
      return list[index];
    }
    return null;
  },

  deleteArticle(id) {
    let list = this.getArticles();
    list = list.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(list));
    return true;
  },

  approveArticle(id) {
    return this.updateArticle(id, { status: 'Published' });
  },

  /* ---------------- UTILITIES ---------------- */

  calculateAge(dobString) {
    if (!dobString) return '';
    const [y, m, d] = dobString.split('-').map(Number);
    const birthDate = new Date(y, m - 1, d);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) {
      months--;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years < 0) return 'Baby';
    if (years === 0 && months === 0) {
      const diffTime = Math.abs(today - birthDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days old`;
    }
    if (years === 0) {
      return `${months} mo${months > 1 ? 's' : ''} old`;
    }
    if (months === 0) {
      return `${years} yr${years > 1 ? 's' : ''} old`;
    }
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
  },

  getAvatarBgForSpecies(species) {
    const map = {
      Dog: 'bg-amber-100 text-amber-700',
      Cat: 'bg-indigo-100 text-indigo-700',
      Bird: 'bg-emerald-100 text-emerald-700',
      Rabbit: 'bg-rose-100 text-rose-700',
      Other: 'bg-purple-100 text-purple-700'
    };
    return map[species] || 'bg-slate-100 text-slate-700';
  }
};

// Initialize on script load
StorageManager.init();
