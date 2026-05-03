import { Rubik } from "next/font/google";
import "bootstrap/dist/css/bootstrap.css";
import "../globals.css";
import Header from "@/component/Header";
import Sidebar from "@/component/Sidebar";
import { UserProvider } from "@/context/UserContext";
import { LoaderProvider } from "@/context/LoaderProvider";
const rubik = Rubik({ subsets: ["latin"] });

export const metadata = {
  title: "Worksheet",
  description: "Worksheet",
  keywords: ["Worksheet"],
};

export default function RootLayout({ children }) {
  return (
    <UserProvider>
      <html lang="en">
        <head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.datatables.net/2.1.6/css/dataTables.dataTables.css"
          />
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body className={`${rubik.className}`} data-background-color="">
          <div className="wrapper">
            <Sidebar />
            <div className="main-panel overflow-x-hidden">
              <Header />
              <LoaderProvider>{children}</LoaderProvider>
            </div>
          </div>
        </body>

        {/* <script
        async
        src="https://cdn.datatables.net/2.1.2/js/dataTables.min.js"
      ></script> */}
        {/* <script
        async
        src="https://cdn.datatables.net/2.1.2/js/dataTables.bootstrap4.min.js"
      ></script> */}
      </html>
    </UserProvider>
  );
}
