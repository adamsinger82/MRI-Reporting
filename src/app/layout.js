export const metadata = {
  title: "AI-Powered MSK Radiology Assistant",
  description: "MSK Radiology AI Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin:0, padding:0, background:"#0d1117" }}>{children}</body>
    </html>
  );
}
