import { useEffect } from "react";
import toast from "react-hot-toast";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { AboutEvent } from "../content-folders/About/About";

export const About = () => {
  // useEffect(() => {
  //   toast.success("Welcome to the About Page 🎉");
  // }, []);

  return (
    <div>
      <Navbar />
      <AboutEvent />
      <Footer />
    </div>
  );
};
