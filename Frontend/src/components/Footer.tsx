import background from "../assets/mobile-footer.svg";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa";
type FooterProps = {
  hasBottomMargin?: boolean;
};
const Footer = ({ hasBottomMargin = false }: FooterProps) => {
  return (
    <footer
      className={`flex align-middle text-white relative bg-cover bg-center py-1 flex-col ${
        hasBottomMargin ? "mb-37 md:mb-0" : ""
      }`}
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="w-full xl:flex xl:justify-center">
        <ul className="px-3 pt-1 pb-1 flex flex-wrap justify-between items-start w-full max-w-5xl ">
          {/* Om oss */}
          <li className="flex flex-col">
            <h3 className="font-bold text-[15px] md:text-[24px]">Om oss</h3>
            <p className="text-white md:text-[16px] text-[10px] font-light cursor-pointer hover:underline">
              Om oss
            </p>
          </li>

          {/* Utforska */}
          <div className=" flex-col gap-2">
            <h3 className="font-bold text-[15px] md:text-[24px]">Utforska</h3>
            <ul className="flex flex-col md:text-[16px] text-[10px] gap-1 text-white cursor-pointer">
              <li className="hover:underline">Boende</li>
              <li className="hover:underline">Aktiviteter</li>
              <li className="hover:underline">Populära områden</li>
              <li className="hover:underline">Hundvänligt resande</li>
            </ul>
          </div>

          {/* Hjälp */}
          <li className="flex flex-col">
            <h3 className="font-bold text-[15px] md:text-[24px]">Hjälp</h3>
            <ul className="flex flex-col gap-0 md:text-[16px] text-[10px] text-white font-light cursor-pointer">
              <li className="hover:underline">FAQ</li>
              <li className="hover:underline">Kontakta oss</li>
              <li className="hover:underline">Villkor och integritet</li>
            </ul>
          </li>

          {/* Håll kontakten */}
          <li className="flex flex-col gap-2">
            <h3 className="font-bold text-[15px] md:text-[24px]">
              Håll kontakten
            </h3>
            <p className="text-white md:text-[16px] text-[10px] font-light hover:underline cursor-pointer">
              Nyhetsbrev
            </p>
            <ul className="flex gap-1 mt-2 text-white">
              <li>
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-500 transition"
                >
                  <FaInstagram size={25} />
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-500 transition"
                >
                  <FaFacebook size={25} />
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition"
                >
                  <FaTiktok size={25} />
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition"
                >
                  <FaTwitter size={25} />
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div className="mt-2 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Naturly. Alla rättigheter reserverade.
      </div>
    </footer>
  );
};

export default Footer;
