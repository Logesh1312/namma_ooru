// --- Fallback placeholder used when a place has no image or the image fails to load ---
const PLACEHOLDER_IMG = "images/places/placeholder.svg";

// --- Preloader Logic (with animated percentage) ---
(function() {
    const percentEl = document.getElementById('preloaderPercent');
    let pct = 0;
    const tick = setInterval(() => {
        pct += Math.random() * 12 + 4;
        if (pct >= 100) { pct = 100; clearInterval(tick); }
        if (percentEl) percentEl.textContent = Math.floor(pct) + '%';
    }, 220);

    function hidePreloader() {
        var preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('hide');
        }
        document.body.classList.remove('preloading');
    }
    // Primary: hide after animation completes (2.5s)
    setTimeout(hidePreloader, 2600);
    // Fallback: also hide on window load in case setTimeout fires too early
    window.addEventListener('load', function() {
        setTimeout(hidePreloader, 2600);
    });
})();

// --- Custom Cursor (dot + trailing ring) ---
(function() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || (window.matchMedia && window.matchMedia('(hover: none)').matches);
    if (isTouch) { document.body.classList.add('no-cursor'); return; }

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverSelectors = 'a, button, .place-card, .filter-btn, input, .magnetic';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverSelectors)) ring.classList.add('hovering');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverSelectors)) ring.classList.remove('hovering');
    });

    // Magnetic effect for elements tagged .magnetic
    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
    });
})();

// --- Scroll Progress Bar + Back to Top ---
(function() {
    const bar = document.getElementById('scrollProgressBar');
    const backBtn = document.getElementById('backToTop');
    const ring = document.getElementById('backToTopRing');
    const circumference = 119; // 2 * PI * r(19)

    function update() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        if (bar) bar.style.width = (progress * 100) + '%';
        if (ring) ring.style.strokeDashoffset = circumference - (progress * circumference);
        if (backBtn) backBtn.classList.toggle('visible', scrollTop > 500);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();

    if (backBtn) {
        backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
})();

// --- Ambient Fireflies in Hero ---
(function() {
    const canvas = document.getElementById('fireflyCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let particles = [];
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }
    function initParticles() {
        const count = Math.min(45, Math.floor(canvas.width / 30));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: canvas.height * 0.4 + Math.random() * canvas.height * 0.6,
            r: Math.random() * 1.8 + 0.6,
            speedX: (Math.random() - 0.5) * 0.25,
            speedY: (Math.random() - 0.5) * 0.2,
            alpha: Math.random(),
            alphaSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1)
        }));
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY;
            p.alpha += p.alphaSpeed;
            if (p.alpha <= 0 || p.alpha >= 1) p.alphaSpeed *= -1;
            if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            if (p.y < canvas.height * 0.3) p.y = canvas.height; if (p.y > canvas.height) p.y = canvas.height * 0.3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(226,165,69,${Math.max(0, Math.min(1, p.alpha)).toFixed(2)})`;
            ctx.shadowColor = 'rgba(226,165,69,0.9)';
            ctx.shadowBlur = 6;
            ctx.fill();
        });
        if (!reduceMotion) requestAnimationFrame(draw);
    }
    resize();
    initParticles();
    if (!reduceMotion) requestAnimationFrame(draw); else draw();
    window.addEventListener('resize', () => { resize(); initParticles(); });
})();

// --- Scroll Reveal Animation ---
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
revealElements.forEach(el => revealObserver.observe(el));

// --- Counter Animation ---
const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            const target = +entry.target.getAttribute('data-target');
            const duration = 2000;
            const increment = target / (duration / 16); 
            let current = 0;
            const updateCounter = () => {
                current += increment;
                if(current < target) {
                    entry.target.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    entry.target.innerText = target;
                }
            };
            updateCounter();
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
counters.forEach(counter => counterObserver.observe(counter));


// --- Directory Data ---
const directoryData = [
    // --- TOURISM ---
    {
        id: "tiger_reserve",
        category: "tourism",
        title: "Sathyamangalam Wildlife Sanctuary",
        title_ta: "Sathyamangalam Wildlife Sanctuary",
        desc: "Declared a Tiger Reserve in 2013, this sanctuary spans over 1,411 sq km. It is a critical wildlife corridor in the Nilgiri Biosphere Reserve connecting the Western and Eastern Ghats. The dense forests are home to a thriving population of tigers, elephants, leopards, striped hyenas, and the majestic Indian gaur.",
        desc_ta: "Declared a Tiger Reserve in 2013, this sanctuary spans over 1,411 sq km. It is a critical wildlife corridor in the Nilgiri Biosphere Reserve connecting the Western and Eastern Ghats. The dense forests are home to a thriving population of tigers, elephants, leopards, striped hyenas, and the majestic Indian gaur.",
        img: "images/places/tiger_real.jpg",
        price: "Safari: ₹500 - ₹1000 per head (varies by vehicle)",
        timings: "6:00 AM - 6:00 PM",
        tag: "🐅 Wildlife",
        mapUrl: "https://maps.google.com/?q=Sathyamangalam+Tiger+Reserve",
        embedUrl: "https://maps.google.com/maps?q=Sathyamangalam+Tiger+Reserve&t=&z=11&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "elephant_corridor",
        category: "tourism",
        title: "Sathy–Bannari Elephant Corridor",
        title_ta: "Sathy–Bannari Elephant Corridor",
        desc: "One of the busiest wild elephant crossing corridors in South India, linking the forests around Sathyamangalam to Bannari and beyond. Large herds move through seasonally, and the forest department runs awareness drives to keep both people and elephants safe.",
        desc_ta: "One of the busiest wild elephant crossing corridors in South India, linking the forests around Sathyamangalam to Bannari and beyond. Large herds move through seasonally, and the forest department runs awareness drives to keep both people and elephants safe.",
        img: "images/places/tiger_reserve.jpg",
        price: "Free (view from designated safe zones only)",
        timings: "Best spotted at dawn & dusk",
        tag: "🐘 Elephant Corridor",
        mapUrl: "https://maps.google.com/?q=Sathyamangalam+Elephant+Corridor",
        embedUrl: "https://maps.google.com/maps?q=Sathyamangalam+Elephant+Corridor&t=&z=11&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "tourism_handloom",
        category: "tourism",
        title: "Chennampatti Handloom Village",
        title_ta: "Chennampatti Handloom Village",
        desc: "A nearby weaving village where generations-old handloom traditions are still practiced. Visitors can watch artisans at the loom and pick up handwoven cotton fabric directly from the source.",
        desc_ta: "A nearby weaving village where generations-old handloom traditions are still practiced. Visitors can watch artisans at the loom and pick up handwoven cotton fabric directly from the source.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Saree_Weaving_by_Handloom_3.jpg",
        price: "Free to visit | Fabric priced per piece",
        timings: "9:00 AM - 6:00 PM (closed Sundays)",
        tag: "🧶 Handloom Village",
        mapUrl: "https://maps.google.com/?q=Chennampatti+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Chennampatti+Sathyamangalam&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "tourism_riverside",
        category: "tourism",
        title: "Bhavani Riverside Park",
        title_ta: "Bhavani Riverside Park",
        desc: "A shaded, family-friendly park along the Bhavani River, popular for evening walks, sunset views, and weekend picnics right in the middle of town.",
        desc_ta: "A shaded, family-friendly park along the Bhavani River, popular for evening walks, sunset views, and weekend picnics right in the middle of town.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Bhavani_River_Mettupalayam_Tamil_Nadu_Aug25_A7CR_06404.jpg",
        price: "Free Entry",
        timings: "6:00 AM - 8:00 PM",
        tag: "🌳 Riverside Park",
        mapUrl: "https://maps.google.com/?q=Bhavani+River+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Bhavani+River+Sathyamangalam&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "dam",
        category: "tourism",
        title: "Bhavani Sagar Dam",
        title_ta: "Bhavani Sagar Dam",
        desc: "Constructed in 1955 on the Bhavani River, it is one of the world's largest earthen dams, stretching over 8 kilometers. The dam forms a massive, breathtaking reservoir that provides vital irrigation and power to the region. The beautifully maintained gardens at its base make it a prime tourist and picnic destination.",
        desc_ta: "Constructed in 1955 on the Bhavani River, it is one of the world's largest earthen dams, stretching over 8 kilometers. The dam forms a massive, breathtaking reservoir that provides vital irrigation and power to the region. The beautifully maintained gardens at its base make it a prime tourist and picnic destination.",
        img: "images/places/dam.jpg",
        price: "Entry: ₹5 | Parking: ₹20",
        timings: "9:00 AM - 5:30 PM",
        tag: "🌊 Scenic",
        mapUrl: "https://maps.google.com/?q=Bhavani+Sagar+Dam",
        embedUrl: "https://maps.google.com/maps?q=Bhavani+Sagar+Dam&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "falls",
        category: "tourism",
        title: "Kodiveri Falls & Dam",
        title_ta: "Kodiveri Falls & Dam",
        desc: "Located about 15km from Sathyamangalam, Kodiveri is a spectacular and scenic spot where the Bhavani River cascades over rugged rocks. Famous for coracle boat rides and fresh, spicy fish fry prepared by local vendors right on the riverbanks.",
        desc_ta: "Located about 15km from Sathyamangalam, Kodiveri is a spectacular and scenic spot where the Bhavani River cascades over rugged rocks. Famous for coracle boat rides and fresh, spicy fish fry prepared by local vendors right on the riverbanks.",
        img: "images/places/falls.jpg",
        price: "Entry: ₹5 | Coracle Ride: ₹50 per head",
        timings: "8:00 AM - 5:00 PM",
        tag: "🚣 Picnic",
        mapUrl: "https://maps.google.com/?q=Kodiveri+Waterfalls",
        embedUrl: "https://maps.google.com/maps?q=Kodiveri+Waterfalls&t=&z=14&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "ghat",
        category: "tourism",
        title: "Dhimbam Ghat Road",
        title_ta: "Dhimbam Ghat Road",
        desc: "A legendary and thrilling mountain pass connecting Sathyamangalam to Karnataka. The road features 27 spectacular hairpin bends climbing through dense forests up to the Dhimbam plateau. The drive offers sweeping, misty panoramic views of the valleys below.",
        desc_ta: "A legendary and thrilling mountain pass connecting Sathyamangalam to Karnataka. The road features 27 spectacular hairpin bends climbing through dense forests up to the Dhimbam plateau. The drive offers sweeping, misty panoramic views of the valleys below.",
        img: "images/places/ghat.jpg",
        price: "Free (Public Road)",
        timings: "Open 24/7 | Best: 6 AM - 6 PM",
        tag: "⛰️ Viewpoint",
        mapUrl: "https://maps.google.com/?q=Dhimbam+Ghat",
        embedUrl: "https://maps.google.com/maps?q=Dhimbam+Ghat&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "hills",
        category: "tourism",
        title: "Kadambur Hills",
        title_ta: "Kadambur Hills",
        desc: "A picturesque, quiet hill station located near Sathyamangalam that remains largely untouched by commercial tourism. It offers vast stretches of dense, pristine forests, indigenous tribal settlements, and brilliant trekking trails.",
        desc_ta: "A picturesque, quiet hill station located near Sathyamangalam that remains largely untouched by commercial tourism. It offers vast stretches of dense, pristine forests, indigenous tribal settlements, and brilliant trekking trails.",
        img: "images/places/hills.jpg",
        price: "Free Entry (Forest Checkpost permissions apply)",
        timings: "Daylight Hours Recommended",
        tag: "🥾 Trekking",
        mapUrl: "https://maps.google.com/?q=Kadambur+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Kadambur+Sathyamangalam&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "resort",
        category: "tourism",
        title: "Forest Eco Resort",
        title_ta: "Forest Eco Resort",
        desc: "Experience pure tranquility in the heart of the wilderness. This premium eco-resort offers luxurious, sustainable accommodations seamlessly blending with nature. Guests can enjoy authentic tribal cuisine, guided nature walks, bird-watching, and cozy evening campfires under incredibly clear, starry skies.",
        desc_ta: "Experience pure tranquility in the heart of the wilderness. This premium eco-resort offers luxurious, sustainable accommodations seamlessly blending with nature. Guests can enjoy authentic tribal cuisine, guided nature walks, bird-watching, and cozy evening campfires under incredibly clear, starry skies.",
        img: "images/places/resort.jpg",
        price: "Rooms starting from ₹3,500/night",
        timings: "Check-in: 12:00 PM | Check-out: 11:00 AM",
        tag: "🏨 Stay",
        mapUrl: "https://maps.google.com/?q=Sathyamangalam+Resorts",
        embedUrl: "https://maps.google.com/maps?q=Sathyamangalam+Resorts&t=&z=12&ie=UTF8&iwloc=&output=embed"
    },
    // --- TEMPLES ---
    {
        id: "temple",
        category: "temples",
        title: "Bannari Amman Temple",
        title_ta: "Bannari Amman Temple",
        desc: "A highly revered Mariamman temple located right at the foothills of the Dhimbam Ghats. Surrounded by lush, untouched forests, the temple has a powerful spiritual aura. The annual Kundam (fire-walking) festival attracts hundreds of thousands of devotees.",
        desc_ta: "A highly revered Mariamman temple located right at the foothills of the Dhimbam Ghats. Surrounded by lush, untouched forests, the temple has a powerful spiritual aura. The annual Kundam (fire-walking) festival attracts hundreds of thousands of devotees.",
        img: "images/places/temple.jpg",
        price: "Free Entry | Special Darshan: ₹50",
        timings: "6:00 AM - 9:00 PM",
        tag: "🙏 Spiritual",
        mapUrl: "https://maps.google.com/?q=Bannari+Amman+Temple+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Bannari+Amman+Temple+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "temple_kottai",
        category: "temples",
        title: "Kottai Mariamman Temple",
        title_ta: "Kottai Mariamman Temple",
        desc: "A historic temple built near the old Sathyamangalam fort (kottai), reflecting the town's Mysore-era heritage. A peaceful spot for morning darshan away from the crowds.",
        desc_ta: "A historic temple built near the old Sathyamangalam fort (kottai), reflecting the town's Mysore-era heritage. A peaceful spot for morning darshan away from the crowds.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Gopuram-street-evening-Tamil_Nadu.jpg",
        price: "Free Entry",
        timings: "6:00 AM - 12:00 PM, 4:00 PM - 8:00 PM",
        tag: "🛕 Heritage Temple",
        mapUrl: "https://maps.google.com/?q=Kottai+Mariamman+Temple+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Kottai+Mariamman+Temple+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "sathy_murugan",
        category: "temples",
        title: "Arulmigu Subramaniaswamy Temple",
        title_ta: "Arulmigu Subramaniaswamy Temple",
        desc: "A beautiful and ancient Murugan temple located in the heart of Sathyamangalam town. The temple is a major spiritual landmark and a daily destination for devotees seeking blessings.",
        desc_ta: "A beautiful and ancient Murugan temple located in the heart of Sathyamangalam town. The temple is a major spiritual landmark and a daily destination for devotees seeking blessings.",
        img: "images/places/sathy_murugan.jpg",
        price: "Free Entry",
        timings: "6:00 AM - 12:30 PM | 4:00 PM - 9:00 PM",
        tag: "🙏 Spiritual",
        mapUrl: "https://maps.google.com/?q=Subramaniaswamy+Temple+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Subramaniaswamy+Temple+Sathyamangalam&t=&z=16&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "vinayagar",
        category: "temples",
        title: "Sathy Vinayagar Temple",
        title_ta: "Sathy Vinayagar Temple",
        desc: "A beloved Ganesh temple visited by locals before every auspicious occasion. Located centrally, it is one of the most frequently visited temples in the town.",
        desc_ta: "A beloved Ganesh temple visited by locals before every auspicious occasion. Located centrally, it is one of the most frequently visited temples in the town.",
        img: "images/places/vinayagar.jpg",
        price: "Free Entry",
        timings: "6:00 AM - 9:00 PM",
        tag: "🙏 Spiritual",
        mapUrl: "https://maps.google.com/?q=Vinayagar+Temple+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Vinayagar+Temple+Sathyamangalam&t=&z=16&ie=UTF8&iwloc=&output=embed"
    },
    // --- SCHOOLS ---
    {
        id: "baps",
        category: "schools",
        title: "Bannari Amman Public School (CBSE)",
        title_ta: "Bannari Amman Public School (CBSE)",
        desc: "A leading CBSE affiliated institution situated in a lush campus near BIT. Known for modern infrastructure, smart classrooms, and a strong emphasis on holistic development, sports, and co-curricular activities.",
        desc_ta: "A leading CBSE affiliated institution situated in a lush campus near BIT. Known for modern infrastructure, smart classrooms, and a strong emphasis on holistic development, sports, and co-curricular activities.",
        img: "images/places/baps.jpg",
        price: "Fees: Varies by Grade (Contact Admin)",
        timings: "Office: 8:30 AM - 4:30 PM",
        tag: "🏫 CBSE",
        mapUrl: "https://maps.google.com/?q=Bannari+Amman+Public+School+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Bannari+Amman+Public+School+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "saraswathi",
        category: "schools",
        title: "Sri Saraswathi Vidhyalaya Matric Hr. Sec.",
        title_ta: "Sri Saraswathi Vidhyalaya Matric Hr. Sec.",
        desc: "A well-established Matriculation Higher Secondary School in the heart of Sathy providing quality education with an excellent track record in board examinations and competitive exam coaching.",
        desc_ta: "A well-established Matriculation Higher Secondary School in the heart of Sathy providing quality education with an excellent track record in board examinations and competitive exam coaching.",
        img: "images/places/saraswathi.jpg",
        price: "Fees: Contact Administration",
        timings: "8:30 AM - 4:30 PM",
        tag: "🏫 Matriculation",
        mapUrl: "https://maps.google.com/?q=Sri+Saraswathi+Vidhyalaya+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Sri+Saraswathi+Vidhyalaya+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "little_flower",
        category: "schools",
        title: "Little Flower Matric Hr. Sec. School",
        title_ta: "Little Flower Matric Hr. Sec. School",
        desc: "A popular school known for its disciplined environment, strong academic results, and vibrant extracurricular programs. Located in the town centre, it's easily accessible.",
        desc_ta: "A popular school known for its disciplined environment, strong academic results, and vibrant extracurricular programs. Located in the town centre, it's easily accessible.",
        img: "images/places/little_flower.jpg",
        price: "Fees: Contact Administration",
        timings: "8:30 AM - 4:30 PM",
        tag: "🏫 Matriculation",
        mapUrl: "https://maps.google.com/?q=Little+Flower+School+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Little+Flower+School+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "govt_boys",
        category: "schools",
        title: "Government Boys Hr. Sec. School",
        title_ta: "Government Boys Hr. Sec. School",
        desc: "One of the oldest and most prominent government schools in the town. It has produced many successful professionals and serves the local community with free, quality education.",
        desc_ta: "One of the oldest and most prominent government schools in the town. It has produced many successful professionals and serves the local community with free, quality education.",
        img: "images/places/govt_boys.jpg",
        price: "Free (Government School)",
        timings: "8:45 AM - 4:00 PM",
        tag: "🏫 Government",
        mapUrl: "https://maps.google.com/?q=Government+Boys+Higher+Secondary+School+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Government+Boys+Higher+Secondary+School+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "nest_school",
        category: "schools",
        title: "The NEST School",
        title_ta: "The NEST School",
        desc: "A modern, progressive school focused on experiential learning and innovative teaching methods. Offers CBSE curriculum with a strong focus on technology and creativity.",
        desc_ta: "A modern, progressive school focused on experiential learning and innovative teaching methods. Offers CBSE curriculum with a strong focus on technology and creativity.",
        img: "images/places/nest_school.jpg",
        price: "Fees: Contact Administration",
        timings: "8:30 AM - 3:30 PM",
        tag: "🏫 CBSE",
        mapUrl: "https://maps.google.com/?q=The+NEST+School+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=The+NEST+School+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "rank_school",
        category: "schools",
        title: "Rank International School",
        title_ta: "Rank International School",
        desc: "An international-level school offering a blend of CBSE curriculum with global educational standards. Features modern labs, sports grounds, and skill-development programs.",
        desc_ta: "An international-level school offering a blend of CBSE curriculum with global educational standards. Features modern labs, sports grounds, and skill-development programs.",
        img: "images/places/rank_school.jpg",
        price: "Fees: Contact Administration",
        timings: "8:30 AM - 4:00 PM",
        tag: "🏫 International",
        mapUrl: "https://maps.google.com/?q=Rank+International+School+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Rank+International+School+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    // --- COLLEGES ---
    {
        id: "bit",
        category: "colleges",
        title: "Bannari Amman Institute of Technology (BIT)",
        title_ta: "Bannari Amman Institute of Technology (BIT)",
        desc: "A premier autonomous engineering institution with NAAC A++ accreditation. It boasts world-class infrastructure, extensive research labs, sprawling sports facilities, and consistently high placement records with top companies.",
        desc_ta: "A premier autonomous engineering institution with NAAC A++ accreditation. It boasts world-class infrastructure, extensive research labs, sprawling sports facilities, and consistently high placement records with top companies.",
        img: "images/places/bit.jpg",
        price: "Fees: Based on TNEA Counselling / Management Quota",
        timings: "Office: 9:00 AM - 5:00 PM",
        tag: "🎓 Engineering",
        mapUrl: "https://maps.google.com/?q=Bannari+Amman+Institute+of+Technology",
        embedUrl: "https://maps.google.com/maps?q=Bannari+Amman+Institute+of+Technology&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "kaamadhenu",
        category: "colleges",
        title: "Kaamadhenu Arts and Science College",
        title_ta: "Kaamadhenu Arts and Science College",
        desc: "A highly sought-after arts and science college in the region offering numerous UG and PG courses affiliated with Bharathiar University. Known for modern labs and fostering a strong cultural and academic environment.",
        desc_ta: "A highly sought-after arts and science college in the region offering numerous UG and PG courses affiliated with Bharathiar University. Known for modern labs and fostering a strong cultural and academic environment.",
        img: "images/places/kaamadhenu.jpg",
        price: "Fees: Government / Self-financing Rates",
        timings: "9:00 AM - 4:30 PM",
        tag: "🎓 Arts & Science",
        mapUrl: "https://maps.google.com/?q=Kaamadhenu+Arts+and+Science+College+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Kaamadhenu+Arts+and+Science+College+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "govt_arts",
        category: "colleges",
        title: "Government Arts & Science College",
        title_ta: "Government Arts & Science College",
        desc: "A public institution affiliated with Bharathiar University offering affordable UG and PG programs in arts, science, and commerce. It serves as a vital higher education centre for rural students in the region.",
        desc_ta: "A public institution affiliated with Bharathiar University offering affordable UG and PG programs in arts, science, and commerce. It serves as a vital higher education centre for rural students in the region.",
        img: "images/places/govt_arts.jpg",
        price: "Fees: Government Subsidized Rates",
        timings: "9:00 AM - 4:00 PM",
        tag: "🎓 Government",
        mapUrl: "https://maps.google.com/?q=Government+Arts+College+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Government+Arts+College+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    // --- SHOPS ---
    {
        id: "daily_market",
        category: "shops",
        title: "Sathy Daily Market (Uzhavar Sandhai)",
        title_ta: "Sathy Daily Market (Uzhavar Sandhai)",
        desc: "The bustling heartbeat of Sathyamangalam's commerce. Farmers from the surrounding hills bring fresh produce, vegetables, and local spices directly to consumers every morning at wholesale prices.",
        desc_ta: "The bustling heartbeat of Sathyamangalam's commerce. Farmers from the surrounding hills bring fresh produce, vegetables, and local spices directly to consumers every morning at wholesale prices.",
        img: "images/places/daily_market.jpg",
        price: "Prices: Fresh market rates",
        timings: "6:00 AM - 1:00 PM",
        tag: "🛒 Fresh Market",
        mapUrl: "https://maps.google.com/?q=Uzhavar+Sandhai+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Uzhavar+Sandhai+Sathyamangalam&t=&z=16&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "sathy_bus_stand_shops",
        category: "shops",
        title: "Sathy Bus Stand Commercial Area",
        title_ta: "Sathy Bus Stand Commercial Area",
        desc: "The central commercial hub surrounding the Sathyamangalam bus stand. A dense cluster of textile shops, electronics stores, jewelry shops, and general merchandise that serves as the main shopping district for the entire taluk.",
        desc_ta: "The central commercial hub surrounding the Sathyamangalam bus stand. A dense cluster of textile shops, electronics stores, jewelry shops, and general merchandise that serves as the main shopping district for the entire taluk.",
        img: "images/places/sathy_bus_stand_shops.jpg",
        price: "Varies by store",
        timings: "9:00 AM - 9:00 PM",
        tag: "🛍️ Shopping Hub",
        mapUrl: "https://maps.google.com/?q=Sathyamangalam+Bus+Stand",
        embedUrl: "https://maps.google.com/maps?q=Sathyamangalam+Bus+Stand&t=&z=16&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "weekly_sandhai",
        category: "shops",
        title: "Sathy Weekly Market (Shandy)",
        title_ta: "Sathy Weekly Market (Shandy)",
        desc: "The massive weekly market held every Friday and Tuesday where vendors from surrounding villages sell clothing, household goods, agricultural tools, cattle feed, and local produce at competitive bargain prices.",
        desc_ta: "The massive weekly market held every Friday and Tuesday where vendors from surrounding villages sell clothing, household goods, agricultural tools, cattle feed, and local produce at competitive bargain prices.",
        img: "images/places/weekly_sandhai.jpg",
        price: "Bargain prices",
        timings: "Every Friday & Tuesday | 7:00 AM - 6:00 PM",
        tag: "🛒 Weekly Shandy",
        mapUrl: "https://maps.google.com/?q=Weekly+Market+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Weekly+Market+Sathyamangalam&t=&z=16&ie=UTF8&iwloc=&output=embed"
    },
    // --- MORE SCHOOLS & COLLEGES ---
    {
        id: "school_sacred",
        category: "schools",
        title: "Sacred Heart Matriculation School",
        title_ta: "Sacred Heart Matriculation School",
        desc: "A well-established matriculation school known for disciplined academics, extracurricular activities, and a nurturing campus environment for younger students.",
        desc_ta: "A well-established matriculation school known for disciplined academics, extracurricular activities, and a nurturing campus environment for younger students.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Andrews_matriculation_school_south_block.jpg",
        price: "Fees: Contact Administration",
        timings: "8:45 AM - 3:45 PM",
        tag: "🏫 Matriculation",
        mapUrl: "https://maps.google.com/?q=Sacred+Heart+School+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Sacred+Heart+School+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "college_poly",
        category: "colleges",
        title: "Sathyamangalam Polytechnic College",
        title_ta: "Sathyamangalam Polytechnic College",
        desc: "A government polytechnic offering diploma programs in engineering trades, providing accessible technical education to students across the taluk.",
        desc_ta: "A government polytechnic offering diploma programs in engineering trades, providing accessible technical education to students across the taluk.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Government_Polytechnic_College_Cherthala.jpg",
        price: "Fees: Government Subsidized Rates",
        timings: "9:00 AM - 4:30 PM",
        tag: "🎓 Polytechnic",
        mapUrl: "https://maps.google.com/?q=Government+Polytechnic+College+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Government+Polytechnic+College+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    // --- FOOD & EATERIES ---
    {
        id: "food_arul",
        category: "food",
        title: "Hotel Arul Mess",
        title_ta: "Hotel Arul Mess",
        desc: "A beloved local mess famous for authentic Kongunadu-style meals — steaming idlis, crisp dosas, and unlimited veg thali served on banana leaf. A Sathy breakfast institution.",
        desc_ta: "A beloved local mess famous for authentic Kongunadu-style meals — steaming idlis, crisp dosas, and unlimited veg thali served on banana leaf. A Sathy breakfast institution.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Traditional_south_indian_meals.jpg",
        price: "Meals: ₹60 - ₹150",
        timings: "6:30 AM - 10:00 PM",
        tag: "🍛 Tiffin & Meals",
        mapUrl: "https://maps.google.com/?q=Hotel+Arul+Mess+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Hotel+Arul+Mess+Sathyamangalam&t=&z=16&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "food_biryani",
        category: "food",
        title: "Sathy Biryani Corner",
        title_ta: "Sathy Biryani Corner",
        desc: "A busy roadside favorite dishing out fragrant Kongu-style mutton and chicken biryani every evening, best enjoyed with onion raita and a side of pickle.",
        desc_ta: "A busy roadside favorite dishing out fragrant Kongu-style mutton and chicken biryani every evening, best enjoyed with onion raita and a side of pickle.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Dum_Biryani_Plate.jpg",
        price: "Plates: ₹120 - ₹280",
        timings: "5:00 PM - 11:00 PM",
        tag: "🍗 Biryani",
        mapUrl: "https://maps.google.com/?q=Biryani+Shops+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Biryani+Shops+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "food_bakery",
        category: "food",
        title: "Amma's Bakery & Sweets",
        title_ta: "Amma's Bakery & Sweets",
        desc: "A cheerful neighbourhood bakery turning out fresh puffs, cakes, and traditional Tamil sweets like mysore pak and jangiri — a favorite stop for festival shopping.",
        desc_ta: "A cheerful neighbourhood bakery turning out fresh puffs, cakes, and traditional Tamil sweets like mysore pak and jangiri — a favorite stop for festival shopping.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Special_Mysore_Pak.jpg",
        price: "Sweets & snacks: ₹10 - ₹500/kg",
        timings: "8:00 AM - 9:30 PM",
        tag: "🍰 Bakery & Sweets",
        mapUrl: "https://maps.google.com/?q=Bakery+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Bakery+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "food_tea",
        category: "food",
        title: "Bhavani Riverside Tea Stalls",
        title_ta: "Bhavani Riverside Tea Stalls",
        desc: "A row of small tea kadais along the river offering strong filter coffee, milky tea, and hot bajji — the perfect evening pit-stop while watching the sunset over the Bhavani.",
        desc_ta: "A row of small tea kadais along the river offering strong filter coffee, milky tea, and hot bajji — the perfect evening pit-stop while watching the sunset over the Bhavani.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/A_Tea_stall_in_Hokenakal..JPG",
        price: "Tea/Coffee: ₹10 - ₹20 | Snacks: ₹20 - ₹40",
        timings: "6:00 AM - 9:30 PM",
        tag: "☕ Tea & Snacks",
        mapUrl: "https://maps.google.com/?q=Bhavani+River+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Bhavani+River+Sathyamangalam&t=&z=14&ie=UTF8&iwloc=&output=embed"
    },
    // --- DRESS & TEXTILES ---
    {
        id: "dress_silks",
        category: "dress",
        title: "Sathy Silks & Sarees",
        title_ta: "Sathy Silks & Sarees",
        desc: "A trusted family-run showroom stocking silk, cotton, and semi-silk sarees for weddings and festivals, alongside dhotis and traditional wear for men.",
        desc_ta: "A trusted family-run showroom stocking silk, cotton, and semi-silk sarees for weddings and festivals, alongside dhotis and traditional wear for men.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Silk_saree.jpg",
        price: "Sarees: ₹500 - ₹15,000+",
        timings: "9:30 AM - 9:00 PM",
        tag: "🥻 Sarees & Silks",
        mapUrl: "https://maps.google.com/?q=Saree+Shops+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Saree+Shops+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "dress_textile",
        category: "dress",
        title: "Bus Stand Textile Row",
        title_ta: "Bus Stand Textile Row",
        desc: "A dense stretch of textile shops near the bus stand selling everything from school uniform cloth to bedsheets, curtains, and daily-wear fabric at bargain prices.",
        desc_ta: "A dense stretch of textile shops near the bus stand selling everything from school uniform cloth to bedsheets, curtains, and daily-wear fabric at bargain prices.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Bolts_of_fabric._(15012162252).jpg",
        price: "Fabric: ₹80 - ₹400/metre",
        timings: "9:00 AM - 9:00 PM",
        tag: "🧵 Textiles",
        mapUrl: "https://maps.google.com/?q=Sathyamangalam+Bus+Stand",
        embedUrl: "https://maps.google.com/maps?q=Sathyamangalam+Bus+Stand&t=&z=16&ie=UTF8&iwloc=&output=embed"
    },
    {
        id: "dress_readymade",
        category: "dress",
        title: "Trendz Readymade Garments",
        title_ta: "Trendz Readymade Garments",
        desc: "A popular readymade clothing store for men, women, and kids — jeans, shirts, ethnic wear, and the latest festival collections under one roof.",
        desc_ta: "A popular readymade clothing store for men, women, and kids — jeans, shirts, ethnic wear, and the latest festival collections under one roof.",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Sari_Shopping_-_Naldehra_-_Near_Shimla_-_Himachal_Pradesh_-_India_(26550813226).jpg",
        price: "Apparel: ₹200 - ₹2,500",
        timings: "10:00 AM - 9:00 PM",
        tag: "👕 Readymade",
        mapUrl: "https://maps.google.com/?q=Readymade+Garments+Sathyamangalam",
        embedUrl: "https://maps.google.com/maps?q=Readymade+Garments+Sathyamangalam&t=&z=15&ie=UTF8&iwloc=&output=embed"
    }
];

// --- Render Cards dynamically ---
const gridContainer = document.getElementById('placesGrid');
const FAVORITES_KEY = 'namma_places_favorites_v1';
let currentLocale = 'en';

const taFallbacks = {
    tiger_reserve: {
        title: 'சத்தியமங்கலம் வனவிலங்கு சரணாலயம்',
        desc: '2013-ல் டைகர் ரிசர்வாக அறிவிக்கப்பட்ட இந்த சரணாலயம், இயற்கை எழில் மிக்க வனப்பகுதியுடன் வனவிலங்குகளின் வசிப்பிடமாகத் திகழ்கிறது.'
    },
    elephant_corridor: {
        title: 'சத்யம்–பன்னாரி யானை வழித்தடம்',
        desc: 'இது ஒரு பிரபலமான யானைச் செல்லும் பாதையாகும்; இயற்கைச் சூழலில் யானைகளைக் காண்பது மிகவும் சுவாரஸ்யமான அனுபவம்.'
    },
    tourism_handloom: {
        title: 'சென்னம்பட்டி கைத்தறி கிராமம்',
        desc: 'கைத்தறி மரபுகளை இன்னும் உயிர்ப்புடன் பேணும் ஒரு சிறப்பு கிராமம்; கைவினைஞர்களின் உழைப்பையும் காட்சியையும் இங்கே காணலாம்.'
    },
    tourism_riverside: {
        title: 'பவானி ஆற்றருகே பூங்கா',
        desc: 'சூரிய அஸ்தமனக் காட்சிகள், குடும்பப் Picnic மற்றும் அமைதியான மாலை நேரங்களுக்கு ஏற்ற இடம்.'
    },
    dam: {
        title: 'பவானி சாகர் அணை',
        desc: 'பவானி ஆற்றின் மீது கட்டப்பட்ட இந்த அணை, அழகிய நீர்நிலையுடன் பிரமிக்க வைக்கும் ஒரு சுற்றுலா தலமாகும்.'
    },
    falls: {
        title: 'கொடிவேரி அருவி & அணை',
        desc: 'மலைகளின் மத்தியில் அமைந்துள்ள இவ்வருவி, கயிறு படகுப் பயணம் மற்றும் இயற்கைச் சூழலுக்குப் பெயர் பெற்றது.'
    },
    ghat: {
        title: 'திம்பம் மலைச்சாலை',
        desc: '27 வளைவுகள் கொண்ட இந்த பாதை, மலைச் சாரலில் அசாத்திய அழகைத் தருகிறது.'
    },
    temple: {
        title: 'பன்னாரி அம்மன் கோயில்',
        desc: 'சத்தியமங்கலத்தின் ஆன்மிக நம்பிக்கைகளுக்கு மையமான இக்கோயில், அமைதியும் வணக்கத்தையும் தருகிறது.'
    },
    hills: {
        title: 'காடம்பூர் மலைகள்',
        desc: 'தூய்மையான காடு, அமைதியான பாதைகள் மற்றும் இயற்கைச் சூழலுக்குப் பிரசித்தமான இடம்.'
    },
    food_biryani: {
        title: 'சத்ய பிரியாணி கார்னர்',
        desc: 'இங்குள்ள பிரியாணி, உள்ளூர் சுவைகள் மற்றும் மாலை நேர மசாலா வாசனைகளுக்கு பிரபலமானது.'
    },
    dress_silks: {
        title: 'சத்ய சில்க்ஸ் & சேலைகள்',
        desc: 'சேலைகள், பட்டு, மற்றும் பாரம்பரிய ஆடைத் தேர்வுகளுக்குப் பெயர் பெற்ற ஒரு நம்பகமான கடை.'
    }
};

function getLocalizedText(item, field) {
    if (currentLocale === 'ta') {
        const taValue = item[`${field}_ta`];
        if (taValue && taValue !== item[field]) return taValue;
        const fallback = taFallbacks[item.id];
        if (fallback && fallback[field]) return fallback[field];
    }
    return item[field];
}

const localeStrings = {
    en: {
        navHome: 'Home',
        navView3d: '3D View',
        navExplore: 'Explore',
        navMap: 'Map',
        navContact: 'Contact',
        heroExploreBtn: 'Explore',
        ghatCaption: '27 hairpin bends carry the Dhimbam Ghat road from the plains up into the misty Western Ghats.',
        aboutTitle: 'About the Town',
        statsTitle: 'Quick Stats',
        forestArea: 'Sq Km Forest Area',
        view3dTitle: 'Explore the Landscape',
        view3dSub: 'A cinematic glimpse of Sathyamangalam — warm light, sweeping ridges, and tranquil waters.',
        view3dBtn: 'Browse Places',
        placesTitle: 'Places to Visit',
        mapTitle: 'Find Us on the Map',
        footerDesc: 'Experience the untouched beauty of Sathyamangalam.',
        footerSubscribeTitle: 'Get Updates & Travel Tips',
        footerEmailPlaceholder: 'Enter your email',
        footerSubscribeBtn: 'Subscribe',
        searchPlaceholder: 'Search places, temples, schools, shops…',
        filterLabels: ['All Directory','Favorites','Schools','Colleges','Shops','Food & Eateries','Dress & Textiles','Tourist Places','Temples'],
        clearFavorites: 'Clear Favorites',
        exportJson: 'Export JSON',
        exportPdf: 'Export PDF',
        langToggle: 'தமிழ்',
        clearFavoritesTitle: 'Clear all saved favorites',
        exportJsonTitle: 'Download favorites as JSON',
        exportPdfTitle: 'Open printable favorites (save as PDF)',
        addToPlan: '+ Add to Plan',
        inPlan: '✓ In Plan',
        viewDetails: 'View Details',
        noResults: '😕 No places match your search. Try a different keyword.',
        searchResults: '{count} found',
        emptyTrip: 'Your plan is empty. Tap "+ Add to Plan" on any place card to start building your day out.',
        copiedLink: 'Link copied to clipboard',
        copyError: 'Could not copy link, open the page manually.',
        favoritesCleared: 'Favorites cleared',
        noFavoritesPdf: 'No favorites to export',
        favoritesTitle: 'Favorites — Namma Ooru',
        favoritesDownloadName: 'namma_ooru_favorites.json'
    },
    ta: {
        navHome: 'முதல் பக்கம்',
        navView3d: '3D காட்சி',
        navExplore: 'உலாவு',
        navMap: 'வரைபடம்',
        navContact: 'தொடர்பு',
        heroExploreBtn: 'இப்போது ஆராயுங்கள்',
        ghatCaption: 'திம்பம் மலைப்பாதையில் 27 வளைவுகள் கொண்ட பாதை, மேகமூட்டமான மலைச் சரிவுகளைக் கடந்து செல்கிறது.',
        aboutTitle: 'நகரத்தின் சிறப்பு',
        statsTitle: 'சுருக்கப் புள்ளிவிவரங்கள்',
        forestArea: 'சதுர கிலோமீட்டர் காடு',
        view3dTitle: 'இயற்கை காட்சியை ஆராயுங்கள்',
        view3dSub: 'சத்தியமங்கலத்தின் காட்சிகள் — மங்கலான ஒளி, மலைச்சரிவுகள், அமைதியான நீர்நிலைகள்.',
        view3dBtn: 'இடங்களைப் பாருங்கள்',
        placesTitle: 'பார்க்க வேண்டிய இடங்கள்',
        mapTitle: 'வரைபடத்தில் எங்களை கண்டறியவும்',
        footerDesc: 'சத்தியமங்கலத்தின் அசாதாரண அழகை அனுபவியுங்கள்.',
        footerSubscribeTitle: 'புதுப்பிப்புகள் மற்றும் பயண குறிப்புகள் பெறுங்கள்',
        footerEmailPlaceholder: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
        footerSubscribeBtn: 'சந்தா',
        searchPlaceholder: 'இடங்கள், கோயில்கள், பள்ளிகள், கடைகள்… தேடுங்கள்',
        filterLabels: ['எல்லா இடங்களும்','பிடித்தவை','பள்ளிகள்','கல்லூரிகள்','கடைகள்','உணவு தலங்கள்','ஆடை & துணிகள்','சுற்றுலா இடங்கள்','கோயில்கள்'],
        clearFavorites: 'பிடித்தவை அழி',
        exportJson: 'JSON ஏற்றுமதி',
        exportPdf: 'PDF ஏற்றுமதி',
        langToggle: 'English',
        clearFavoritesTitle: 'எல்லா பிடித்தவையும் அழிக்கவும்',
        exportJsonTitle: 'JSON ஐ பதிவிறக்கவும்',
        exportPdfTitle: 'பதிவுக்கு ஏற்ற PDF-ஐ திறக்கவும்',
        addToPlan: '+ திட்டத்தில் சேர்க்கவும்',
        inPlan: '✓ திட்டத்தில் உள்ளது',
        viewDetails: 'விவரங்களை காண்க',
        noResults: '😕 உங்கள் தேடலுக்கு பொருத்தமான இடங்கள் எதுவும் இல்லை. வேறு சொல் முயற்சிக்கவும்.',
        searchResults: '{count} கண்டறியப்பட்டன',
        emptyTrip: 'உங்கள் திட்டம் காலியாக உள்ளது. எந்த இடம் கார்டிலும் "+ Add to Plan" என்பதைத் தட்டி, உங்கள் நாளைத் திட்டமிடுங்கள்.',
        copiedLink: 'இணைப்பு கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது',
        copyError: 'இணைப்பை நகலெடுக்க முடியவில்லை; பக்கத்தை கைமுறையாகத் திறக்கவும்.',
        favoritesCleared: 'பிடித்தவை அகற்றப்பட்டன',
        noFavoritesPdf: 'ஏற்றுமதி செய்ய பிடித்தவை இல்லை',
        favoritesTitle: 'பிடித்தவை — நம்ம ஊரு',
        favoritesDownloadName: 'namma_ooru_favorites.json'
    }
};

function getFavoritesSet() {
    try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) {
        return new Set();
    }
}

function saveFavoritesSet(set) {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(set)));
    } catch (e) { /* ignore */ }
}

// --- Trip Planner storage ---
const TRIP_KEY = 'namma_trip_plan_v1';
function getTripSet() {
    try {
        const raw = localStorage.getItem(TRIP_KEY);
        return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) {
        return new Set();
    }
}
function saveTripSet(set) {
    try {
        localStorage.setItem(TRIP_KEY, JSON.stringify(Array.from(set)));
    } catch (e) { /* ignore */ }
}

// --- Quick actions: clear/export favorites, language toggle, share/print ---
document.addEventListener('DOMContentLoaded', () => {
    const clearBtn = document.getElementById('clearFavs');
    const exportJsonBtn = document.getElementById('exportJson');
    const exportPdfBtn = document.getElementById('exportPdf');
    const langToggle = document.getElementById('langToggle');

    if (clearBtn) clearBtn.addEventListener('click', () => {
        const s = localeStrings[currentLocale] || localeStrings.en;
        if (!confirm(s.clearFavoritesTitle)) return;
        localStorage.removeItem(FAVORITES_KEY);
        renderCards(document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all');
        alert(s.favoritesCleared);
    });

    if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => {
        const favs = getFavoritesSet();
        const data = directoryData.filter(d => favs.has(d.id));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'namma_ooru_favorites.json'; a.click();
        URL.revokeObjectURL(url);
    });

    if (exportPdfBtn) exportPdfBtn.addEventListener('click', () => {
        const s = localeStrings[currentLocale] || localeStrings.en;
        const favs = getFavoritesSet();
        const data = directoryData.filter(d => favs.has(d.id));
        if (!data.length) { alert(s.noFavoritesPdf); return; }
        const win = window.open('', '_blank');
        const html = `
            <html><head><title>${s.favoritesTitle}</title>
            <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111} img{max-width:100%;height:auto} h2{margin-top:1rem}</style>
            </head><body>
            <h1>${s.favoritesTitle}</h1>
            ${data.map(d => {
                const title = getLocalizedText(d, 'title');
                const desc = getLocalizedText(d, 'desc');
                return `<section><h2>${title}</h2><p><strong>${d.tag}</strong></p><p>${desc}</p><p><a href="${d.mapUrl}">${d.mapUrl}</a></p></section>`;
            }).join('<hr/>')}
            </body></html>`;
        win.document.write(html);
        win.document.close();
        // Give the new window a short delay to render before calling print
        setTimeout(() => { win.print(); }, 700);
    });

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const next = langToggle.getAttribute('data-lang') === 'en' ? 'ta' : 'en';
            langToggle.setAttribute('data-lang', next);
            langToggle.textContent = localeStrings[next].langToggle;
            applyLocale(next);
        });
    }

    applyLocale(currentLocale);

    // open place from hash if present
    const hash = location.hash.replace('#', '');
    if (hash.startsWith('place=')) {
        const id = hash.split('=')[1];
        setTimeout(() => { if (window.openModal) window.openModal(id); }, 200);
    }
});

function applyLocale(lang) {
    const s = localeStrings[lang] || localeStrings.en;
    const textMap = [
        ['navHome', 'navHome'],
        ['navView3d', 'navView3d'],
        ['navExplore', 'navExplore'],
        ['navMap', 'navMap'],
        ['navContact', 'navContact'],
        ['heroExploreBtn', 'heroExploreBtn'],
        ['ghatCaption', 'ghatCaption'],
        ['aboutTitle', 'aboutTitle'],
        ['statsTitle', 'statsTitle'],
        ['view3dTitle', 'view3dTitle'],
        ['view3dSub', 'view3dSub'],
        ['view3dBtn', 'view3dBtn'],
        ['placesTitle', 'placesTitle'],
        ['mapTitle', 'mapTitle'],
        ['footerDesc', 'footerDesc'],
        ['footerSubscribeTitle', 'footerSubscribeTitle']
    ];

    textMap.forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el && s[key]) el.textContent = s[key];
    });

    const searchInput = document.getElementById('placeSearch');
    if (searchInput) searchInput.placeholder = s.searchPlaceholder;

    const filterBtnEls = document.querySelectorAll('.filter-btn:not(#langToggle)');
    filterBtnEls.forEach((b, i) => {
        if (s.filterLabels[i]) b.textContent = s.filterLabels[i];
    });

    const clearFavs = document.getElementById('clearFavs');
    if (clearFavs) {
        clearFavs.textContent = s.clearFavorites;
        clearFavs.title = s.clearFavoritesTitle;
    }
    const exportJson = document.getElementById('exportJson');
    if (exportJson) {
        exportJson.textContent = s.exportJson;
        exportJson.title = s.exportJsonTitle;
    }
    const exportPdf = document.getElementById('exportPdf');
    if (exportPdf) {
        exportPdf.textContent = s.exportPdf;
        exportPdf.title = s.exportPdfTitle;
    }
    const langToggleBtn = document.getElementById('langToggle');
    if (langToggleBtn) langToggleBtn.textContent = s.langToggle;

    currentLocale = lang;
    document.documentElement.lang = lang;

    const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
    renderCards(activeFilter);

    const modalId = document.getElementById('modalTitle')?.dataset?.id;
    if (modalId && document.getElementById('placeModal')?.style.display === 'block') {
        if (window.openModal) window.openModal(modalId);
    }
}

async function requestMissingTranslations(target) {
    try {
        const toTranslate = [];
        const mapIndex = [];
        directoryData.forEach((item, idx) => {
            const needsTitle = !item.title_ta || item.title_ta === item.title;
            const needsDesc = !item.desc_ta || item.desc_ta === item.desc;
            if (needsTitle || needsDesc) {
                // combine title and desc so we can translate in one call per item
                toTranslate.push(item.title + '\n|||\n' + item.desc);
                mapIndex.push(idx);
            }
        });
        if (!toTranslate.length) return;
        const resp = await fetch('http://localhost:3001/api/translate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: toTranslate, target })
        });
        const j = await resp.json();
        if (!j.translations) return;
        j.translations.forEach((t, i) => {
            const parts = t.split('\n|||\n');
            const idx = mapIndex[i];
            if (parts[0]) directoryData[idx].title_ta = parts[0];
            if (parts[1]) directoryData[idx].desc_ta = parts.slice(1).join('\n|||\n');
        });
    } catch (e) {
        console.error('translation error', e);
    }
}

// Share & Print inside modal
const modalShareBtn = document.getElementById('modalShare');
const modalPrintBtn = document.getElementById('modalPrint');
if (modalShareBtn) {
    modalShareBtn.addEventListener('click', () => {
        const id = document.getElementById('modalTitle')?.dataset?.id || document.querySelector('.modal-body')?.getAttribute('data-id');
        const hash = `#place=${id}`;
        const url = location.origin + location.pathname + hash;
        navigator.clipboard?.writeText(url).then(() => alert('Link copied to clipboard'), () => alert(url));
    });
}
if (modalPrintBtn) {
    modalPrintBtn.addEventListener('click', () => {
        // print current modal content in a new window
        const modalContent = document.querySelector('.modal-content');
        if (!modalContent) return;
        const win = window.open('', '_blank');
        const html = `
            <html><head><title>${document.getElementById('modalTitle')?.innerText || 'Place'}</title>
            <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px} img{max-width:100%;height:auto}</style>
            </head><body>${modalContent.innerHTML}</body></html>`;
        win.document.write(html); win.document.close(); setTimeout(()=>win.print(),500);
    });
}

// Close/open modal on hash change
window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#','');
    if (!hash.startsWith('place=')) {
        if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
    } else {
        const id = hash.split('=')[1]; if (window.openModal) window.openModal(id);
    }
});

let currentSearchTerm = '';

function renderCards(filter) {
    gridContainer.innerHTML = "";
    const favorites = getFavoritesSet();
    const normalizedFilter = filter || 'all';
    let filteredData;
    if (normalizedFilter === 'all') filteredData = directoryData;
    else if (normalizedFilter === 'favorites') filteredData = directoryData.filter(d => favorites.has(d.id));
    else filteredData = directoryData.filter(d => d.category === normalizedFilter);

    if (currentSearchTerm) {
        const term = currentSearchTerm.toLowerCase();
        filteredData = filteredData.filter(d =>
            (d.title || '').toLowerCase().includes(term) ||
            (d.title_ta || '').toLowerCase().includes(term) ||
            (d.desc || '').toLowerCase().includes(term) ||
            (d.desc_ta || '').toLowerCase().includes(term) ||
            (d.tag || '').toLowerCase().includes(term) ||
            (d.category || '').toLowerCase().includes(term)
        );
    }

    const searchCountEl = document.getElementById('searchCount');
    if (searchCountEl) {
        searchCountEl.textContent = currentSearchTerm ? localeStrings[currentLocale].searchResults.replace('{count}', filteredData.length) : '';
    }

    if (!filteredData.length) {
        gridContainer.innerHTML = `<div class="no-results reveal fade-up active">
            <p>${localeStrings[currentLocale].noResults}</p>
        </div>`;
        return;
    }

    const locale = localeStrings[currentLocale] || localeStrings.en;
    filteredData.forEach((item, index) => {
        const isFav = favorites.has(item.id);
        const favClass = isFav ? 'favorited' : '';
        const star = isFav ? '★' : '☆';
        const titleText = getLocalizedText(item, 'title');
        const descText = getLocalizedText(item, 'desc');
        const inTrip = getTripSet().has(item.id);
        const cardHTML = `
            <div class="place-card card-animate cat-${item.category}" data-id="${item.id}" style="animation-delay:${Math.min(index, 12) * 60}ms">
                <div class="card-img-wrapper" data-lightbox="${item.id}">
                    <img src="${item.img || PLACEHOLDER_IMG}" alt="${item.title}" loading="lazy" onerror="this.onerror=null; this.src=PLACEHOLDER_IMG;">
                    <span class="zoom-hint">🔍</span>
                    <button class="fav-btn ${favClass}" data-id="${item.id}" aria-label="Save to favorites">${star}</button>
                    <span class="cat-chip">${item.tag}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${titleText}</h3>
                    <p class="card-desc">${descText}</p>
                    <div class="card-footer">
                        <button class="btn-trip ${inTrip ? 'added' : ''}" data-id="${item.id}">${inTrip ? locale.inPlan : locale.addToPlan}</button>
                        <button class="btn-more" onclick="openModal('${item.id}')">${locale.viewDetails}</button>
                    </div>
                </div>
            </div>
        `;
        gridContainer.innerHTML += cardHTML;
    });
}

// --- Live Search Wiring ---
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('placeSearch');
    if (!searchInput) return;
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearchTerm = e.target.value.trim();
            const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
            renderCards(activeFilter);
        }, 200);
    });
});

// --- Photo Lightbox (extra feature: click any card photo to view it big) ---
(function setupLightbox() {
    let box = document.querySelector('.photo-lightbox');
    if (!box) {
        box = document.createElement('div');
        box.className = 'photo-lightbox';
        box.innerHTML = `
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <img src="" alt="">
            <div class="lightbox-caption"></div>
        `;
        document.body.appendChild(box);
    }
    const imgEl = box.querySelector('img');
    const captionEl = box.querySelector('.lightbox-caption');
    const closeBtn = box.querySelector('.lightbox-close');

    function openLightbox(item) {
        imgEl.src = item.img || PLACEHOLDER_IMG;
        imgEl.alt = item.title;
        captionEl.textContent = item.title;
        box.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        box.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
    closeBtn.addEventListener('click', closeLightbox);
    box.addEventListener('click', (e) => { if (e.target === box) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

    gridContainer.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.card-img-wrapper');
        if (!wrapper) return;
        if (e.target.closest('.fav-btn')) return;
        const id = wrapper.getAttribute('data-lightbox');
        const item = directoryData.find(d => d.id === id);
        if (item) openLightbox(item);
    });
})();

// Delegate favorite button clicks
gridContainer.addEventListener('click', (e) => {
    const tripBtn = e.target.closest('.btn-trip');
    if (tripBtn) {
        const id = tripBtn.getAttribute('data-id');
        const trip = getTripSet();
        if (trip.has(id)) {
            trip.delete(id);
            tripBtn.classList.remove('added');
            tripBtn.textContent = '+ Add to Plan';
        } else {
            trip.add(id);
            tripBtn.classList.add('added');
            tripBtn.textContent = '✓ In Plan';
        }
        saveTripSet(trip);
        renderTripDrawer();
        return;
    }
    const btn = e.target.closest('.fav-btn');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id) return;
    const favs = getFavoritesSet();
    if (favs.has(id)) {
        favs.delete(id);
        btn.classList.remove('favorited');
        btn.textContent = '☆';
    } else {
        favs.add(id);
        btn.classList.add('favorited');
        btn.textContent = '★';
    }
    btn.classList.remove('pulse');
    void btn.offsetWidth; // restart animation
    btn.classList.add('pulse');
    saveFavoritesSet(favs);
    // If currently viewing favorites filter, re-render to reflect removal
    const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter');
    if (activeFilter === 'favorites') renderCards('favorites');
});

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderCards('all');
});

// --- Touch-friendly tap detection for .btn-more to avoid swipe interference ---
(function() {
    const grid = document.getElementById('placesGrid');
    if (!grid) return;

    const pointerState = {};
    grid.addEventListener('pointerdown', (e) => {
        const btn = e.target.closest('.btn-more');
        if (!btn) return;
        pointerState[e.pointerId] = { x: e.clientX, y: e.clientY, t: Date.now() };
    }, { passive: true });

    grid.addEventListener('pointerup', (e) => {
        const start = pointerState[e.pointerId];
        delete pointerState[e.pointerId];
        const btn = e.target.closest('.btn-more');
        if (!btn || !start) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        const dist = Math.hypot(dx, dy);
        // treat as a tap if movement is small
        if (dist < 12 && (Date.now() - start.t) < 600) {
            e.preventDefault();
            e.stopPropagation();
            // find data-id from nearest card
            const card = btn.closest('.place-card');
            const id = card ? card.getAttribute('data-id') : null;
            if (id && window.openModal) window.openModal(id);
        }
    }, { passive: false });

    // prevent dragging images from interfering with touch
    grid.addEventListener('dragstart', (e) => {
        if (e.target.closest('.place-card')) e.preventDefault();
    });
})();

// --- Category Filtering ---
const filterBtns = document.querySelectorAll('.filter-btn:not(#langToggle)');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter') || 'all';
        
        // Add a small fade out effect before rendering
        gridContainer.style.opacity = '0';
        setTimeout(() => {
            renderCards(filter);
            gridContainer.style.opacity = '1';
        }, 300);
    });
});

// --- Lightbox Modal ---
const modal = document.getElementById("placeModal");
const closeModal = document.querySelector(".close-modal");

window.openModal = (id) => {
    const data = directoryData.find(d => d.id === id);
    if(data) {
        const modalTitleEl = document.getElementById("modalTitle");
        const modalTitleText = getLocalizedText(data, 'title');
        const modalDescText = getLocalizedText(data, 'desc');
        modalTitleEl.innerText = modalTitleText;
        modalTitleEl.dataset.id = data.id;
        document.getElementById("modalDesc").innerText = modalDescText;
        document.getElementById("modalPrice").innerText = "💰 " + data.price;
        document.getElementById("modalTiming").innerText = "🕒 " + data.timings;
        document.getElementById("modalDirections").href = data.mapUrl || "#";
        document.getElementById("modalMapFrame").src = data.embedUrl || "";
        
        // Use realistic image as the modal hero image
        const imgContainer = document.querySelector(".modal-img-container");
        const modalImgAlt = getLocalizedText(data, 'title');
        imgContainer.innerHTML = `<img src="${data.img || PLACEHOLDER_IMG}" alt="${modalImgAlt}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src=PLACEHOLDER_IMG;">`;

        // Tint modal accent by category
        const modalContentEl = document.querySelector(".modal-content");
        if (modalContentEl) {
            modalContentEl.className = 'modal-content cat-' + data.category;
        }

        modal.style.display = "block";
        document.body.style.overflow = "hidden";
        try { history.replaceState(null, '', '#place=' + data.id); } catch(e){}
    }
}

closeModal.onclick = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    document.getElementById("modalMapFrame").src = "";
    try { history.replaceState(null, '', location.pathname); } catch(e){}
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        document.getElementById("modalMapFrame").src = "";
        try { history.replaceState(null, '', location.pathname); } catch(e){}
    }
}

// --- 3D Tilt for Place Cards (mouse-driven, event-delegated so it works on re-rendered cards) ---
(function() {
    // Disable tilt on touch devices to avoid interference with touch gestures
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || (window.matchMedia && window.matchMedia('(hover: none)').matches);
    if (isTouch) return;

    const grid = document.getElementById('placesGrid');
    if (!grid) return;

    function handleMove(e) {
        const card = e.target.closest('.place-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateY = ((x - cx) / cx) * 8;   // left-right tilt
        const rotateX = ((cy - y) / cy) * 8;   // up-down tilt
        card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
    }

    function handleLeave(e) {
        const card = e.target.closest('.place-card');
        if (!card) return;
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
    }

    grid.addEventListener('mousemove', handleMove);
    grid.addEventListener('mouseleave', handleLeave, true);
})();

// --- Hero Parallax (Ghats ridges shift gently with cursor + scroll) ---
(function() {
    const hero = document.getElementById('home');
    const layer = document.getElementById('heroParallax');
    if (!hero || !layer) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        layer.style.transform = `translate3d(${px * -18}px, ${py * -10}px, 0) rotateX(${py * 2}deg) rotateY(${px * -2}deg)`;
    });

    hero.addEventListener('mouseleave', () => {
        layer.style.transform = 'translate3d(0,0,0) rotateX(0) rotateY(0)';
    });

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            layer.style.setProperty('--scrollShift', scrolled * 0.15 + 'px');
            layer.style.transform = `translate3d(0, ${scrolled * 0.15}px, 0)`;
        }
    }, { passive: true });
})();

// Leaflet Interactive Map...
document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map', { scrollWheelZoom: false }).setView([11.5034, 77.2407], 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    const markers = [
        { coords: [11.5034, 77.2407], title: 'Sathyamangalam Town', color: '#f59e0b', popup: 'Town center and gateway to the ghats', target: 'trail' },
        { coords: [11.5270, 77.2920], title: 'Bhavani River', color: '#38bdf8', popup: 'River routes and scenic waterfront views', target: 'river' },
        { coords: [11.4700, 77.2100], title: 'Temple Circuit', color: '#34d399', popup: 'Spiritual landmarks and cultural stops', target: 'temple' }
    ];

    const markerLayers = [];

    markers.forEach((markerData, index) => {
        const marker = L.circleMarker(markerData.coords, {
            color: markerData.color,
            fillColor: markerData.color,
            fillOpacity: 0.9,
            radius: 8 + index
        }).addTo(map);

        marker.bindPopup(`<b>${markerData.title}</b><br>${markerData.popup}`);
        if (index === 0) marker.openPopup();

        const pulse = L.circle(markerData.coords, {
            color: markerData.color,
            fillColor: markerData.color,
            fillOpacity: 0.12,
            radius: 22
        }).addTo(map);

        pulse.setStyle({ opacity: 0.7 });
        let scale = 1;
        const animate = () => {
            scale = scale === 1 ? 1.4 : 1;
            pulse.setRadius(22 * scale);
            pulse.setStyle({ opacity: scale === 1 ? 0.35 : 0.12 });
            window.setTimeout(animate, 900);
        };
        animate();

        markerLayers.push({ ...markerData, marker, pulse });
    });

    document.querySelectorAll('.map-panel-item').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-map-target');
            const match = markerLayers.find(item => item.target === target);
            if (!match) return;
            map.flyTo(match.coords, 13, { duration: 1.2 });
            match.marker.openPopup();
        });
    });
});

// ================= Trip Planner Drawer =================
function renderTripDrawer() {
    const trip = getTripSet();
    const list = document.getElementById('tripList');
    const badge = document.getElementById('tripBadge');
    if (badge) {
        badge.textContent = trip.size;
        badge.classList.toggle('show', trip.size > 0);
    }
    if (!list) return;
    if (!trip.size) {
        list.innerHTML = `<p class="trip-empty">Your plan is empty. Tap "+ Add to Plan" on any place card to start building your day out.</p>`;
        return;
    }
    const items = directoryData.filter(d => trip.has(d.id));
    list.innerHTML = items.map(item => `
        <div class="trip-item cat-${item.category}" data-id="${item.id}">
            <img src="${item.img || PLACEHOLDER_IMG}" alt="${item.title}" onerror="this.onerror=null; this.src=PLACEHOLDER_IMG;">
            <div class="trip-item-info">
                <h4>${item.title}</h4>
                <span>${item.tag}</span>
            </div>
            <button class="trip-remove" data-id="${item.id}" aria-label="Remove">&times;</button>
        </div>
    `).join('');
}

(function() {
    const fab = document.getElementById('tripFab');
    const drawer = document.getElementById('tripDrawer');
    const overlay = document.getElementById('tripOverlay');
    const closeBtn = document.getElementById('tripClose');
    const clearBtn = document.getElementById('tripClear');
    const shareBtn = document.getElementById('tripShare');
    const list = document.getElementById('tripList');
    if (!fab || !drawer) return;

    function openDrawer() {
        drawer.classList.add('open');
        overlay.classList.add('open');
        renderTripDrawer();
    }
    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
    }
    fab.addEventListener('click', openDrawer);
    closeBtn?.addEventListener('click', closeDrawer);
    overlay?.addEventListener('click', closeDrawer);

    clearBtn?.addEventListener('click', () => {
        if (!confirm('Clear your entire day plan?')) return;
        saveTripSet(new Set());
        renderTripDrawer();
        const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        renderCards(activeFilter);
    });

    shareBtn?.addEventListener('click', () => {
        const trip = getTripSet();
        if (!trip.size) { alert('Add a few places to your plan first!'); return; }
        const items = directoryData.filter(d => trip.has(d.id));
        const text = `My Sathyamangalam Day Plan 🧳\n\n` + items.map((it, i) => `${i + 1}. ${it.title} — ${it.tag}`).join('\n') + `\n\nPlanned with Namma Ooru`;
        if (navigator.share) {
            navigator.share({ title: 'My Sathyamangalam Day Plan', text }).catch(() => {});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => alert('Trip plan copied to clipboard!'), () => alert(text));
        } else {
            alert(text);
        }
    });

    list?.addEventListener('click', (e) => {
        const rmBtn = e.target.closest('.trip-remove');
        if (!rmBtn) return;
        const id = rmBtn.getAttribute('data-id');
        const trip = getTripSet();
        trip.delete(id);
        saveTripSet(trip);
        renderTripDrawer();
        const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        renderCards(activeFilter);
    });

    document.addEventListener('DOMContentLoaded', renderTripDrawer);
})();

// ================= Spotlight Carousel =================
(function() {
    const track = document.getElementById('spotlightTrack');
    const dotsWrap = document.getElementById('spotlightDots');
    const prevBtn = document.getElementById('spotlightPrev');
    const nextBtn = document.getElementById('spotlightNext');
    const spotlight = document.getElementById('spotlight');
    if (!track || !spotlight || !dotsWrap) return;

    const slides = Array.from(track.children);
    let current = 0;
    let timer = null;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'spotlight-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(index) {
        if (!slides.length) return;
        slides[current]?.classList.remove('active');
        dots[current]?.classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current]?.classList.add('active');
        dots[current]?.classList.add('active');
        spotlight.setAttribute('data-active-tint', slides[current]?.getAttribute('data-tint') || 'default');
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoplay() {
        if (reduceMotion) return;
        stopAutoplay();
        timer = window.setInterval(next, 5000);
    }
    function stopAutoplay() { if (timer) { clearInterval(timer); timer = null; } }
    function handleNavigation(direction) {
        direction > 0 ? next() : prev();
        startAutoplay();
    }

    nextBtn?.addEventListener('click', () => handleNavigation(1));
    prevBtn?.addEventListener('click', () => handleNavigation(-1));
    spotlight.addEventListener('mouseenter', stopAutoplay);
    spotlight.addEventListener('mouseleave', startAutoplay);
    spotlight.addEventListener('focusin', stopAutoplay);
    spotlight.addEventListener('focusout', () => {
        if (!spotlight.contains(document.activeElement)) startAutoplay();
    });

    document.addEventListener('keydown', (e) => {
        if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); handleNavigation(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); handleNavigation(-1); }
    });

    // Basic touch swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); startAutoplay(); }
    }, { passive: true });

    spotlight.setAttribute('data-active-tint', slides[0]?.getAttribute('data-tint') || 'default');
    if (!reduceMotion) startAutoplay();
})();

// ================= 3D Place Wheel (interactive explorer) =================
(function() {
    const stage = document.getElementById('wheel3dStage');
    const ring = document.getElementById('wheel3dRing');
    const prevBtn = document.getElementById('wheel3dPrev');
    const nextBtn = document.getElementById('wheel3dNext');
    const surpriseBtn = document.getElementById('wheel3dSurprise');
    if (!stage || !ring || typeof directoryData === 'undefined') return;

    // Curated highlight set spanning multiple categories for variety
    const featuredIds = [
        "tiger_reserve", "elephant_corridor", "falls", "temple",
        "food_biryani", "dress_silks", "dam", "tourism_handloom"
    ];
    const items = featuredIds
        .map(id => directoryData.find(d => d.id === id))
        .filter(Boolean);

    const N = items.length;
    if (!N) return;
    const step = 360 / N;
    const cardHalfWidth = 84;
    const radius = Math.round((cardHalfWidth / Math.tan(Math.PI / N)) * 1.25);

    items.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = `wheel3d-card cat-${item.category}`;
        card.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-index', i);
        card.innerHTML = `
            <img src="${item.img || PLACEHOLDER_IMG}" alt="${item.title}" loading="lazy" onerror="this.onerror=null; this.src=PLACEHOLDER_IMG;">
            <div class="wheel3d-card-label">
                <span class="wt-tag">${item.tag}</span>
                <span class="wt-title">${item.title}</span>
            </div>
        `;
        ring.appendChild(card);
    });

    let angle = 0;          // current rotation of the ring
    let targetAngle = null; // when set, we animate toward this angle
    let dragging = false;
    let lastX = 0;
    let dragDistance = 0;
    let autoRotate = true;
    let resumeTimer = null;

    function render() {
        ring.style.transform = `rotateY(${angle}deg)`;
    }

    function pauseAuto(resumeAfterMs) {
        autoRotate = false;
        if (resumeTimer) clearTimeout(resumeTimer);
        if (resumeAfterMs) {
            resumeTimer = setTimeout(() => { autoRotate = true; }, resumeAfterMs);
        }
    }

    function loop() {
        if (targetAngle !== null) {
            const diff = targetAngle - angle;
            if (Math.abs(diff) < 0.15) {
                angle = targetAngle;
                targetAngle = null;
                pauseAuto(3200);
            } else {
                angle += diff * 0.08;
            }
            render();
        } else if (autoRotate && !dragging) {
            angle += 0.06;
            render();
        }
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    function stepRotate(dir) {
        pauseAuto(3200);
        targetAngle = (targetAngle !== null ? targetAngle : angle) + dir * step;
    }
    prevBtn?.addEventListener('click', () => stepRotate(-1));
    nextBtn?.addEventListener('click', () => stepRotate(1));

    surpriseBtn?.addEventListener('click', () => {
        pauseAuto(4000);
        const randomIndex = Math.floor(Math.random() * N);
        // Normalize current angle to figure how many full spins to add for a satisfying flourish
        const base = targetAngle !== null ? targetAngle : angle;
        const currentMod = ((base % 360) + 360) % 360;
        // The card that ends up facing front when ring rotation = -i*step (mod 360)
        const desiredMod = ((-randomIndex * step) % 360 + 360) % 360;
        let delta = desiredMod - currentMod;
        delta = ((delta + 180) % 360) - 180; // shortest signed delta
        targetAngle = base + delta + 720; // add extra full spins for flourish
        surpriseBtn.classList.add('pulse');
        setTimeout(() => surpriseBtn.classList.remove('pulse'), 600);
    });

    // Drag / swipe to rotate manually
    function onPointerDown(x) {
        dragging = true;
        dragDistance = 0;
        lastX = x;
        targetAngle = null;
        pauseAuto(0);
        stage.classList.add('dragging');
    }
    function onPointerMove(x) {
        if (!dragging) return;
        const dx = x - lastX;
        lastX = x;
        dragDistance += Math.abs(dx);
        angle += dx * 0.4;
        render();
    }
    function onPointerUp(target) {
        if (!dragging) return;
        dragging = false;
        stage.classList.remove('dragging');
        pauseAuto(3200);
        // Treat as a click (open modal) only if the pointer barely moved
        if (dragDistance < 6 && target) {
            const card = target.closest('.wheel3d-card');
            if (card) {
                const id = card.getAttribute('data-id');
                if (id && window.openModal) window.openModal(id);
            }
        }
    }

    stage.addEventListener('mousedown', (e) => onPointerDown(e.clientX));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX));
    window.addEventListener('mouseup', (e) => onPointerUp(e.target));

    stage.addEventListener('touchstart', (e) => onPointerDown(e.touches[0].clientX), { passive: true });
    stage.addEventListener('touchmove', (e) => onPointerMove(e.touches[0].clientX), { passive: true });
    stage.addEventListener('touchend', (e) => onPointerUp(e.changedTouches[0]?.target), { passive: true });

    stage.addEventListener('mouseenter', () => pauseAuto(0));
    stage.addEventListener('mouseleave', () => { if (!dragging) pauseAuto(600); autoRotate = true; });
})();
