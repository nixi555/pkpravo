document.addEventListener('DOMContentLoaded', () => {
    
    // Optimizirana funkcija za učitavanje headera i footera
    const loadPartials = () => {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        // Ako elementi ne postoje na stranici, odmah pokreni glavni kod
        if (!headerPlaceholder || !footerPlaceholder) {
            initializePage();
            return;
        }
        
        // Koristimo Promise.all da se oba dijela učitavaju ISTOVREMENO, što je brže
        Promise.all([
            fetch('/_includes/header.html').then(response => response.ok ? response.text() : ''),
            fetch('/_includes/footer.html').then(response => response.ok ? response.text() : '')
        ])
        .then(([headerHtml, footerHtml]) => {
            // Zamijeni placeholdere s učitanim HTML-om
            headerPlaceholder.outerHTML = headerHtml;
            footerPlaceholder.outerHTML = footerHtml;
        })
        .catch(error => console.error('Greška pri učitavanju headera/footera:', error))
        .finally(() => {
            // BILO DA JE USPJELO ILI NE, UVIJEK POKRENI GLAVNI KOD NAKON OVOGA
            // Ovo osigurava da ostatak stranice (meni, animacije) uvijek radi.
            initializePage();
        });
    };
    
    // Glavna funkcija koja pokreće sav ostali kod NAKON što se učitaju header i footer
    const initializePage = () => {
        // FUNKCIONALAN MOBILNI MENI
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.querySelector('.nav-links');
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
        }

        // DINAMIČKI HEADER
        const header = document.querySelector('header');
        if (header) {
            let lastScrollY = window.scrollY;
            const heroSection = document.querySelector('#hero');
            const headerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (window.innerWidth > 768) {
                        header.classList.toggle('header-light-content', entry.isIntersecting);
                        header.classList.toggle('header-dark-content', !entry.isIntersecting);
                    }
                });
            }, { threshold: 0.05, rootMargin: "-80px 0px 0px 0px" });
            
            if (heroSection) {
                headerObserver.observe(heroSection);
                if (window.scrollY > 50) header.classList.add('scrolled');
            } else {
                 header.classList.add('scrolled', 'header-dark-content');
            }

            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) { header.classList.add('scrolled'); } 
                else if (heroSection) { header.classList.remove('scrolled'); }
                
                if (window.innerWidth <= 768) {
                    if (window.scrollY > lastScrollY && window.scrollY > 70) { header.classList.add('header-hidden'); } 
                    else { header.classList.remove('header-hidden'); }
                    lastScrollY = window.scrollY;
                }
            });
        }

        // FAQ ACCORDION
        document.querySelectorAll('.faq-item .faq-question').forEach(button => {
            button.addEventListener('click', () => {
                const item = button.parentElement;
                const answer = button.nextElementSibling;
                item.classList.toggle('active');
                answer.style.maxHeight = item.classList.contains('active') ? answer.scrollHeight + "px" : 0;
            });
        });

        // REVEAL ANIMACIJE
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
        document.querySelectorAll('.reveal, .section-title').forEach(el => revealObserver.observe(el));
        
        // UČITAVANJE RASPOREDA
        const rasporedContainer = document.getElementById('raspored-container');
        if (rasporedContainer) {
             fetch('/_data/schedule.json')
            .then(res => res.ok ? res.json() : Promise.reject('Greška pri dohvaćanju rasporeda'))
            .then(data => {
                const container = rasporedContainer;
                container.innerHTML = '';
                const table = document.createElement('table');
                const headers = ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
                
                let theadHTML = `<thead><tr><th>Grupa</th>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
                
                let tbodyHTML = '<tbody>';
                data.grupe.forEach(grupa => {
                    tbodyHTML += `
                        <tr>
                            <td data-label="Grupa">${grupa.naziv || '-'}</td>
                            <td data-label="Ponedjeljak">${grupa.pon || '-'}</td>
                            <td data-label="Utorak">${grupa.uto || '-'}</td>
                            <td data-label="Srijeda">${grupa.sri || '-'}</td>
                            <td data-label="Četvrtak">${grupa.cet || '-'}</td>
                            <td data-label="Petak">${grupa.pet || '-'}</td>
                        </tr>
                    `;
                });
                tbodyHTML += '</tbody>';
                
                table.innerHTML = theadHTML + tbodyHTML;
                container.appendChild(table);
            })
            .catch(error => {
                if (rasporedContainer) rasporedContainer.innerHTML = '<p class="text-center">Greška pri učitavanju rasporeda.</p>';
                console.error('Error fetching schedule:', error);
            });
        }

        // COOKIE BANNER LOGIKA
        const cookieBanner = document.getElementById('cookie-banner');
        const acceptAllBtn = document.getElementById('cookie-accept-all');
        const settingsBtn = document.getElementById('cookie-settings-btn');
        const saveSettingsBtn = document.getElementById('cookie-save-settings');
        const analyticsCheckbox = document.getElementById('analytics-cookie-checkbox');
        const initialView = document.getElementById('cookie-initial-view');
        const settingsView = document.getElementById('cookie-settings-view');

        const initAnalytics = () => {
            console.log("Analitika (npr. Google Analytics) je prihvaćena i aktivirana.");
        };

        const showSettings = () => {
            if (initialView && settingsView && cookieBanner) {
                initialView.classList.add('hidden');
                settingsView.classList.remove('hidden');
                cookieBanner.classList.add('is-expanded');
            }
        };

        const handleConsent = (consentValue) => {
            localStorage.setItem('pk_porec_cookie_consent', consentValue);
            if(cookieBanner) cookieBanner.classList.add('hidden');
            
            if (consentValue === 'accepted') {
                initAnalytics();
            }
        };

        if (settingsBtn) {
            settingsBtn.addEventListener('click', showSettings);
        }

        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', () => {
                if (analyticsCheckbox) analyticsCheckbox.checked = true;
                handleConsent('accepted');
            });
        }

        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                if (analyticsCheckbox && analyticsCheckbox.checked) {
                    handleConsent('accepted');
                } else {
                    handleConsent('rejected');
                }
            });
        }

        const consentStatus = localStorage.getItem('pk_porec_cookie_consent');
        if (!consentStatus) {
            if(cookieBanner) {
                setTimeout(() => {
                    cookieBanner.classList.remove('hidden');
                }, 500);
            }
        } else if (consentStatus === 'accepted') {
            initAnalytics();
        }

        // KOD ZA HTML5 KALENDAR (iako ga više ne trebamo aktivno s type="date")
        // Ostavljamo za slučaj da se predomislite - ne smeta
        const dateInput = document.querySelector('input[type="date"]');
        if (dateInput && dateInput.type !== 'date') {
            // Fallback za stare preglednike ako zatreba...
        }
    };

    // Pokreni učitavanje djelomičnih datoteka
    loadPartials();
});
