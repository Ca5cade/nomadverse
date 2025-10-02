import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";

export default function CertificatePage() {
  const { width, height } = useWindowSize();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUsername(user.username || "Student");
  }, []);

  const handleDownload = () => {
    const certificate = document.getElementById("certificate");
    if (certificate) {
      html2canvas(certificate).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "landscape" });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("certificate.pdf");
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-text-primary font-serif">
      <Confetti width={width} height={height} />
      <div id="certificate" className="bg-certificate-bg bg-cover bg-center border-8 border-double border-accent-gold p-10 rounded-lg shadow-lg text-center w-[800px] h-[600px] flex flex-col justify-center items-center relative">
        <div className="absolute top-8 right-8 w-24 h-24">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#ffd700" stroke="#b8860b" strokeWidth="2" />
            <text x="50" y="55" textAnchor="middle" fontSize="12" fill="#b8860b" fontWeight="bold">Official Seal</text>
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-accent-gold mb-4" style={{ fontFamily: 'Merriweather' }}>Certificate of Completion</h1>
        <p className="text-2xl mb-2" style={{ fontFamily: 'Merriweather' }}>This is to certify that</p>
        <h2 className="text-6xl font-bold mb-4" style={{ fontFamily: 'Great Vibes' }}>{username}</h2>
        <p className="text-2xl mb-6" style={{ fontFamily: 'Merriweather' }}>has successfully completed the</p>
        <h3 className="text-3xl font-bold text-accent-blue" style={{ fontFamily: 'Merriweather' }}>NomadVerse Introduction to Robotics Course</h3>
      </div>
      <Button onClick={handleDownload} className="mt-8">
        <Download className="w-4 h-4 mr-2" />
        Download Certificate
      </Button>
    </div>
  );
}
