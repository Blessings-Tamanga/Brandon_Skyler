import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Script from 'next/script';

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'public', 'index.html');
  const html = fs.readFileSync(filePath, 'utf8');

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  const title = titleMatch ? titleMatch[1].trim() : 'Brandon Sklenar';
  let bodyHtml = bodyMatch ? bodyMatch[1] : html;

  // Prevent duplicate script execution; Next injects app.js below.
  bodyHtml = bodyHtml.replace(/<script[^>]*src=["'](?:\/)?js\/app\.js["'][^>]*><\/script>/gi, '');

  return {
    props: {
      title,
      bodyHtml
    }
  };
}

export default function Home({ title, bodyHtml }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link rel="stylesheet" href="/css.css" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script src="/js/app.js" strategy="afterInteractive" />
    </>
  );
}
