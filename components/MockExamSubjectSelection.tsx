import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../App';
import { Badge } from './ui/badge';
import { 
  ArrowLeft,
  BookOpen,
  Lock,
  CheckCircle,
  Settings,
  LogOut,
  GraduationCap,
  Calculator,
  FlaskConical,
  Globe,
  Code,
  Music,
  Palette,
  Languages
} from 'lucide-react';

const translations = {
  en: {
    title: "Select Subject",
    backToDashboard: "Back to Dashboard",
    selectSubject: "Choose Your Subject",
    description: "Select a subject to access mock exams. Currently, only Business Studies is available.",
    comingSoon: "Coming Soon",
    available: "Available",
    businessStudies: "Business Studies",
    mathematics: "Mathematics",
    science: "Science",
    english: "English Language",
    computerScience: "Computer Science",
    music: "Music",
    art: "Art & Design",
    languages: "Languages",
    continue: "Continue"
  }
};

interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
  description: string;
}

export function MockExamSubjectSelection() {
  const { setCurrentPage } = useApp();
  const t = translations.en;

  const subjects: Subject[] = [
    {
      id: 'business-studies',
      name: t.businessStudies,
      icon: <Calculator className="h-6 w-6" />,
      available: true,
      description: "Practice mock exams for Business Studies Paper 1 and Paper 2"
    },
    {
      id: 'mathematics',
      name: t.mathematics,
      icon: <Calculator className="h-6 w-6" />,
      available: false,
      description: "Mathematics mock exams coming soon"
    },
    {
      id: 'science',
      name: t.science,
      icon: <FlaskConical className="h-6 w-6" />,
      available: false,
      description: "Science mock exams coming soon"
    },
    {
      id: 'english',
      name: t.english,
      icon: <BookOpen className="h-6 w-6" />,
      available: false,
      description: "English Language mock exams coming soon"
    },
    {
      id: 'computer-science',
      name: t.computerScience,
      icon: <Code className="h-6 w-6" />,
      available: false,
      description: "Computer Science mock exams coming soon"
    },
    {
      id: 'music',
      name: t.music,
      icon: <Music className="h-6 w-6" />,
      available: false,
      description: "Music mock exams coming soon"
    },
    {
      id: 'art',
      name: t.art,
      icon: <Palette className="h-6 w-6" />,
      available: false,
      description: "Art & Design mock exams coming soon"
    },
    {
      id: 'languages',
      name: t.languages,
      icon: <Languages className="h-6 w-6" />,
      available: false,
      description: "Languages mock exams coming soon"
    }
  ];

  const handleSubjectSelection = (subjectId: string) => {
    if (subjectId === 'business-studies') {
      setCurrentPage('mock-exam-selection');
    }
  };

  return (
    <div className="h-screen bg-white overflow-hidden">
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
        <div className="text-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: '#FF7FA3' }}>{t.selectSubject}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            {t.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0 overflow-hidden">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className={`border-2 transition-all duration-300 overflow-hidden flex flex-col h-full ${
                subject.available
                  ? 'border-gray-200 bg-white/90 hover:shadow-xl cursor-pointer hover:border-purple-300'
                  : 'border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed'
              }`}
              style={{
                borderRadius: '1rem',
                boxShadow: subject.available
                  ? '0 10px 25px -5px rgba(255, 77, 145, 0.15), 0 4px 6px -2px rgba(255, 77, 145, 0.1)'
                  : '0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => subject.available && handleSubjectSelection(subject.id)}
            >
              <CardHeader className="pb-3 bg-black flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: '#FFB6C1' }}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      subject.available ? 'bg-white/10' : 'bg-gray-500/20'
                    }`}>
                      <div className="w-4 h-4" style={{ color: subject.available ? '#FFB6C1' : '#9CA3AF' }}>
                        {subject.icon}
                      </div>
                    </div>
                    <span className="truncate">{subject.name}</span>
                  </CardTitle>
                  {subject.available ? (
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs px-1.5 py-0.5 flex-shrink-0">
                      <CheckCircle className="h-2.5 w-2.5 mr-1" />
                      {t.available}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30 text-xs px-1.5 py-0.5 flex-shrink-0">
                      <Lock className="h-2.5 w-2.5 mr-1" />
                      {t.comingSoon}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-3 flex flex-col flex-1 min-h-0">
                <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-shrink-0">
                  {subject.description}
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (subject.available) {
                      handleSubjectSelection(subject.id);
                    }
                  }}
                  disabled={!subject.available}
                  className={`w-full mt-auto ${
                    subject.available
                      ? 'bg-black hover:opacity-90 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } py-2 text-xs font-medium transition-all duration-300`}
                >
                  {subject.available ? (
                    <>
                      <GraduationCap className="h-3.5 w-3.5 mr-1.5 inline" style={{ color: '#FF4D91' }} />
                      {t.continue}
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 mr-1.5 inline" />
                      {t.comingSoon}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

