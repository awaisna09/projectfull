import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Logo } from './Logo';
import { useApp } from '../App';
import { 
  ArrowRight,
  Award,
  BarChart3,
  Book,
  BookMarked,
  BookOpen, 
  Brain, 
  CheckCircle,
  Circle,
  Clock,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  PenTool,
  PieChart,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';

const palette = {
  violet: '#9B4DFF',
  magenta: '#FF4D91',
  coral: '#FF6C6C',
  lightViolet: 'rgba(155, 77, 255, 0.1)',
  lightMagenta: 'rgba(255, 77, 145, 0.1)',
  lightCoral: 'rgba(255, 108, 108, 0.1)'
};

const heroStats = [
  { label: 'Grade Improvement', value: '92%' },
  { label: 'Courses Available', value: 'IGCSE' },
  { label: 'Student Satisfaction', value: '98%' }
];

const whyChooseFeatures = [
        {
          icon: Brain,
    title: 'AI-Powered Practice',
    description: 'Get instant feedback and personalised recommendations based on how you perform.',
    accent: [palette.violet, palette.magenta]
        },
        {
          icon: BookOpen,
    title: 'Paper-Specific Support',
    description: 'Practice with real past papers from IGCSE, A-Level, and IB curricula.',
    accent: [palette.magenta, palette.coral]
  },
  {
    icon: Target,
    title: 'Practice Mode',
    description: 'Tackle targeted drills that focus on knowledge gaps and exam-ready techniques.',
    accent: [palette.coral, palette.magenta]
  },
  {
    icon: Lightbulb,
    title: 'Visual Learning',
    description: 'Interactive diagrams, animations, and visual explanations for complex concepts.',
    accent: [palette.violet, palette.coral]
        },
        {
          icon: Trophy,
    title: 'Gamification',
    description: 'Earn badges, track streaks, and compete with peers to stay motivated every day.',
    accent: [palette.magenta, palette.violet]
        },
        {
          icon: MessageCircle,
    title: '24/7 AI Tutor',
    description: 'Ask anything, anytime — get instant, personalised explanations within seconds.',
    accent: [palette.magenta, palette.coral]
  }
];

const processSteps = [
  {
    number: '01',
    title: 'Choose Your Subject',
    description: 'Pick from 25+ IGCSE, A-Level, and IB subjects tailored to your syllabus.'
  },
  {
    number: '02',
    title: 'AI Assessment',
    description: 'Let Imtehaan analyse your strengths and weaknesses in minutes.'
  },
  {
    number: '03',
    title: 'Practice & Learn',
    description: 'Follow a personalised roadmap with lessons, past papers, and instant grading.'
  },
  {
    number: '04',
    title: 'Track Progress',
    description: 'Visual dashboards help you stay on pace and celebrate every improvement.'
  }
];

const processStepColors = [palette.violet, palette.magenta, palette.coral, palette.violet];

const featureHighlights = [
  {
    icon: Brain,
    title: 'Smart AI Grading',
    description: 'Detailed performance breakdowns and model answers for every submission.',
    colors: [palette.violet, palette.magenta]
  },
  {
    icon: BookOpen,
    title: 'Past Paper Library',
    description: 'Searchable archive of recent and historic exams to build exam readiness.',
    colors: [palette.magenta, palette.coral]
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Trend lines, heat maps, and granular insights into your study habits.',
    colors: [palette.coral, palette.magenta]
  },
  {
    icon: Lightbulb,
    title: 'Video Lessons',
    description: 'Short, high-impact lesson explainers created by expert Cambridge teachers.',
    colors: [palette.magenta, palette.violet]
  },
  {
    icon: Trophy,
    title: 'Achievement System',
    description: 'Unlock milestones, sustain streaks, and compete in global study leagues.',
    colors: [palette.violet, palette.magenta]
  },
  {
    icon: MessageCircle,
    title: '24/7 AI Assistant',
    description: 'Clarify doubts, summarise topics, and generate flashcards instantly.',
    colors: [palette.magenta, palette.coral]
  }
];

const subjects = [
  { icon: BookOpen, label: 'Mathematics', colors: [palette.violet, palette.magenta] },
  { icon: Brain, label: 'Physics', colors: [palette.magenta, palette.coral] },
  { icon: Lightbulb, label: 'Chemistry', colors: [palette.coral, palette.violet] },
  { icon: Sparkles, label: 'Biology', colors: [palette.magenta, palette.violet] },
  { icon: TrendingUp, label: 'Business Studies', colors: [palette.violet, palette.coral] },
  { icon: BarChart3, label: 'Economics', colors: [palette.magenta, palette.coral] },
  { icon: Book, label: 'English', colors: [palette.violet, palette.magenta] },
  { icon: MessageCircle, label: 'Computer Science', colors: [palette.coral, palette.magenta] }
];

const analyticsFeatures = [
  {
    icon: PieChart,
    title: 'Performance Insights',
    description: 'Visualise accuracy, speed, and concept mastery across subjects.'
  },
  {
    icon: TrendingUp,
    title: 'Weak Area Analysis',
    description: 'Pinpoint topic gaps with AI generated improvement blueprints.'
  },
  {
    icon: Clock,
    title: 'Study Time Analytics',
    description: 'Optimise schedules with time-on-task insights and streak tracking.'
  }
];

const analyticsData = [
  { subject: 'Math', score: 65 },
  { subject: 'Physics', score: 80 },
  { subject: 'Chemistry', score: 70 }
];

const analyticsBarColors = [palette.violet, palette.magenta, palette.coral];

const studentBenefits = [
  {
    icon: Rocket,
    title: 'Faster Learning',
    description: 'AI-driven learning paths accelerate revision by 3x vs. traditional study.'
  },
  {
    icon: CheckCircle,
    title: 'Higher Scores',
    description: '92% of Imtehaan students gain at least one grade boundary in 6 weeks.'
  },
  {
    icon: Clock,
    title: 'Study Anytime',
    description: 'Mobile-first experience gives you 24/7 access to tutors and resources.'
  }
];

const footerLinks = {
  product: [
    { label: 'Plans', page: 'pricing' },
    { label: 'Features', page: 'landing' },
    { label: 'Pricing', page: 'pricing' }
  ],
  support: [
    { label: 'Contact', page: 'contact-support' },
    { label: 'Help Center', page: 'help-center' }
  ],
  legal: [
    { label: 'Privacy Policy', page: 'privacy-policy' },
    { label: 'Terms of Service', page: 'terms-of-service' }
  ]
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }
  })
};

const hoverCard = {
  whileHover: { y: -8, scale: 1.02 },
  whileTap: { scale: 0.99 }
};

export function LandingPage() {
  const { setCurrentPage } = useApp();

  const handleNavigate = (page: 'login' | 'signup') => setCurrentPage(page);
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-12">
          <Logo size="md" showText />
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-black">
            <button onClick={() => scrollToSection('why-imtehaan')} className="hover:text-[#111827] transition">
              Why Imtehaan
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#111827] transition">
              How it Works
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#111827] transition">
              Features
            </button>
            <button onClick={() => scrollToSection('subjects')} className="hover:text-[#111827] transition">
              Subjects
            </button>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-black" onClick={() => handleNavigate('login')}>
              Sign In
                </Button>
                <Button 
              className="rounded-full px-6 py-3 text-white shadow-md transition-transform duration-300 hover:scale-[1.04]"
              style={{ background: '#000000' }}
              onClick={() => handleNavigate('signup')}
            >
              Start Learning Now
                </Button>
              </div>
            </div>
      </header>

      <main>
        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{ 
            backgroundImage:
              'radial-gradient(circle at 60% 40%, rgba(155,77,255,0.24), rgba(255,77,145,0.12)), url("/Background.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-white/85" />
          <div className="relative mx-auto flex min-h-[92vh] max-w-5xl flex-col items-center justify-center gap-12 px-6 py-32 text-center lg:px-16 lg:text-left lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              className="space-y-6 lg:max-w-3xl"
            >
              <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-[#111827] md:text-5xl lg:text-[56px]">
                Ace Your IGCSE, A-Levels & IB with Your{' '}
                <span className="bg-gradient-to-r from-[#9B4DFF] via-[#FF4D91] to-[#FF6C6C] bg-clip-text text-transparent">
                  Personal AI Tutor
                </span>
                </h1>
              <p className="text-lg text-[#6B7280] md:text-xl">
                Learn smarter with real past papers, instant grading, and 24/7 AI tutoring — built for ambitious students who want top grades.
                </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                  className="rounded-full px-6 py-3 font-medium text-white shadow-lg transition-transform duration-300 hover:scale-105"
                  style={{ background: '#000000' }}
                  onClick={() => handleNavigate('signup')}
              >
                  Start Learning Now
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                  variant="outline" 
                  className="rounded-full px-6 py-3 font-medium transition hover:brightness-110"
                  style={{
                    borderColor: '#FF4D91',
                    color: '#FF4D91',
                    boxShadow: '0 0 0 1px rgba(255,77,145,0.15)'
                  }}
                  onClick={() => handleNavigate('login')}
                >
                  Try AI Tutor
              </Button>
            </div>
              <div className="grid w-full gap-4 sm:grid-cols-3">
                {heroStats.map((item, index) => (
                  <motion.div
                    key={item.label}
                    custom={index}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 text-left shadow-sm"
                  >
                    <p className="text-2xl font-semibold text-[#111827]">{item.value}</p>
                    <p className="text-xs uppercase tracking-wide text-[#6B7280]">{item.label}</p>
                  </motion.div>
                ))}
          </div>
            </motion.div>
        </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
            className="pointer-events-none absolute bottom-[-40px] right-0 hidden lg:block"
          >
            <div className="relative h-[520px] w-[520px] max-w-[45vw]">
              <img
                src="./Frame 3466210.png"
                alt="Hero Illustration"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
              <motion.div
                className="absolute -top-6 right-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white text-white font-semibold shadow-lg"
                style={{ background: '#9B4DFF' }}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >
                A+
              </motion.div>
              <motion.div
                className="absolute bottom-6 -left-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white text-white font-semibold shadow-lg"
                style={{ background: '#FF4D91' }}
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              >
                IB
              </motion.div>
              </div>
          </motion.div>
        </section>

        {/* Why Choose */}
        <section
          id="why-imtehaan"
          className="relative overflow-hidden py-20 md:py-28"
            style={{ 
            background: `linear-gradient(180deg, rgba(155,77,255,0.08), rgba(255,77,145,0.05), #FFFFFF)`
          }}
        >
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at top, rgba(155,77,255,0.3), transparent 60%)' }} />
          <div className="relative mx-auto max-w-6xl space-y-10 px-6 md:px-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp} className="text-center space-y-4">
              <Badge
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: palette.lightViolet, color: palette.violet }}
              >
              Core Features
            </Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111827]">Why Choose Imtehaan?</h2>
              <p className="mx-auto max-w-2xl text-lg text-[#6B7280]">Everything you need to excel in your exams — all in one AI-powered learning platform.</p>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {whyChooseFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index}
                >
                  <motion.div className="h-full" {...hoverCard}>
                    <Card className="relative h-full rounded-[22px] border border-[#E5E7EB] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] px-6 py-7 space-y-4">
                      <div
                        className="absolute inset-x-6 top-0 h-[3px] rounded-b-full"
                        style={{ background: `linear-gradient(90deg, ${feature.accent[0]}, ${feature.accent[1]})` }}
                      />
                      <div
                        className="w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-md"
                        style={{ background: `linear-gradient(135deg, ${feature.accent[0]}, ${feature.accent[1]})` }}
                      >
                        <feature.icon className="h-6 w-6" />
              </div>
                      <h3 className="text-xl font-semibold text-[#111827]">{feature.title}</h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed">{feature.description}</p>
                </Card>
                  </motion.div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Process */}
        <section id="how-it-works" className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6 md:px-12 space-y-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp} className="text-center space-y-4">
              <Badge className="px-4 py-2 rounded-full" style={{ backgroundColor: palette.lightMagenta, color: palette.magenta }}>
                Get started in minutes
            </Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111827]">How Imtehaan Works</h2>
              <p className="mx-auto max-w-2xl text-lg text-[#6B7280]">From assessment to analytics, our AI guides every step of your revision journey.</p>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index}
                >
                  <motion.div className="h-full" {...hoverCard}>
              <Card 
                      className="h-full rounded-2xl border border-[#E5E7EB] shadow-md px-6 py-8 space-y-4"
                      style={{ background: `linear-gradient(180deg, ${palette.lightViolet}, rgba(255,255,255,0.95))` }}
                    >
                      <div
                        className="w-16 h-16 mx-auto rounded-full text-white text-lg font-semibold flex items-center justify-center shadow-md"
                        style={{ background: `linear-gradient(135deg, ${processStepColors[index % processStepColors.length]}, ${processStepColors[(index + 1) % processStepColors.length]})` }}
                      >
                        {step.number}
                </div>
                      <h3 className="text-xl font-semibold text-center text-[#111827]">{step.title}</h3>
                      <p className="text-sm text-[#6B7280] text-center leading-relaxed">{step.description}</p>
              </Card>
                  </motion.div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Features */}
        <section id="features" className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6 md:px-12 space-y-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp} className="text-center space-y-4">
              <Badge className="px-4 py-2 rounded-full" style={{ backgroundColor: palette.lightViolet, color: palette.violet }}>
                All-in-one toolkit
            </Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111827]">Everything You Need to Succeed</h2>
              <p className="mx-auto max-w-2xl text-lg text-[#6B7280]">Discover powerful tools designed to help you master your subjects and ace your exams.</p>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featureHighlights.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index}
                >
                  <motion.div className="h-full" whileHover={{ scale: 1.02, y: -6 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
                    <Card className="h-full rounded-2xl border border-[#E5E7EB] bg-white shadow-lg px-6 py-7 space-y-5">
                      <div
                        className="w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${feature.colors[0]}, ${feature.colors[1]})` }}
                      >
                        <feature.icon className="h-7 w-7" />
          </div>
                      <h3 className="text-xl font-semibold text-[#111827]">{feature.title}</h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed">{feature.description}</p>
              </Card>
                  </motion.div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Subjects */}
        <section id="subjects" className="bg-[#F9FAFB] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6 md:px-12 space-y-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp} className="text-center space-y-4">
              <Badge className="px-4 py-2 rounded-full" style={{ backgroundColor: palette.lightCoral, color: palette.coral }}>
                Curriculum coverage
            </Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111827]">Subjects Available</h2>
              <p className="mx-auto max-w-2xl text-lg text-[#6B7280]">Comprehensive coverage across all major curricula and subjects.</p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {subjects.map((subject, index) => {
                const isBusinessStudies = subject.label === 'Business Studies';
                return (
                <motion.button
                  key={subject.label}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index}
                  whileHover={isBusinessStudies ? { y: -6, scale: 1.01 } : {}}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  className={`flex items-center gap-3 rounded-2xl px-5 py-4 shadow-sm text-black transition ${
                    isBusinessStudies ? 'hover:brightness-105 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${subject.colors[0]}, ${subject.colors[1]})` }}
                  onClick={isBusinessStudies ? () => handleNavigate('login') : undefined}
                  disabled={!isBusinessStudies}
                >
                  <subject.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{subject.label}</span>
                </motion.button>
                );
              })}
                    </div>
            <div className="flex justify-center">
            <Button 
              className="rounded-full px-6 py-2 text-sm font-medium text-white shadow-md transition hover:brightness-110"
              style={{ background: '#000000' }}
              onClick={() => handleNavigate('login')}
            >
              <span className="flex items-center gap-2">
              View All Subjects
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </section>

        {/* Analytics */}
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6 md:px-12 grid gap-10 lg:grid-cols-2 items-center">
            <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="space-y-6">
              <Badge className="px-4 py-2 rounded-full" style={{ backgroundColor: palette.lightViolet, color: palette.violet }}>
                Insights that matter
                    </Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111827]">Track Your Progress with Precision</h2>
              <p className="text-lg text-[#6B7280] leading-relaxed">Get deep insights into your learning journey with analytics and visual tracking designed for exam excellence.</p>
              <div className="space-y-4">
                {analyticsFeatures.map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] px-5 py-4 shadow-sm"
                    style={{ background: `linear-gradient(90deg, ${palette.lightViolet}, rgba(255,255,255,0.95))` }}
                    custom={index}
                    variants={fadeInUp}
                  >
                    <div
                      className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow"
                      style={{ background: 'linear-gradient(135deg, #9B4DFF, #FF4D91)' }}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                      <p className="text-sm text-[#6B7280] leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="rounded-3xl border border-[#E5E7EB] bg-white shadow-xl px-6 py-6 space-y-6"
            >
                  <div className="flex items-center justify-between">
                      <div>
                  <p className="text-sm uppercase tracking-wide text-[#6B7280]">Performance Overview</p>
                  <p className="text-xl font-semibold text-[#111827]">This Week</p>
                      </div>
                <Badge className="px-3 py-1 rounded-full" style={{ backgroundColor: palette.lightMagenta, color: palette.magenta }}>
                  Active
                </Badge>
                      </div>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="subject" stroke="#9CA3AF" tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} />
                    <Bar dataKey="score" radius={[12, 12, 0, 0]}>
                      {analyticsData.map((entry, idx) => (
                        <Cell key={entry.subject} fill={analyticsBarColors[idx]} />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="imtGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#9B4DFF" />
                        <stop offset="50%" stopColor="#FF4D91" />
                        <stop offset="100%" stopColor="#FF6C6C" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
                      </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-[#F9FAFB] px-4 py-3 text-center">
                  <p className="text-2xl font-semibold text-[#111827]">42</p>
                  <p className="text-xs uppercase tracking-wide text-[#6B7280]">Topics Completed</p>
                    </div>
                <div className="rounded-2xl bg-[#F9FAFB] px-4 py-3 text-center">
                  <p className="text-2xl font-semibold text-[#111827]">18</p>
                  <p className="text-xs uppercase tracking-wide text-[#6B7280]">Hours Studied</p>
                  </div>
                <div className="rounded-2xl bg-[#F9FAFB] px-4 py-3 text-center">
                  <p className="text-2xl font-semibold text-[#111827]">156</p>
                  <p className="text-xs uppercase tracking-wide text-[#6B7280]">Streak Days</p>
                </div>
            </div>
            </motion.div>
        </div>
      </section>

        {/* Student Benefits */}
        <section className="bg-[#F9FAFB] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6 md:px-12 space-y-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp} className="text-center space-y-4">
              <Badge className="px-4 py-2 rounded-full" style={{ backgroundColor: palette.lightCoral, color: palette.coral }}>
                Loved by students worldwide
                    </Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111827]">Why Students Choose Imtehaan</h2>
              <p className="mx-auto max-w-2xl text-lg text-[#6B7280]">Join thousands of successful students achieving their academic goals.</p>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-3">
              {studentBenefits.map((benefit, index) => {
                const gradientStops = [
                  [palette.violet, palette.magenta],
                  [palette.magenta, palette.coral],
                  [palette.coral, palette.violet]
                ];
                const colors = gradientStops[index % gradientStops.length];
                return (
                  <motion.div
                    key={benefit.title}
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={index}
                  >
                    <motion.div className="h-full" {...hoverCard}>
                      <Card className="h-full rounded-2xl border border-[#E5E7EB] bg-white shadow-lg px-6 py-7 space-y-4">
                        <div
                          className="w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-md"
                          style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                        >
                          <benefit.icon className="h-6 w-6" />
                  </div>
                        <h3 className="text-xl font-semibold text-[#111827]">{benefit.title}</h3>
                        <p className="text-sm text-[#6B7280] leading-relaxed">{benefit.description}</p>
              </Card>
                    </motion.div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </section>

        {/* CTA */}
        <section
          className="relative overflow-hidden py-24 text-white"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(155,77,255,0.95) 0%, rgba(255,77,145,0.9) 50%, rgba(255,108,108,0.9) 100%), url("/Background.png")',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          <div className="absolute inset-0 bg-[rgba(255,255,255,0.1)]" />
          <div className="relative mx-auto max-w-3xl px-6 text-center space-y-6">
            <Badge className="mx-auto bg-white/20 text-white px-4 py-2 rounded-full">It’s your time to shine</Badge>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">Ready to Transform Your Learning?</h2>
            <p className="text-lg md:text-xl text-white/90">Join thousands of students who have improved their grades with AI-powered tutoring.</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                className="rounded-full px-6 py-3 font-medium text-white shadow-lg transition-transform duration-300 hover:scale-105"
                style={{ background: 'linear-gradient(90deg, #9B4DFF, #FF4D91, #FF6C6C)' }}
                onClick={() => handleNavigate('signup')}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                className="rounded-full px-6 py-3 font-medium transition hover:brightness-110"
                style={{ borderColor: '#FF4D91', color: '#FF4D91' }}
                onClick={() => handleNavigate('login')}
              >
                Try AI Tutor Now
              </Button>
            </div>
            <p className="text-sm text-white/80">Start today and join our learner community.</p>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer
        className="text-black py-10"
        style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,215,240,0.7) 35%, rgba(240,246,255,0.85) 100%)' }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12 space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-start mt-4">
            <div className="space-y-4">
              <Logo size="md" showText />
              <p className="text-sm text-black/70 leading-relaxed">AI-powered education for IGCSE, A-Level, and IB students.</p>
              <div className="flex items-center gap-3 text-black/60">
                <a
                  href="https://instagram.com"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37a3.37 3.37 0 1 1-6.74 0 3.37 3.37 0 0 1 6.74 0Z" />
                    <path d="M17.5 6.5h.01" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M4.98 3.5c0 1.32-1.06 2.38-2.36 2.38h-.03A2.37 2.37 0 0 1 .25 3.5 2.37 2.37 0 0 1 2.62 1.1a2.37 2.37 0 0 1 2.36 2.4ZM.44 8.75h4.31V24H.44V8.75ZM9.65 8.75h4.14v2.07h.06c.58-1.09 2-2.24 4.12-2.24 4.4 0 5.21 2.9 5.21 6.67V24h-4.3v-6.88c0-1.64-.03-3.75-2.29-3.75-2.3 0-2.65 1.79-2.65 3.64V24H9.65V8.75Z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  aria-label="YouTube"
                  className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M21.8 8.001a2.75 2.75 0 0 0-1.93-1.95C18.03 6 12 6 12 6s-6.03 0-7.87.051a2.75 2.75 0 0 0-1.93 1.95A28.17 28.17 0 0 0 2 12a28.17 28.17 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.93 1.95C5.97 18 12 18 12 18s6.03 0 7.87-.051a2.75 2.75 0 0 0 1.93-1.95A28.17 28.17 0 0 0 22 12a28.17 28.17 0 0 0-.2-3.999ZM10 14.5v-5l4.5 2.5-4.5 2.5Z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-6 lg:mt-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-black/70 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: palette.magenta }} />
                Product
              </p>
              <nav className="space-y-3 text-sm text-black/60">
                {footerLinks.product.map((link) => (
                  <button
                    key={link.label}
                    className="block transition hover:text-transparent hover:bg-clip-text"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #9B4DFF, #FF4D91)',
                      WebkitBackgroundClip: 'text'
                    }}
                    onClick={() => setCurrentPage(link.page as any)}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
                </div>
                <div className="mt-6 lg:mt-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-black/70 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" style={{ color: palette.coral }} />
                Support
              </p>
              <nav className="space-y-3 text-sm text-black/60">
                {footerLinks.support.map((link) => (
                  <button
                    key={link.label}
                    className="block transition hover:text-transparent hover:bg-clip-text"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #FF4D91, #FF6C6C)',
                      WebkitBackgroundClip: 'text'
                    }}
                    onClick={() => setCurrentPage(link.page as any)}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
                </div>
                <div className="mt-6 lg:mt-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-black/70 mb-3 flex items-center gap-2">
                <BookMarked className="h-4 w-4" style={{ color: palette.violet }} />
                Legal
              </p>
              <nav className="space-y-3 text-sm text-black/60">
                {footerLinks.legal.map((link) => (
                  <button
                    key={link.label}
                    className="block transition hover:text-transparent hover:bg-clip-text"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #9B4DFF, #FF6C6C)',
                      WebkitBackgroundClip: 'text'
                    }}
                    onClick={() => setCurrentPage(link.page as any)}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
                </div>
                </div>
          <div className="border-t border-black/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-black/60">
            <p>© 2025 Imtehaan.ai. All rights reserved.</p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10">
              <span className="w-2 h-2 rounded-full" style={{ background: palette.magenta }} />
              AI Systems Active
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

