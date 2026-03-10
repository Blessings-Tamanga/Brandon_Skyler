import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link rel="stylesheet" href="/css.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SUPABASE__ = ${JSON.stringify({
              url: process.env.SUPABASE_URL || '',
              anonKey: process.env.SUPABASE_ANON_KEY || ''
            })};`
          }}
        />
        <script
          src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.6/dist/umd/supabase.min.js"
          defer
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
