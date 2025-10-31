import React from 'react';
import { jsPDF } from 'jspdf';
import { Download, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Configuração de horas por curso (ordem dos IDs no banco)
const COURSE_HOURS = {
  "Gestão de Carreira": "18",
  "Autoconhecimento para Aceleração de Carreiras": "23",
  "Introdução a Finanças Pessoais": "25",
  "Auto Análise e Foco em Metas": "18",
  "Mentoria de Empregabilidade": "24",
};

// Função para obter horas do curso
const getCourseHours = (courseName) => {
  return COURSE_HOURS[courseName] || "08";
};

export const Certificate = ({ userName, courseName, completionDate, trilhaId, courseHours }) => {
  const hours = courseHours || getCourseHours(courseName);

  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Carregar logo
    let logoData = null;
    try {
      const response = await fetch('/gskills_logo_final.png');
      const blob = await response.blob();
      logoData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Não foi possível carregar o logo:', error);
    }

    // Carregar assinatura
    let signatureData = null;
    try {
      const response = await fetch('/assets/assinatura-samantha.png');
      const blob = await response.blob();
      signatureData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Não foi possível carregar a assinatura:', error);
    }

    // Fundo branco
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Borda dupla
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // Logo no canto superior esquerdo
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', 20, 20, 30, 20);
      } catch (error) {
        console.warn('Erro ao adicionar logo:', error);
      }
    }

    // Título "CERTIFICADO"
    doc.setFontSize(28);
    doc.setTextColor(25, 60, 45);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO', pageWidth / 2, 50, { align: 'center' });

    // "Certificamos que"
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text('Certificamos que', pageWidth / 2, 65, { align: 'center' });

    // Nome do usuário
    doc.setFontSize(24);
    doc.setTextColor(25, 60, 45);
    doc.setFont('helvetica', 'bold');
    doc.text(userName, pageWidth / 2, 80, { align: 'center' });

    // Linha sob o nome
    doc.setDrawColor(139, 195, 74);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 50, 82, pageWidth / 2 + 50, 82);

    // Texto descritivo
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('concluiu com êxito o curso', pageWidth / 2, 95, { align: 'center' });

    // Nome do curso (COM DESTAQUE)
    doc.setFontSize(20);
    doc.setTextColor(25, 60, 45);
    doc.setFont('helvetica', 'bold');
    const courseLines = doc.splitTextToSize(courseName, pageWidth - 80);
    let courseY = 110;
    courseLines.forEach((line, index) => {
      doc.text(line, pageWidth / 2, courseY + (index * 8), { align: 'center' });
    });

    // Descrição do programa
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    const descY = courseY + (courseLines.length * 8) + 10;
    doc.text('do Programa TalentSkills, da AgroSkills - Aceleradora de Carreiras no Agronegócio,', pageWidth / 2, descY, { align: 'center' });
    doc.text(`realizado em ${completionDate}, perfazendo a carga horária de ${hours} horas.`, pageWidth / 2, descY + 6, { align: 'center' });

    // Assinatura
    const signatureY = pageHeight - 50;

    if (signatureData) {
      try {
        doc.addImage(signatureData, 'PNG', pageWidth / 2 - 20, signatureY - 12, 40, 12);
      } catch (error) {
        console.warn('Erro ao adicionar assinatura:', error);
      }
    }

    // Linha da assinatura
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 35, signatureY, pageWidth / 2 + 35, signatureY);

    // Nome do signatário
    doc.setFontSize(12);
    doc.setTextColor(25, 60, 45);
    doc.setFont('helvetica', 'bold');
    doc.text('Samantha Andrade', pageWidth / 2, signatureY + 6, { align: 'center' });

    // Cargo
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text('COO - AgroSkills', pageWidth / 2, signatureY + 11, { align: 'center' });

    // Salvar
    const fileName = `CERTIFICADO-AGROSKILLS-${userName.replace(/\s/g, '-').toUpperCase()}-${courseName.replace(/\s/g, '-')}.pdf`;
    doc.save(fileName);
  };

  return (
    <Card className="bg-white border-gray-200 hover:animate-pulse">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Award className="w-16 h-16 text-green-500" />
          </div>

          <h3 className="text-2xl font-bold text-black mb-2">
            Parabéns! Curso Concluído
          </h3>

          <p className="text-black mb-6 max-w-md">
            Você completou todas as aulas. Seu certificado está pronto para download.
          </p>

          <div className="flex items-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">100% Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Carga horária: {hours}h</span>
            </div>
          </div>

          <Button
            onClick={generatePDF}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Certificado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const CertificatePreview = ({ userName, courseName, completionDate }) => {
  return (
    <div className="w-full aspect-[1.414/1] bg-white border-4 border-green-500 rounded-lg shadow-2xl p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-500 rounded-full"></div>
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">AgroSkills</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Certificado de Conclusão</h2>
          <div className="w-32 h-1 bg-green-500 mx-auto mt-3"></div>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-gray-600 text-lg">Certificamos que</p>
          <p className="text-3xl font-bold text-green-600">{userName}</p>
          <p className="text-gray-600 text-lg">concluiu com êxito o curso</p>
          <p className="text-2xl font-bold text-gray-800 px-8">{courseName}</p>
        </div>

        <p className="text-gray-500 text-sm mb-8">Concluído em {completionDate}</p>

        <div className="border-t-2 border-gray-400 pt-2 px-12">
          <p className="text-sm text-gray-600">AgroSkills - Plataforma de Aprendizagem</p>
        </div>

        <Award className="absolute bottom-8 right-8 w-16 h-16 text-green-200" />
      </div>
    </div>
  );
};
