export const metadata = {
  title: "Deluxe Coffeeworks — Orders",
  description: "Simple order page (no payment).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", padding: "20px" }}>
        {children}
      </body>
    </html>
  );
}
