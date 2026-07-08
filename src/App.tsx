import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import InterviewPractice from "@/pages/InterviewPractice";
import TextInterview from "@/pages/TextInterview";
import VoiceInterview from "@/pages/VoiceInterview";
import VideoInterview from "@/pages/VideoInterview";
import Results from "@/pages/Results";
import QuestionBank from "@/pages/QuestionBank";
import Training from "@/pages/training/Training";
import SelfIntro from "@/pages/training/SelfIntro";
import ResumeQuestions from "@/pages/training/ResumeQuestions";
import PressureInterview from "@/pages/training/PressureInterview";
import GroupInterview from "@/pages/training/GroupInterview";
import Growth from "@/pages/Growth";
import ParticleBackground from "@/components/ParticleBackground";

export default function App() {
  return (
    <Router>
      <ParticleBackground />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview-practice" element={<InterviewPractice />} />
        <Route path="/interview/text" element={<TextInterview />} />
        <Route path="/interview/voice" element={<VoiceInterview />} />
        <Route path="/interview/video" element={<VideoInterview />} />
        <Route path="/results" element={<Results />} />
        <Route path="/question-bank" element={<QuestionBank />} />
        <Route path="/training" element={<Training />} />
        <Route path="/training/self-intro" element={<SelfIntro />} />
        <Route path="/training/resume-questions" element={<ResumeQuestions />} />
        <Route path="/training/pressure-interview" element={<PressureInterview />} />
        <Route path="/training/group-interview" element={<GroupInterview />} />
        <Route path="/growth" element={<Growth />} />
      </Routes>
    </Router>
  );
}
