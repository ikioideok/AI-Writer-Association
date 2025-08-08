document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const base_path = body.dataset.base_path || '.';

    const adjustPaths = (htmlContent, path) => {
        // Avoid processing for root pages
        if (path === '.') {
            return htmlContent;
        }
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.querySelectorAll('[href^="./"]').forEach(el => {
            const currentHref = el.getAttribute('href');
            el.setAttribute('href', `${path}/${currentHref.substring(2)}`);
        });
        tempDiv.querySelectorAll('[src^="./"]').forEach(el => {
            const currentSrc = el.getAttribute('src');
            el.setAttribute('src', `${path}/${currentSrc.substring(2)}`);
        });
        return tempDiv.innerHTML;
    };

    const loadHTML = (url, element, position = 'afterbegin', path) => {
        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                return response.text();
            })
            .then(data => {
                const adjustedData = adjustPaths(data, path);
                element.insertAdjacentHTML(position, adjustedData);
            });
    };

    loadHTML(`${base_path}/_header.html`, body, 'afterbegin', base_path)
        .then(() => {
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenuButton && mobileMenu) {
                mobileMenuButton.addEventListener('click', () => {
                    mobileMenu.classList.toggle('hidden');
                });
            }
        })
        .then(() => {
            return loadHTML(`${base_path}/_footer.html`, body, 'beforeend', base_path);
        })
        .catch(error => console.error('Error loading header or footer:', error));

    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            if (content && content.classList.contains('accordion-content')) {
                content.classList.toggle('hidden');
            }
        });
    });

    const faqContainer = document.getElementById('faq-container');
    if (faqContainer) {
        fetch(`${base_path}/assets/data/faq.json`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load faq.json');
                return response.json();
            })
            .then(data => {
                let faqHtml = '';
                data.forEach(item => {
                    faqHtml += `
                        <div class="simple-card">
                            <h4 class="font-bold text-lg text-primary-custom mb-2">${item.question}</h4>
                            <p class="text-text-light leading-relaxed text-sm">${item.answer}</p>
                        </div>
                    `;
                });
                faqContainer.innerHTML = faqHtml;
            })
            .catch(error => {
                console.error('Error fetching FAQ data:', error);
                faqContainer.innerHTML = '<p>FAQの読み込みに失敗しました。</p>';
            });
    }
});
