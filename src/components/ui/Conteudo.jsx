// src/components/ui/Conteudo.jsx
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { CaretRight, CaretLeft, Gear, Plus, Minus, Lock } from "phosphor-react"; // ajuste ícones se não usar phosphor

export default function Conteudo() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("descricao");
  const [openModule, setOpenModule] = useState(null);

  // Dados simulados
  const curso = {
    title: "Introdução a Finanças Pessoais",
    progress: 30, // em %
    modules: [
      { id: 1, title: "Boas Vindas", lessons: ["Boas Vindas"], locked: false },
      {
        id: 2,
        title: "Prosperidade Financeira",
        lessons: ["Prosperidade Financeira"],
        locked: false,
      },
      {
        id: 3,
        title: "Investimentos",
        lessons: ["Investimentos"],
        locked: false,
      },
      {
        id: 4,
        title: "Bônus: Dicionário das Finanças",
        lessons: ["Dicionário das Finanças"],
        locked: false,
      },
      {
        id: 5,
        title: "Encerramento + E‑book",
        lessons: ["Encerramento + E‑book"],
        locked: false,
      },
      {
        id: 6,
        title: "Prova",
        lessons: [],
        locked: true,
        note: "Conclua os módulos para liberar.",
      },
      {
        id: 7,
        title: "Certificado",
        lessons: [],
        locked: true,
        note: "Bloqueado",
      },
    ],
  };

  // Escolhendo a “aula atual” pelo id (simulado)
  const currentModule =
    curso.modules.find((m) => m.id === Number(id)) || curso.modules[0];
  const currentLesson = currentModule.lessons[0] || "Sem aulas";

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="max-w-7x1 mx-auto px-4 py-8 grid grid-cols-[1fr,300px] gap-9">
        <nav className="text-sm text-gray-600 mb-4">
          <Link to="/dashboard" className="hover:underline">
            Início
          </Link>
          <span className="mx-2">▸</span>
          <Link to="/conteudo" className="hover:underline">
            Conteúdos
          </Link>
          <span className="mx-2">▸</span>
          <span className="font-semibold">{currentLesson}</span>
        </nav>

        <div className="flex flex-1 space-x-8 ">
          {/* Main area (player + footer + tabs) */}
          <div className="flex-1 flex flex-col ">
            {/* Vídeo */}
            <div className="bg-black rounded-lg  overflow-hidden shadow w-[1000px]">
              <video
                src="https://www.w3schools.com/html/mov_bbb.mp4" // placeholder
                controls
                className="w-full h-[500px] bg-black"
              />
            </div>

            {/* Rodapé do player */}
            <div className="mt-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{currentLesson}</h2>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
                  Avalie essa aula
                </button>
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                  <CaretLeft />
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Concluir
                </button>
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                  <CaretRight />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6">
              <div className="flex border-b">
                <button
                  className={`px-4 py-2 -mb-px ${
                    activeTab === "descricao"
                      ? "border-b-2 border-green-500 text-green-500"
                      : "text-gray-600"
                  }`}
                  onClick={() => setActiveTab("descricao")}
                >
                  Descrição
                </button>
                <button
                  className={`px-4 py-2 -mb-px ${
                    activeTab === "comentarios"
                      ? "border-b-2 border-green-500 text-green-500"
                      : "text-gray-600"
                  }`}
                  onClick={() => setActiveTab("comentarios")}
                >
                  Comentários (0)
                </button>
              </div>
              <div className="p-4">
                {activeTab === "descricao" ? (
                  <p className="text-gray-700">
                    Aqui vai a <strong>descrição</strong> da aula. Você pode
                    colocar texto, links, imagens, etc.
                  </p>
                ) : (
                  <p className="text-gray-500">Ainda não há comentários.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-80 border-l pl-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{curso.title}</h3>
              <button>
                <Gear size={20} />
              </button>
            </div>
            <div className="mb-4">
              <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${curso.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {curso.progress}% concluído
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {curso.modules.map((mod) => (
                <div key={mod.id} className="border rounded-lg">
                  <button
                    className="w-full flex items-center justify-between px-4 py-2 text-left"
                    onClick={() =>
                      setOpenModule(openModule === mod.id ? null : mod.id)
                    }
                  >
                    <span>{mod.title}</span>
                    <div className="flex items-center space-x-2">
                      {mod.locked && <Lock className="w-4 h-4 text-gray-400" />}
                      {!mod.locked &&
                        (openModule === mod.id ? <Minus /> : <Plus />)}
                    </div>
                  </button>
                  {openModule === mod.id && !mod.locked && (
                    <ul className="px-6 pb-2 space-y-1">
                      {mod.lessons.map((lesson, i) => (
                        <li
                          key={i}
                          className={`py-1 ${
                            lesson === currentLesson
                              ? "text-green-500 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  )}
                  {openModule === mod.id && mod.locked && (
                    <p className="px-6 pb-2 text-sm text-gray-500">
                      {mod.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
