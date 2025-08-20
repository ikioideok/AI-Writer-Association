document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('article-form');
    const responseMessage = document.getElementById('response-message');

    // Set default date to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}.${month}.${day}`;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        responseMessage.textContent = '送信中...';
        responseMessage.className = 'mt-4 text-yellow-600';

        try {
            const response = await fetch('/api/articles', {
                method: 'POST',
                body: formData // Send FormData directly
            });

            const result = await response.json();

            if (response.ok) {
                responseMessage.textContent = `成功！ ${result.message} 新しい記事はこちら: ${result.filePath}`;
                responseMessage.className = 'mt-4 text-green-600';
                form.reset();
                // Reset date to today after submission
                if (dateInput) {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    dateInput.value = `${year}.${month}.${day}`;
                }
            } else {
                responseMessage.textContent = `エラー: ${result.message}`;
                responseMessage.className = 'mt-4 text-red-600';
            }
        } catch (error) {
            console.error('フォームの送信中にエラーが発生しました:', error);
            responseMessage.textContent = 'フォームの送信中に予期せぬエラーが発生しました。';
            responseMessage.className = 'mt-4 text-red-600';
        }
    });
});