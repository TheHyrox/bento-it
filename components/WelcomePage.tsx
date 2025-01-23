import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MenuBar from './Menubar';

interface BentoBlockProps {
  children: React.ReactNode;
  width?: number;  // units
  height?: number; // units
}

const BentoBlock: React.FC<BentoBlockProps> = ({ children, width = 1, height = 1 }) => {
  return (
    <div 
      className="border border-[var(--foreground)] rounded-lg flex items-center justify-center text-[var(--foreground)] opacity-80"
      style={{
        width: calculateSize(width),
        height: calculateSize(height)
      }}
    >
      {children}
    </div>
  );
};

const BASE_UNIT = 200; // Can be changed via prop
const GAP = 16;

const calculateSize = (units: number) => {
  return units * BASE_UNIT + ((units - 1) * GAP);
};

const WelcomePage = () => {
  return (
    <>
      <MenuBar />

      <div className="min-h-screen bg-[var(--background)]">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-[var(--foreground)] mb-6">
              Create Your Perfect Digital Space
            </h1>
            <p className="text-xl text-[var(--foreground)] opacity-80 mb-8 max-w-3xl mx-auto">
              Design your personal page with our intuitive bento-style layout. 
              Showcase your content, projects, and links in a beautiful, customizable grid.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/auth/register" 
                className="bg-[var(--foreground)] text-[var(--background)] px-8 py-3 rounded-lg hover:opacity-90 transition"
              >
                Get Started
              </Link>
              <Link 
                href="#demo" 
                className="bg-[var(--background)] text-[var(--foreground)] px-8 py-3 rounded-lg border-2 border-[var(--foreground)] hover:opacity-80 transition"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[var(--foreground)]">See It In Action</h2>
            <div className="bg-[var(--background)] p-8">
              <div className="grid gap-4 w-full max-w-[800px] mx-auto"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `${BASE_UNIT}px ${BASE_UNIT}px ${BASE_UNIT}px ${BASE_UNIT}px`,
                  gridTemplateAreas: `
                    "one two two three"
                    "four four four three"
                    "four four four three"
                    "five five five six"
                    "five five five six"
                  `,
                  gridAutoRows: `${BASE_UNIT}px`
                }}
              >
                {/* 1:1 */}
                <div style={{ gridArea: 'one' }}>
                  <BentoBlock width={1} height={1}>
                    <p>This is a 1:1 block</p>
                  </BentoBlock>
                </div>
                
                {/* 2:1 */}
                <div style={{ gridArea: 'two' }}>
                  <BentoBlock width={2} height={1}>2:1</BentoBlock>
                </div>
                
                {/* 1:3 */}
                <div style={{ gridArea: 'three' }}>
                  <BentoBlock width={1} height={3}>1:3</BentoBlock>
                </div>
                
                {/* 2:2 */}
                <div style={{ gridArea: 'four' }}>
                  <BentoBlock width={2} height={2}>
                    <Image 
                      src="/pictures/suisse.png"
                      alt="Switzerland flag"
                      width={calculateSize(2)}
                      height={calculateSize(2)}
                      className="object-cover rounded-lg"
                    />
                  </BentoBlock>
                </div>
                
                {/* 3:2 */}
                <div style={{ gridArea: 'five' }}>
                  <BentoBlock width={3} height={2}>3:2</BentoBlock>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[var(--foreground)]">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border border-[var(--foreground)] bg-neutral-800">
                <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)] ">Customizable Layout</h3>
                <p className="text-[var(--foreground)] opacity-80">
                  Drag and resize blocks to create your perfect layout. Add text, images, links, and more.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-[var(--foreground)] bg-neutral-800">
                <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Personal URL</h3>
                <p className="text-[var(--foreground)] opacity-80">
                  Get your own custom URL with bento.it/[username]. Create multiple pages for different purposes.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-[var(--foreground)] bg-neutral-800">
                <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Easy to Use</h3>
                <p className="text-[var(--foreground)] opacity-80">
                  No coding required. Our visual editor makes it simple to create and update your page.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Specifications Section */}
        <section id="specs" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[var(--foreground)]">Technical Specs</h2>
            <div className="grid md:grid-cols-2 gap-8 ">
              <div className="border border-[var(--foreground)] p-6 rounded-lg bg-neutral-800">
                <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Content Types</h3>
                <ul className="space-y-2 text-[var(--foreground)] opacity-80">
                  <li>• Text blocks with rich formatting</li>
                  <li>• Image galleries and media</li>
                  <li>• External and internal links</li>
                  <li>• Custom embedding support</li>
                </ul>
              </div>
              <div className="border border-[var(--foreground)] p-6 rounded-lg bg-neutral-800">
                <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Customization</h3>
                <ul className="space-y-2 text-[var(--foreground)] opacity-80">
                  <li>• Flexible grid layouts</li>
                  <li>• Custom color schemes</li>
                  <li>• Multiple block sizes</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default WelcomePage;