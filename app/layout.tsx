import { SocketProvider } from "@/components/SocketProvider";
import { TailwindIndicator } from "@/components/TailwindIndicator";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@/styles/globals.css";

export const metadata = {
  title: "Chillout App",
  description: "Hang out with friends",
  icons: {
    icon: "/chillout-title.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="">
        <SocketProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="">{children}</main>
            <TailwindIndicator />
          </ThemeProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
