"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: "Nomzod harbiy tibbiy komissiyani necha kunda o'tib tugatishi kerak?",
      a: "Nomzod harbiy tibbiy komissiyani 14 kunda o'tib tugatishi kerak."
    },
    {
      q: "Tibbiy ko'rik necha bosqichdan iborat?",
      a: "Tibbiy ko'rik uch bosqichdan iborat."
    },
    {
      q: "Laboratoriya tahlillari uchun qon olish vaqti nechigacha?",
      a: "Laboratoriya tahlillari uchun qon olish vaqti 8:00 dan 10:00 gacha. Och qoringa kelish kerak."
    },
    {
      q: "Ekspert shifokorlar qabul vaqti?",
      a: "Ekspert shifokorlar qabul vaqti 08:30 dan 15:00 gacha. Tushlik vaqti 13:00 dan 14:00 gacha."
    },
    {
      q: "Nomzod necha nafar shifokor ko'rigidan o'tish lozim?",
      a: "Nomzod 8 nafar shifokor ko'rigidan o'tishi lozim. Qizlar uchun 9 nafar shifokor."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      
      {/* Hero Section - HTML'dagi page-header ni moslashtirish */}
     <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-900 via-blue-700 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl xl:text-5xl font-black text-white mb-4">
            Tez-Tez So'raladigan Savollar
          </h1>
          <p className="text-xl text-blue-100 opacity-95 max-w-2xl mx-auto leading-relaxed">
            Tibbiy komissiya haqida eng ko'p beriladigan savollarga javoblar
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 xl:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem 
                key={index}
                question={faq.q}
                answer={faq.a}
                isOpen={openIndex === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>

        </div>
      </section>

    </div>
  )
}

// Alohida FAQItem komponenti
function FAQItem({ 
  question, 
  answer, 
  isOpen, 
  onToggle 
}: { 
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <Card className={`
      group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 rounded-2xl 
      transition-all duration-300 hover:shadow-lg
      ${isOpen 
        ? 'border-blue-500 dark:border-blue-400 shadow-lg' 
        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
      }
    `} onClick={onToggle}>
      <CardContent className="p-0">
        {/* Question */}
        <div
          className={`
            w-full px-8 py-2 flex items-center justify-between text-left
            transition-all duration-300
            ${isOpen 
              && 'bg-blue-50 dark:bg-blue-900/20' 
            }
          `}
        >
          <h3 className={`
            text-lg font-bold pr-4
            transition-colors duration-300
            ${isOpen 
              ? 'text-blue-700 dark:text-blue-300' 
              : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
            }
          `}>
            {question}
          </h3>
          
          <ChevronDown 
            className={`
              w-6 h-6 shrink-0 transition-transform duration-300
              ${isOpen 
                ? 'rotate-180 text-blue-600 dark:text-blue-400' 
                : 'text-slate-400 group-hover:text-blue-500'
              }
            `} 
          />
        </div>

        {/* Answer - HTML'dagi faq-answer ni moslashtirish */}
        <div className={`
          transition-all duration-300 overflow-hidden
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="px-8 pb-6 pt-2">
            <div className="
              text-slate-600 dark:text-slate-300 leading-relaxed 
              border-l-4 border-blue-500 dark:border-blue-400 pl-4
            ">
              {answer}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}