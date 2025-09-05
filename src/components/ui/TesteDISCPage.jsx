import Navbar from "@/components/ui/Navbar.jsx";

const TesteDISCPage = () => {
  const token = localStorage.getItem("token");

  return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <iframe
            className="w-full"
            style={{ height: "100vh" }}
            src={`https://app.agroskills.com.br/api/relatorios/${token}`}
        />
      </div>
  );
};

export default TesteDISCPage;
