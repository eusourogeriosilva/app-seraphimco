// Seraphim.co — home. Gera o JSON-LD FAQPage a partir das perguntas da própria página,
// para que o texto exista num só lugar (o HTML) e os dados estruturados nunca fiquem desatualizados.
import { initMenu } from '../components/menu.ts';

function faqSchema(): void {
  const itens = [...document.querySelectorAll<HTMLDetailsElement>('#perguntas details.faq')].map((d) => {
    const pergunta = d.querySelector('summary')?.textContent?.trim() ?? '';
    const resposta = [...d.querySelectorAll('.faq__answer > *')].map((e) => e.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' ');
    return { '@type': 'Question', name: pergunta, acceptedAnswer: { '@type': 'Answer', text: resposta } };
  }).filter((i) => i.name && i.acceptedAnswer.text);
  if (!itens.length) return;
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: itens });
  document.head.append(s);
}

faqSchema();
initMenu();
