import React, { ReactNode } from 'react';
import Head from 'next/head';

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<Props> = ({
  children,
  title = 'Xbox Sale Predictor',
  description = 'Predict when Xbox games will go on sale',
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        {/* Navigation */}
        <nav className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                <h1 className="text-xl font-bold text-xbox-green-light">Xbox Sale Predictor</h1>
              </div>
              <div className="flex gap-4">
                <a href="/" className="hover:text-xbox-green-light transition">
                  Home
                </a>
                <a href="/search" className="hover:text-xbox-green-light transition">
                  Search
                </a>
                <a href="/trending-deals" className="hover:text-xbox-green-light transition">
                  Trending
                </a>
                <a href="/upcoming-sales" className="hover:text-xbox-green-light transition">
                  Upcoming
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

        {/* Footer */}
        <footer className="bg-dark-800 border-t border-dark-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-dark-400">
              © 2026 Xbox Sale Predictor. Made with ❤️ for gamers.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
