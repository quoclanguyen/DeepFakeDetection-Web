import {ReactNode} from "react";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

interface HomeLayoutProps {
  children: ReactNode;
}
function HomeLayout(props: HomeLayoutProps) {
  return (
    <div className="w-[calc(100vw-15px)] h-full bg-gray-200">
      <Header/>
      <main className="min-h-screen h-full">{props.children}</main>
      <Footer />
    </div>
  );
}

export default HomeLayout;
