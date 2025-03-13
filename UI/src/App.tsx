import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import MinutesFrame from "./pages/MinutesFrame";
import MeetingsFrame from "./pages/MeetingsFrame";
import UploadTest from "./components/UploadTest"; 
import { MeetingProvider } from './context/MeetingContext';
import "./global.css";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
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

  useEffect(() => {
    document.title = "Meeting Minutes";
  }, []);

  return (
    <MeetingProvider>
      <Routes>
        <Route path="/" element={<MinutesFrame />} />
        <Route path="/meetings" element={<MeetingsFrame />} />
        <Route path="/upload-test" element={<UploadTest />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </MeetingProvider>
  );
}

export default App;
