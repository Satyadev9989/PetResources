/**
 * Pet Care Resources Platform - Initial Seed Data
 * Provides rich, realistic default data for Articles, Pet Profiles, and Vaccine Trackers.
 */

const SEED_ARTICLES = [
  {
    id: "art-1",
    title: "Puppy Vaccination Schedules: 6 to 16 Weeks Roadmap",
    slug: "puppy-vaccination-schedules",
    category: "Dog Care",
    species: "Dog",
    author: {
      name: "Dr. Sarah Jenkins, DVM",
      role: "Veterinary Surgeon",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80"
    },
    readTime: "5 min read",
    difficulty: "Essential",
    featured: true,
    status: "Published",
    createdAt: "2026-09-15",
    summary: "A comprehensive timeline of core vaccines (DHPP, Rabies) and non-core boosters required during your puppy's critical developmental phase.",
    content: `
      <p class="mb-4 text-slate-700 leading-relaxed">Vaccines are one of the most cost-effective and dependable medical interventions available in veterinary medicine. During the first few months of life, maternal antibodies naturally protect puppies, but as these fade, artificial immunization becomes critical.</p>
      
      <h4 class="text-lg font-bold text-slate-800 mb-2 mt-4">Core Vaccination Timeline</h4>
      <div class="overflow-x-auto my-3">
        <table class="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg">
          <thead class="bg-indigo-50/70 text-indigo-900 font-semibold border-b">
            <tr>
              <th class="p-3">Age Window</th>
              <th class="p-3">Core Vaccines</th>
              <th class="p-3">Optional / Non-Core</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="p-3 font-medium text-slate-800">6 - 8 Weeks</td>
              <td class="p-3">DHPP (Distemper, Parvovirus, Adenovirus, Parainfluenza)</td>
              <td class="p-3">Bordetella (Kennel Cough)</td>
            </tr>
            <tr class="bg-slate-50/50">
              <td class="p-3 font-medium text-slate-800">10 - 12 Weeks</td>
              <td class="p-3">DHPP Booster #1</td>
              <td class="p-3">Leptospirosis, Lyme Disease</td>
            </tr>
            <tr>
              <td class="p-3 font-medium text-slate-800">14 - 16 Weeks</td>
              <td class="p-3">DHPP Booster #2 + Rabies (1-Year)</td>
              <td class="p-3">Canine Influenza</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 class="text-lg font-bold text-slate-800 mb-2 mt-4">Post-Vaccine Monitoring</h4>
      <p class="mb-4 text-slate-700 leading-relaxed">Mild lethargy, temporary tenderness at injection sites, and a slight low-grade fever are common for 24 hours. Seek immediate veterinary assistance if you notice facial swelling, severe hives, or repeated vomiting.</p>

      <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-4">
        <h5 class="font-bold text-amber-900 mb-1 flex items-center gap-2"><i class="fa-solid fa-triangle-exclamation text-amber-600"></i> Critical Vet Warning</h5>
        <p class="text-amber-800 text-sm">Do not allow puppies to walk in high-traffic public canine parks or pet store floors until at least 7 to 10 days after their final 16-week vaccination booster!</p>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    tags: ["Vaccines", "Puppy", "Preventative Health"]
  },
  {
    id: "art-2",
    title: "Indoor Cat Enrichment: 7 Ways to Prevent Boredom & Stress",
    slug: "indoor-cat-enrichment",
    category: "Cat Care",
    species: "Cat",
    author: {
      name: "Marcus Vance",
      role: "Feline Behavior Specialist",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    readTime: "4 min read",
    difficulty: "Beginner",
    featured: true,
    status: "Published",
    createdAt: "2026-09-18",
    summary: "Transform your home into an interactive feline paradise with vertical territory, puzzle feeders, and hunting play routines.",
    content: `
      <p class="mb-4 text-slate-700 leading-relaxed">While indoor cats live significantly longer and safer lives than outdoor felines, a sedentary and unstimulating domestic environment can lead to chronic stress, obesity, and behavioral disorders like over-grooming or litter avoidance.</p>
      
      <h4 class="text-lg font-bold text-slate-800 mb-2 mt-4">The 7 Pillars of Feline Enrichment</h4>
      <ul class="space-y-3 mb-4 text-slate-700">
        <li class="flex items-start gap-2">
          <i class="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
          <span><strong>Vertical Territory:</strong> Install wall cat shelves and multi-tiered scratch trees. Cats feel safest when observing their territory from elevated vantage points.</span>
        </li>
        <li class="flex items-start gap-2">
          <i class="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
          <span><strong>The Predatory Play Sequence:</strong> Engage your cat in 10-15 minute wand toy sessions (stalk -> chase -> pounce -> catch -> eat). Always finish with a protein treat!</span>
        </li>
        <li class="flex items-start gap-2">
          <i class="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
          <span><strong>Puzzle Feeders:</strong> Ditch traditional food bowls. Foraging toys simulate natural hunting instinct and slow down digestion.</span>
        </li>
        <li class="flex items-start gap-2">
          <i class="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
          <span><strong>Window Perches & "Cat TV":</strong> Position a perch facing bird feeders or rustling garden greenery for optical stimulation.</span>
        </li>
        <li class="flex items-start gap-2">
          <i class="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
          <span><strong>Sensory Scents:</strong> Offer organic catnip, silver vine, or cat-safe wheatgrass boxes.</span>
        </li>
      </ul>
    `,
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    tags: ["Enrichment", "Behavior", "Indoor Cats"]
  },
  {
    id: "art-3",
    title: "Toxic Foods Alert: 12 Common Kitchen Items Fatal to Dogs & Cats",
    slug: "toxic-foods-dogs-cats",
    category: "Nutrition",
    species: "All Pets",
    author: {
      name: "Dr. Elena Rostova",
      role: "Veterinary Toxicologist",
      avatar: "https://images.unsplash.com/photo-1594824813589-4b68e98f79f2?auto=format&fit=crop&w=150&q=80"
    },
    readTime: "6 min read",
    difficulty: "Crucial",
    featured: true,
    status: "Published",
    createdAt: "2026-09-22",
    summary: "From onions and xylitol to macadamia nuts and raisins, learn which household staples trigger toxic reactions and emergency antidote steps.",
    content: `
      <p class="mb-4 text-slate-700 leading-relaxed">Human culinary favorites are frequently lethal to companion animals due to distinct metabolic enzyme pathways. Keep this checklist handy on your kitchen refrigerator.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div class="bg-rose-50 border border-rose-200 p-4 rounded-xl">
          <h5 class="font-bold text-rose-900 flex items-center gap-2 mb-2"><i class="fa-solid fa-skull-crossbones text-rose-600"></i> Extreme Threat (Immediate ER)</h5>
          <ul class="text-sm text-rose-800 space-y-1.5 list-disc list-inside">
            <li><strong>Xylitol (Birch Sugar):</strong> In chewing gum, peanut butter. Induces fatal hypoglycemia & liver failure.</li>
            <li><strong>Grapes & Raisins:</strong> Triggers acute renal failure in dogs.</li>
            <li><strong>Lilies (Any Species):</strong> 100% fatal to cats even from pollen grooming.</li>
            <li><strong>Dark Chocolate & Cocoa:</strong> High theobromine causes tachyarrhythmia & seizures.</li>
          </ul>
        </div>
        <div class="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <h5 class="font-bold text-amber-900 flex items-center gap-2 mb-2"><i class="fa-solid fa-circle-exclamation text-amber-600"></i> Moderate to Severe Hazards</h5>
          <ul class="text-sm text-amber-800 space-y-1.5 list-disc list-inside">
            <li><strong>Onions, Garlic, Chives:</strong> Destroys red blood cells causing hemolytic anemia.</li>
            <li><strong>Macadamia Nuts:</strong> Causes hind limb weakness, tremor, hyperthermia.</li>
            <li><strong>Caffeine:</strong> Coffee grounds, soda, energy drinks.</li>
            <li><strong>Yeast Dough:</strong> Expands in stomach & releases toxic alcohol.</li>
          </ul>
        </div>
      </div>

      <div class="bg-indigo-50 border border-indigo-200 p-4 rounded-xl mt-4">
        <h5 class="font-bold text-indigo-900 mb-1">Emergency Action Protocol</h5>
        <p class="text-indigo-800 text-sm">Do NOT induce vomiting with hydrogen peroxide unless specifically directed by an animal poison control center or your veterinarian, as caustic substances can severely burn the esophagus.</p>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
    tags: ["Toxicology", "Emergency", "Nutrition Safety"]
  },
  {
    id: "art-4",
    title: "Stress-Free Grooming: Gentle Nail Trimming & Coat Maintenance",
    slug: "stress-free-grooming-nails",
    category: "Grooming",
    species: "All Pets",
    author: {
      name: "Chloe Bennett",
      role: "Certified Master Groomer",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"
    },
    readTime: "4 min read",
    difficulty: "Practical",
    featured: false,
    status: "Published",
    createdAt: "2026-09-25",
    summary: "Step-by-step cooperative care conditioning so your pet tolerates clippers, deshedding rakes, and ear cleanings without fear.",
    content: `
      <p class="mb-4 text-slate-700 leading-relaxed">Grooming should not be a wrestling match. When pets experience trauma during grooming, future procedures require sedation or restraint. By implementing cooperative care, pets learn to voluntarily offer paws and tolerate clippers.</p>
      
      <h4 class="text-lg font-bold text-slate-800 mb-2 mt-4">Desensitization in 4 Stages</h4>
      <ol class="list-decimal list-inside space-y-2 text-slate-700 mb-4">
        <li><strong>Tool Introduction:</strong> Place nail clippers or grinders next to high-value treats without touching the pet.</li>
        <li><strong>Tactile Conditioning:</strong> Gently touch paw pads with your fingers, followed immediately by rewards.</li>
        <li><strong>Sound Association:</strong> Run motorized grinders across the room while feeding lickable purée or peanut butter.</li>
        <li><strong>Micro-Trims:</strong> Clip just 1 millimeter of one nail per session, praising calmly.</li>
      </ol>

      <div class="bg-slate-100 p-4 rounded-xl border border-slate-200">
        <span class="font-bold text-slate-800">Pro-Tip for Bleeding Nails:</span>
        <p class="text-sm text-slate-600 mt-1">Always keep styptic powder (or cornstarch in a pinch) on hand. If you accidentally cut the quick, press powder firmly onto the nail tip for 30 seconds.</p>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80",
    tags: ["Grooming", "Nail Trim", "Cooperative Care"]
  },
  {
    id: "art-5",
    title: "Raw vs. Kibble: Demystifying Canine Diet Formulation",
    slug: "raw-vs-kibble-canine-diet",
    category: "Nutrition",
    species: "Dog",
    author: {
      name: "Dr. Sarah Jenkins, DVM",
      role: "Veterinary Surgeon",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80"
    },
    readTime: "7 min read",
    difficulty: "Advanced",
    featured: false,
    status: "Published",
    createdAt: "2026-09-28",
    summary: "Objective veterinary breakdown of pathogen safety, nutritional completeness, bioavailability, and budget comparisons.",
    content: `
      <p class="mb-4 text-slate-700 leading-relaxed">Pet nutritional debates often spark fierce arguments among pet parents. Veterinary nutritionists emphasize that whether feeding commercial extruded kibble, gently cooked recipes, or raw diets, the non-negotiable metric is balanced nutrient completeness meeting AAFCO/FEDIAF standards.</p>
      
      <h4 class="text-lg font-bold text-slate-800 mb-2 mt-4">Kibble Advantages vs Concerns</h4>
      <p class="mb-2 text-slate-700">Premium kibbles undergo extensive feeding trials and formulation checks. They are convenient, shelf-stable, and economically accessible. However, high-temperature extrusion can diminish delicate micronutrients, making hydration management essential.</p>

      <h4 class="text-lg font-bold text-slate-800 mb-2 mt-4">Raw Diets: What to Know</h4>
      <p class="mb-4 text-slate-700">Raw feeding requires strict sanitation due to potential Salmonella and Listeria pathogens that can also affect human handlers. Furthermore, homemade raw recipes frequently lack adequate calcium-to-phosphorus ratios unless formulated under a board-certified veterinary nutritionist (DACVIM).</p>
    `,
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80",
    tags: ["Nutrition", "Kibble", "Diet"]
  },
  {
    id: "art-6",
    title: "Senior Pet Comfort: Managing Canine & Feline Arthritis",
    slug: "senior-pet-comfort-arthritis",
    category: "Dog Care",
    species: "All Pets",
    author: {
      name: "Dr. Elena Rostova",
      role: "Veterinary Toxicologist",
      avatar: "https://images.unsplash.com/photo-1594824813589-4b68e98f79f2?auto=format&fit=crop&w=150&q=80"
    },
    readTime: "5 min read",
    difficulty: "Essential",
    featured: false,
    status: "Published",
    createdAt: "2026-10-01",
    summary: "Recognize subtle stiffness symptoms in aging pets and discover environmental modifications (ramps, orthopedic beds) and multimodal pain treatments.",
    content: `
      <p class="mb-4 text-slate-700 leading-relaxed">Over 80% of dogs over age 8 and 90% of cats over age 12 suffer from degenerative joint disease (osteoarthritis). Because pets instinctively conceal discomfort, pet parents frequently confuse pain with 'just slowing down due to old age'.</p>
      
      <h4 class="text-lg font-bold text-slate-800 mb-2">Home Environment Upgrades</h4>
      <ul class="list-disc list-inside space-y-2 text-slate-700 mb-4">
        <li>Provide memory foam orthopedic pet beds with supportive bolster edges.</li>
        <li>Place non-slip runners or yoga mats over slippery hardwood and tile flooring.</li>
        <li>Elevate food and water bowls to chest height to decrease neck strain.</li>
        <li>Install gentle pet ramps alongside car trunks and bedroom furniture.</li>
      </ul>
    `,
    image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80",
    tags: ["Senior Pets", "Arthritis", "Wellness"]
  },
  {
    id: "art-7",
    title: "Feline Dental Health: Preventing Painful Stomatitis & Tartar",
    slug: "feline-dental-health",
    category: "Cat Care",
    species: "Cat",
    author: {
      name: "Marcus Vance",
      role: "Feline Behavior Specialist",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    readTime: "4 min read",
    difficulty: "Practical",
    featured: false,
    status: "Pending Review",
    createdAt: "2026-10-04",
    summary: "Community guide on introducing enzyme-based toothpastes, dental diets, and recognizing bad breath as an early infection warning.",
    content: `
      <p class="mb-4 text-slate-700 leading-relaxed">Dental disease is the most under-diagnosed clinical condition in domestic felines. Bacteria beneath the gumline can enter the bloodstream and damage kidneys and heart valves.</p>
    `,
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80",
    tags: ["Dental", "Cats", "Hygiene"]
  }
];

const DEFAULT_SPECIES_PHOTOS = {
  Dog: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80",
  Cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80",
  Rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80",
  Bird: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=400&q=80",
  Other: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80"
};

const CUTE_PET_PRESETS = [
  {
    id: "preset-1",
    name: "Golden Retriever Puppy",
    species: "Dog",
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "preset-2",
    name: "Smiling Corgi",
    species: "Dog",
    url: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "preset-3",
    name: "French Bulldog Puppy",
    species: "Dog",
    url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "preset-4",
    name: "Fluffy Poodle / Doodle",
    species: "Dog",
    url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "preset-5",
    name: "Playful Husky Pup",
    species: "Dog",
    url: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "preset-6",
    name: "Curious Ginger Tabby",
    species: "Cat",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "preset-7",
    name: "Blue-Eyed Ragdoll",
    species: "Cat",
    url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "preset-8",
    name: "Adorable Calico Kitten",
    species: "Cat",
    url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "preset-9",
    name: "Fluffy White Bunny",
    species: "Rabbit",
    url: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "preset-10",
    name: "Colorful Parrot / Bird",
    species: "Bird",
    url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=400&q=80"
  }
];

const SEED_PETS = [
  {
    id: "pet-1",
    name: "Luna",
    species: "Dog",
    breed: "Golden Retriever",
    dob: "2023-04-12",
    ageText: "3 yrs 5 mos",
    weight: 29.5,
    weightUnit: "kg",
    gender: "Female",
    neutered: true,
    microchip: "985-1410-092-411",
    color: "#EAB308", // amber/gold
    photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80",
    avatarBg: "bg-amber-50 text-amber-700",
    notes: "Friendly, loves swimming and retrieving tennis balls. Sensitive to chicken proteins."
  },
  {
    id: "pet-2",
    name: "Milo",
    species: "Cat",
    breed: "Domestic Shorthair",
    dob: "2024-02-18",
    ageText: "2 yrs 8 mos",
    weight: 4.8,
    weightUnit: "kg",
    gender: "Male",
    neutered: true,
    microchip: "985-2311-802-993",
    color: "#6366F1", // indigo
    photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80",
    avatarBg: "bg-indigo-50 text-indigo-700",
    notes: "Loves high perches and feather teasers. Indoor only."
  },
  {
    id: "pet-3",
    name: "Barnaby",
    species: "Dog",
    breed: "French Bulldog",
    dob: "2025-01-10",
    ageText: "1 yr 8 mos",
    weight: 12.2,
    weightUnit: "kg",
    gender: "Male",
    neutered: false,
    microchip: "985-7740-331-508",
    color: "#F97316", // orange
    photoUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80",
    avatarBg: "bg-orange-50 text-orange-700",
    notes: "Brachycephalic care required. Avoid hot weather walks."
  },
  {
    id: "pet-4",
    name: "Cleo",
    species: "Cat",
    breed: "Ragdoll",
    dob: "2024-11-05",
    ageText: "1 yr 11 mos",
    weight: 5.1,
    weightUnit: "kg",
    gender: "Female",
    neutered: true,
    microchip: "985-6112-901-447",
    color: "#3B82F6", // blue
    photoUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80",
    avatarBg: "bg-blue-50 text-blue-700",
    notes: "Very docile, requires weekly de-shedding brushing."
  }
];

const SEED_VACCINES = [
  {
    id: "vac-1",
    petId: "pet-1",
    petName: "Luna",
    vaccineName: "Rabies 3-Year Booster",
    dueDate: "2026-11-20",
    dateAdministered: "2023-11-20",
    status: "Upcoming",
    clinic: "Paws & Whiskers Animal Hospital",
    veterinarian: "Dr. Sarah Jenkins",
    notes: "Mandatory state license renewal requires updated certificate."
  },
  {
    id: "vac-2",
    petId: "pet-1",
    petName: "Luna",
    vaccineName: "DHPP (Distemper, Parvo)",
    dueDate: "2026-08-15",
    dateAdministered: "2025-08-15",
    status: "Overdue",
    clinic: "Oakwood Veterinary Clinic",
    veterinarian: "Dr. Thomas Miller",
    notes: "Core booster overdue by ~2 months. Scheduled for next weekend."
  },
  {
    id: "vac-3",
    petId: "pet-2",
    petName: "Milo",
    vaccineName: "FVRCP (Feline Viral Rhinotracheitis)",
    dueDate: "2026-10-15",
    dateAdministered: "2025-10-15",
    status: "Upcoming",
    clinic: "City Cat Specialty Clinic",
    veterinarian: "Dr. Elena Rostova",
    notes: "Annual 3-in-1 feline vaccine due this month."
  },
  {
    id: "vac-4",
    petId: "pet-2",
    petName: "Milo",
    vaccineName: "Rabies (PureVax Feline)",
    dueDate: "2026-05-10",
    dateAdministered: "2026-05-10",
    status: "Completed",
    clinic: "City Cat Specialty Clinic",
    veterinarian: "Dr. Elena Rostova",
    notes: "Non-adjuvanted vaccine administered right rear limb."
  },
  {
    id: "vac-5",
    petId: "pet-3",
    petName: "Barnaby",
    vaccineName: "Bordetella (Kennel Cough)",
    dueDate: "2026-12-05",
    dateAdministered: "2025-12-05",
    status: "Upcoming",
    clinic: "Happy Tails Vet Care",
    veterinarian: "Dr. Arthur Bell",
    notes: "Required before boarding for holiday travel."
  },
  {
    id: "vac-6",
    petId: "pet-4",
    petName: "Cleo",
    vaccineName: "Feline Leukemia (FeLV)",
    dueDate: "2026-06-30",
    dateAdministered: "2026-06-30",
    status: "Completed",
    clinic: "Paws & Whiskers Animal Hospital",
    veterinarian: "Dr. Sarah Jenkins",
    notes: "Routine negative titer confirmed before administration."
  }
];

const COMMON_VACCINES = {
  Dog: [
    "DHPP (Distemper, Parvo, Adenovirus)",
    "Rabies (1-Year)",
    "Rabies (3-Year Booster)",
    "Bordetella (Kennel Cough)",
    "Leptospirosis",
    "Lyme Disease",
    "Canine Influenza (H3N2/H3N8)",
    "Rattlesnake Vaccine"
  ],
  Cat: [
    "FVRCP (Feline Distemper & Upper Resp)",
    "Rabies (PureVax 1-Year)",
    "Rabies (3-Year)",
    "Feline Leukemia (FeLV)",
    "FIV (Feline Immunodeficiency)",
    "Chlamydia Felis"
  ],
  Other: [
    "Rabbit Hemorrhagic Disease (RHDV2)",
    "Myxomatosis",
    "Ferret Distemper",
    "General Wellness Booster"
  ]
};
