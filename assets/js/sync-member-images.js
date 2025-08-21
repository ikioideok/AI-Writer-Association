document.addEventListener('DOMContentLoaded', () => {
    const memberCardsContainer = document.querySelector('.grid.md\\:grid-cols-3');
    if (!memberCardsContainer) return;

    const memberCards = memberCardsContainer.children;

    for (const card of memberCards) {
        const link = card.querySelector('a');
        if (!link) continue;

        const memberPageUrl = link.href;
        const imageOnListPage = card.querySelector('img');

        if (!memberPageUrl || !imageOnListPage) continue;

        fetch(memberPageUrl)
            .then(response => {
                if (!response.ok) {
                    console.error('Failed to fetch member page:', memberPageUrl);
                    return;
                }
                return response.text();
            })
            .then(html => {
                if (!html) return;
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const imageOnDetailPage = doc.querySelector('.profile-image-container img');

                if (imageOnDetailPage && imageOnDetailPage.src) {
                    const imageUrl = new URL(imageOnDetailPage.src);
                    const imagePath = imageUrl.pathname; // This will be like /assets/images/foo.png

                    // The list page is at the root, so the path should be relative from there.
                    // imagePath is /assets/images/foo.png, so we remove the leading slash.
                    imageOnListPage.src = imagePath.substring(1);
                }
            })
            .catch(error => {
                console.error('Error processing member page:', memberPageUrl, error);
            });
    }
});
