import { Outlet, useLocation } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Providers from "@/components/Providers";
import Modal from "react-modal";
const RootLayout = () => {
  Modal.setAppElement("#root");
  const location = useLocation();
  const isHousingDetails = location.pathname.startsWith("/house/"); // Check if on HousingDetails page
  return (
    // max-w-max
    <Providers>
      <div
        id="root"
        className="flex flex-col min-h-screen mx-auto my-0 w-full font-[League_Spartan] font-normal bg-[#F4F4F4]"
      >
        <Navbar />
        <main className="flex-1 min-h-screen">
          <Outlet />
        </main>
      <Footer hasBottomMargin={isHousingDetails}/> {/* Pass prop to Footer */}
      </div>
    </Providers>
  );
};
export default RootLayout;
