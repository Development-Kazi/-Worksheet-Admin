import { Rubik } from "next/font/google";
import "../globals.css";
import "bootstrap/dist/css/bootstrap.css";
const rubik = Rubik({ subsets: ["latin"] });

export const metadata = {
  title: "Worksheet",
  description: "Worksheet",
  keywords: ["Worksheet"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={rubik.className} data-background-color="">
        {children}
      </body>
    </html>
  );
}
