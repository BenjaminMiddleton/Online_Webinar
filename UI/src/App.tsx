import React from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import MinutesFrame from "./pages/MinutesFrame";
import MeetingsFrame from "./pages/MeetingsFrame";
import UploadTest from "./components/UploadTest"; // Import the test component

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  React.useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  React.useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "Minutes Frame";
        metaDescription = "View and manage your minutes.";
        break;
      case "/meetings":
        title = "Meetings Frame";
        metaDescription = "View and manage your meetings.";
        break;
      case "/action-points":
        title = "Action Points";
        metaDescription = "Manage your action points.";
        break;
      case "/upload-test":
        title = "Upload Test";
        metaDescription = "Test file upload functionality.";
        break;
      default:
        title = "Minutes Frame";
        metaDescription = "View and manage your minutes.";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag: HTMLMetaElement | null = document.querySelector(
        'head > meta[name="description"]'
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<MinutesFrame />} />
      <Route path="/meetings" element={<MeetingsFrame />} />
      <Route path="/upload-test" element={<UploadTest />} />
    </Routes>
  );
}

export default App;
