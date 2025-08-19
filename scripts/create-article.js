const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');

const articleTemplatePath = path.join(__dirname, '..', 'article_templete.html');
const columnPath = path.join(__dirname, '..', 'column.html');
const articlesDirPath = path.join(__dirname, '..', 'articles');

// 質問を定義
const questions = [
    {
        type: 'input',
        name: 'title',
        message: '記事のタイトルを入力してください:',
        validate: input => !!input || 'タイトルは必須です。'
    },
    {
        type: 'input',
        name: 'date',
        message: '公開日 (YYYY.MM.DD) を入力してください:',
        default: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
        validate: input => /^\d{4}\.\d{2}\.\d{2}$/.test(input) || '日付は YYYY.MM.DD 形式で入力してください。'
    },
    {
        type: 'input',
        name: 'description',
        message: '記事の概要を入力してください:',
        validate: input => !!input || '概要は必須です。'
    },
    {
        type: 'input',
        name: 'imagePath',
        message: '記事のメイン画像のパスを入力してください (例: ../assets/images/new-image.jpeg):',
        validate: input => !!input || '画像パスは必須です。'
    },
    {
        type: 'editor',
        name: 'content',
        message: '記事の本文をMarkdownで記述してください (エディタが起動します):',
        validate: input => !!input || '本文は必須です。'
    }
];

// ファイル名を生成する関数
const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // スペースを-に置換
        .replace(/[^\w\-]+/g, '')       // 英数字、アンダースコア、ハイフン以外を削除
        .replace(/\-\-+/g, '-')         // 連続するハイフンを1つに
        .replace(/^-+/, '')             // 先頭のハイフンを削除
        .replace(/-+$/, '');            // 末尾のハイフンを削除
};

async function createArticle() {
    try {
        const answers = await inquirer.prompt(questions);
        const { title, date, description, imagePath, content } = answers;

        // 1. 新しい記事HTMLを作成
        const slug = slugify(title);
        const newArticleFileName = `${slug}.html`;
        const newArticleFilePath = path.join(articlesDirPath, newArticleFileName);

        const articleTemplate = await fs.readFile(articleTemplatePath, 'utf-8');
        const contentHtml = marked(content);

        const newArticleContent = articleTemplate
            .replace(/<title>.*<\/title>/, `<title>${title} - AIライター協会</title>`)
            .replace(/<meta name="description" content=".*">/, `<meta name="description" content="${description}">`)
            .replace(/<p class="text-gray-500 mb-2">.*<\/p>/, `<p class="text-gray-500 mb-2">${date}</p>`)
            .replace(/<h1 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">.*<\/h1>/, `<h1 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">${title}</h1>`)
            .replace(/<p class="text-sm mt-2 text-gray-500">.*<\/p>/, `<p class="text-sm mt-2 text-gray-500"><a href="../index.html" class="hover:underline">ホーム</a> &gt; <a href="../column.html" class="hover:underline">コラム</a> &gt; ${title}</p>`)
            .replace(/<img src=".*" alt="記事のメイン画像".*>/, `<img src="${imagePath}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg mb-12">`)
            .replace(/<div class="article-content text-gray-800">[\s\S]*?<\/div>/, `<div class="article-content text-gray-800">${contentHtml}</div>`);

        await fs.writeFile(newArticleFilePath, newArticleContent);
        console.log(`✅ 記事を作成しました: ${newArticleFilePath}`);

        // 2. column.htmlを更新
        const columnHtml = await fs.readFile(columnPath, 'utf-8');

        const newColumnEntry = `
                    <!-- コラム記事 -->
                    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                        <a href="articles/${newArticleFileName}" class="block group">
                            <img src="${imagePath.replace('../', '')}" alt="${title}" class="w-full h-48 object-cover group-hover:opacity-80 transition-opacity">
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
        console.log(`✅ コラム一覧を更新しました: ${columnPath}`);

    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
    }
}

createArticle();
