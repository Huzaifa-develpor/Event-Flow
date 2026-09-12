import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "EventFlow - Digital Prestige Management",
  description: "Create experiences people remember.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#07080A] text-white font-sans min-h-screen flex flex-col justify-between overflow-x-hidden antialiased">
        {/* Background Grid Pattern */}
        <div
          className="fixed inset-0 z-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Global Luminous Gradients */}
        <div className="fixed top-[10%] right-[10%] w-[450px] h-[450px] bg-purple-600/30 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="fixed bottom-[15%] left-[5%] w-[380px] h-[380px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Fixed Top Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        {/* Dynamic Page Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center pt-20">
          {children}
        </div>

        {/* Fixed Bottom Footer */}
        <Footer />
      </body>
    </html>
  );
}
