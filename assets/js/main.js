document.addEventListener("DOMContentLoaded", function() {
    // サイトのベースパス（例: /AI-Writer-Association/）を取得
    const base = window.location.pathname.endsWith('/') 
        ? window.location.pathname 
        : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

    const isArticlePage = base.includes('/articles/');
    
    // ベースパスからの絶対パスを構築
    const headerPath = isArticlePage ? '../_header.html' : './_header.html';

    fetch(headerPath)
        .then(response => {
            if (!response.ok) throw new Error('Header not found at: ' + headerPath);
            return response.text();
        })
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);

            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');

            if (mobileMenuButton && mobileMenu) {
                mobileMenuButton.addEventListener('click', () => {
                    mobileMenu.classList.toggle('hidden');
                });
            }
        })
        .catch(error => console.error('Error fetching header:', error));
});