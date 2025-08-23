const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const multer = require('multer');

const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname)));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/images/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Paths
const articleTemplatePath = path.join(__dirname, 'article_templete.html');
const columnPath = path.join(__dirname, 'column.html');
const articlesDirPath = path.join(__dirname, 'articles');

// 日本語を保持するslugify関数
const slugifyJp = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\p{L}\p{N}_-]+/gu, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// 英語用のslugify関数 (安全のため)
const slugifyEn = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};


// API endpoint for creating articles
app.post('/api/articles', upload.single('image'), async (req, res) => {
    try {
        const { title, slug, date, description, content } = req.body;
        const imageFile = req.file;

        if (!title || !date || !description || !content || !imageFile) {
            return res.status(400).json({ message: 'すべてのフィールドと画像を入力してください。' });
        }
        
        const imagePath = `../assets/images/${imageFile.filename}`;

        const finalSlug = slug ? slugifyEn(slug) : slugifyJp(title);
        
        if (!finalSlug) {
            return res.status(400).json({ message: '有効なファイル名を生成できませんでした。英語のファイル名を確認するか、タイトルを修正してください。' });
        }

        const newArticleFileName = `${finalSlug}.html`;
        const newArticleFilePath = path.join(articlesDirPath, newArticleFileName);

        const articleTemplate = await fs.readFile(articleTemplatePath, 'utf-8');
        const contentHtml = marked(content);

        const articleUrl = `https://a-i-l-a.jp/articles/${newArticleFileName}`;
        const imageUrl = `https://a-i-l-a.jp/assets/images/${imageFile.filename}`;

        const newArticleContent = articleTemplate
            .replace(/<title>.*<\/title>/, `<title>${title} - AIライター協会</title>`)
            .replace(/<meta property="og:title" content=".*">/, `<meta property="og:title" content="${title} - AIライター協会">`)
            .replace(/<meta name="description" content=".*">/, `<meta name="description" content="${description}">`)
            .replace(/<meta property="og:description" content=".*">/, `<meta property="og:description" content="${description}">`)
            .replace('OG_URL_PLACEHOLDER', articleUrl)
            .replace('OG_IMAGE_PLACEHOLDER', imageUrl)
            .replace(/<p class="text-gray-500 mb-2">.*<\/p>/, `<p class="text-gray-500 mb-2">${date}</p>`)
            .replace(/<h1 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">.*<\/h1>/, `<h1 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">${title}</h1>`)
            .replace(/<p class="text-sm mt-2 text-gray-500">.*<\/p>/, `<p class="text-sm mt-2 text-gray-500"><a href="../index.html" class="hover:underline">ホーム</a> &gt; <a href="../column.html" class="hover:underline">コラム</a> &gt; ${title}</p>`)
            .replace(/<img src=".*" alt="記事のメイン画像".*>/, `<img src="${imagePath}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg mb-12">`)
            .replace(/<div class="article-content text-gray-800">[\s\S]*?<\/div>/, `<div class="article-content text-gray-800">${contentHtml}</div>`);

        await fs.writeFile(newArticleFilePath, newArticleContent);

        const columnHtml = await fs.readFile(columnPath, 'utf-8');
        
        const columnImagePath = imagePath.replace('../', '');
        
        const newColumnEntry = `
                    <!-- コラム記事 -->
                    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                        <a href="articles/${newArticleFileName}" class="block group">
                            <img src="${columnImagePath}" alt="${title}" class="w-full h-48 object-cover group-hover:opacity-80 transition-opacity">
                            <div class="p-6">
                                <p class="text-sm text-gray-500 mb-2">${date}</p>
                                <h4 class="font-bold text-lg mb-2 group-hover:text-blue-800">${title}</h4>
                                <p class="text-gray-600 text-sm leading-relaxed">${description}</p>
                            </div>
                        </a>
                    </div>`;

        const gridEndMarker = '<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">';
        const insertionPoint = columnHtml.indexOf(gridEndMarker) + gridEndMarker.length;
        
        const updatedColumnHtml = 
            columnHtml.slice(0, insertionPoint) +
            newColumnEntry +
            columnHtml.slice(insertionPoint);

        await fs.writeFile(columnPath, updatedColumnHtml);
        
        res.status(201).json({ message: '記事が正常に作成されました。', filePath: `/articles/${newArticleFileName}` });

    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
});

app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました。`);
    console.log(`投稿フォームはこちら: http://localhost:${port}/admin.html`);
});