/*
================================================================
DAMIKUS WEB - PREMIUM INTERACTIVE APPLICATION ENGINE
================================================================
Architecture: Modular JSON loaders, HTML Sanitizers, 60FPS Canvas
Special Features: 3D Tilt, Custom Cursor, Music Player & Visualizer,
                  AI Chatbot, VCF Download, PWA Integration, Easter Eggs
================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
  
  // --------------------------------------------------
  // 1. DATA STATE & CORE INITIALIZATION
  // --------------------------------------------------
  const state = {
    profile: null,
    socials: null,
    projects: null,
    timeline: null,
    music: null,
    certificates: null,
    skills: null,
    chatbot: null,
    gallery: null,
    activeTrackIndex: 0,
    isPlaying: false,
    theme: 'purple',
    isDarkMode: true,
    visitCount: 0,
    sessionSeconds: 0,
    musicTimer: null,
    audioContext: null,
    audioAnalyser: null,
    audioSource: null,
    simulatedAudioInterval: null,
    logoClicks: 0
  };

  // Helper: DOM Safe Text Sanitizer (prevents XSS)
  function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(match) {
      switch (match) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return match;
      }
    });
  }

  // Helper: Fetch JSON with graceful fallback
  async function fetchJSON(url, fallbackData) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (e) {
      console.warn(`Failed to load ${url}, using premium placeholder values.`, e);
      return fallbackData;
    }
  }

  // Initialize and load all JSON data sources in parallel
  async function loadAllData() {
    
    // Define fallbacks in case file retrieval fails
    const profileFallback = {
      personal: {
        name: "Damikus",
        avatar: "",
        profession: "Ingeniero Civil & Project Manager",
        professionsList: ["Ingeniero Civil", "Calculista Estructural", "Gestor de Obras"],
        bio: "Apasionado por el diseño estructural, la planificación de obras y la gestión de proyectos de infraestructura viales e hidráulicas.",
        age: 27,
        birthday: "25 de Noviembre",
        location: "Madrid, España",
        latitude: 40.4167,
        longitude: -3.7037,
        timezone: "Europe/Madrid",
        status: { text: "Revisando planos de obra", type: "online", dot: "online" },
        stats: { daysSinceStart: 2190, yearsCoding: 6, clients: 38, followers: "8K", coffees: 1500 }
      },
      universo: { movie: "Megaestructuras", series: "How It's Made", anime: "Dr. Stone", game: "SimCity / Cities: Skylines", food: "Parrillada", drink: "Café", color: "Azul Eléctrico & Gris Cemento", quote: "Construimos espacios para vivir historias.", emoji: "🏗️", birthdayText: "25 Nov" }
    };
    
    const socialsFallback = [
      { name: "Instagram", url: "#", username: "@damikus.ing", followers: "4K", icon: "instagram", color: "#E1306C" },
      { name: "Facebook", url: "#", username: "Damikus Civil", followers: "3K", icon: "facebook", color: "#1877F2" }
    ];

    const projectsFallback = [
      { title: "Puente Atirantado San Martín", description: "Modelado BIM y cálculo estructural del puente urbano.", tags: ["Revit", "SAP2000", "BIM"], github: "#", demo: "#" }
    ];

    const timelineFallback = [
      { year: "2023", title: "Ingeniero Calculista Junior", description: "Graduación y colegiatura profesional." }
    ];

    const musicFallback = [
      { title: "Ambient Beats", artist: "Lofi Obras", src: "", cover: "", lyrics: [{ time: 0, text: "Música para concentrarse en la obra" }] }
    ];

    const certificatesFallback = [
      { title: "BIM Coordinator Specialist", issuer: "Autodesk", date: "2024", badge: "🏗️", glow: "rgba(59, 130, 246, 0.4)" }
    ];

    const skillsFallback = [
      { category: "Estructuras", items: [{ name: "SAP2000 & ETABS", level: 90 }] }
    ];

    const chatbotFallback = {
      system: { name: "Damikus AI", welcome: "Hola, soy el asistente de Damikus. ¿En qué te ayudo sobre mis servicios de obras civiles?", fallback: "Pregúntame sobre '¿Quién eres?', '¿Qué servicios ofreces?' o 'Contacto'." },
      qa: [
        { trigger: "¿Quién eres?", keywords: ["quien"], response: "Soy Damikus, Ingeniero Civil y Gestor de Proyectos." },
        { trigger: "¿Cómo te contacto?", keywords: ["contacto"], response: "Escríbeme a contacto@damikus.web." }
      ]
    };

    const galleryFallback = [
      { title: "Inspección de Obra", type: "image", src: "", category: "Trabajo", description: "Supervisión técnica de concreto." }
    ];

    // Load sources parallel
    const [profile, socials, projects, timeline, music, certificates, skills, chatbot, gallery] = await Promise.all([
      fetchJSON('data/profile.json', profileFallback),
      fetchJSON('data/socials.json', socialsFallback),
      fetchJSON('data/projects.json', projectsFallback),
      fetchJSON('data/timeline.json', timelineFallback),
      fetchJSON('data/music.json', musicFallback),
      fetchJSON('data/certificates.json', certificatesFallback),
      fetchJSON('data/skills.json', skillsFallback),
      fetchJSON('data/chatbot.json', chatbotFallback),
      fetchJSON('data/gallery.json', galleryFallback)
    ]);

    state.profile = profile;
    state.socials = socials;
    state.projects = projects;
    state.timeline = timeline;
    state.music = music;
    state.certificates = certificates;
    state.skills = skills;
    state.chatbot = chatbot;
    state.gallery = gallery;

    renderAllComponents();
    initPostLoadEffects();
  }

  // --------------------------------------------------
  // 2. COMPONENT RENDER ENGINE
  // --------------------------------------------------
  function renderAllComponents() {
    renderHero();
    renderStatus();
    renderUniverse();
    renderSocials();
    renderAbout();
    renderAchievements();
    renderTimeline();
    renderSkills();
    renderProjects();
    renderGallery();
    renderChatbotSuggestions();
    initMusicPlayer();
    initCounters();
    generateQR();
  }

  // Render Hero Block
  function renderHero() {
    const p = state.profile.personal;
    const avatar = document.getElementById('hero-avatar');
    if (avatar) {
      avatar.src = p.avatar || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\' viewBox%3D\'0 0 100 100\'%3E%3Crect width%3D\'100%25\' height%3D\'100%25\' fill%3D\'%23581c87\'%2F%3E%3Ctext y%3D\'50%25\' x%3D\'50%25\' font-size%3D\'28\' fill%3D\'white\' text-anchor%3D\'middle\' dy%3D\'.3em\'%3ED%3C/text%3E%3C/svg%3E';
      avatar.onerror = () => { avatar.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\' viewBox%3D\'0 0 100 100\'%3E%3Crect width%3D\'100%25\' height%3D\'100%25\' fill%3D\'%23581c87\'%2F%3E%3Ctext y%3D\'50%25\' x%3D\'50%25\' font-size%3D\'28\' fill%3D\'white\' text-anchor%3D\'middle\' dy%3D\'.3em\'%3ED%3C/text%3E%3C/svg%3E'; };
    }
    document.getElementById('hero-name').textContent = sanitize(p.name);
    document.getElementById('hero-bio').textContent = sanitize(p.bio);
    initTypewriter(p.professionsList || ['Creative Developer']);
  }

  // Render Status
  function renderStatus() {
    const p = state.profile.personal;
    const statusAvatar = document.getElementById('status-avatar');
    if (statusAvatar) {
      statusAvatar.src = p.avatar || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\' viewBox%3D\'0 0 100 100\'%3E%3Crect width%3D\'100%25\' height%3D\'100%25\' fill%3D\'%231A1A1A\'%2F%3E%3C/svg%3E';
    }
    updateDiscordStatus(p.status.dot, p.status.text, p.status.type);
  }

  // Render Universe
  function renderUniverse() {
    const u = state.profile.universo;
    const container = document.getElementById('universe-list');
    if (!container) return;
    
    const universeMapping = [
      { key: 'movie', label: 'Película', icon: 'fa-film' },
      { key: 'series', label: 'Serie', icon: 'fa-tv' },
      { key: 'anime', label: 'Anime', icon: 'fa-dragon' },
      { key: 'game', label: 'Videojuego', icon: 'fa-gamepad' },
      { key: 'food', label: 'Comida', icon: 'fa-bowl-food' },
      { key: 'drink', label: 'Bebida', icon: 'fa-mug-hot' },
      { key: 'color', label: 'Color', icon: 'fa-palette' },
      { key: 'birthdayText', label: 'Cumpleaños', icon: 'fa-cake-candles' }
    ];

    container.innerHTML = universeMapping.map(item => {
      const val = u[item.key];
      if (!val) return '';
      return `
        <li class="universe-item">
          <span class="universe-label"><i class="fa-solid ${sanitize(item.icon)}"></i> ${sanitize(item.label)}</span>
          <span class="universe-value">${sanitize(val)}</span>
        </li>
      `;
    }).join('');
  }

  // Render Socials
  function renderSocials() {
    const container = document.getElementById('socials-grid-container');
    if (!container) return;
    
    // Lucide Icon mappings to FontAwesome classes
    const iconMap = {
      instagram: 'fa-instagram',
      github: 'fa-github',
      linkedin: 'fa-linkedin-in',
      music: 'fa-spotify',
      youtube: 'fa-youtube',
      video: 'fa-tiktok',
      'message-square': 'fa-discord',
      tv: 'fa-twitch',
      twitter: 'fa-x-twitter',
      phone: 'fa-whatsapp',
      send: 'fa-telegram',
      mail: 'fa-envelope',
      facebook: 'fa-facebook'
    };

    container.innerHTML = state.socials.map(soc => {
      const faClass = iconMap[soc.icon] || 'fa-link';
      return `
        <a href="${sanitize(soc.url)}" target="_blank" rel="noopener noreferrer" 
           class="social-card magnet-btn" style="--social-hover-color: ${sanitize(soc.color)}; --social-hover-color-glow: ${sanitize(soc.color)}20;"
           aria-label="Ir a ${sanitize(soc.name)} de Damikus">
          <i class="fa-brands ${sanitize(faClass)}"></i>
          <span class="social-card-name">${sanitize(soc.name)}</span>
          <span class="social-card-count">${sanitize(soc.followers)}</span>
        </a>
      `;
    }).join('');
  }

  // Render About Me
  function renderAbout() {
    const p = state.profile.personal;
    const u = state.profile.universo;
    document.getElementById('about-text-content').textContent = sanitize(p.bio);
    document.getElementById('about-quote-text').textContent = sanitize(u.quote);
  }

  // Render Achievements & Certificates
  function renderAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    container.innerHTML = state.certificates.map(cert => {
      return `
        <a href="${sanitize(cert.file)}" target="_blank" rel="noopener" class="achievement-badge" style="--badge-glow: ${sanitize(cert.glow)}">
          <div class="badge-icon-box">${sanitize(cert.badge)}</div>
          <div class="badge-info">
            <span class="badge-name">${sanitize(cert.title)}</span>
            <span class="badge-issuer">${sanitize(cert.issuer)} (${sanitize(cert.date)})</span>
          </div>
        </a>
      `;
    }).join('');
  }

  // Render Timeline
  function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = state.timeline.map(item => {
      return `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-year">${sanitize(item.year)}</div>
          <div class="timeline-role">${sanitize(item.title)}</div>
          <p class="timeline-desc">${sanitize(item.description)}</p>
        </div>
      `;
    }).join('');
  }

  // Render Skills
  function renderSkills() {
    const container = document.getElementById('skills-container');
    if (!container) return;

    container.innerHTML = state.skills.map(cat => {
      const skillsHTML = cat.items.map(skill => {
        return `
          <div class="skill-item">
            <div class="skill-info">
              <span class="skill-name">${sanitize(skill.name)}</span>
              <span class="skill-pct">${parseInt(skill.level)}%</span>
            </div>
            <div class="skill-bar-container">
              <div class="skill-bar-fill" data-pct="${parseInt(skill.level)}"></div>
              <span class="input-glow"></span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="skill-category">
          <h4 class="skill-category-title">${sanitize(cat.category)}</h4>
          ${skillsHTML}
        </div>
      `;
    }).join('');
  }

  // Render Projects
  function renderProjects() {
    const container = document.getElementById('projects-list');
    if (!container) return;

    container.innerHTML = state.projects.map(proj => {
      const tagsHTML = proj.tags.map(t => `<span class="project-tag">${sanitize(t)}</span>`).join('');
      const img = proj.image || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\' viewBox%3D\'0 0 160 90\'%3E%3Crect width%3D\'100%25\' height%3D\'100%25\' fill%3D\'%231A1A1A\'%2F%3E%3C/svg%3E';
      return `
        <article class="project-card">
          <div class="project-img-wrapper">
            <img class="project-img" src="${sanitize(img)}" alt="${sanitize(proj.title)}" loading="lazy" onerror="this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\' viewBox%3D\'0 0 160 90\'%3E%3Crect width%3D\'100%25\' height%3D\'100%25\' fill%3D\'%231A1A1A\'%2F%3E%3C/svg%3E';" />
          </div>
          <div class="project-details">
            <h4 class="project-title">${sanitize(proj.title)}</h4>
            <p class="project-desc">${sanitize(proj.description)}</p>
            <div class="project-tags">${tagsHTML}</div>
            <div class="project-links">
              <a href="${sanitize(proj.github)}" target="_blank" rel="noopener noreferrer" class="btn secondary-btn ripple-btn magnet-btn"><i class="fa-solid fa-compass-drafting"></i> Ver Planos</a>
              <a href="${sanitize(proj.demo)}" target="_blank" rel="noopener noreferrer" class="btn primary-btn ripple-btn magnet-btn"><i class="fa-solid fa-cube"></i> Modelo 3D</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Render Gallery Masonry
  function renderGallery() {
    const container = document.getElementById('gallery-masonry-grid');
    if (!container) return;

    container.innerHTML = state.gallery.map((item, index) => {
      const src = item.src || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\' viewBox%3D\'0 0 100 100\'%3E%3Crect width%3D\'100%25\' height%3D\'100%25\' fill%3D\'%231A1A1A\'%2F%3E%3C/svg%3E';
      
      let mediaHTML = `<img src="${sanitize(src)}" alt="${sanitize(item.title)}" loading="lazy" onerror="this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\' viewBox%3D\'0 0 100 100\'%3E%3Crect width%3D\'100%25\' height%3D\'100%25\' fill%3D\'%231A1A1A\'%2F%3E%3C/svg%3E';" />`;
      if (item.type === 'video') {
        mediaHTML = `<video src="${sanitize(src)}" muted playsinline loop preload="metadata"></video>`;
      }

      return `
        <div class="gallery-item" data-category="${sanitize(item.category)}" data-index="${index}">
          ${mediaHTML}
          <div class="gallery-item-overlay">
            <span class="gallery-item-cat">${sanitize(item.category)}</span>
            <h4 class="gallery-item-title">${sanitize(item.title)}</h4>
          </div>
        </div>
      `;
    }).join('');

    // Rebind click events
    document.querySelectorAll('.gallery-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'));
        openLightbox(idx);
      });
    });
  }

  // Render AI Chatbot suggestions
  function renderChatbotSuggestions() {
    const container = document.getElementById('chat-suggest-chips');
    const welcomeText = document.getElementById('chat-welcome-text');
    const nameTitle = document.getElementById('chatbot-name-title');
    
    if (state.chatbot.system) {
      if (welcomeText) welcomeText.textContent = sanitize(state.chatbot.system.welcome);
      if (nameTitle) nameTitle.textContent = sanitize(state.chatbot.system.name);
    }

    if (!container) return;
    container.innerHTML = state.chatbot.qa.map(qa => {
      return `<button class="chat-chip">${sanitize(qa.trigger)}</button>`;
    }).join('');

    // Bind click events on chips
    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const question = chip.textContent;
        handleChatbotSubmit(question);
      });
    });
  }

  // --------------------------------------------------
  // 3. CORE INTERACTIVE EFFECTS & ANIMATIONS
  // --------------------------------------------------
  
  // Custom Cursor trailing logic
  const cursor = document.getElementById('custom-cursor');
  const cPointer = cursor ? cursor.querySelector('.cursor-pointer') : null;
  const cRing = cursor ? cursor.querySelector('.cursor-ring') : null;
  
  let mouse = { x: 0, y: 0 };
  let ringPos = { x: 0, y: 0 };
  let isMoving = false;
  let targetMagnetic = null;

  function initCursor() {
    if (!cursor) return;
    
    // Hide standard cursor on non-touch
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.body.classList.add('custom-cursor-active');
      
      window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        isMoving = true;
        
        // Update direct pointer
        cPointer.style.left = `${mouse.x}px`;
        cPointer.style.top = `${mouse.y}px`;
      });

      // Mouse drag click styles
      window.addEventListener('mousedown', () => cursor.classList.add('clicked'));
      window.addEventListener('mouseup', () => cursor.classList.remove('clicked'));

      // Continuous loop with smooth interpolation for outer ring (Lag/Elastic effect)
      function updateRing() {
        if (targetMagnetic) {
          const rect = targetMagnetic.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          // Magnet snap interpolation
          ringPos.x += (cx - ringPos.x) * 0.2;
          ringPos.y += (cy - ringPos.y) * 0.2;
        } else {
          ringPos.x += (mouse.x - ringPos.x) * 0.15;
          ringPos.y += (mouse.y - ringPos.y) * 0.15;
        }
        
        cRing.style.left = `${ringPos.x}px`;
        cRing.style.top = `${ringPos.y}px`;
        
        requestAnimationFrame(updateRing);
      }
      updateRing();
    }
  }

  // Card Spotlight Reflections + Hover Scale
  function init3DTiltAndSpotlight() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update Spotlight positioning custom properties
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Skip hover scale on mobile
        if (!window.matchMedia('(min-width: 992px)').matches) return;
        
        card.style.transform = 'scale3d(1.015, 1.015, 1.015)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale3d(1, 1, 1)';
      });
    });

    // Magnetic Button snapping hover listener
    const magneticBtns = document.querySelectorAll('.magnet-btn');
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', e => {
          if (cursor) cursor.classList.add('hovering');
          targetMagnetic = btn;
        });
        
        btn.addEventListener('mouseleave', () => {
          if (cursor) cursor.classList.remove('hovering');
          targetMagnetic = null;
        });
      });

      // Regular links and inputs hovering class for cursor
      document.querySelectorAll('a, button, input, textarea, .theme-opt, .chat-chip').forEach(el => {
        if (el.classList.contains('magnet-btn')) return;
        el.addEventListener('mouseenter', () => { if (cursor) cursor.classList.add('hovering'); });
        el.addEventListener('mouseleave', () => { if (cursor) cursor.classList.remove('hovering'); });
      });
    }

    // Ripple click animations on buttons
    document.querySelectorAll('.ripple-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const r = document.createElement('span');
        r.classList.add('ripple');
        r.style.left = `${x}px`;
        r.style.top = `${y}px`;
        
        this.appendChild(r);
        setTimeout(() => r.remove(), 600);
      });
    });
  }

  // Typewriter text generator
  let typewriterIndex = 0;
  let wordIndex = 0;
  let isDeleting = false;
  let typewriterTimer = null;

  function initTypewriter(words) {
    const el = document.getElementById('typewriter');
    if (!el) return;

    function tick() {
      const currentWord = words[wordIndex];
      let displayVal = '';
      
      if (isDeleting) {
        displayVal = currentWord.substring(0, typewriterIndex - 1);
        typewriterIndex--;
      } else {
        displayVal = currentWord.substring(0, typewriterIndex + 1);
        typewriterIndex++;
      }

      el.textContent = sanitize(displayVal);

      let delta = 150 - Math.random() * 50;
      if (isDeleting) delta /= 2;

      if (!isDeleting && typewriterIndex === currentWord.length) {
        delta = 2000; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && typewriterIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delta = 500; // Pause before next word
      }

      typewriterTimer = setTimeout(tick, delta);
    }
    
    if (typewriterTimer) clearTimeout(typewriterTimer);
    tick();
  }

  // Intersection Observer for scroll triggers (Timeline and cards reveal)
  function initScrollTriggers() {
    // Skills bar fill reveal
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    const skillObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetPct = bar.getAttribute('data-pct');
          bar.style.width = `${targetPct}%`;
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.1 });
    skillBars.forEach(b => skillObserver.observe(b));

    // Stacking/Reveal animations on cards
    const cards = document.querySelectorAll('.bento-card');
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
          }, idx * 60);
        }
      });
    }, { threshold: 0.05 });
    
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) scale(0.96)';
      card.style.transition = `opacity var(--transition-slow), transform var(--transition-slow), background var(--transition-normal)`;
      cardObserver.observe(card);
    });
  }

  // --------------------------------------------------
  // 4. DIGITAL CLOCK, WEATHER, WIDGETS
  // --------------------------------------------------
  function initWidgets() {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    function updateTime() {
      const now = new Date();
      
      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      const dayEl = document.getElementById('clock-day');
      const dateEl = document.getElementById('clock-date');
      const timeEl = document.getElementById('clock-time');

      if (dayEl) dayEl.textContent = dayName;
      if (dateEl) dateEl.textContent = `${dayNum} de ${monthName}`;
      if (timeEl) timeEl.textContent = `${hrs}:${mins}:${secs}`;

      // Discord Status hour-sync selector
      syncDiscordStatusByTime(now.getHours());
      
      // Update session timer
      state.sessionSeconds++;
      const sMins = String(Math.floor(state.sessionSeconds / 60)).padStart(2, '0');
      const sSecs = String(state.sessionSeconds % 60).padStart(2, '0');
      const sTimerEl = document.getElementById('stat-timer');
      if (sTimerEl) sTimerEl.textContent = `${sMins}:${sSecs}`;
    }

    setInterval(updateTime, 1000);
    updateTime();

    // Mock local weather calculation
    function initWeather() {
      const weathers = [
        { desc: 'Despejado', icon: 'fa-sun', temp: 26 },
        { desc: 'Ligeramente Nublado', icon: 'fa-cloud-sun', temp: 24 },
        { desc: 'Lluvia Fina', icon: 'fa-cloud-showers-heavy', temp: 18 },
        { desc: 'Tormenta Eléctrica', icon: 'fa-cloud-bolt', temp: 21 },
        { desc: 'Brumoso', icon: 'fa-smog', temp: 19 }
      ];
      
      const hr = new Date().getHours();
      let index = 0;
      if (hr >= 0 && hr < 6) index = 4; // Fog
      else if (hr >= 6 && hr < 12) index = 1; // Cloudy sun
      else if (hr >= 12 && hr < 19) index = 0; // Sunny
      else index = 2; // Rain

      const w = weathers[index];
      const weatherEl = document.getElementById('weather-text');
      if (weatherEl) {
        weatherEl.innerHTML = `<i class="fa-solid ${w.icon}"></i> ${w.temp}°C ${w.desc}`;
      }
    }
    initWeather();
  }

  // Discord real-time status card dynamics
  function updateDiscordStatus(dot, text, type) {
    const dotEl = document.getElementById('discord-ping-dot');
    const textEl = document.getElementById('discord-ping-text');
    const statusTextTitle = document.getElementById('status-text-title');
    const statusTextDesc = document.getElementById('status-text-desc');
    const badgeEl = document.getElementById('status-badge');

    if (dotEl) {
      dotEl.className = 'ping-dot';
      if (dot === 'online') dotEl.style.backgroundColor = '#10b981';
      else if (dot === 'idle') dotEl.style.backgroundColor = '#f97316';
      else dotEl.style.backgroundColor = '#ef4444';
    }

    if (textEl) textEl.textContent = sanitize(text);

    let statusTitle = 'Disponible';
    let statusDesc = 'Disponible para proyectos';
    let statusColor = '#10b981';

    if (type === 'busy' || dot === 'idle') {
      statusTitle = 'Ocupado';
      statusDesc = 'Revisando planos BIM';
      statusColor = '#f97316';
    } else if (type === 'dnd' || dot === 'dnd') {
      statusTitle = 'En Obra';
      statusDesc = 'Supervisando vaciado';
      statusColor = '#ef4444';
    } else if (type === 'coding') {
      statusTitle = 'Cálculo Estructural';
      statusDesc = 'Modelando en SAP2000';
      statusColor = '#a855f7';
    } else if (type === 'sleeping') {
      statusTitle = 'Descansando';
      statusDesc = 'Desconectado temporalmente';
      statusColor = '#606060';
    }

    if (statusTextTitle) statusTextTitle.textContent = statusTitle;
    if (statusTextDesc) statusTextDesc.textContent = statusDesc;
    if (badgeEl) badgeEl.style.backgroundColor = statusColor;
  }

  // Automatically switch status based on hour
  function syncDiscordStatusByTime(hr) {
    // Only auto-sync if user hasn't selected manual status override recently
    if (state.manualStatusOverride) return;

    let dot = 'online';
    let text = 'Disponible';
    let type = 'online';

    if (hr >= 0 && hr < 7) {
      dot = 'dnd';
      text = 'Descansando';
      type = 'sleeping';
    } else if (hr >= 9 && hr < 14) {
      dot = 'online';
      text = 'Calculando estructuras';
      type = 'coding';
    } else if (hr >= 14 && hr < 16) {
      dot = 'idle';
      text = 'Almorzando';
      type = 'busy';
    } else if (hr >= 16 && hr < 20) {
      dot = 'online';
      text = 'Disponible';
      type = 'online';
    } else {
      dot = 'online';
      text = 'Modelando en Revit';
      type = 'coding';
    }

    updateDiscordStatus(dot, text, type);
  }

  // Bind Discord selector overrides
  document.querySelectorAll('.status-selector-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-status');
      state.manualStatusOverride = true;
      let dot = 'online';
      let text = 'Disponible';

      if (type === 'idle') {
        dot = 'idle';
        text = 'Ocupado';
      } else if (type === 'dnd') {
        dot = 'dnd';
        text = 'No molestar';
      }

      updateDiscordStatus(dot, text, type);
    });
  });

  // --------------------------------------------------
  // 5. INTERACTIVE MUSIC PLAYER & CANVAS WAVES
  // --------------------------------------------------
  let audio = document.getElementById('ambient-audio');
  
  function initMusicPlayer() {
    const playPauseBtn = document.getElementById('play-pause');
    const prevTrackBtn = document.getElementById('prev-track');
    const nextTrackBtn = document.getElementById('next-track');
    const volumeSlider = document.getElementById('volume-slider');
    const progressContainer = document.getElementById('music-progress-container');
    const bgMusicToggle = document.getElementById('bg-music-toggle');
    
    if (!state.music || state.music.length === 0) return;

    // Load active track details
    loadTrack(state.activeTrackIndex);

    // Audio volume synchronization
    audio.volume = volumeSlider ? volumeSlider.value / 100 : 0.5;

    // Play/Pause Action
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', togglePlay);
    }
    
    // Header Ambient toggle
    if (bgMusicToggle) {
      bgMusicToggle.addEventListener('click', () => {
        togglePlay();
        bgMusicToggle.innerHTML = state.isPlaying ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
      });
    }

    if (prevTrackBtn) prevTrackBtn.addEventListener('click', prevTrack);
    if (nextTrackBtn) nextTrackBtn.addEventListener('click', nextTrack);

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
      });
    }

    // Skip Timeline trigger click
    if (progressContainer) {
      progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        
        if (audio.duration) {
          audio.currentTime = audio.duration * percentage;
          updateProgressUI();
        } else {
          // Simulated audio length jump
          simulatedTime = 180 * percentage;
          updateProgressUI();
        }
      });
    }

    // Connect analyzer once player starts
    audio.addEventListener('play', initAudioNodes);
    audio.addEventListener('timeupdate', updateProgressUI);
    audio.addEventListener('ended', nextTrack);
  }

  let simulatedTime = 0;

  function loadTrack(index) {
    const track = state.music[index];
    document.getElementById('music-title').textContent = sanitize(track.title);
    document.getElementById('music-artist').textContent = sanitize(track.artist);
    
    const cover = document.getElementById('music-cover');
    if (cover) {
      cover.src = track.cover || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\' viewBox%3D\'0 0 100 100\'%3E%3Crect width%3D\'100%25\' height%3D\'100%25\' fill%3D\'%23581c87\'%2F%3E%3C/svg%3E';
      cover.onerror = () => { cover.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\' viewBox%3D\'0 0 100 100\'%3E%3Crect width%3D\'100%25\' height%3D\'100%25\' fill%3D\'%23581c87\'%2F%3E%3C/svg%3E'; };
    }

    // Handle track source path (use royalty-free synth fallback if empty)
    audio.src = track.src || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    audio.load();
    
    simulatedTime = 0;
    updateProgressUI();
    renderSyncedLyrics(track.lyrics);
  }

  function togglePlay() {
    if (state.isPlaying) {
      audio.pause();
      state.isPlaying = false;
      document.getElementById('play-pause').innerHTML = '<i class="fa-solid fa-play"></i>';
      document.getElementById('vinyl-disc').style.animationPlayState = 'paused';
      document.getElementById('vinyl-status').textContent = 'En pausa';
      clearInterval(state.simulatedAudioInterval);
    } else {
      // Browser permission handle
      audio.play().then(() => {
        state.isPlaying = true;
        document.getElementById('play-pause').innerHTML = '<i class="fa-solid fa-pause"></i>';
        document.getElementById('vinyl-disc').style.animationPlayState = 'running';
        document.getElementById('vinyl-status').textContent = 'Reproduciendo';
      }).catch(e => {
        console.warn("Audio play blocked by browser, simulating progress bar...", e);
        // Start simulated timer in case browser restricts real playback
        state.isPlaying = true;
        document.getElementById('play-pause').innerHTML = '<i class="fa-solid fa-pause"></i>';
        document.getElementById('vinyl-disc').style.animationPlayState = 'running';
        document.getElementById('vinyl-status').textContent = 'Simulando';
        
        state.simulatedAudioInterval = setInterval(() => {
          simulatedTime = (simulatedTime + 1) % 180;
          updateProgressUI();
        }, 1000);
      });
    }
  }

  function prevTrack() {
    state.activeTrackIndex = (state.activeTrackIndex - 1 + state.music.length) % state.music.length;
    loadTrack(state.activeTrackIndex);
    if (state.isPlaying) audio.play().catch(() => {});
  }

  function nextTrack() {
    state.activeTrackIndex = (state.activeTrackIndex + 1) % state.music.length;
    loadTrack(state.activeTrackIndex);
    if (state.isPlaying) audio.play().catch(() => {});
  }

  // Update progress timelines and durations
  function updateProgressUI() {
    const curTime = audio.duration ? audio.currentTime : simulatedTime;
    const totDuration = audio.duration ? audio.duration : 180;
    
    const fill = document.getElementById('music-progress-fill');
    const currentLabel = document.getElementById('music-time-current');
    const totalLabel = document.getElementById('music-time-total');

    if (fill) fill.style.width = `${(curTime / totDuration) * 100}%`;
    if (currentLabel) currentLabel.textContent = formatTime(curTime);
    if (totalLabel) totalLabel.textContent = formatTime(totDuration);

    updateLyricsTracker(curTime);
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = String(Math.floor(secs % 60)).padStart(2, '0');
    return `${m}:${s}`;
  }

  // Sync Lyrics visual output
  let trackLyrics = [];
  function renderSyncedLyrics(lyrics) {
    trackLyrics = lyrics || [];
    const scrollContainer = document.getElementById('lyrics-scroll');
    if (!scrollContainer) return;

    scrollContainer.innerHTML = trackLyrics.map((lyr, index) => {
      return `<p class="lyric-line ${index === 0 ? 'active' : ''}" id="lyric-${index}">${sanitize(lyr.text)}</p>`;
    }).join('');
    scrollContainer.style.transform = 'translateY(0px)';
  }

  function updateLyricsTracker(currentTime) {
    if (trackLyrics.length === 0) return;
    
    let activeIndex = 0;
    for (let i = 0; i < trackLyrics.length; i++) {
      if (currentTime >= trackLyrics[i].time) {
        activeIndex = i;
      }
    }

    document.querySelectorAll('.lyric-line').forEach((line, idx) => {
      if (idx === activeIndex) {
        line.classList.add('active');
        const container = document.getElementById('lyrics-scroll');
        if (container) {
          // Centered scroll animation
          container.style.transform = `translateY(${-idx * 24}px)`;
        }
      } else {
        line.classList.remove('active');
      }
    });
  }

  // Web Audio Context Analyzer
  function initAudioNodes() {
    if (state.audioContext) return;
    
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioContext = new AudioCtx();
      state.audioAnalyser = state.audioContext.createAnalyser();
      state.audioSource = state.audioContext.createMediaElementSource(audio);
      
      state.audioSource.connect(state.audioAnalyser);
      state.audioAnalyser.connect(state.audioContext.destination);
      
      state.audioAnalyser.fftSize = 64;
    } catch (e) {
      console.warn("Could not load HTML5 Audio nodes, fallback to mathematical visual waves.", e);
    }
  }

  // Draw Audio Visualizer frequencies on canvas
  const visCanvas = document.getElementById('music-visualizer');
  const visCtx = visCanvas ? visCanvas.getContext('2d') : null;

  function renderVisualizer() {
    if (!visCtx) return;
    requestAnimationFrame(renderVisualizer);

    visCtx.clearRect(0, 0, visCanvas.width, visCanvas.height);
    
    const bufferLength = state.audioAnalyser ? state.audioAnalyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    if (state.audioAnalyser && state.isPlaying) {
      state.audioAnalyser.getByteFrequencyData(dataArray);
    } else if (state.isPlaying) {
      // Simulate frequencies using sine curves when real audio is blocked
      const t = Date.now() * 0.005;
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = Math.abs(Math.sin(i * 0.3 + t)) * 120 + 20;
      }
    } else {
      // Resting pulse
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = 5;
      }
    }

    const barWidth = (visCanvas.width / bufferLength) * 1.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * visCanvas.height;

      // Premium visual styling gradient
      const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color').trim() || '#a855f7';
      const secondaryColor = getComputedStyle(document.body).getPropertyValue('--secondary-color').trim() || '#ec4899';
      
      const grad = visCtx.createLinearGradient(0, visCanvas.height, 0, visCanvas.height - barHeight);
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(1, secondaryColor);

      visCtx.fillStyle = grad;
      visCtx.fillRect(x, visCanvas.height - barHeight, barWidth - 2, barHeight);

      x += barWidth;
    }
  }
  renderVisualizer();

  // --------------------------------------------------
  // 6. GALLERY FILTERS & LIGHTBOX SCREEN
  // --------------------------------------------------
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightbox-content-box');
  const lightboxCaption = document.getElementById('lightbox-caption-text');
  let activeLightboxIndex = 0;

  // Filter masonry elements
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-filter');

      document.querySelectorAll('.gallery-item').forEach(item => {
        const cat = item.getAttribute('data-category');
        if (val === 'all' || cat === val) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  function openLightbox(index) {
    if (!lightbox) return;
    activeLightboxIndex = index;
    const item = state.gallery[index];
    
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Stop scroll

    renderLightboxMedia(item);
  }

  function renderLightboxMedia(item) {
    if (!lightboxContent) return;
    lightboxContent.innerHTML = '';
    
    if (item.type === 'video') {
      lightboxContent.innerHTML = `<video src="${sanitize(item.src)}" controls autoplay playsinline loop></video>`;
    } else {
      lightboxContent.innerHTML = `<img src="${sanitize(item.src)}" alt="${sanitize(item.title)}" />`;
    }
    
    if (lightboxCaption) {
      lightboxCaption.innerHTML = `<strong>${sanitize(item.title)}</strong> — ${sanitize(item.description)}`;
    }
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Resume scroll
    if (lightboxContent) lightboxContent.innerHTML = '';
  }

  // Navigation
  function navigateLightbox(dir) {
    activeLightboxIndex = (activeLightboxIndex + dir + state.gallery.length) % state.gallery.length;
    renderLightboxMedia(state.gallery[activeLightboxIndex]);
  }

  if (lightbox) {
    document.getElementById('lightbox-close-btn').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev-btn').addEventListener('click', () => navigateLightbox(-1));
    document.getElementById('lightbox-next-btn').addEventListener('click', () => navigateLightbox(1));
    
    // Close on click outside
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard controls
    window.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('show')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // Swipe gestures on mobile devices
    let touchstartX = 0;
    let touchendX = 0;
    
    lightbox.addEventListener('touchstart', e => {
      touchstartX = e.changedTouches[0].screenX;
    }, false);
    
    lightbox.addEventListener('touchend', e => {
      touchendX = e.changedTouches[0].screenX;
      handleSwipe();
    }, false);
    
    function handleSwipe() {
      if (touchendX < touchstartX - 50) navigateLightbox(1); // Swipe left
      if (touchendX > touchstartX + 50) navigateLightbox(-1); // Swipe right
    }
  }

  // --------------------------------------------------
  // 7. CHATBOT AND WEB APIS (SHARE / QR / CONTACT)
  // --------------------------------------------------
  const chatWidget = document.getElementById('ai-chat-widget');
  const chatWindow = document.getElementById('chat-window');
  const chatMessages = document.getElementById('chat-messages-container');
  const chatInput = document.getElementById('chat-input');
  
  if (chatWidget) {
    document.getElementById('chat-toggle').addEventListener('click', () => {
      chatWindow.classList.toggle('show');
      chatWindow.setAttribute('aria-hidden', chatWindow.classList.contains('show') ? 'false' : 'true');
      
      // Hide notification badge once opened
      const alertDot = chatWidget.querySelector('.chat-alert-dot');
      if (alertDot) alertDot.style.display = 'none';
    });
    
    document.getElementById('chat-close').addEventListener('click', () => {
      chatWindow.classList.remove('show');
      chatWindow.setAttribute('aria-hidden', 'true');
    });

    document.getElementById('chat-send').addEventListener('click', () => {
      if (chatInput.value.trim()) {
        handleChatbotSubmit(chatInput.value.trim());
        chatInput.value = '';
      }
    });

    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && chatInput.value.trim()) {
        handleChatbotSubmit(chatInput.value.trim());
        chatInput.value = '';
      }
    });
  }

  function handleChatbotSubmit(msg) {
    appendChatMessage('user', msg);
    
    setTimeout(() => {
      const resp = queryChatbotResponse(msg);
      appendChatMessage('bot', resp);
    }, 450);
  }

  function appendChatMessage(sender, text) {
    if (!chatMessages) return;
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}-msg`;
    msg.innerHTML = `<p>${sanitize(text)}</p>`;
    
    chatMessages.appendChild(msg);
    
    // Defer scrolling slightly to let browser complete layout calculations
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 60);
  }

  function queryChatbotResponse(msg) {
    const raw = msg.toLowerCase();
    
    // Find matching questions using keywords
    for (let qa of state.chatbot.qa) {
      for (let keyword of qa.keywords) {
        if (raw.includes(keyword)) {
          return qa.response;
        }
      }
    }
    
    return state.chatbot.system.fallback;
  }

  // QR Code generator using a high-quality online scannable QR API
  function generateQR() {
    const container = document.getElementById('qr-code-canvas-container');
    if (!container) return;
    
    // Set the QR code target to your official Vercel domain
    const currentUrl = 'https://damikus.vercel.app/';
    
    // Create an image element pointing to qrserver API
    const qrImg = document.createElement('img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}&color=000000&bgcolor=ffffff&margin=10`;
    qrImg.alt = "Código QR de Damikus Web";
    qrImg.className = "qr-code-image";
    qrImg.style.width = "100%";
    qrImg.style.height = "100%";
    qrImg.style.borderRadius = "8px";
    
    container.innerHTML = '';
    container.appendChild(qrImg);
  }

  // Web Share & Link Copy Actions
  const copyBtn = document.getElementById('copy-link-btn');
  const shareBtn = document.getElementById('web-share-btn');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-solid fa-link"></i> Copiar Enlace';
          }, 2000);
        })
        .catch(err => console.error('Failed to copy link: ', err));
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'Damikus Web',
          text: 'Echa un vistazo a la identidad digital de Damikus.',
          url: window.location.href
        }).catch(err => console.log('Share error: ', err));
      } else {
        // Fallback
        shareBtn.innerHTML = '<i class="fa-solid fa-circle-info"></i> API No Soportada';
        setTimeout(() => {
          shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Compartir';
        }, 2000);
      }
    });
  }

  // Save VCF Contact File
  const saveBtn = document.getElementById('save-contact-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
N:;${state.profile.personal.name};;;
FN:${state.profile.personal.name}
ORG:Damikus Studio
TITLE:${state.profile.personal.profession}
EMAIL;TYPE=PREF,INTERNET:hola@damikus.web
URL:https://damikus.web
END:VCARD`;

      const blob = new Blob([vcard], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const newA = document.createElement('a');
      newA.href = url;
      newA.download = `${state.profile.personal.name}.vcf`;
      document.body.appendChild(newA);
      newA.click();
      document.body.removeChild(newA);
      URL.revokeObjectURL(url);
    });
  }

  // Contact Form submit logic
  const contactForm = document.getElementById('contact-form');
  const contactFeedback = document.getElementById('contact-feedback');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      
      if (!name || !email || !message) {
        showFormFeedback('error', 'Por favor, rellene todos los campos.');
        return;
      }

      if (!validateEmail(email)) {
        showFormFeedback('error', 'Correo electrónico no válido.');
        return;
      }

      // Simulate API submit delay
      const submitBtn = document.getElementById('contact-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando... <i class="fa-solid fa-circle-notch fa-spin"></i>';

      setTimeout(() => {
        showFormFeedback('success', '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Enviar Mensaje</span> <i class="fa-solid fa-paper-plane"></i>';
      }, 1500);
    });
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showFormFeedback(type, text) {
    if (!contactFeedback) return;
    contactFeedback.className = `contact-feedback ${type}`;
    contactFeedback.textContent = text;
    
    // Auto clear after 4s
    setTimeout(() => {
      contactFeedback.style.display = 'none';
    }, 4000);
  }

  // --------------------------------------------------
  // 8. HIGH-PERFORMANCE SURPRISE CANVAS ENGINE (CONFETTI/FIREWORKS)
  // --------------------------------------------------
  const fxCanvas = document.getElementById('fx-canvas');
  const fxCtx = fxCanvas ? fxCanvas.getContext('2d') : null;
  let fxParticles = [];
  let fxAnimationRunning = false;

  function resizeFxCanvas() {
    if (fxCanvas) {
      fxCanvas.width = window.innerWidth;
      fxCanvas.height = window.innerHeight;
    }
  }
  window.addEventListener('resize', resizeFxCanvas);
  resizeFxCanvas();

  class ConfettiParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 8 + 4;
      this.speedX = Math.random() * 10 - 5;
      this.speedY = Math.random() * -12 - 5;
      this.gravity = 0.3;
      this.color = `hsl(${Math.random() * 360}, 90%, 60%)`;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 10 - 5;
      this.alpha = 1;
    }
    update() {
      this.speedY += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      if (this.y > window.innerHeight) this.alpha = 0;
      else if (this.alpha > 0.01) this.alpha -= 0.01;
    }
    draw() {
      fxCtx.save();
      fxCtx.translate(this.x, this.y);
      fxCtx.rotate(this.rotation * Math.PI / 180);
      fxCtx.fillStyle = this.color;
      fxCtx.globalAlpha = this.alpha;
      fxCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      fxCtx.restore();
    }
  }

  class FireworkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 3 + 1;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 6 + 2;
      this.speedX = Math.cos(angle) * velocity;
      this.speedY = Math.sin(angle) * velocity;
      this.gravity = 0.15;
      this.color = color;
      this.alpha = 1;
    }
    update() {
      this.speedY += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.alpha > 0.02) this.alpha -= 0.015;
    }
    draw() {
      fxCtx.save();
      fxCtx.fillStyle = this.color;
      fxCtx.globalAlpha = this.alpha;
      fxCtx.shadowBlur = 10;
      fxCtx.shadowColor = this.color;
      fxCtx.beginPath();
      fxCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      fxCtx.fill();
      fxCtx.restore();
    }
  }

  function launchSurpriseFX() {
    // Generate Confetti particles from bottom sides
    for (let i = 0; i < 60; i++) {
      fxParticles.push(new ConfettiParticle(0, window.innerHeight));
      fxParticles.push(new ConfettiParticle(window.innerWidth, window.innerHeight));
    }

    // Generate Fireworks in mid screen
    const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#eab308'];
    for (let f = 0; f < 3; f++) {
      setTimeout(() => {
        const fx = Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2;
        const fy = Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.2;
        const col = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 40; i++) {
          fxParticles.push(new FireworkParticle(fx, fy, col));
        }
      }, f * 300);
    }

    if (!fxAnimationRunning) {
      fxAnimationRunning = true;
      runFXLoop();
    }
  }

  function runFXLoop() {
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    
    fxParticles.forEach((p, idx) => {
      p.update();
      p.draw();
      if (p.alpha <= 0 || p.y > window.innerHeight) {
        fxParticles.splice(idx, 1);
      }
    });

    if (fxParticles.length > 0) {
      requestAnimationFrame(runFXLoop);
    } else {
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      fxAnimationRunning = false;
    }
  }

  // Bind surprise button click
  const surpriseBtn = document.getElementById('surprise-btn');
  if (surpriseBtn) {
    surpriseBtn.addEventListener('click', () => {
      launchSurpriseFX();
      
      // Easter egg sound synthesis (optional / Web Audio API)
      if (state.audioContext) {
        const osc = state.audioContext.createOscillator();
        const gain = state.audioContext.createGain();
        osc.connect(gain);
        gain.connect(state.audioContext.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, state.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, state.audioContext.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.2, state.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0, state.audioContext.currentTime + 0.3);
        
        osc.start();
        osc.stop(state.audioContext.currentTime + 0.3);
      }
    });
  }

  // --------------------------------------------------
  // 9. GPU-FRIENDLY BACKGROUND AURORA CANVAS (60FPS)
  // --------------------------------------------------
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
  let bgParticles = [];
  
  function resizeBgCanvas() {
    if (bgCanvas) {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
    }
  }
  window.addEventListener('resize', resizeBgCanvas);
  resizeBgCanvas();

  class Star {
    constructor() {
      this.x = Math.random() * bgCanvas.width;
      this.y = Math.random() * bgCanvas.height;
      this.size = Math.random() * 1.5 + 0.2;
      this.alpha = Math.random();
      this.speed = Math.random() * 0.01 + 0.005;
    }
    update() {
      this.alpha += this.speed;
      if (this.alpha > 1 || this.alpha < 0) this.speed *= -1;
    }
    draw() {
      bgCtx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      bgCtx.beginPath();
      bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      bgCtx.fill();
    }
  }

  class AuroraBlob {
    constructor(x, y, radius, colorVar, alpha) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.colorVar = colorVar;
      this.alpha = alpha;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Keep inside bounds roughly
      if (this.x < -this.radius || this.x > bgCanvas.width + this.radius) this.speedX *= -1;
      if (this.y < -this.radius || this.y > bgCanvas.height + this.radius) this.speedY *= -1;
    }
    draw() {
      const color = getComputedStyle(document.body).getPropertyValue(this.colorVar).trim() || '#a855f7';
      const grad = bgCtx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      bgCtx.save();
      bgCtx.globalAlpha = this.alpha;
      bgCtx.fillStyle = grad;
      bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgCtx.restore();
    }
  }

  function initBackground() {
    bgParticles = [];
    // Initialize stars
    const starCount = Math.floor(window.innerWidth * 0.08);
    for (let i = 0; i < starCount; i++) {
      bgParticles.push(new Star());
    }

    // Initialize auroras (two dynamic color layers)
    bgParticles.push(new AuroraBlob(bgCanvas.width * 0.3, bgCanvas.height * 0.3, 400, '--primary-color', 0.08));
    bgParticles.push(new AuroraBlob(bgCanvas.width * 0.7, bgCanvas.height * 0.6, 500, '--secondary-color', 0.05));
  }

  function animateBackground() {
    if (!bgCtx) return;
    requestAnimationFrame(animateBackground);

    // Dynamic clean
    bgCtx.fillStyle = state.isDarkMode ? '#0B0B0B' : '#F3F4F6';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Draw blobs first (back)
    bgParticles.forEach(p => {
      if (p instanceof AuroraBlob) {
        p.update();
        p.draw();
      }
    });

    // Draw stars (front)
    if (state.isDarkMode) {
      bgParticles.forEach(p => {
        if (p instanceof Star) {
          p.update();
          p.draw();
        }
      });
    }
  }

  // --------------------------------------------------
  // 10. SYSTEM THEMES, EASTER EGGS & POST LOAD ACTIONS
  // --------------------------------------------------
  
  // Theme dropdown controllers
  const dropdownTrigger = document.querySelector('.theme-dropdown-trigger');
  const dropdown = document.querySelector('.theme-dropdown');
  
  if (dropdownTrigger && dropdown) {
    dropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });

    document.querySelectorAll('.theme-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const theme = opt.getAttribute('data-theme');
        setThemeColor(theme);
      });
    });
  }

  function setThemeColor(theme) {
    state.theme = theme;
    
    // Remove all theme classes and add active
    document.body.className = document.body.className.replace(/theme-\S+/g, '');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('damikus-theme', theme);
    
    // Re-initialize background color blobs dynamically
    initBackground();
  }

  // Dark/Light Mode switch
  const modeToggle = document.getElementById('dark-mode-toggle');
  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      state.isDarkMode = !state.isDarkMode;
      document.body.classList.toggle('light-mode', !state.isDarkMode);
      document.body.classList.toggle('dark-mode', state.isDarkMode);
      
      modeToggle.innerHTML = state.isDarkMode ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
      localStorage.setItem('damikus-mode', state.isDarkMode ? 'dark' : 'light');
    });
  }

  // Save selected settings to LocalStorage on startup
  function loadSavedSettings() {
    const savedTheme = localStorage.getItem('damikus-theme');
    const savedMode = localStorage.getItem('damikus-mode');

    if (savedTheme) {
      setThemeColor(savedTheme);
    }
    
    if (savedMode === 'light') {
      state.isDarkMode = false;
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
      if (modeToggle) modeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  }

  // Dynamic statistics counters
  function initCounters() {
    const p = state.profile.personal;
    
    // Visit counter simulation
    let visits = parseInt(localStorage.getItem('damikus-visits') || '0');
    visits++;
    localStorage.setItem('damikus-visits', visits);
    
    document.getElementById('stat-visitors').textContent = visits;
    document.getElementById('stat-days').textContent = parseInt(p.stats.daysSinceStart);
    document.getElementById('stat-years').textContent = parseInt(p.stats.yearsCoding);
  }

  // Easter Eggs listener (Konami Code: UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A)
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;

  window.addEventListener('keydown', e => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        launchKonamiSurprise();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });

  function launchKonamiSurprise() {
    launchSurpriseFX();
    alert("¡Código Konami activado! Modo Hackerman activado temporalmente 💻⚡");
    
    // Set theme to green Matrix-style
    setThemeColor('green');
  }

  // Logo triple clicks secret
  const logoTrigger = document.getElementById('logo-trigger');
  if (logoTrigger) {
    logoTrigger.addEventListener('click', () => {
      state.logoClicks++;
      if (state.logoClicks === 5) {
        launchSurpriseFX();
        alert("¡Has descubierto el huevo de pascua secreto! Gracias por explorar Damikus Web 🤖🚀");
        state.logoClicks = 0;
      }
    });
  }

  // Floating Back to top actions
  const backToTopBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    // Show after scrolling 300px
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }

    // Scroll progress bar indicator mapping
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (scrollTop / docHeight) * 100;
    const scrollBar = document.getElementById('scroll-progress-bar');
    if (scrollBar) scrollBar.style.height = `${pct}%`;

    // Active dots toggle
    const sections = ['hero', 'about', 'projects', 'gallery', 'contact'];
    const dots = document.querySelectorAll('.scroll-dot');
    
    sections.forEach((secId, index) => {
      const el = document.getElementById(secId);
      if (el) {
        const top = el.offsetTop - 150;
        const bottom = top + el.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bottom) {
          dots.forEach(d => d.classList.remove('active'));
          if (dots[index]) dots[index].classList.add('active');
        }
      }
    });
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Register PWA service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('Service Worker registered successfully!', reg.scope))
        .catch(err => console.warn('Service Worker registration failed: ', err));
    });
  }

  // Final actions initialized after cinematic fade out
  function initPostLoadEffects() {
    initCursor();
    init3DTiltAndSpotlight();
    initScrollTriggers();
    initWidgets();
    
    // Launch particles background
    initBackground();
    animateBackground();
  }

  // --------------------------------------------------
  // LAUNCH LOAD STAGE
  // --------------------------------------------------
  loadSavedSettings();
  loadAllData();

});
