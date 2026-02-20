import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: 'Documentation - Flowryd',
  description: 'Complete documentation for the Flowryd platform — authentication, flows, deals, API reference, and more.',
}

const navbar = (
  <Navbar
    logo={
      <span style={{ fontWeight: 700, fontSize: 16 }}>
        Flowryd Docs
      </span>
    }
    projectLink="https://github.com/will8998/flowryd-dapp"
  />
)

const footer = (
  <Footer>
    <span>© {new Date().getFullYear()} Flowryd. All rights reserved.</span>
  </Footer>
)

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Head>
        <meta name="theme-color" content="#020202" />
      </Head>
      <Layout
        navbar={navbar}
        pageMap={await getPageMap('/documentation')}
        footer={footer}
        editLink=""
        feedback={{ content: null }}
        sidebar={{ defaultMenuCollapseLevel: 1 }}
        darkMode={false}
        nextThemes={{ forcedTheme: 'dark' }}
      >
        {children}
      </Layout>
    </>
  )
}
