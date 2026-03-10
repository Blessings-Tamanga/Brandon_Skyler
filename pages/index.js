import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Script from 'next/script';

export async function getServerSideProps() {
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
      </Head>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script src="/js/app.js" strategy="afterInteractive" />
    </>
  );
}
