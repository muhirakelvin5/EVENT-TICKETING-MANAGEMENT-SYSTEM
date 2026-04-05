import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { EventDetailsPage } from "../content-folders/Events/EventsDetails";

export const Events = () => {


  return (
    <div>
      <Navbar />
      <EventDetailsPage />
      <Footer />
    </div>
  );
};
