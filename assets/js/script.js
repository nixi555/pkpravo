document.addEventListener('DOMContentLoaded', () => {
    
    // Optimizirana funkcija za učitavanje headera i footera
    const loadPartials = () => {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        if (!headerPlaceholder || !footerPlaceholder) {
            initializePage();
            return;
        }
        
        Promise.all([
            fetch('/_includes/header.html').then(response => response.ok ? response.text() : ''),
            fetch('/_includes/footer.html').then(response => response.ok ? response.text() : '')
        ])
        .then(([headerHtml, footerHtml]) => {
            headerPlaceholder.outerHTML = headerHtml;
            footerPlaceholder.outerHTML = footerHtml;
        })
        .catch(error => console.error('Greška pri učitavanju headera/footera:', error))
        .finally(() => {
            initializePage();
        });
    };
    
    // Glavna funkcija koja pokreće sav ostali kod
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
                    // Ovu provjeru ostavljamo jer se odnosi na promjenu boje headera (light/dark)
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
                
                // === ISPRAVAK JE OVDJE ===
                // Uklonili smo provjeru širine ekrana (if (window.innerWidth <= 768)),
                // tako da se logika za skrivanje i prikazivanje headera sada
                // primjenjuje na SVIM veličinama ekrana.
                if (window.scrollY > lastScrollY && window.scrollY > 70) {
                    header.classList.add('header-hidden');
                } else {
                    header.classList.remove('header-hidden');
                }
                lastScrollY = window.scrollY;
                // === KRAJ ISPRAVKA ===
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
        // ... Ostatak koda za cookie banner ostaje isti ...
    };

    // Pokreni učitavanje djelomičnih datoteka
    loadPartials();
});
