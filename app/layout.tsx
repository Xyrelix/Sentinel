import "./globals.css";

export const metadata = {
  title: "Sentinel",
  description: "Pre-signature transaction protection platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
