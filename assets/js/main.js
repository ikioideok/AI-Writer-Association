document.addEventListener("DOMContentLoaded", function() {
    const isArticlePage = window.location.pathname.includes('/articles/');
    const headerPath = isArticlePage ? '../_header.html' : '_header.html';

    fetch(headerPath)
        .then(response => {
            if (!response.ok) throw new Error('Header not found');
            return response.text();
        })
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);

            // ★★★ここからが追加部分★★★
            // ヘッダーが挿入された後に、ボタンの処理を開始する
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');

            if (mobileMenuButton && mobileMenu) {
                mobileMenuButton.addEventListener('click', () => {
                    mobileMenu.classList.toggle('hidden');
                });
            }
            // ★★★ここまで★★★
        })
        .catch(error => console.error('Error fetching header:', error));
});