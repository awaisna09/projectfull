import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../App';
import { 
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  CheckSquare,
  Calculator,
  BarChart3,
  Settings,
  LogOut,
  Globe
} from 'lucide-react';

const translations = {
  en: {
    title: "Mock Exam Selection",
    backToDashboard: "Back to Dashboard",
    selectPaper: "Select Your Paper",
    paper1: "Paper 1",
    paper2: "Paper 2",
    duration: "Duration",
    format: "Format",
    weightage: "Weightage",
    marks: "Marks",
    questions: "Questions",
    assessment: "Assessment",
    startExam: "Start Exam",
    paper1Description: "Short Answer and Data Response",
    paper2Description: "Case Study",
    paper1Details: "Four questions requiring a mixture of short answers and structured data responses",
    paper2Details: "Four questions based on a case study, provided as an insert with the paper",
    candidatesAnswer: "Candidates answer all questions",
    externallyAssessed: "Externally assessed",
    hour30: "1 hour 30 minutes",
    percentage50: "50%",
    marks80: "80 marks"
  }
};

export function MockExamSelection() {
  const {setCurrentPage} = useApp();
  const t = translations.en;

  const handlePaperSelection = (paper: 'p1' | 'p2') => {
    if (paper === 'p1') {
      setCurrentPage('mock-exam');
    } else {
      // For Paper 2, you can redirect to a different page or show a message
      setCurrentPage('mock-exam-p2');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="border-b shadow-sm backdrop-blur-md sticky top-0 z-40" style={{ background: 'linear-gradient(90deg, rgba(155,77,255,0.12), rgba(255,77,145,0.1), rgba(255,108,108,0.1))', borderColor: 'rgba(155,77,255,0.2)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage('dashboard')}
                className="rounded-xl px-4 py-2 transition-all duration-300"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, rgba(155,77,255,0.15), rgba(255,77,145,0.15), rgba(255,108,108,0.15))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToDashboard}
              </Button>
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-3xl font-bold" style={{ color: '#FF7FA3' }}>
                  {t.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('settings')} className="hover:bg-gray-100/80 transition-colors">
                <Settings className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={() => {
                localStorage.removeItem('imtehaan_current_page');
                setCurrentPage('landing');
              }} className="hover:bg-gray-100/80 transition-colors">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
        <div className="text-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-semibold mb-3" style={{ color: '#FF7FA3' }}>{t.selectPaper}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            Choose between Paper 1 (Short Answer and Data Response) or Paper 2 (Case Study) to begin your mock exam.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto flex-1 min-h-0">
          {/* Paper 1 */}
          <Card className="border-2 border-gray-200 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full" style={{ borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(255, 77, 145, 0.15), 0 4px 6px -2px rgba(255, 77, 145, 0.1)' }}>
            <CardHeader className="pb-4 bg-black" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <CardTitle className="text-xl flex items-center gap-3" style={{ color: '#FFB6C1' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
                  <Calculator className="h-5 w-5" style={{ color: '#FFB6C1' }} />
                </div>
                {t.paper1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col pt-5">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{t.duration}:</span>
                    <span className="text-gray-600">{t.hour30}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{t.marks}:</span>
                    <span className="text-gray-600">{t.marks80}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{t.weightage}:</span>
                    <span className="text-gray-600">{t.percentage50}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{t.questions}:</span>
                    <span className="text-gray-600">4</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg border" style={{ background: 'linear-gradient(90deg, rgba(155,77,255,0.08), rgba(255,77,145,0.08), rgba(255,108,108,0.08))', borderColor: 'rgba(155,77,255,0.2)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#9B4DFF' }}>{t.format}</h4>
                    <p className="text-sm" style={{ color: '#9B4DFF' }}>{t.paper1Description}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-sm">{t.paper1Details}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckSquare className="h-4 w-4" style={{ color: '#9B4DFF' }} />
                    <span>{t.candidatesAnswer}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckSquare className="h-4 w-4" style={{ color: '#9B4DFF' }} />
                    <span>{t.externallyAssessed}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => handlePaperSelection('p1')}
                className="w-full bg-black hover:opacity-90 text-white py-3 text-base font-medium transition-all duration-300 mt-auto"
              >
                <FileText className="h-5 w-5 mr-2 inline" style={{ color: '#FF4D91' }} />
                {t.startExam} - {t.paper1}
              </Button>
            </CardContent>
          </Card>

          {/* Paper 2 */}
          <Card className="border-2 border-gray-200 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full" style={{ borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(255, 77, 145, 0.15), 0 4px 6px -2px rgba(255, 77, 145, 0.1)' }}>
            <CardHeader className="pb-4 bg-black" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <CardTitle className="text-xl flex items-center gap-3" style={{ color: '#FFB6C1' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
                  <FileText className="h-5 w-5" style={{ color: '#FFB6C1' }} />
                </div>
                {t.paper2}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col pt-5">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{t.duration}:</span>
                    <span className="text-gray-600">{t.hour30}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{t.marks}:</span>
                    <span className="text-gray-600">{t.marks80}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{t.weightage}:</span>
                    <span className="text-gray-600">{t.percentage50}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{t.questions}:</span>
                    <span className="text-gray-600">4</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg border" style={{ background: 'linear-gradient(90deg, rgba(255,77,145,0.08), rgba(255,108,108,0.08), rgba(155,77,255,0.08))', borderColor: 'rgba(255,77,145,0.2)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#FF4D91' }}>{t.format}</h4>
                    <p className="text-sm" style={{ color: '#FF4D91' }}>{t.paper2Description}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-sm">{t.paper2Details}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckSquare className="h-4 w-4" style={{ color: '#FF4D91' }} />
                    <span>{t.candidatesAnswer}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckSquare className="h-4 w-4" style={{ color: '#FF4D91' }} />
                    <span>{t.externallyAssessed}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => handlePaperSelection('p2')}
                className="w-full bg-black hover:opacity-90 text-white py-3 text-base font-medium transition-all duration-300 mt-auto"
              >
                <FileText className="h-5 w-5 mr-2 inline" style={{ color: '#FF4D91' }} />
                {t.startExam} - {t.paper2}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}