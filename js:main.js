document.addEventListener("DOMContentLoaded", function() {

    // Function to load HTML content into a placeholder
    const loadHTML = (filePath, placeholderId) => {
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok " + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                document.getElementById(placeholderId).innerHTML = data;

                // Re-initialize mobile menu logic after header is loaded
                if (placeholderId === 'header-placeholder') {
                    const mobileMenuButton = document.getElementById('mobile-menu-button');
                    const mobileMenu = document.getElementById('mobile-menu');
                    if(mobileMenuButton) {
                        mobileMenuButton.addEventListener('click', () => {
                            mobileMenu.classList.toggle('hidden');
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error loading HTML:', error);
                document.getElementById(placeholderId).innerHTML = `<p class="text-red-500 text-center">Failed to load content.</p>`;
            });
    };

    // Load header and footer
    loadHTML('partials/header.html', 'header-placeholder');
    loadHTML('partials/footer.html', 'footer-placeholder');

    // --- Navbar Shadow on Scroll ---
    // This needs to be handled carefully as the navbar is loaded dynamically
    // We will check for it after a short delay
    setTimeout(() => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('shadow-lg', 'bg-[#0a192f]/90');
                } else {
                    navbar.classList.remove('shadow-lg', 'bg-[#0a192f]/90');
                }
            });
        }
    }, 500);


    // --- Parallax Image Effect (only on main page) ---
    const parallaxImg = document.getElementById('parallax-img');
    if (parallaxImg) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            parallaxImg.style.transform = `translateY(${scrollPosition * 0.1}px)`;
        });
    }

    // --- Fade-in Sections on Scroll ---
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });
    sections.forEach(section => {
        observer.observe(section);
    });

});
