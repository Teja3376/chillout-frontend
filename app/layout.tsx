import { SocketProvider } from "@/components/SocketProvider";
import { TailwindIndicator } from "@/components/TailwindIndicator";
import "@/styles/globals.css";

export const metadata = {
  title: "Chillout App",
  description: "Hang out with friends",
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
          <main className="">{children}</main>
          <TailwindIndicator />
        </SocketProvider>
      </body>
    </html>
  );
}
