import fs from "fs"
import path from "path"
import Head from "next/head"
import Script from "next/script"

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "public", "index.html")
  const html = fs.readFileSync(filePath, "utf8")

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)

  const title = titleMatch ? titleMatch[1].trim() : "Brandon Sklenar"
  let bodyHtml = bodyMatch ? bodyMatch[1] : html

  bodyHtml = bodyHtml.replace(/<script[^>]*src=["'](?:\/)?js\/app\.js["'][^>]*><\/script>/gi, "")

  return {
    props: {
      title,
      bodyHtml
    },
    revalidate: 60
  }
}

export default function Home({ title, bodyHtml }) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />

     <Script src="/js/app.js" strategy="afterInteractive" />
    </>
  )
}